import db from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        sex: true,
        vacationLeave: true,
        mandatoryLeave: true,
        sickLeave: true,
        specialPrivilegeLeave: true,
        maternityLeave: true,
        paternityLeave: true,
        usedVacationLeave: true,
        usedMandatoryLeave: true,
        usedSickLeave: true,
        usedMaternityLeave: true,
        usedPaternityLeave: true,
        usedSpecialPrivilegeLeave: true,
      },
    });

    if (!userResult) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User data from database:", userResult);
    console.log("User sex:", userResult.sex);
    console.log("Maternity leave value:", userResult.maternityLeave);

    // Build leave balances based on actual user data
    const leaveBalances = [
      {
        type: "Vacation Leave",
        total: userResult.vacationLeave,
        used: userResult.usedVacationLeave,
        remaining: userResult.vacationLeave - userResult.usedVacationLeave,
        color: "text-blue-600",
      },
      {
        type: "Mandatory/Force Leave",
        total: userResult.mandatoryLeave,
        used: userResult.usedMandatoryLeave,
        remaining: userResult.mandatoryLeave - userResult.usedMandatoryLeave,
        color: "text-purple-600",
      },
      {
        type: "Sick Leave",
        total: userResult.sickLeave,
        used: userResult.usedSickLeave,
        remaining: userResult.sickLeave - userResult.usedSickLeave,
        color: "text-red-600",
      },
      {
        type: "Special Privilege Leave",
        total: userResult.specialPrivilegeLeave,
        used: userResult.usedSpecialPrivilegeLeave,
        remaining: userResult.specialPrivilegeLeave - userResult.usedSpecialPrivilegeLeave,
        color: "text-green-600",
      },
    ];

    // Check for male users (paternity leave)
    const isMale = userResult.sex?.toLowerCase() === "male" || userResult.sex?.toLowerCase() === "m";
    if (isMale && userResult.paternityLeave > 0) {
      leaveBalances.push({
        type: "Paternity Leave",
        total: userResult.paternityLeave,
        used: userResult.usedPaternityLeave,
        remaining: userResult.paternityLeave - userResult.usedPaternityLeave,
        color: "text-sky-600",
      });
    }

    // Check for female users (maternity leave)
    // More flexible check for "female" values
    const isFemale = userResult.sex?.toLowerCase() === "female" || userResult.sex?.toLowerCase() === "f";
    console.log("Is user female?", isFemale);

    // Always add maternity leave for female users with a default value if not set
    if (isFemale) {
      // Default to 105 days if not set (standard maternity leave in many places)
      const maternityTotal = userResult.maternityLeave;
      const maternityUsed = userResult.usedMaternityLeave;

      leaveBalances.push({
        type: "Maternity Leave",
        total: maternityTotal,
        used: maternityUsed,
        remaining: maternityTotal - maternityUsed,
        color: "text-pink-600",
      });
    }

    return NextResponse.json({
      leaveBalances,
      userSex: userResult.sex || null,
    });
  } catch (error) {
    console.error("Error fetching leave balances:", error);
    return NextResponse.json({ error: "Failed to fetch leave balances" }, { status: 500 });
  }
}
