"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  leaveType: "Annual" | "Sick" | "Unpaid" | "Maternity" | "Paternity";
  startDate: string;
  endDate: string;
  totalDays: number;
  dateSubmitted: string;
  justification: string;
  status: "Endorsed" | "Approved" | "Rejected";
}

interface EmployeeBalance {
  annualLeave: number;
  sickLeave: number;
  unpaidLeave: number;
  maternityLeave: number;
  paternityLeave: number;
}

interface RequestHistoryItem {
  id: string;
  leaveType: LeaveRequest["leaveType"];
  startDate: string;
  endDate: string;
  status: LeaveRequest["status"];
  totalDays: number;
}

// Sample data
const sampleLeaveRequests: LeaveRequest[] = [
  {
    id: "LR001",
    employeeName: "John Doe",
    department: "Engineering",
    leaveType: "Annual",
    startDate: "2024-04-01",
    endDate: "2024-04-05",
    totalDays: 5,
    dateSubmitted: "2024-03-15",
    justification: "Family vacation",
    status: "Endorsed",
  },
  {
    id: "LR002",
    employeeName: "Jane Smith",
    department: "Marketing",
    leaveType: "Sick",
    startDate: "2024-03-25",
    endDate: "2024-03-26",
    totalDays: 2,
    dateSubmitted: "2024-03-24",
    justification: "Medical appointment",
    status: "Endorsed",
  },
  {
    id: "LR003",
    employeeName: "Alice Johnson",
    department: "Finance",
    leaveType: "Annual",
    startDate: "2024-04-10",
    endDate: "2024-04-12",
    totalDays: 3,
    dateSubmitted: "2024-03-20",
    justification: "Personal matters",
    status: "Endorsed",
  },
];

const sampleEmployeeBalances: Record<string, EmployeeBalance> = {
  "John Doe": {
    annualLeave: 10,
    sickLeave: 14,
    unpaidLeave: 0,
    maternityLeave: 0,
    paternityLeave: 5,
  },
  "Jane Smith": {
    annualLeave: 8,
    sickLeave: 12,
    unpaidLeave: 0,
    maternityLeave: 90,
    paternityLeave: 0,
  },
  "Alice Johnson": {
    annualLeave: 15,
    sickLeave: 15,
    unpaidLeave: 0,
    maternityLeave: 90,
    paternityLeave: 0,
  },
};

const sampleRequestHistory: Record<string, RequestHistoryItem[]> = {
  "John Doe": [
    {
      id: "HIST001",
      leaveType: "Annual",
      startDate: "2024-02-01",
      endDate: "2024-02-03",
      status: "Approved",
      totalDays: 3,
    },
    {
      id: "HIST002",
      leaveType: "Sick",
      startDate: "2024-01-15",
      endDate: "2024-01-15",
      status: "Approved",
      totalDays: 1,
    },
  ],
  "Jane Smith": [
    {
      id: "HIST003",
      leaveType: "Annual",
      startDate: "2024-02-15",
      endDate: "2024-02-16",
      status: "Approved",
      totalDays: 2,
    },
  ],
  "Alice Johnson": [
    {
      id: "HIST004",
      leaveType: "Sick",
      startDate: "2024-02-20",
      endDate: "2024-02-21",
      status: "Approved",
      totalDays: 2,
    },
    {
      id: "HIST005",
      leaveType: "Annual",
      startDate: "2024-01-10",
      endDate: "2024-01-12",
      status: "Rejected",
      totalDays: 3,
    },
  ],
};

export default function ApprovedApprovals() {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        if (!data.isLoggedIn) {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Endorsed Leave Requests</h1>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="py-3 px-4 text-left">Employee Name</th>
              <th className="py-3 px-4 text-left">Department</th>
              <th className="py-3 px-4 text-left">Leave Type</th>
              <th className="py-3 px-4 text-left">Start Date</th>
              <th className="py-3 px-4 text-left">End Date</th>
              <th className="py-3 px-4 text-left">Date Submitted</th>
              <th className="py-3 px-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sampleLeaveRequests.map((request) => (
              <React.Fragment key={request.id}>
                <tr
                  className="border-t hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedRequest(selectedRequest?.id === request.id ? null : request)}>
                  <td className="py-3 px-4">{request.employeeName}</td>
                  <td className="py-3 px-4">{request.department}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">{request.leaveType}</Badge>
                  </td>
                  <td className="py-3 px-4">{DateTime.fromISO(request.startDate).toFormat("dd LLL yyyy")}</td>
                  <td className="py-3 px-4">{DateTime.fromISO(request.endDate).toFormat("dd LLL yyyy")}</td>
                  <td className="py-3 px-4">{DateTime.fromISO(request.dateSubmitted).toFormat("dd LLL yyyy")}</td>
                  <td className="py-3 px-4">
                    {selectedRequest?.id === request.id ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </td>
                </tr>
                {selectedRequest?.id === request.id && (
                  <tr>
                    <td
                      colSpan={7}
                      className="bg-muted/30 border-t">
                      <div className="p-6 grid gap-6">
                        {/* Leave Details */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Leave Details</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Employee Name</p>
                              <p className="font-medium">{request.employeeName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Department</p>
                              <p className="font-medium">{request.department}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Leave Type</p>
                              <Badge
                                variant="secondary"
                                className="mt-1">
                                {request.leaveType}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Days</p>
                              <p className="font-medium">{request.totalDays} days</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm text-muted-foreground">Date Range</p>
                              <p className="font-medium">
                                {DateTime.fromISO(request.startDate).toFormat("dd LLL yyyy")} -{" "}
                                {DateTime.fromISO(request.endDate).toFormat("dd LLL yyyy")}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm text-muted-foreground">Justification</p>
                              <p className="font-medium">{request.justification}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Leave Balances */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Leave Balances</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-3 gap-4">
                            {Object.entries(sampleEmployeeBalances[request.employeeName]).map(([type, balance]) => (
                              <div key={type}>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {type.replace(/([A-Z])/g, " $1").trim()} Leave
                                </p>
                                <p className="font-medium">{balance} days</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Request History */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Request History</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {sampleRequestHistory[request.employeeName].map((historyItem) => (
                                <div
                                  key={historyItem.id}
                                  className="flex items-center justify-between border-b pb-4 last:border-0">
                                  <div>
                                    <Badge
                                      variant="secondary"
                                      className="mb-1">
                                      {historyItem.leaveType}
                                    </Badge>
                                    <p className="text-sm">
                                      {DateTime.fromISO(historyItem.startDate).toFormat("dd LLL yyyy")} -{" "}
                                      {DateTime.fromISO(historyItem.endDate).toFormat("dd LLL yyyy")}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <Badge
                                      variant={historyItem.status === "Approved" ? "default" : "destructive"}
                                      className="mb-1">
                                      {historyItem.status}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground">{historyItem.totalDays} days</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
