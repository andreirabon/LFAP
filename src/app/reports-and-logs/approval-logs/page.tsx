"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";

// Types
interface ApprovalLog {
  id: string;
  requestType: string;
  requesterName: string;
  requestDate: string;
  approverName: string;
  approvalDate: string;
  status: "Approved" | "Rejected" | "Pending";
  comments?: string;
}

// Format date to local string
const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString();
};

// Sample data
const sampleApprovalLogs: ApprovalLog[] = [
  {
    id: "REQ-001",
    requestType: "Annual Leave",
    requesterName: "John Doe",
    requestDate: "2024-03-15",
    approverName: "Jane Smith",
    approvalDate: "2024-03-16",
    status: "Approved",
    comments: "Approved as requested",
  },
  {
    id: "REQ-002",
    requestType: "Sick Leave",
    requesterName: "Alice Johnson",
    requestDate: "2024-03-14",
    approverName: "Bob Wilson",
    approvalDate: "2024-03-14",
    status: "Rejected",
    comments: "Insufficient documentation",
  },
  {
    id: "REQ-003",
    requestType: "Annual Leave",
    requesterName: "Charlie Brown",
    requestDate: "2024-03-13",
    approverName: "Diana Prince",
    approvalDate: "2024-03-15",
    status: "Approved",
    comments: "Enjoy your vacation",
  },
  {
    id: "REQ-004",
    requestType: "Unpaid Leave",
    requesterName: "Eve Anderson",
    requestDate: "2024-03-12",
    approverName: "Frank Miller",
    approvalDate: "",
    status: "Pending",
    comments: "Under review",
  },
];

type SortConfig = {
  key: keyof ApprovalLog;
  direction: "asc" | "desc";
} | null;

export default function ApprovalLogsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Handle sorting
  const handleSort = (key: keyof ApprovalLog) => {
    setSortConfig((currentSort) => {
      if (currentSort?.key === key) {
        return {
          key,
          direction: currentSort.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...sampleApprovalLogs];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue !== undefined && bValue !== undefined) {
          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
        }
        return 0;
      });
    }

    return filtered;
  }, [statusFilter, sortConfig]);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Approval Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="mb-6">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Approval Logs Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("requestDate")}>
                  Request Date {sortConfig?.key === "requestDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Approver</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("approvalDate")}>
                  Approval Date {sortConfig?.key === "approvalDate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}>
                  Status {sortConfig?.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.id}</TableCell>
                  <TableCell>{log.requestType}</TableCell>
                  <TableCell>{log.requesterName}</TableCell>
                  <TableCell>{formatDate(log.requestDate)}</TableCell>
                  <TableCell>{log.approverName}</TableCell>
                  <TableCell>{formatDate(log.approvalDate)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.status === "Approved" ? "default" : log.status === "Rejected" ? "destructive" : "secondary"
                      }>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{log.comments || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
