import db from "@/db";
import { leaveRequests, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // First, fetch the leave requests with status 'endorsed'
    const endorsedRequests = await db
      .select({
        id: leaveRequests.id,
        type: leaveRequests.type,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        reason: leaveRequests.reason,
        status: leaveRequests.status,
        supportingDoc: leaveRequests.supportingDoc,
        managerComments: leaveRequests.managerComments,
        managerId: leaveRequests.managerId,
        createdAt: leaveRequests.createdAt,
        updatedAt: leaveRequests.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          department: users.department,
        },
      })
      .from(leaveRequests)
      .leftJoin(users, eq(leaveRequests.userId, users.id))
      .where(eq(leaveRequests.status, "endorsed"))
      .orderBy(leaveRequests.updatedAt);

    // For each request, fetch the manager information
    const requestsWithManagerInfo = await Promise.all(
      endorsedRequests.map(async (request) => {
        if (request.managerId) {
          const manager = await db
            .select({
              firstName: users.firstName,
              lastName: users.lastName,
            })
            .from(users)
            .where(eq(users.id, request.managerId))
            .limit(1);

          if (manager.length > 0) {
            return {
              ...request,
              manager: manager[0],
            };
          }
        }
        return request;
      }),
    );

    return NextResponse.json(requestsWithManagerInfo);
  } catch (error) {
    console.error("Error fetching endorsed leave requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
