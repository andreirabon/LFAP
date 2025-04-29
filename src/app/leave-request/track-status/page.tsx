import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  submittedDate: string;
}

const sampleLeaveRequests: LeaveRequest[] = [
  {
    id: "LR-2024-001",
    type: "Vacation Leave",
    startDate: "2024-03-15",
    endDate: "2024-03-20",
    numberOfDays: 5,
    status: "Pending",
    submittedDate: "2024-03-01",
  },
  {
    id: "LR-2024-002",
    type: "Sick Leave",
    startDate: "2024-02-28",
    endDate: "2024-02-29",
    numberOfDays: 2,
    status: "Approved",
    submittedDate: "2024-02-27",
  },
  {
    id: "LR-2024-003",
    type: "Special Privilege Leave",
    startDate: "2024-02-14",
    endDate: "2024-02-14",
    numberOfDays: 1,
    status: "Rejected",
    submittedDate: "2024-02-10",
  },
];

function getStatusColor(status: LeaveRequest["status"]) {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Cancelled: "bg-gray-100 text-gray-800",
  };
  return colors[status];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function TrackStatus() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

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
              {sampleLeaveRequests.map((request) => (
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
