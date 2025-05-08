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
  vacationLeave: number;
  mandatoryLeave: number;
  sickLeave: number;
  maternityLeave: number;
  paternityLeave: number;
  specialPrivilegeLeave: number;
}

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
