import db from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        vacationLeave: true,
        mandatoryLeave: true,
        sickLeave: true,
        specialPrivilegeLeave: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const leaveBalances = [
      {
        type: "Vacation Leave",
        total: user.vacationLeave,
        used: 0, // TODO: Calculate from leave_requests table
        remaining: user.vacationLeave,
        color: "text-blue-600",
      },
      {
        type: "Mandatory/Force Leave",
        total: user.mandatoryLeave,
        used: 0,
        remaining: user.mandatoryLeave,
        color: "text-purple-600",
      },
      {
        type: "Sick Leave",
        total: user.sickLeave,
        used: 0,
        remaining: user.sickLeave,
        color: "text-red-600",
      },
      {
        type: "Special Privilege Leave",
        total: user.specialPrivilegeLeave,
        used: 0,
        remaining: user.specialPrivilegeLeave,
        color: "text-green-600",
      },
    ];

    return NextResponse.json({ leaveBalances });
  } catch (error) {
    console.error("Error fetching leave balances:", error);
    return NextResponse.json({ error: "Failed to fetch leave balances" }, { status: 500 });
  }
}
