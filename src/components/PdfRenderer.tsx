"use client";

import { Button } from "@/components/ui/button";
import { Document, Page, PDFDownloadLink, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Download } from "lucide-react";

// Define the LeaveRequest type
interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: "pending" | "endorsed" | "rejected" | "returned" | "approved" | "tm_approved" | "tm_rejected" | "tm_returned";
  submittedDate: string;
  userName: string;
  userEmail: string;
}

interface PdfRendererProps {
  leaveRequests: LeaveRequest[];
}

// Define styles for PDF document
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
    borderBottomStyle: "solid",
    alignItems: "center",
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 5,
    flex: 1,
    textAlign: "left",
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
    borderRightStyle: "solid",
  },
  statusTag: {
    padding: 3,
    borderRadius: 5,
    fontSize: 8,
  },
  metaInfo: {
    fontSize: 10,
    marginBottom: 10,
    textAlign: "right",
  },
});

// Status color mapping for PDF
function getStatusTagStyle(status: LeaveRequest["status"]) {
  const baseStyle = { ...styles.statusTag };

  switch (status) {
    case "pending":
      return { ...baseStyle, backgroundColor: "#fef9c3", color: "#854d0e" };
    case "endorsed":
      return { ...baseStyle, backgroundColor: "#dbeafe", color: "#1e40af" };
    case "approved":
      return { ...baseStyle, backgroundColor: "#dcfce7", color: "#166534" };
    case "rejected":
      return { ...baseStyle, backgroundColor: "#fee2e2", color: "#991b1b" };
    case "returned":
      return { ...baseStyle, backgroundColor: "#ffedd5", color: "#9a3412" };
    case "tm_approved":
      return { ...baseStyle, backgroundColor: "#d1fae5", color: "#065f46" };
    case "tm_rejected":
      return { ...baseStyle, backgroundColor: "#fecdd3", color: "#9f1239" };
    case "tm_returned":
      return { ...baseStyle, backgroundColor: "#fef3c7", color: "#92400e" };
    default:
      return baseStyle;
  }
}

// Function to get display text for status
function getStatusDisplayText(status: LeaveRequest["status"]) {
  const displayText = {
    pending: "Waiting to be Endorsed by Manager",
    endorsed: "Endorsed by the Manager",
    approved: "Approved by the Manager",
    rejected: "Rejected by the Manager",
    returned: "Returned by the Manager",
    tm_approved: "Approved by the Top Management",
    tm_rejected: "Rejected by the Top Management",
    tm_returned: "Returned by the Top Management",
  };
  return displayText[status] || status;
}

// PDF Document component
const LeaveHistoryPdf = ({ leaveRequests }: PdfRendererProps) => (
  <Document>
    <Page
      size="A4"
      style={styles.page}>
      <Text style={styles.title}>Leave History Report</Text>
      <Text style={styles.metaInfo}>
        Generated on:{" "}
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <Text style={styles.metaInfo}>Total Requests: {leaveRequests.length}</Text>

      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>ID</Text>
          <Text style={styles.tableCell}>Employee</Text>
          <Text style={styles.tableCell}>Type</Text>
          <Text style={styles.tableCell}>Period</Text>
          <Text style={styles.tableCell}>Days</Text>
          <Text style={styles.tableCell}>Status</Text>
          <Text style={styles.tableCell}>Submitted</Text>
        </View>

        {/* Table Rows */}
        {leaveRequests.map((request) => (
          <View
            key={request.id}
            style={styles.tableRow}>
            <Text style={styles.tableCell}>{request.id}</Text>
            <Text style={styles.tableCell}>
              {request.userName}
              {"\n"}
              {request.userEmail}
            </Text>
            <Text style={styles.tableCell}>{request.type}</Text>
            <Text style={styles.tableCell}>
              {new Date(request.startDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              {" - "}
              {new Date(request.endDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
            <Text style={styles.tableCell}>{request.numberOfDays}</Text>
            <Text style={[styles.tableCell, getStatusTagStyle(request.status)]}>
              {getStatusDisplayText(request.status)}
            </Text>
            <Text style={styles.tableCell}>
              {new Date(request.submittedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default function PdfRenderer({ leaveRequests }: PdfRendererProps) {
  return (
    <PDFDownloadLink
      document={<LeaveHistoryPdf leaveRequests={leaveRequests} />}
      fileName="leave-history-report.pdf"
      className="inline-block">
      {({ loading, error }) => {
        if (error) {
          console.error("Error generating PDF:", error);
        }
        return (
          <Button
            variant="outline"
            disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {loading ? "Generating PDF..." : "Export to PDF"}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}
