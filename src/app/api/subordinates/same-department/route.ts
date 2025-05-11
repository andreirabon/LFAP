import db from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { and, eq, ilike, ne, or } from "drizzle-orm";
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

    // IMPORTANT: For regular managers, department filtering is MANDATORY
    if (manager.role !== "Super Admin" && !manager.department) {
      console.log("Manager without department - returning empty result");
      return NextResponse.json([]);
    }

    console.log("API Request Info:", {
      userId: session.userId,
      managerRole: manager.role,
      managerDepartment: manager.department,
      searchQuery,
    });

    // Create query conditions
    const queryConditions = [
      // Always exclude the current user
      ne(users.id, manager.id),
    ];

    // Add search condition if provided
    if (searchQuery && searchQuery.trim() !== "") {
      queryConditions.push(or(ilike(users.firstName, `%${searchQuery}%`), ilike(users.lastName, `%${searchQuery}%`)));
    }

    // For regular managers, ALWAYS filter by department
    // For Super Admins, we don't filter by department (they see all)
    if (manager.role !== "Super Admin") {
      if (!manager.department) {
        return NextResponse.json([]);
      }
      console.log("Filtering by department:", manager.department);
      queryConditions.push(eq(users.department, manager.department));
    }

    const finalQuery = and(...queryConditions);
    // Don't stringify objects with circular references
    console.log("Query conditions applied");

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
      .where(finalQuery)
      .orderBy(users.firstName, users.lastName);

    console.log(`Found ${subordinates.length} subordinates in same department`);

    // Double-check results - STRICT FILTERING for regular managers
    if (manager.role !== "Super Admin" && manager.department) {
      // Filter out any subordinates that don't match the manager's department
      const filteredSubordinates = subordinates.filter((sub) => sub.department === manager.department);

      // Log if any were filtered out
      const filteredCount = subordinates.length - filteredSubordinates.length;
      if (filteredCount > 0) {
        console.warn(`Filtered out ${filteredCount} subordinates from different departments`);
      }

      // Return only the filtered subordinates that match the department
      return NextResponse.json(filteredSubordinates);
    }

    return NextResponse.json(subordinates);
  } catch (error) {
    console.error("Error fetching subordinates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
