import db from "@/db";
import { leaveRequests, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pendingRequests = await db
      .select({
        id: leaveRequests.id,
        type: leaveRequests.type,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        reason: leaveRequests.reason,
        status: leaveRequests.status,
        supportingDoc: leaveRequests.supportingDoc,
        managerComments: leaveRequests.managerComments,
        createdAt: leaveRequests.createdAt,
        updatedAt: leaveRequests.updatedAt,
        employee: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          department: users.department,
        },
      })
      .from(leaveRequests)
      .leftJoin(users, eq(leaveRequests.userId, users.id))
      .where(eq(leaveRequests.status, "pending"))
      .orderBy(leaveRequests.createdAt); // Optional: order by creation date

    // The 'department' field in the employee object might be null if not set in the DB.
    // The 'supportingDoc' and 'managerComments' might also be null.

    return NextResponse.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending leave requests:", error);
    return NextResponse.json({ error: "Failed to fetch pending leave requests" }, { status: 500 });
  }
}
