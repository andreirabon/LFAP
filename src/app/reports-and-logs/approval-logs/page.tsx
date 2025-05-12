import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import db from "@/db/index";
import { leaveRequests, users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { desc, eq, inArray, or } from "drizzle-orm";
import { redirect } from "next/navigation";

// Database schema type (based on error messages)
interface DbLeaveRequest {
  id: number;
  type: string;
  startDate: Date;
  endDate: Date;
  status: "pending" | "endorsed" | "rejected" | "returned" | "approved" | "tm_approved" | "tm_rejected" | "tm_returned";
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  reason: string;
  supportingDoc: string | null;
}

// User data type
interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

// View model type for the UI
interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: "pending" | "endorsed" | "rejected" | "returned" | "approved" | "tm_approved" | "tm_rejected" | "tm_returned";
  submittedDate: string;
  userName: string;
  userEmail: string;
}

function getStatusColor(status: LeaveRequest["status"]) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    endorsed: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    returned: "bg-orange-100 text-orange-800",
    tm_approved: "bg-emerald-100 text-emerald-800",
    tm_rejected: "bg-rose-100 text-rose-800",
    tm_returned: "bg-amber-100 text-amber-800",
  };
  return colors[status];
}

function getStatusDisplayText(status: LeaveRequest["status"]) {
  const displayText = {
    pending: "Waiting to be Endorsed by Manager",
    endorsed: "Endorsed by the Manager",
    approved: "Approved by the Manager",
    rejected: "Rejected by the Manager",
    returned: "Returned by the Manager",
    tm_approved: "Approved by the Top Management",
    tm_rejected: "Rejected by the Top Management",
    tm_returned: "Returned by the Top Management",
  };
  return displayText[status];
}

function formatDate(date: Date | string) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function calculateDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function mapDbToViewLeaveRequest(dbRequest: DbLeaveRequest, usersMap: Map<number, UserData>): LeaveRequest {
  const user = usersMap.get(dbRequest.userId);
  const userName = user ? `${user.firstName} ${user.lastName}` : "Unknown User";

  return {
    id: dbRequest.id.toString(),
    type: dbRequest.type,
    startDate: dbRequest.startDate.toISOString(),
    endDate: dbRequest.endDate.toISOString(),
    numberOfDays: calculateDays(dbRequest.startDate, dbRequest.endDate),
    status: dbRequest.status,
    submittedDate: dbRequest.createdAt.toISOString(),
    userName,
    userEmail: user?.email || "No Email",
  };
}

export default async function ApprovalLogs() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  // Fetch all tm_approved and endorsed leave requests
  const allApprovedRequests = (await db
    .select()
    .from(leaveRequests)
    .where(or(eq(leaveRequests.status, "tm_approved"), eq(leaveRequests.status, "endorsed")))
    .orderBy(desc(leaveRequests.createdAt))) as DbLeaveRequest[];

  // Extract all unique user IDs from the requests
  const userIds = [...new Set(allApprovedRequests.map((request) => request.userId))];

  // Only try to fetch user data if we have any requests
  const usersMap = new Map<number, UserData>();

  if (userIds.length > 0) {
    // Fetch user data for these users using the inArray operator
    const usersData = (await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(inArray(users.id, userIds))) as UserData[];

    // Create a map of user id to user data for easy lookup
    usersData.forEach((user) => {
      usersMap.set(user.id, user);
    });
  }

  // Map database results to view model
  const mappedLeaveRequests = allApprovedRequests.map((request) => mapDbToViewLeaveRequest(request, usersMap));

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Approved & Endorsed Requests ({mappedLeaveRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {mappedLeaveRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedLeaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{request.userName}</div>
                      <div className="text-xs text-gray-500">{request.userEmail}</div>
                    </TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </TableCell>
                    <TableCell>{request.numberOfDays}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          request.status,
                        )}`}>
                        {getStatusDisplayText(request.status)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(request.submittedDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No approved or endorsed requests found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
