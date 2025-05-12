"use server";

import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

interface RegisterState {
  message: string;
  success?: boolean;
}

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string(),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  sex: z.enum(["Male", "Female"], { required_error: "Sex is required" }),
});

export async function registerUser(
  _prevState: RegisterState | null,
  formData: FormData,
): Promise<RegisterState | null> {
  try {
    //* Extract and validate form data
    const rawFormData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      department: formData.get("department"),
      sex: formData.get("sex"),
    };

    const validatedData = registerSchema.parse(rawFormData);

    //* Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, validatedData.email)).execute();

    if (existingUser.length > 0) {
      return {
        message: "A user with this email already exists",
        success: false,
      };
    }

    //* Insert new user
    await db.insert(users).values({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      password: validatedData.password,
      role: validatedData.role,
      department: validatedData.department,
      sex: validatedData.sex,
    });
    return {
      message: "Registration successful!",
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        message: error.errors[0].message,
        success: false,
      };
    }
    console.error("Registration error:", error);
    return {
      message: "An error occurred during registration",
      success: false,
    };
  }
}
