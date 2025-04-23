"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

// Types
interface Employee {
  id: string;
  name: string;
  department: string;
}

interface LeaveRequest {
  id: string;
  employee: Employee;
  type: string;
  startDate: string;
  endDate: string;
  totalDuration: number;
  reason: string;
  submittedDate: string;
  status: "Pending Manager Approval" | "Endorsed" | "Rejected" | "Returned";
  managerComments?: string;
}

// Sample data
const sampleLeaveRequests: LeaveRequest[] = [
  {
    id: "LR-2024-001",
    employee: {
      id: "EMP001",
      name: "John Doe",
      department: "Information Technology",
    },
    type: "Vacation Leave",
    startDate: "2024-03-20",
    endDate: "2024-03-25",
    totalDuration: 5,
    reason: "Annual family vacation",
    submittedDate: "2024-03-10",
    status: "Pending Manager Approval",
  },
  {
    id: "LR-2024-002",
    employee: {
      id: "EMP002",
      name: "Jane Smith",
      department: "Information Technology",
    },
    type: "Sick Leave",
    startDate: "2024-03-18",
    endDate: "2024-03-19",
    totalDuration: 2,
    reason: "Medical appointment and recovery",
    submittedDate: "2024-03-15",
    status: "Pending Manager Approval",
  },
  {
    id: "LR-2024-003",
    employee: {
      id: "EMP003",
      name: "Bob Wilson",
      department: "Information Technology",
    },
    type: "Personal Leave",
    startDate: "2024-03-22",
    endDate: "2024-03-22",
    totalDuration: 1,
    reason: "Family event",
    submittedDate: "2024-03-16",
    status: "Pending Manager Approval",
  },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function EndorseLeaveRequest() {
  const [requests, setRequests] = useState<LeaveRequest[]>(sampleLeaveRequests);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [managerComments, setManagerComments] = useState("");

  const handleRequestSelect = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setManagerComments(request.managerComments || "");
  };

  const handleAction = (action: "Endorsed" | "Rejected" | "Returned") => {
    if (!selectedRequest) return;
    if (!managerComments.trim() && (action === "Rejected" || action === "Returned")) {
      toast.error("Please provide comments before rejecting or returning the request");
      return;
    }

    // Update the request status locally
    const updatedRequests = requests.map((request) =>
      request.id === selectedRequest.id
        ? {
            ...request,
            status: action,
            managerComments: managerComments.trim(),
          }
        : request,
    );

    setRequests(updatedRequests);
    setSelectedRequest(null);
    setManagerComments("");
    toast.success(`Request ${action.toLowerCase()} successfully`);
  };

  const getStatusColor = (status: LeaveRequest["status"]) => {
    const colors = {
      "Pending Manager Approval": "bg-yellow-100 text-yellow-800",
      Endorsed: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Returned: "bg-orange-100 text-orange-800",
    };
    return colors[status];
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Endorse Leave Requests</h1>

      {/* Pending Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests
                .filter((request) => request.status === "Pending Manager Approval")
                .map((request) => (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRequestSelect(request)}>
                    <TableCell className="font-medium">{request.employee.name}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{formatDate(request.startDate)}</TableCell>
                    <TableCell>{formatDate(request.endDate)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          request.status,
                        )}`}>
                        {request.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Selected Request Details */}
      {selectedRequest && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold">Employee Information</h4>
                <p className="text-sm">
                  Name: {selectedRequest.employee.name}
                  <br />
                  ID: {selectedRequest.employee.id}
                  <br />
                  Department: {selectedRequest.employee.department}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Leave Information</h4>
                <p className="text-sm">
                  Type: {selectedRequest.type}
                  <br />
                  Duration: {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}
                  <br />
                  Total Days: {selectedRequest.totalDuration}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Reason</h4>
                <p className="text-sm">{selectedRequest.reason}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Submission Date</h4>
                <p className="text-sm">{formatDate(selectedRequest.submittedDate)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Unit Schedule Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Unit Schedule Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This section would display the team's availability and schedule during the requested leave period.
                </p>
              </CardContent>
            </Card>

            {/* Manager Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Manager Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comments</label>
                  <Textarea
                    placeholder="Enter your comments here (required for Reject/Return actions)"
                    value={managerComments}
                    onChange={(e) => setManagerComments(e.target.value)}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAction("Endorsed")}
                    className="bg-green-600 hover:bg-green-700">
                    Endorse
                  </Button>
                  <Button
                    onClick={() => handleAction("Rejected")}
                    variant="destructive">
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleAction("Returned")}
                    variant="outline"
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    Return for Clarification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
