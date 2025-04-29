"use client";

import { Button } from "@/components/ui/button";
import { Document, Page, PDFDownloadLink, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Download } from "lucide-react";

interface DepartmentData {
  department: string;
  leaveDays: number;
  employeeCount: number;
}

interface EmployeeData {
  name: string;
  department: string;
  leaveDays: number;
  leaveType: string;
}

interface PDFDownloadButtonProps {
  selectedMonth: string;
  departmentData: DepartmentData[];
  employeeData: EmployeeData[];
  totalLeaveDays: number;
  averageUtilization: string;
  totalEmployees: number;
}

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    color: "#1a1a1a",
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    padding: 15,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    width: "30%",
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
  },
  statValue: {
    fontSize: 20,
    marginTop: 5,
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    textAlign: "left",
  },
});

// PDF Document Component
const PDFDocument = ({
  selectedMonth,
  departmentData,
  employeeData,
  totalLeaveDays,
  averageUtilization,
  totalEmployees,
}: Omit<PDFDownloadButtonProps, "data">) => (
  <Document>
    <Page
      size="A4"
      style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Monthly Leave Utilization Report</Text>
        <Text style={styles.subheader}>{selectedMonth}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Total Leave Days</Text>
            <Text style={styles.statValue}>{totalLeaveDays}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Average Utilization</Text>
            <Text style={styles.statValue}>{averageUtilization}%</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Total Employees</Text>
            <Text style={styles.statValue}>{totalEmployees}</Text>
          </View>
        </View>

        <Text style={styles.header}>Department-wise Leave Distribution</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Department</Text>
            <Text style={styles.tableCell}>Leave Days</Text>
            <Text style={styles.tableCell}>Employee Count</Text>
          </View>
          {departmentData.map((dept: DepartmentData, index: number) => (
            <View
              key={index}
              style={styles.tableRow}>
              <Text style={styles.tableCell}>{dept.department}</Text>
              <Text style={styles.tableCell}>{dept.leaveDays}</Text>
              <Text style={styles.tableCell}>{dept.employeeCount}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.header, { marginTop: 20 }]}>Employee Leave Details</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Employee Name</Text>
            <Text style={styles.tableCell}>Department</Text>
            <Text style={styles.tableCell}>Leave Days</Text>
            <Text style={styles.tableCell}>Leave Type</Text>
          </View>
          {employeeData.map((employee: EmployeeData, index: number) => (
            <View
              key={index}
              style={styles.tableRow}>
              <Text style={styles.tableCell}>{employee.name}</Text>
              <Text style={styles.tableCell}>{employee.department}</Text>
              <Text style={styles.tableCell}>{employee.leaveDays}</Text>
              <Text style={styles.tableCell}>{employee.leaveType}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

export default function PDFDownloadButton({
  selectedMonth,
  departmentData,
  employeeData,
  totalLeaveDays,
  averageUtilization,
  totalEmployees,
}: PDFDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={
        <PDFDocument
          selectedMonth={selectedMonth}
          departmentData={departmentData}
          employeeData={employeeData}
          totalLeaveDays={totalLeaveDays}
          averageUtilization={averageUtilization}
          totalEmployees={totalEmployees}
        />
      }
      fileName={`leave-report-${selectedMonth.toLowerCase().replace(" ", "-")}.pdf`}>
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
}
