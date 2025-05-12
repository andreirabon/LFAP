"use client";

import { ExportToExcelButton } from "@/components/ExportToExcelButton";
import { ExportToPdfButton } from "@/components/ExportToPdfButton";

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

interface ExportButtonsProps {
  leaveRequests: LeaveRequest[];
}

export function ExportButtons({ leaveRequests }: ExportButtonsProps) {
  return (
    <div className="flex items-center space-x-2">
      <ExportToExcelButton leaveRequests={leaveRequests} />
      <ExportToPdfButton leaveRequests={leaveRequests} />
    </div>
  );
}
