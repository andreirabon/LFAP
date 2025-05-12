"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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

// Props interface for the button component
interface ExportToPdfButtonProps {
  leaveRequests: LeaveRequest[];
}

// Load the PDF components with no SSR
const PDFRenderer = dynamic(() => import("./PdfRenderer"), {
  ssr: false,
  loading: () => (
    <Button
      variant="outline"
      disabled>
      <Download className="mr-2 h-4 w-4" />
      Loading PDF Export...
    </Button>
  ),
});

export function ExportToPdfButton({ leaveRequests }: ExportToPdfButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Button
        variant="outline"
        disabled>
        <Download className="mr-2 h-4 w-4" />
        Loading PDF Export...
      </Button>
    );
  }

  return <PDFRenderer leaveRequests={leaveRequests} />;
}
