"use server";

import db from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

interface LoginState {
  message: string;
  success?: boolean;
}

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function loginUser(_prevState: LoginState | null, formData: FormData): Promise<LoginState | null> {
  let shouldRedirect = false;

  try {
    // Extract and validate form data
    const rawFormData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validatedData = loginSchema.parse(rawFormData);

    // Find user with matching credentials
    const user = await db.select().from(users).where(eq(users.email, validatedData.email)).execute();

    if (user.length === 0 || user[0].password !== validatedData.password) {
      return {
        message: "Invalid email or password",
        success: false,
      };
    }

    // Create session
    const session = await getSession();
    session.isLoggedIn = true;
    session.userId = user[0].id;
    session.firstName = user[0].firstName;
    session.lastName = user[0].lastName;
    session.email = user[0].email;
    session.role = user[0].role;
    await session.save();

    shouldRedirect = true;
    return {
      message: "Login successful",
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        message: error.errors[0].message,
        success: false,
      };
    }
    console.error("Login error:", error);
    return {
      message: "An error occurred during login",
      success: false,
    };
  } finally {
    if (shouldRedirect) {
      redirect("/");
    }
  }
}
