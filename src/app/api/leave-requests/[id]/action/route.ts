import db from "@/db";
import { leaveRequests, leaveStatusEnum } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

// Define a schema for the request body
const actionSchema = z.object({
  action: z.enum(leaveStatusEnum.enumValues), // Use the enum values directly
  managerComments: z.string().optional(),
  managerId: z.number().optional(), // Assuming you get managerId from session or client
});

// Update the type definition to match Next.js's expectations
export async function PATCH(request: Request, context: { params: { id: string } }) {
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

    // Comments are required for 'rejected' or 'returned' status
    if ((action === "rejected" || action === "returned") && (!managerComments || managerComments.trim() === "")) {
      return NextResponse.json({ error: "Manager comments are required for this action" }, { status: 400 });
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

    return NextResponse.json(updatedRequest[0]);
  } catch (error) {
    console.error("Error updating leave request:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
