"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { LeaveRequest } from "./PDFDownload";

// Dynamically import PDF components with ssr disabled
const PDFDownloadComponent = dynamic(() => import("./PDFDownload").then((mod) => mod.PDFDownloadComponent), {
  ssr: false,
});

// Mock Data
const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    employeeName: "John Doe",
    leaveType: "Annual",
    requestDate: "2024-03-01",
    startDate: "2024-03-15",
    endDate: "2024-03-20",
    status: "Approved",
  },
  {
    id: 2,
    employeeName: "Jane Smith",
    leaveType: "Sick",
    requestDate: "2024-03-02",
    startDate: "2024-03-10",
    endDate: "2024-03-12",
    status: "Pending",
  },
  {
    id: 3,
    employeeName: "Mike Johnson",
    leaveType: "Unpaid",
    requestDate: "2024-03-03",
    startDate: "2024-04-01",
    endDate: "2024-04-05",
    status: "Rejected",
  },
  {
    id: 4,
    employeeName: "Sarah Williams",
    leaveType: "Annual",
    requestDate: "2024-03-04",
    startDate: "2024-03-25",
    endDate: "2024-03-30",
    status: "Approved",
  },
  {
    id: 5,
    employeeName: "Robert Brown",
    leaveType: "Sick",
    requestDate: "2024-03-05",
    startDate: "2024-03-08",
    endDate: "2024-03-09",
    status: "Pending",
  },
];

// Format date function
const formatDate = (dateStr: string) => {
  return DateTime.fromISO(dateStr).toFormat("dd LLL yyyy");
};

export default function LeaveHistoryReportPage() {
  // State for leave requests
  const [leaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LeaveRequest;
    direction: "asc" | "desc";
  } | null>(null);

  // Sorting function
  const handleSort = (key: keyof LeaveRequest) => {
    setSortConfig((currentSort) => ({
      key,
      direction: currentSort?.key === key && currentSort?.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filter and sort the data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...leaveRequests];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [leaveRequests, statusFilter, sortConfig]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave History Report</h1>
        <PDFDownloadComponent data={filteredAndSortedData} />
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <Select
          defaultValue={statusFilter}
          onValueChange={(value: string) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee Name</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("startDate")}>
              Start Date {sortConfig?.key === "startDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>End Date</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("status")}>
              Status {sortConfig?.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedData.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.employeeName}</TableCell>
              <TableCell>{request.leaveType}</TableCell>
              <TableCell>{formatDate(request.requestDate)}</TableCell>
              <TableCell>{formatDate(request.startDate)}</TableCell>
              <TableCell>{formatDate(request.endDate)}</TableCell>
              <TableCell>
                <span
                  className={cn("px-2 py-1 rounded-full text-sm font-medium", {
                    "bg-green-100 text-green-800": request.status === "Approved",
                    "bg-yellow-100 text-yellow-800": request.status === "Pending",
                    "bg-red-100 text-red-800": request.status === "Rejected",
                  })}>
                  {request.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
