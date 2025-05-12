import db from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  // If user is logged in, fetch complete user data including department
  if (session.isLoggedIn && session.userId) {
    try {
      const userData = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

      if (userData.length > 0) {
        // Add user data to the session response
        return NextResponse.json({
          ...session,
          user: {
            id: userData[0].id,
            firstName: userData[0].firstName,
            lastName: userData[0].lastName,
            email: userData[0].email,
            role: userData[0].role,
            department: userData[0].department,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  return NextResponse.json(session);
}
