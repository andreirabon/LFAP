import db from "@/db";
import { leaveRequests, users } from "@/db/schema";
import { NextResponse, RouteHandlerParams } from "@/lib/route-types";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Helper function to send notification email (implementation would depend on your email service)
async function sendNotificationEmail(email: string, subject: string, message: string) {
  // This is a placeholder - implement with your preferred email service
  // Example with a hypothetical email service:
  // await emailService.send({
  //   to: email,
  //   subject,
  //   html: message,
  // });

  console.log(`Email notification would be sent to ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);

  // For now, we'll just log it
  return true;
}

// Define a schema for the request body
const actionSchema = z
  .object({
    action: z.enum(["rejected", "returned", "endorsed", "tm_approved", "tm_rejected", "tm_returned"]),
    managerComments: z.string().optional(),
    managerId: z.number().optional(), // Manager or top management ID
  })
  .superRefine((data, ctx) => {
    // Comments are required for 'rejected', 'returned', 'tm_rejected', or 'tm_returned' status
    if (
      (data.action === "rejected" ||
        data.action === "returned" ||
        data.action === "tm_rejected" ||
        data.action === "tm_returned") &&
      (!data.managerComments || data.managerComments.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Comments are required for this action",
        path: ["managerComments"],
      });
    }

    // Validate comment length
    if (
      (data.action === "rejected" ||
        data.action === "returned" ||
        data.action === "tm_rejected" ||
        data.action === "tm_returned") &&
      data.managerComments &&
      data.managerComments.trim().length < 10
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Comments must be at least 10 characters long when rejecting or returning a request",
        path: ["managerComments"],
      });
    }
  });

// Helper to update leave balances
async function updateLeaveBalance(userId: number, leaveType: string, days: number) {
  try {
    // Map the leave type from request to the corresponding user fields
    const fieldMapping: Record<string, { totalField: string; usedField: string }> = {
      "Vacation Leave": {
        totalField: "vacationLeave",
        usedField: "usedVacationLeave",
      },
      "Mandatory Leave": {
        totalField: "mandatoryLeave",
        usedField: "usedMandatoryLeave",
      },
      "Mandatory/Force Leave": {
        totalField: "mandatoryLeave",
        usedField: "usedMandatoryLeave",
      },
      "Mandatory/Forced Leave": {
        totalField: "mandatoryLeave",
        usedField: "usedMandatoryLeave",
      },
      "Sick Leave": {
        totalField: "sickLeave",
        usedField: "usedSickLeave",
      },
      "Maternity Leave": {
        totalField: "maternityLeave",
        usedField: "usedMaternityLeave",
      },
      "Paternity Leave": {
        totalField: "paternityLeave",
        usedField: "usedPaternityLeave",
      },
      "Special Privilege Leave": {
        totalField: "specialPrivilegeLeave",
        usedField: "usedSpecialPrivilegeLeave",
      },
    };

    // Get the field mapping for this leave type
    const mapping = fieldMapping[leaveType];
    if (!mapping) {
      throw new Error(`Invalid leave type: ${leaveType}`);
    }

    // Get current user record
    const userRecord = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!userRecord.length) {
      throw new Error(`User not found: ${userId}`);
    }

    const user = userRecord[0];

    // Check if user has enough balance
    const totalBalance = user[mapping.totalField as keyof typeof user] as number;
    const usedBalance = user[mapping.usedField as keyof typeof user] as number;
    const remainingBalance = totalBalance - usedBalance;

    if (remainingBalance < days) {
      throw new Error(
        `Insufficient leave balance for ${leaveType}. Available: ${remainingBalance} days, Requested: ${days} days`,
      );
    }

    // Update used balance
    const updateData: Partial<typeof users.$inferInsert> = {};

    // Create a type-safe way to update the field
    if (mapping.usedField === "usedVacationLeave") {
      updateData.usedVacationLeave = usedBalance + days;
    } else if (mapping.usedField === "usedMandatoryLeave") {
      updateData.usedMandatoryLeave = usedBalance + days;
    } else if (mapping.usedField === "usedSickLeave") {
      updateData.usedSickLeave = usedBalance + days;
    } else if (mapping.usedField === "usedMaternityLeave") {
      updateData.usedMaternityLeave = usedBalance + days;
    } else if (mapping.usedField === "usedPaternityLeave") {
      updateData.usedPaternityLeave = usedBalance + days;
    } else if (mapping.usedField === "usedSpecialPrivilegeLeave") {
      updateData.usedSpecialPrivilegeLeave = usedBalance + days;
    }

    // Update the user record
    await db.update(users).set(updateData).where(eq(users.id, userId));

    return true;
  } catch (error) {
    console.error("Error updating leave balance:", error);
    throw error;
  }
}

// Calculate duration in days
function calculateDuration(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
}

// Use the standard Next.js type for PATCH route handler
export async function PATCH(request: Request, context: RouteHandlerParams<{ id: string }>): Promise<Response> {
  const leaveRequestId = parseInt(context.params.id, 10);

  if (isNaN(leaveRequestId)) {
    return NextResponse.json({ error: "Invalid leave request ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = actionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request body", details: validation.error.errors }, { status: 400 });
    }

    const { action, managerComments, managerId } = validation.data;

    // Fetch the current leave request to track changes
    const currentLeaveRequest = await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.id, leaveRequestId))
      .limit(1);

    if (!currentLeaveRequest.length) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    const leaveRequest = currentLeaveRequest[0];

    // Prepare update data
    const updateData: Partial<typeof leaveRequests.$inferInsert> = {
      status: action,
      managerComments: managerComments?.trim() || leaveRequest.managerComments,
      updatedAt: new Date(),
    };

    if (managerId !== undefined) {
      updateData.managerId = managerId;
    }

    let updatedRequest;

    // Handle top management approval with transaction
    if (action === "tm_approved") {
      try {
        // Start a transaction to ensure both updates succeed or fail together
        await db.transaction(async (tx) => {
          // 1. Update leave request status
          updatedRequest = await tx
            .update(leaveRequests)
            .set(updateData)
            .where(eq(leaveRequests.id, leaveRequestId))
            .returning();

          if (!updatedRequest.length) {
            throw new Error("Failed to update leave request");
          }

          // 2. Calculate days and update leave balance
          const days = calculateDuration(leaveRequest.startDate, leaveRequest.endDate);

          // Check if userId exists
          if (!leaveRequest.userId) {
            throw new Error("Leave request has no associated user");
          }

          // 3. Update the leave balance
          await updateLeaveBalance(leaveRequest.userId, leaveRequest.type, days);
        });

        // If we get here, transaction was successful
      } catch (txError) {
        console.error("Transaction failed:", txError);

        // Check if the error is related to insufficient leave balance
        if ((txError as Error).message.includes("Insufficient leave balance")) {
          return NextResponse.json(
            {
              error: "Insufficient leave balance",
              details: (txError as Error).message,
              type: "leave_balance_error",
            },
            { status: 400 },
          );
        }

        return NextResponse.json(
          { error: "Failed to approve leave request", details: (txError as Error).message },
          { status: 500 },
        );
      }
    } else {
      // For non-approval actions, just update the status
      updatedRequest = await db
        .update(leaveRequests)
        .set(updateData)
        .where(eq(leaveRequests.id, leaveRequestId))
        .returning();

      if (!updatedRequest || updatedRequest.length === 0) {
        return NextResponse.json({ error: "Leave request not found or no changes made" }, { status: 404 });
      }
    }

    // Send notification email to employee
    if (leaveRequest.userId) {
      try {
        // Get the employee details
        const employee = await db.select().from(users).where(eq(users.id, leaveRequest.userId)).limit(1);

        if (employee.length > 0 && employee[0].email) {
          // Get manager/approver name
          if (managerId) {
            // No need to fetch approver if we're not using it
          }

          // Determine email subject and message based on action
          let subject = "";
          let message = "";

          switch (action) {
            case "tm_approved":
              subject = "Your Leave Request Has Been Approved";
              message = `<p>Dear ${employee[0].firstName},</p>
                <p>Your leave request for ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(
                leaveRequest.endDate,
              ).toLocaleDateString()} has been approved.</p>
                ${managerComments ? `<p><strong>Comments:</strong> ${managerComments}</p>` : ""}
                <p>Regards,<br/>HR Team</p>`;
              break;

            case "endorsed":
              subject = "Your Leave Request Has Been Endorsed";
              message = `<p>Dear ${employee[0].firstName},</p>
                <p>Your leave request for ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(
                leaveRequest.endDate,
              ).toLocaleDateString()} has been endorsed and forwarded for final approval.</p>
                ${managerComments ? `<p><strong>Comments:</strong> ${managerComments}</p>` : ""}
                <p>Regards,<br/>HR Team</p>`;
              break;

            case "tm_rejected":
              subject = "Your Leave Request Has Been Rejected";
              message = `<p>Dear ${employee[0].firstName},</p>
                <p>Your leave request for ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(
                leaveRequest.endDate,
              ).toLocaleDateString()} has been rejected by top management.</p>
                <p><strong>Reason:</strong> ${managerComments || "No reason provided"}</p>
                <p>If you have any questions, please contact your manager.</p>
                <p>Regards,<br/>HR Team</p>`;
              break;

            case "tm_returned":
              subject = "Your Leave Request Has Been Returned";
              message = `<p>Dear ${employee[0].firstName},</p>
                <p>Your leave request for ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(
                leaveRequest.endDate,
              ).toLocaleDateString()} has been returned by top management for further review.</p>
                <p><strong>Comments:</strong> ${managerComments || "No comments provided"}</p>
                <p>Please discuss this with your manager.</p>
                <p>Regards,<br/>HR Team</p>`;
              break;

            default:
              // Don't send email for other statuses
              break;
          }

          if (subject && message) {
            await sendNotificationEmail(employee[0].email, subject, message);
          }
        }
      } catch (emailError) {
        // Log the error but don't fail the request
        console.error("Failed to send notification email:", emailError);
      }
    }

    // Return the updated request
    return NextResponse.json({
      success: true,
      message: `Leave request ${action.replace("tm_", "").replace("_", " ")} successfully`,
    });
  } catch (error) {
    console.error("Error updating leave request:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
