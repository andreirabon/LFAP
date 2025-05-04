import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "./session";

export interface Session {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export async function auth(): Promise<Session | null> {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return null;
    }

    // Get user from database using session ID
    const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

    if (!user.length) {
      return null;
    }

    return {
      user: {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
      },
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
