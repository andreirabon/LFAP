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
    // Get department filter (if specified in request)
    const departmentFilter = request.nextUrl.searchParams.get("department");

    console.log("API Request Info:", {
      userId: session.userId,
      managerRole: manager.role,
      managerDepartment: manager.department,
      searchQuery,
      departmentFilter,
    });

    // Create base query conditions
    const queryConditions = [];

    // Always exclude the current user from results
    queryConditions.push(ne(users.id, manager.id));

    // Add search filter if search query exists
    if (searchQuery && searchQuery.trim() !== "") {
      queryConditions.push(or(ilike(users.firstName, `%${searchQuery}%`), ilike(users.lastName, `%${searchQuery}%`)));
    }

    // Handle department filtering differently based on role
    if (manager.role === "Super Admin") {
      // Super Admin with explicit department filter
      if (departmentFilter && departmentFilter.trim() !== "") {
        console.log("Super Admin filtering by department:", departmentFilter);
        queryConditions.push(eq(users.department, departmentFilter));
      } else {
        console.log("Super Admin viewing all departments");
        // No department filter for Super Admin
      }
    } else {
      // Regular managers MUST only see their own department
      if (!manager.department) {
        console.log("Manager without department - no results will be shown");
        return NextResponse.json([]); // Return empty array if manager has no department
      }

      console.log("Restricting to manager's department:", manager.department);
      queryConditions.push(eq(users.department, manager.department));
    }

    // Combine all conditions with AND
    const finalQuery = and(...queryConditions);

    console.log("Final query conditions:", JSON.stringify(queryConditions, null, 2));

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

    console.log(`Found ${subordinates.length} subordinates matching criteria`);

    // Extra verification on the results (debug logging)
    if (manager.role !== "Super Admin" && manager.department) {
      const wrongDept = subordinates.filter((sub) => sub.department !== manager.department);
      if (wrongDept.length > 0) {
        console.error(`Error: Found ${wrongDept.length} subordinates from wrong departments!`);
        console.error(
          "Problem subordinates:",
          wrongDept.map((sub) => ({
            id: sub.id,
            name: `${sub.firstName} ${sub.lastName}`,
            dept: sub.department,
          })),
        );
      }
    }

    return NextResponse.json(subordinates);
  } catch (error) {
    console.error("Error fetching subordinates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
