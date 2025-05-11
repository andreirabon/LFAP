import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  department?: string | null;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "lfap_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }

  return session;
}
