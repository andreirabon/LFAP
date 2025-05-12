"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Define the LeaveRequest type (same as in PDF component)
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

// Props interface for the button component
interface ExportToExcelButtonProps {
  leaveRequests: LeaveRequest[];
}

// Function to format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

export function ExportToExcelButton({ leaveRequests }: ExportToExcelButtonProps) {
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  // Need to run on client side only
  useEffect(() => {
    setIsClient(true);
    console.log("Excel export component mounted");
  }, []);

  const createExcelTable = () => {
    // Create a visible table with the data
    const table = document.createElement("table");
    table.id = "excel-export-table";
    table.style.position = "absolute";
    table.style.left = "-9999px"; // Off-screen but still rendered

    // Create header row
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const headers = [
      "Request ID",
      "Employee Name",
      "Email",
      "Leave Type",
      "Start Date",
      "End Date",
      "Days",
      "Status",
      "Submitted Date",
    ];

    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body rows
    const tbody = document.createElement("tbody");

    leaveRequests.forEach((request) => {
      const row = document.createElement("tr");

      // Add cells for each column
      [
        request.id,
        request.userName,
        request.userEmail,
        request.type,
        formatDate(request.startDate),
        formatDate(request.endDate),
        request.numberOfDays.toString(),
        getStatusDisplayText(request.status),
        formatDate(request.submittedDate),
      ].forEach((cellText) => {
        const td = document.createElement("td");
        td.textContent = cellText;
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Clear any existing tables
    if (tableContainerRef.current) {
      tableContainerRef.current.innerHTML = "";
      tableContainerRef.current.appendChild(table);
    }

    console.log("Excel table created with ID:", table.id);
    return table;
  };

  const handleExport = () => {
    console.log("Export button clicked");

    setIsExporting(true);

    try {
      console.log("Loading ExcellentExport library");

      // Create CSV data directly without ExcellentExport
      let csvContent = "";

      // Add headers
      const headers = [
        "Request ID",
        "Employee Name",
        "Email",
        "Leave Type",
        "Start Date",
        "End Date",
        "Days",
        "Status",
        "Submitted Date",
      ];
      csvContent += headers.join(",") + "\n";

      // Add data rows
      leaveRequests.forEach((request) => {
        const row = [
          request.id,
          `"${request.userName.replace(/"/g, '""')}"`, // Escape quotes in CSV
          `"${request.userEmail.replace(/"/g, '""')}"`,
          `"${request.type.replace(/"/g, '""')}"`,
          `"${formatDate(request.startDate)}"`,
          `"${formatDate(request.endDate)}"`,
          request.numberOfDays.toString(),
          `"${getStatusDisplayText(request.status).replace(/"/g, '""')}"`,
          `"${formatDate(request.submittedDate)}"`,
        ];
        csvContent += row.join(",") + "\n";
      });

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `leave-history-report-${new Date().toISOString().split("T")[0]}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);

      // Trigger download
      console.log("Downloading CSV file:", filename);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("CSV export completed");
    } catch (error) {
      console.error("Critical error exporting data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isClient) {
    return (
      <Button
        variant="outline"
        disabled>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Loading Excel Export...
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleExport}
        disabled={isExporting}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        {isExporting ? "Generating Excel..." : "Export to Excel"}
      </Button>
      <div
        ref={tableContainerRef}
        style={{ position: "absolute", left: "-9999px", top: 0 }}></div>
    </>
  );
}
