"use client";

import { Button } from "@/components/ui/button";
import { Document, Page, PDFDownloadLink, StyleSheet, Text, View } from "@react-pdf/renderer";
import { DateTime } from "luxon";

// Types
export interface LeaveRequest {
  id: number;
  employeeName: string;
  leaveType: "Annual" | "Sick" | "Unpaid";
  requestDate: string;
  startDate: string;
  endDate: string;
  status: "Approved" | "Pending" | "Rejected";
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
    width: "100%",
  },
  tableHeader: {
    backgroundColor: "#f1f5f9",
    fontWeight: "bold",
  },
  tableCell: {
    width: "16.66%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
    fontSize: 10,
  },
  statusCell: {
    padding: 4,
    borderRadius: 4,
    textAlign: "center",
  },
});

// Format date function
const formatDate = (dateStr: string) => {
  return DateTime.fromISO(dateStr).toFormat("dd LLL yyyy");
};

// PDF Document Component
const LeaveHistoryPDF = ({ data }: { data: LeaveRequest[] }) => (
  <Document>
    <Page
      size="A4"
      style={styles.page}>
      <Text style={styles.title}>Leave History Report</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Employee Name</Text>
          <Text style={styles.tableCell}>Leave Type</Text>
          <Text style={styles.tableCell}>Request Date</Text>
          <Text style={styles.tableCell}>Start Date</Text>
          <Text style={styles.tableCell}>End Date</Text>
          <Text style={styles.tableCell}>Status</Text>
        </View>
        {data.map((request) => (
          <View
            key={request.id}
            style={styles.tableRow}>
            <Text style={styles.tableCell}>{request.employeeName}</Text>
            <Text style={styles.tableCell}>{request.leaveType}</Text>
            <Text style={styles.tableCell}>{formatDate(request.requestDate)}</Text>
            <Text style={styles.tableCell}>{formatDate(request.startDate)}</Text>
            <Text style={styles.tableCell}>{formatDate(request.endDate)}</Text>
            <Text style={styles.tableCell}>{request.status}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export function PDFDownloadComponent({ data }: { data: LeaveRequest[] }) {
  return (
    <PDFDownloadLink
      document={<LeaveHistoryPDF data={data} />}
      fileName="leave-history-report.pdf">
      {({ loading }) => <Button disabled={loading}>{loading ? "Generating PDF..." : "Download PDF"}</Button>}
    </PDFDownloadLink>
  );
}
