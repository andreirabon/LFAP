import db from "@/db";
import { leaveRequests } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const editLeaveRequestSchema = z.object({
  type: z.string().min(1, "Leave type is required"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid start date"),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid end date"),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason must not exceed 500 characters"),
  supportingDoc: z.string().optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authResult = await auth();
    const userId = authResult?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaveRequestId = parseInt(params.id, 10);
    if (isNaN(leaveRequestId)) {
      return NextResponse.json({ error: "Invalid leave request ID" }, { status: 400 });
    }

    // Get the leave request to verify ownership
    const [leaveRequest] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, leaveRequestId)).limit(1);

    if (!leaveRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    // Verify the user owns this leave request
    if (leaveRequest.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to edit this leave request" }, { status: 403 });
    }

    // Only allow editing of returned requests
    if (leaveRequest.status !== "returned" && leaveRequest.status !== "tm_returned") {
      return NextResponse.json({ error: "Only returned leave requests can be edited" }, { status: 403 });
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = editLeaveRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    // Validate date range
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate < startDate) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }

    // Update the leave request
    const updateData = {
      type: data.type,
      startDate,
      endDate,
      reason: data.reason,
      status: "pending", // Reset to pending after edit
      updatedAt: new Date(),
      ...(data.supportingDoc ? { supportingDoc: data.supportingDoc } : {}),
    };

    const [updatedLeaveRequest] = await db
      .update(leaveRequests)
      .set(updateData)
      .where(eq(leaveRequests.id, leaveRequestId))
      .returning();

    return NextResponse.json(updatedLeaveRequest);
  } catch (error) {
    console.error("Error editing leave request:", error);
    return NextResponse.json({ error: "Failed to edit leave request" }, { status: 500 });
  }
}
