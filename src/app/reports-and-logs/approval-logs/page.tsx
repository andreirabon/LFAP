"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

// Dynamically import all react-pdf components
const Document = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.Page), { ssr: false });
const Text = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.Text), { ssr: false });
const View = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.View), { ssr: false });
const PDFDownloadLink = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink), {
  ssr: false,
  loading: () => (
    <Button
      variant="outline"
      disabled>
      <Download className="mr-2 h-4 w-4" />
      Loading PDF Generator...
    </Button>
  ),
});

// Import StyleSheet type only for type checking
// Create styles object with proper type
const styles = {
  page: {
    flexDirection: "column" as const,
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderStyle: "solid" as const,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row" as const,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 35,
    alignItems: "center" as const,
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    padding: 5,
    textAlign: "left" as const,
    fontFamily: "Helvetica",
  },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    textAlign: "center" as const,
  },
  statusApproved: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusRejected: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  statusPending: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
  },
} as const;

// Format date to local string
const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString();
};

// Update the ApprovalLogsPDF component to use the dynamic components
const ApprovalLogsPDF = ({ data }: { data: ApprovalLog[] }) => (
  <Document>
    <Page
      size="A4"
      style={styles.page}>
      <Text style={styles.title}>Approval Logs Report</Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Request ID</Text>
          <Text style={styles.tableCell}>Type</Text>
          <Text style={styles.tableCell}>Requester</Text>
          <Text style={styles.tableCell}>Request Date</Text>
          <Text style={styles.tableCell}>Approver</Text>
          <Text style={styles.tableCell}>Approval Date</Text>
          <Text style={styles.tableCell}>Status</Text>
          <Text style={styles.tableCell}>Comments</Text>
        </View>
        {/* Table Body */}
        {data.map((log) => (
          <View
            key={log.id}
            style={styles.tableRow}>
            <Text style={styles.tableCell}>{log.id}</Text>
            <Text style={styles.tableCell}>{log.requestType}</Text>
            <Text style={styles.tableCell}>{log.requesterName}</Text>
            <Text style={styles.tableCell}>{formatDate(log.requestDate)}</Text>
            <Text style={styles.tableCell}>{log.approverName}</Text>
            <Text style={styles.tableCell}>{formatDate(log.approvalDate)}</Text>
            <Text
              style={[
                styles.tableCell,
                styles.statusBadge,
                log.status === "Approved"
                  ? styles.statusApproved
                  : log.status === "Rejected"
                  ? styles.statusRejected
                  : styles.statusPending,
              ]}>
              {log.status}
            </Text>
            <Text style={styles.tableCell}>{log.comments || "—"}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

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

// Create a separate component for the PDF download button
const PDFDownloadButton = ({ data }: { data: ApprovalLog[] }) => {
  return (
    <PDFDownloadLink
      document={<ApprovalLogsPDF data={data} />}
      fileName="approval-logs.pdf"
      style={{ textDecoration: "none" }}>
      {({ loading }) => (
        <Button
          variant="outline"
          disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Generating PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

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
        if (sortConfig.key === "approvalDate" && (!a[sortConfig.key] || !b[sortConfig.key])) {
          return sortConfig.direction === "asc" ? 1 : -1; // Empty dates go last
        }

        const aValue = String(a[sortConfig.key]);
        const bValue = String(b[sortConfig.key]);

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
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
          <PDFDownloadButton data={filteredAndSortedData} />
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
