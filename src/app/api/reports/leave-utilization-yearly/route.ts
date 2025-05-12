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

    // Get year from query params or use current year
    const currentDate = new Date();
    const year = parseInt(searchParams.get("year") || currentDate.getFullYear().toString());

    // Create an array to hold monthly data
    const monthlyData = [];

    // Get all users with departments once for efficiency
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

    // Get all leave requests for the entire year
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const allYearLeaveRequests = await db
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
          lte(leaveRequests.startDate, yearEnd),
          gte(leaveRequests.endDate, yearStart),
          eq(leaveRequests.status, "tm_approved"),
        ),
      );

    // Process data for each month
    for (let month = 1; month <= 12; month++) {
      const { firstDay, lastDay } = getMonthBoundaries(year, month);

      // Initialize data structures for this month
      const departmentData: Record<string, { leaveDays: number; employeeCount: number }> = {};
      const leaveTypeCount: Record<string, number> = {};

      // Filter leave requests for current month
      const monthLeaves = allYearLeaveRequests.filter((leave) => {
        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate);
        return leaveStart <= lastDay && leaveEnd >= firstDay;
      });

      // Process leave requests for this month
      monthLeaves.forEach((leave) => {
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
      });

      // Format department data
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

      // Add month data to result
      monthlyData.push({
        month,
        monthName: new Date(year, month - 1, 1).toLocaleString("default", { month: "long" }),
        departmentData: formattedDepartmentData,
        mostUtilizedLeaveType: mostUtilizedLeaveType.count > 0 ? mostUtilizedLeaveType : null,
      });
    }

    return NextResponse.json({
      year,
      monthlyData,
    });
  } catch (error) {
    console.error("Error fetching yearly leave utilization data:", error);
    return NextResponse.json({ error: "Failed to fetch yearly leave utilization data" }, { status: 500 });
  }
}
