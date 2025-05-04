import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import db from "@/db/index";
import { leaveRequests } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { and, desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

// Database schema type (based on error messages)
interface DbLeaveRequest {
  id: number;
  type: string;
  startDate: Date;
  endDate: Date;
  status: "pending" | "approved" | "rejected";
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
  status: "pending" | "approved" | "rejected" | "cancelled";
  submittedDate: string;
}

function getStatusColor(status: LeaveRequest["status"]) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };
  return colors[status];
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

  // Fetch leave requests for the current user
  const userLeaveRequests = (await db.query.leaveRequests.findMany({
    where: and(
      inArray(leaveRequests.status, ["pending", "approved", "rejected"] as const),
      eq(leaveRequests.userId, userId),
    ),
    orderBy: [desc(leaveRequests.createdAt)],
  })) as DbLeaveRequest[];

  // Map database results to view model
  const mappedLeaveRequests = userLeaveRequests.map(mapDbToViewLeaveRequest);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Leave Request Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
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
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(request.submittedDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
