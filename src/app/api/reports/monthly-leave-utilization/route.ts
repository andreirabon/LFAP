import db from "@/db";
import { leaveRequests, users } from "@/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// Function to get the first and last day of a month
function getMonthBoundaries(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  return { firstDay, lastDay };
}

// Calculate the number of days between two dates (inclusive)
function calculateDaysBetween(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const differenceInTime = end.getTime() - start.getTime();
  return Math.floor(differenceInTime / (1000 * 3600 * 24)) + 1;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get year and month from query params or use current month
    const currentDate = new Date();
    const year = parseInt(searchParams.get("year") || currentDate.getFullYear().toString());
    const month = parseInt(searchParams.get("month") || (currentDate.getMonth() + 1).toString());

    // Get first and last day of the month
    const { firstDay, lastDay } = getMonthBoundaries(year, month);

    // Get all leave requests that overlap with the specified month
    const leaveRequestsData = await db
      .select({
        id: leaveRequests.id,
        userId: leaveRequests.userId,
        type: leaveRequests.type,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        status: leaveRequests.status,
        department: users.department,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(leaveRequests)
      .leftJoin(users, eq(leaveRequests.userId, users.id))
      .where(
        and(
          // Leave request starts before or during the month
          lte(leaveRequests.startDate, lastDay),
          // Leave request ends after or during the month
          gte(leaveRequests.endDate, firstDay),
          // Only include approved leaves
          eq(leaveRequests.status, "tm_approved"),
        ),
      );

    // Process the leave requests to calculate days within the specified month
    const departmentData: Record<string, { leaveDays: number; employeeCount: number }> = {};
    const leaveTypeCount: Record<string, number> = {};
    const employeeData: Array<{
      name: string;
      department: string;
      leaveDays: number;
      leaveType: string;
    }> = [];

    // Get unique users with departments
    const allUsersWithDepts = await db
      .select({
        id: users.id,
        department: users.department,
      })
      .from(users)
      .where(sql`${users.department} IS NOT NULL`);

    // Count employees per department
    const deptEmployeeCount: Record<string, number> = {};
    allUsersWithDepts.forEach((user) => {
      if (user.department) {
        deptEmployeeCount[user.department] = (deptEmployeeCount[user.department] || 0) + 1;
      }
    });

    // Calculate leave days per department and leave type
    leaveRequestsData.forEach((leave) => {
      if (!leave.department) return;

      // Calculate days that fall within the month
      const startDate = new Date(leave.startDate) < firstDay ? firstDay : new Date(leave.startDate);
      const endDate = new Date(leave.endDate) > lastDay ? lastDay : new Date(leave.endDate);
      const daysInMonth = calculateDaysBetween(startDate, endDate);

      // Aggregate department data
      if (!departmentData[leave.department]) {
        departmentData[leave.department] = {
          leaveDays: 0,
          employeeCount: deptEmployeeCount[leave.department] || 0,
        };
      }
      departmentData[leave.department].leaveDays += daysInMonth;

      // Aggregate leave type data
      leaveTypeCount[leave.type] = (leaveTypeCount[leave.type] || 0) + 1;

      // Aggregate employee data
      employeeData.push({
        name: `${leave.firstName} ${leave.lastName}`,
        department: leave.department,
        leaveDays: daysInMonth,
        leaveType: leave.type,
      });
    });

    // Format department data for response
    const formattedDepartmentData = Object.entries(departmentData).map(([department, data]) => ({
      department,
      leaveDays: data.leaveDays,
      employeeCount: data.employeeCount,
    }));

    // Find most utilized leave type
    let mostUtilizedLeaveType = { type: "", count: 0 };
    Object.entries(leaveTypeCount).forEach(([type, count]) => {
      if (count > mostUtilizedLeaveType.count) {
        mostUtilizedLeaveType = { type, count };
      }
    });

    return NextResponse.json({
      departmentData: formattedDepartmentData,
      employeeData,
      mostUtilizedLeaveType: mostUtilizedLeaveType.count > 0 ? mostUtilizedLeaveType : null,
      year,
      month,
    });
  } catch (error) {
    console.error("Error fetching leave utilization data:", error);
    return NextResponse.json({ error: "Failed to fetch leave utilization data" }, { status: 500 });
  }
}
