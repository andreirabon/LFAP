import db from "@/db";
import { users } from "@/db/schema";
import { LeaveBalance } from "@/types/leave";
import { eq } from "drizzle-orm";

export async function getUserLeaveBalances(userId: number): Promise<LeaveBalance[]> {
  try {
    const userLeaveBalances = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        vacationLeave: true,
        mandatoryLeave: true,
        sickLeave: true,
        maternityLeave: true,
        specialPrivilegeLeave: true,
      },
    });

    if (!userLeaveBalances) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Transform the database result into the LeaveBalance[] format
    return [
      {
        type: "Vacation Leave",
        total: 50, // These could be configurable constants
        used: 50 - userLeaveBalances.vacationLeave,
        remaining: userLeaveBalances.vacationLeave,
        description: "Annual vacation leave for rest and recreation",
        color: "text-blue-600",
      },
      {
        type: "Mandatory/Force Leave",
        total: 5,
        used: 5 - userLeaveBalances.mandatoryLeave,
        remaining: userLeaveBalances.mandatoryLeave,
        description: "Required leave days that must be taken within the year",
        color: "text-purple-600",
      },
      {
        type: "Sick Leave",
        total: 15,
        used: 15 - userLeaveBalances.sickLeave,
        remaining: userLeaveBalances.sickLeave,
        description: "Leave for medical reasons and recovery",
        color: "text-red-600",
      },
      {
        type: "Maternity Leave",
        total: 105,
        used: 105 - userLeaveBalances.maternityLeave,
        remaining: userLeaveBalances.maternityLeave,
        description: "Leave for childbirth and maternal care",
        color: "text-pink-600",
      },
      {
        type: "Special Privilege Leave",
        total: 3,
        used: 3 - userLeaveBalances.specialPrivilegeLeave,
        remaining: userLeaveBalances.specialPrivilegeLeave,
        description: "Leave for special occasions or personal matters",
        color: "text-green-600",
      },
    ];
  } catch (error) {
    console.error("Error fetching user leave balances:", error);
    throw error;
  }
}
