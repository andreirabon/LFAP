import db from "@/db";
import { leaveRequests } from "@/db/schema";
import { auth } from "@/lib/auth";
import { parseLocalDate } from "@/lib/date-utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for the request body
const leaveRequestSchema = z.object({
  leaveType: z.string(),
  startDate: z.string().transform((date) => parseLocalDate(date)),
  endDate: z.string().transform((date) => parseLocalDate(date)),
  reason: z.string().min(10).max(500),
  supportingDocs: z.array(z.string()).optional(),
  department: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get the session and verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate the request body
    const body = await request.json();
    console.log("Received leave request body:", body); // Log the received request body
    const validatedData = leaveRequestSchema.parse(body);

    // Get supporting doc if present
    const supportingDoc = validatedData.supportingDocs?.length ? validatedData.supportingDocs[0] : undefined;

    // Get department from request body, or use the session user's department as fallback
    const department = validatedData.department || session.user.department || null;
    console.log("Using department:", department); // Log the department being used

    // Insert the leave request into the database
    const newLeaveRequest = await db
      .insert(leaveRequests)
      .values({
        userId: session.user.id,
        type: validatedData.leaveType,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        reason: validatedData.reason,
        supportingDoc: supportingDoc,
        department: department,
        status: "pending", // Default status for new requests
        createdAt: parseLocalDate(new Date().toISOString()),
      })
      .returning();

    return NextResponse.json(
      { message: "Leave request submitted successfully", data: newLeaveRequest[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting leave request:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to submit leave request" }, { status: 500 });
  }
}
