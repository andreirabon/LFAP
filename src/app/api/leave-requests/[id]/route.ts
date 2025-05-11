import db from "@/db";
import { leaveRequests } from "@/db/schema";
import { auth } from "@/lib/auth";
import { NextResponse, RouteHandlerParams } from "@/lib/route-types";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";

export async function GET(request: Request, context: RouteHandlerParams<{ id: string }>): Promise<Response> {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authResult = await auth();
    const userId = authResult?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaveRequestId = parseInt(context.params.id, 10);
    if (isNaN(leaveRequestId)) {
      return NextResponse.json({ error: "Invalid leave request ID" }, { status: 400 });
    }

    // Get the leave request
    const [leaveRequest] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, leaveRequestId)).limit(1);

    if (!leaveRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    // Verify the user owns this leave request
    if (leaveRequest.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to view this leave request" }, { status: 403 });
    }

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error("Error fetching leave request:", error);
    return NextResponse.json({ error: "Failed to fetch leave request" }, { status: 500 });
  }
}
