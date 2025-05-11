import db from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { and, eq, ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get current user's session
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has manager role
    const manager = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: {
        id: true,
        role: true,
        department: true,
      },
    });

    if (!manager) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }

    // Only allow access to managers and super admins
    if (manager.role !== "Manager" && manager.role !== "Super Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get search params from URL
    const searchQuery = request.nextUrl.searchParams.get("search") || "";

    // Base query: Get users from the same department as the manager
    let query = and(
      eq(users.department, manager.department), // Same department as manager
      users.id !== manager.id, // Exclude the manager
    );

    // For super admins, don't filter by department
    if (manager.role === "Super Admin") {
      query = users.id !== manager.id; // Only exclude the manager
    }

    // Add search filter if search query exists
    if (searchQuery) {
      query = and(
        query,
        or(
          ilike(users.firstName, `%${searchQuery}%`),
          ilike(users.lastName, `%${searchQuery}%`),
          // Convert ID to string for search comparison
          ilike(users.id.toString(), `%${searchQuery}%`),
        ),
      );
    }

    // Execute query
    const subordinates = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        department: users.department,
        sex: users.sex,
        vacationLeave: users.vacationLeave,
        mandatoryLeave: users.mandatoryLeave,
        sickLeave: users.sickLeave,
        maternityLeave: users.maternityLeave,
        paternityLeave: users.paternityLeave,
        specialPrivilegeLeave: users.specialPrivilegeLeave,
        usedVacationLeave: users.usedVacationLeave,
        usedMandatoryLeave: users.usedMandatoryLeave,
        usedSickLeave: users.usedSickLeave,
        usedMaternityLeave: users.usedMaternityLeave,
        usedPaternityLeave: users.usedPaternityLeave,
        usedSpecialPrivilegeLeave: users.usedSpecialPrivilegeLeave,
      })
      .from(users)
      .where(query)
      .orderBy(users.firstName, users.lastName);

    return NextResponse.json(subordinates);
  } catch (error) {
    console.error("Error fetching subordinates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
