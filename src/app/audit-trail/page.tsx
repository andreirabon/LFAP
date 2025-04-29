"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";

// Types
interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  actionType: "CREATE" | "UPDATE" | "DELETE" | "LOGIN";
  targetResource: string;
}

// Mock data
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "1",
    timestamp: "2024-03-20T10:30:00Z",
    userName: "john.doe",
    actionType: "LOGIN",
    targetResource: "User/john.doe",
  },
  {
    id: "2",
    timestamp: "2024-03-20T11:15:00Z",
    userName: "jane.smith",
    actionType: "CREATE",
    targetResource: "Document/report-2024-03",
  },
  {
    id: "3",
    timestamp: "2024-03-20T11:45:00Z",
    userName: "admin.user",
    actionType: "UPDATE",
    targetResource: "User/jane.smith",
  },
  {
    id: "4",
    timestamp: "2024-03-20T12:00:00Z",
    userName: "john.doe",
    actionType: "DELETE",
    targetResource: "Document/old-report",
  },
  {
    id: "5",
    timestamp: "2024-03-20T13:30:00Z",
    userName: "jane.smith",
    actionType: "UPDATE",
    targetResource: "Document/report-2024-03",
  },
];

type SortConfig = {
  key: keyof AuditLogEntry;
  direction: "asc" | "desc";
} | null;

// Format date to local string with time
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export default function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Handle sorting
  const handleSort = (key: keyof AuditLogEntry) => {
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
    let filtered = [...mockAuditLogs];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) => log.userName.toLowerCase().includes(query) || log.targetResource.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = String(a[sortConfig.key]);
        const bValue = String(b[sortConfig.key]);

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [searchQuery, sortConfig]);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="mb-6">
            <Input
              placeholder="Search by username or resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Audit Logs Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("timestamp")}>
                  Timestamp {sortConfig?.key === "timestamp" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("userName")}>
                  User Name {sortConfig?.key === "userName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Action Type</TableHead>
                <TableHead>Target Resource</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>{log.actionType}</TableCell>
                  <TableCell>{log.targetResource}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
