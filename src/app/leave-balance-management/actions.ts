"use server";

import db from "@/db";
import { users } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import { z } from "zod";

// Define validation schema
const searchEmployeeSchema = z.object({
  employeeId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type EmployeeSearchParams = z.infer<typeof searchEmployeeSchema>;

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  sex: string;
  department: string | null;
  vacationLeave: number;
  mandatoryLeave: number;
  sickLeave: number;
  maternityLeave: number;
  paternityLeave: number;
  specialPrivilegeLeave: number;
}

// Add LeaveTypeKey definition
export type LeaveTypeKey =
  | "vacationLeave"
  | "mandatoryLeave"
  | "sickLeave"
  | "maternityLeave"
  | "paternityLeave"
  | "specialPrivilegeLeave";

export async function searchEmployees(params: EmployeeSearchParams): Promise<Employee[]> {
  try {
    // Validate input
    const validatedParams = searchEmployeeSchema.parse(params);

    // Filter out empty search terms
    const filters = [];

    if (validatedParams.employeeId && validatedParams.employeeId.trim() !== "") {
      const idNumber = parseInt(validatedParams.employeeId);
      if (!isNaN(idNumber)) {
        filters.push(eq(users.id, idNumber));
      }
    }

    if (validatedParams.firstName && validatedParams.firstName.trim() !== "") {
      filters.push(ilike(users.firstName, `%${validatedParams.firstName}%`));
    }

    if (validatedParams.lastName && validatedParams.lastName.trim() !== "") {
      filters.push(ilike(users.lastName, `%${validatedParams.lastName}%`));
    }

    // If no search filters provided, return empty array
    if (filters.length === 0) {
      return [];
    }

    // Construct and execute query with OR logic
    const results = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        sex: users.sex,
        department: users.department,
        vacationLeave: users.vacationLeave,
        mandatoryLeave: users.mandatoryLeave,
        sickLeave: users.sickLeave,
        maternityLeave: users.maternityLeave,
        paternityLeave: users.paternityLeave,
        specialPrivilegeLeave: users.specialPrivilegeLeave,
      })
      .from(users)
      .where(or(...filters))
      .execute();

    return results;
  } catch (error) {
    console.error("Error searching employees:", error);
    throw new Error("Failed to search employees");
  }
}

// New server action to update employee leave balance
const updateLeaveBalanceSchema = z.object({
  employeeId: z.number().int().positive(),
  leaveType: z.enum([
    "vacationLeave",
    "mandatoryLeave",
    "sickLeave",
    "maternityLeave",
    "paternityLeave",
    "specialPrivilegeLeave",
  ]),
  newValue: z.number().int().min(0, "Leave balance cannot be negative."),
});

export type UpdateLeaveBalanceParams = z.infer<typeof updateLeaveBalanceSchema>;

// Define a type for possible Drizzle ORM update result shapes
type DrizzleUpdateResult =
  | {
      rowCount?: number;
      rowsAffected?: number;
    }
  | unknown[];

export async function updateEmployeeLeaveBalance(
  params: UpdateLeaveBalanceParams,
): Promise<{ success: boolean; message?: string; updatedBalance?: number }> {
  try {
    const validatedParams = updateLeaveBalanceSchema.parse(params);

    // Create an update object with a dynamic key
    const updateData: Partial<typeof users.$inferInsert> = {};
    updateData[validatedParams.leaveType] = validatedParams.newValue;

    const result = await db.update(users).set(updateData).where(eq(users.id, validatedParams.employeeId)).execute();

    // Cast result to our defined type for handling different return structures
    const typedResult = result as DrizzleUpdateResult;

    const rowsAffected: number | null =
      ("rowCount" in typedResult && typeof typedResult.rowCount === "number" ? typedResult.rowCount : 0) ||
      (Array.isArray(typedResult) && typedResult.length > 0 ? typedResult.length : 0) ||
      ("rowsAffected" in typedResult && typeof typedResult.rowsAffected === "number" ? typedResult.rowsAffected : null);

    if (rowsAffected === null || rowsAffected > 0) {
      // Assuming success if rowsAffected is not definitively zero.
      // Some drivers might not return rowCount for updates without RETURNING.
      // Ideally, for critical updates, use .returning() to confirm the change.
      return {
        success: true,
        message: "Leave balance updated successfully.",
        updatedBalance: validatedParams.newValue,
      };
    } else {
      return { success: false, message: "Employee not found or no changes needed." };
    }
  } catch (error) {
    console.error("Error updating leave balance:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: `Validation error: ${error.errors.map((e) => e.message).join(", ")}` };
    }
    return { success: false, message: "Failed to update leave balance due to a server error." };
  }
}
