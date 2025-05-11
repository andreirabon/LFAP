import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import db from "@/db";
import { leaveRequests, users } from "@/db/schema";
import { calculateDays, formatDate } from "@/lib/date-utils";
import { desc, eq } from "drizzle-orm";

// View model for the UI
interface EndorsedLeaveRequest {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  submittedDate: string;
}

function getStatusBadge(status: string) {
  return (
    <Badge
      variant="outline"
      className="bg-yellow-100 text-yellow-800">
      {status}
    </Badge>
  );
}

export default async function EndorsedLeaveRequests() {
  // Fetch all leave requests with status 'endorsed'
  const endorsedRequests = await db
    .select({
      id: leaveRequests.id,
      userId: leaveRequests.userId,
      type: leaveRequests.type,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      reason: leaveRequests.reason,
      status: leaveRequests.status,
      createdAt: leaveRequests.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(leaveRequests)
    .leftJoin(users, eq(leaveRequests.userId, users.id))
    .where(eq(leaveRequests.status, "endorsed"))
    .orderBy(desc(leaveRequests.createdAt));

  // Map database results to view model
  const mappedRequests: EndorsedLeaveRequest[] = endorsedRequests.map((request) => ({
    id: request.id.toString(),
    employeeName: `${request.firstName} ${request.lastName}`,
    type: request.type,
    startDate: request.startDate.toISOString(),
    endDate: request.endDate.toISOString(),
    numberOfDays: calculateDays(request.startDate, request.endDate),
    reason: request.reason,
    submittedDate: request.createdAt.toISOString(),
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Endorsed Leave Requests</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Endorsed Leave Requests ({mappedRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {mappedRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No endorsed leave requests found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.employeeName}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </TableCell>
                    <TableCell>{request.numberOfDays}</TableCell>
                    <TableCell>{getStatusBadge("Endorsed")}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>{formatDate(request.submittedDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
