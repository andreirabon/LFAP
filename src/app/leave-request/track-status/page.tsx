import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import db from "@/db/index";
import { leaveRequests } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
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

// View model type for the UI
interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: "pending" | "endorsed" | "rejected" | "returned" | "approved" | "tm_approved" | "tm_rejected" | "tm_returned";
  submittedDate: string;
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

function mapDbToViewLeaveRequest(dbRequest: DbLeaveRequest): LeaveRequest {
  return {
    id: dbRequest.id.toString(),
    type: dbRequest.type,
    startDate: dbRequest.startDate.toISOString(),
    endDate: dbRequest.endDate.toISOString(),
    numberOfDays: calculateDays(dbRequest.startDate, dbRequest.endDate),
    status: dbRequest.status,
    submittedDate: dbRequest.createdAt.toISOString(),
  };
}

export default async function TrackStatus() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  // Get the current user's ID from the auth session
  const authResult = await auth();
  const userId = authResult?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch all leave requests for the current user regardless of status
  const userLeaveRequests = (await db.query.leaveRequests.findMany({
    where: eq(leaveRequests.userId, userId),
    orderBy: [desc(leaveRequests.createdAt)],
  })) as DbLeaveRequest[];

  // Map database results to view model
  const mappedLeaveRequests = userLeaveRequests.map(mapDbToViewLeaveRequest);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Leave Request Status ({mappedLeaveRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {mappedLeaveRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedLeaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
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
                    <TableCell>
                      {(request.status === "returned" || request.status === "tm_returned") && (
                        <Link href={`/leave-request/edit/${request.id}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-orange-100 text-orange-800">
                            Edit Request
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No pending requests at this time</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
