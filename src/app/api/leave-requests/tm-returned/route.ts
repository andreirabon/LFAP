import db from "@/db";
import { leaveRequests, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tmReturnedRequests = await db
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
      .where(eq(leaveRequests.status, "tm_returned"))
      .orderBy(leaveRequests.createdAt);

    return NextResponse.json(tmReturnedRequests);
  } catch (error) {
    console.error("Error fetching tm_returned leave requests:", error);
    return NextResponse.json({ error: "Failed to fetch tm_returned leave requests" }, { status: 500 });
  }
}
