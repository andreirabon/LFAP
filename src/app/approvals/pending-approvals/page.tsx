"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateTime } from "luxon";
import { useState } from "react";

interface LeaveBalance {
  annual: number;
  sick: number;
  unpaid: number;
}

interface StatusUpdate {
  status: string;
  updatedBy: string;
  updatedAt: Date;
  comments?: string;
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  leaveType: "Annual" | "Sick" | "Unpaid";
  reason: string;
  status: "Endorsed" | "Approved" | "Rejected";
  leaveBalance: LeaveBalance;
  statusTrail: StatusUpdate[];
}

// Sample data
const sampleLeaveRequests: LeaveRequest[] = [
  {
    id: "LR001",
    employeeName: "John Doe",
    employeeId: "EMP001",
    startDate: new Date("2024-03-20"),
    endDate: new Date("2024-03-25"),
    duration: 5,
    leaveType: "Annual",
    reason: "Family vacation",
    status: "Endorsed",
    leaveBalance: {
      annual: 15,
      sick: 10,
      unpaid: 0,
    },
    statusTrail: [
      {
        status: "Submitted",
        updatedBy: "John Doe",
        updatedAt: new Date("2024-03-10"),
      },
      {
        status: "Endorsed",
        updatedBy: "Jane Smith (Manager)",
        updatedAt: new Date("2024-03-12"),
        comments: "Employee has sufficient leave balance",
      },
    ],
  },
  {
    id: "LR002",
    employeeName: "Alice Johnson",
    employeeId: "EMP002",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-04-03"),
    duration: 3,
    leaveType: "Sick",
    reason: "Medical appointment and recovery",
    status: "Endorsed",
    leaveBalance: {
      annual: 12,
      sick: 8,
      unpaid: 0,
    },
    statusTrail: [
      {
        status: "Submitted",
        updatedBy: "Alice Johnson",
        updatedAt: new Date("2024-03-15"),
      },
      {
        status: "Endorsed",
        updatedBy: "Bob Wilson (Manager)",
        updatedAt: new Date("2024-03-16"),
        comments: "Medical certificate provided",
      },
    ],
  },
];

export default function PendingApprovals() {
  const [requests, setRequests] = useState<LeaveRequest[]>(sampleLeaveRequests);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const handleAction = (requestId: string, action: "Approved" | "Rejected") => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: action,
              statusTrail: [
                ...request.statusTrail,
                {
                  status: action,
                  updatedBy: "Top Management",
                  updatedAt: new Date(),
                  comments: `Leave request ${action.toLowerCase()} by top management`,
                },
              ],
            }
          : request,
      ),
    );
    setSelectedRequest(null);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Pending Leave Approvals</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee Name</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.employeeName}</TableCell>
              <TableCell>{request.leaveType}</TableCell>
              <TableCell>{DateTime.fromJSDate(request.startDate).toFormat("dd LLL yyyy")}</TableCell>
              <TableCell>{DateTime.fromJSDate(request.endDate).toFormat("dd LLL yyyy")}</TableCell>
              <TableCell>{request.duration} days</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === "Endorsed"
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                  {request.status}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRequest(request)}
                  disabled={request.status !== "Endorsed"}>
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedRequest && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leave Request Details</CardTitle>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => handleAction(selectedRequest.id, "Rejected")}>
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAction(selectedRequest.id, "Approved")}>
                Approve
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-2">Employee Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>Name: {selectedRequest.employeeName}</p>
                  <p>Employee ID: {selectedRequest.employeeId}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Leave Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>Type: {selectedRequest.leaveType}</p>
                  <p>Duration: {selectedRequest.duration} days</p>
                  <p>Start: {DateTime.fromJSDate(selectedRequest.startDate).toFormat("dd LLL yyyy")}</p>
                  <p>End: {DateTime.fromJSDate(selectedRequest.endDate).toFormat("dd LLL yyyy")}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Leave Balances</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Annual Leave</p>
                  <p className="text-lg font-semibold">{selectedRequest.leaveBalance.annual} days</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Sick Leave</p>
                  <p className="text-lg font-semibold">{selectedRequest.leaveBalance.sick} days</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Unpaid Leave</p>
                  <p className="text-lg font-semibold">{selectedRequest.leaveBalance.unpaid} days</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Reason</h3>
              <div className="bg-gray-50 p-4 rounded-lg">{selectedRequest.reason}</div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Status History</h3>
              <div className="space-y-2">
                {selectedRequest.statusTrail.map((status, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg flex justify-between">
                    <div>
                      <p className="font-medium">{status.status}</p>
                      <p className="text-sm text-gray-600">{status.updatedBy}</p>
                      {status.comments && <p className="text-sm text-gray-600 mt-1">{status.comments}</p>}
                    </div>
                    <p className="text-sm text-gray-600">
                      {DateTime.fromJSDate(status.updatedAt).toFormat("dd LLL yyyy HH:mm")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
