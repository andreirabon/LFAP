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
        usedVacationLeave: true,
        usedMandatoryLeave: true,
        usedSickLeave: true,
        usedMaternityLeave: true,
        usedSpecialPrivilegeLeave: true,
      },
    });

    if (!userLeaveBalances) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Transform the database result into the LeaveBalance[] format
    return [
      {
        type: "Vacation Leave",
        total: userLeaveBalances.vacationLeave + (userLeaveBalances.usedVacationLeave ?? 0),
        used: userLeaveBalances.usedVacationLeave ?? 0,
        remaining: userLeaveBalances.vacationLeave,
        description: "Annual vacation leave for rest and recreation",
        color: "text-blue-600",
      },
      {
        type: "Mandatory/Force Leave",
        total: userLeaveBalances.mandatoryLeave + (userLeaveBalances.usedMandatoryLeave ?? 0),
        used: userLeaveBalances.usedMandatoryLeave ?? 0,
        remaining: userLeaveBalances.mandatoryLeave,
        description: "Required leave days that must be taken within the year",
        color: "text-purple-600",
      },
      {
        type: "Sick Leave",
        total: userLeaveBalances.sickLeave + (userLeaveBalances.usedSickLeave ?? 0),
        used: userLeaveBalances.usedSickLeave ?? 0,
        remaining: userLeaveBalances.sickLeave,
        description: "Leave for medical reasons and recovery",
        color: "text-red-600",
      },
      {
        type: "Maternity Leave",
        total: userLeaveBalances.maternityLeave + (userLeaveBalances.usedMaternityLeave ?? 0),
        used: userLeaveBalances.usedMaternityLeave ?? 0,
        remaining: userLeaveBalances.maternityLeave,
        description: "Leave for childbirth and maternal care",
        color: "text-pink-600",
      },
      {
        type: "Special Privilege Leave",
        total: userLeaveBalances.specialPrivilegeLeave + (userLeaveBalances.usedSpecialPrivilegeLeave ?? 0),
        used: userLeaveBalances.usedSpecialPrivilegeLeave ?? 0,
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
