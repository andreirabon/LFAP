import db from "@/db";
import { leaveRequests, leaveStatusEnum, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
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
    action: z.enum(leaveStatusEnum.enumValues), // Use the enum values directly
    managerComments: z.string().optional(),
    managerId: z.number().optional(), // Assuming you get managerId from session or client
  })
  .superRefine((data, ctx) => {
    // Comments are required for 'rejected' or 'returned' status
    if (
      (data.action === "rejected" || data.action === "returned") &&
      (!data.managerComments || data.managerComments.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Manager comments are required for this action",
        path: ["managerComments"],
      });
    }

    // Validate comment length for 'rejected' or 'returned' status
    if (
      (data.action === "rejected" || data.action === "returned") &&
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

// Update the type definition to match Next.js's expectations
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Await the params object before accessing its properties
  const { id } = await params;
  const leaveRequestId = parseInt(id, 10);

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

    const updateData: Partial<typeof leaveRequests.$inferInsert> = {
      status: action,
      managerComments: managerComments?.trim() || null,
      updatedAt: new Date(),
    };

    if (managerId !== undefined) {
      updateData.managerId = managerId;
    }

    const updatedRequest = await db
      .update(leaveRequests)
      .set(updateData)
      .where(eq(leaveRequests.id, leaveRequestId))
      .returning();

    if (updatedRequest.length === 0) {
      return NextResponse.json({ error: "Leave request not found or no changes made" }, { status: 404 });
    }

    // At this point, we could log to an audit trail table
    // Example: await createAuditTrailEntry({
    //   userId: managerId,
    //   action: `Updated leave request ${leaveRequestId} status from ${currentLeaveRequest[0].status} to ${action}`,
    //   entityType: 'leave_request',
    //   entityId: leaveRequestId,
    //   details: JSON.stringify({
    //     previousStatus: currentLeaveRequest[0].status,
    //     newStatus: action,
    //     comments: managerComments?.trim() || null
    //   })
    // });

    // If request was rejected, notify the employee
    if (action === "rejected" && updatedRequest[0].userId) {
      try {
        // Get the employee details
        const employee = await db.select().from(users).where(eq(users.id, updatedRequest[0].userId)).limit(1);

        if (employee.length > 0 && employee[0].email) {
          // Get manager name
          let managerName = "Your manager";
          if (managerId) {
            const manager = await db.select().from(users).where(eq(users.id, managerId)).limit(1);

            if (manager.length > 0) {
              managerName = `${manager[0].firstName} ${manager[0].lastName}`;
            }
          }

          // Send notification email
          await sendNotificationEmail(
            employee[0].email,
            "Your Leave Request Has Been Rejected",
            `<p>Dear ${employee[0].firstName},</p>
            <p>Your leave request for ${new Date(updatedRequest[0].startDate).toLocaleDateString()} to ${new Date(
              updatedRequest[0].endDate,
            ).toLocaleDateString()} has been rejected.</p>
            <p><strong>Reason:</strong> ${managerComments || "No reason provided"}</p>
            <p>If you have any questions, please contact ${managerName}.</p>
            <p>Regards,<br/>HR Team</p>`,
          );
        }
      } catch (emailError) {
        // Log the error but don't fail the request
        console.error("Failed to send notification email:", emailError);
      }
    }

    return NextResponse.json(updatedRequest[0]);
  } catch (error) {
    console.error("Error updating leave request:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
