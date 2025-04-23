"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateTime } from "luxon";
import { useState } from "react";

interface LeaveBalance {
  annual: number;
  sick: number;
  personal: number;
}

interface HistoryEntry {
  status: "SUBMITTED" | "ENDORSED" | "REJECTED";
  date: string;
  by: string;
  role?: string;
  comment?: string;
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  leaveType: "ANNUAL" | "SICK" | "PERSONAL";
  startDate: string;
  endDate: string;
  duration: number;
  justification: string;
  leaveBalances: LeaveBalance;
  history: HistoryEntry[];
}

// Sample data
const SAMPLE_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "LR001",
    employeeName: "John Doe",
    employeeId: "EMP001",
    department: "Engineering",
    leaveType: "ANNUAL",
    startDate: "2024-03-20",
    endDate: "2024-03-25",
    duration: 5,
    justification: "Family vacation planned months in advance",
    leaveBalances: {
      annual: 12.5,
      sick: 8.0,
      personal: 3.0,
    },
    history: [
      {
        status: "SUBMITTED",
        date: "2024-02-15",
        by: "John Doe",
      },
      {
        status: "ENDORSED",
        date: "2024-02-16",
        by: "Jane Smith",
        role: "Department Head",
      },
      {
        status: "REJECTED",
        date: "2024-02-17",
        by: "Michael Johnson",
        role: "Top Management",
        comment: "Critical project deadline during requested dates",
      },
    ],
  },
  {
    id: "LR002",
    employeeName: "Sarah Wilson",
    employeeId: "EMP002",
    department: "Marketing",
    leaveType: "SICK",
    startDate: "2024-03-10",
    endDate: "2024-03-12",
    duration: 2,
    justification: "Medical procedure and recovery",
    leaveBalances: {
      annual: 15.0,
      sick: 5.0,
      personal: 2.0,
    },
    history: [
      {
        status: "SUBMITTED",
        date: "2024-02-28",
        by: "Sarah Wilson",
      },
      {
        status: "ENDORSED",
        date: "2024-02-29",
        by: "Robert Brown",
        role: "Team Lead",
      },
      {
        status: "REJECTED",
        date: "2024-03-01",
        by: "Michael Johnson",
        role: "Top Management",
        comment: "Insufficient medical documentation provided",
      },
    ],
  },
  {
    id: "LR003",
    employeeName: "David Lee",
    employeeId: "EMP003",
    department: "Finance",
    leaveType: "PERSONAL",
    startDate: "2024-04-05",
    endDate: "2024-04-05",
    duration: 1,
    justification: "Personal appointment",
    leaveBalances: {
      annual: 18.0,
      sick: 10.0,
      personal: 1.0,
    },
    history: [
      {
        status: "SUBMITTED",
        date: "2024-03-20",
        by: "David Lee",
      },
      {
        status: "ENDORSED",
        date: "2024-03-21",
        by: "Emily Davis",
        role: "Department Head",
      },
      {
        status: "REJECTED",
        date: "2024-03-22",
        by: "Michael Johnson",
        role: "Top Management",
        comment: "Month-end closing period, critical staff presence required",
      },
    ],
  },
];

const LeaveTypeColors = {
  ANNUAL: "bg-blue-100 text-blue-800",
  SICK: "bg-red-100 text-red-800",
  PERSONAL: "bg-green-100 text-green-800",
};

function formatDate(dateString: string): string {
  return DateTime.fromISO(dateString).toFormat("MMM dd, yyyy");
}

export default function RejectedApprovals() {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Rejected Leave Approvals</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List View */}
        <Card>
          <CardHeader>
            <CardTitle>Rejected Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SAMPLE_LEAVE_REQUESTS.map((request) => (
                  <TableRow
                    key={request.id}
                    className={`cursor-pointer hover:bg-muted ${selectedRequest?.id === request.id ? "bg-muted" : ""}`}
                    onClick={() => setSelectedRequest(request)}>
                    <TableCell>{request.employeeName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={LeaveTypeColors[request.leaveType]}>
                        {request.leaveType.charAt(0) + request.leaveType.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(request.startDate)}</TableCell>
                    <TableCell>{formatDate(request.endDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail View */}
        <Card className={!selectedRequest ? "hidden lg:block" : ""}>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequest ? (
              <div className="space-y-6">
                {/* Employee & Leave Details */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Employee Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p>{selectedRequest.employeeName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Employee ID</p>
                      <p>{selectedRequest.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p>{selectedRequest.department}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p>{selectedRequest.duration} day(s)</p>
                    </div>
                  </div>
                </div>

                {/* Leave Balances */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Leave Balances</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="text-xs text-muted-foreground">Annual</p>
                      <p className="font-medium">{selectedRequest.leaveBalances.annual} days</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <p className="text-xs text-muted-foreground">Sick</p>
                      <p className="font-medium">{selectedRequest.leaveBalances.sick} days</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-xs text-muted-foreground">Personal</p>
                      <p className="font-medium">{selectedRequest.leaveBalances.personal} days</p>
                    </div>
                  </div>
                </div>

                {/* Justification */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Employee Justification</h3>
                  <p className="text-sm">{selectedRequest.justification}</p>
                </div>

                {/* Request History */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Request History</h3>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="space-y-4">
                      {selectedRequest.history.map((entry, index) => (
                        <div
                          key={index}
                          className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                entry.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : entry.status === "ENDORSED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }>
                              {entry.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
                          </div>
                          <p className="text-sm">
                            by {entry.by}
                            {entry.role && ` (${entry.role})`}
                          </p>
                          {entry.comment && (
                            <p className="text-sm text-muted-foreground">&ldquo;{entry.comment}&rdquo;</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">Select a request to view details</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
