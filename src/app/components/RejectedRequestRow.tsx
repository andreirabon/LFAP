"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { parseLocalDate } from "@/lib/date-utils";
import { DateTime } from "luxon";

// Function to calculate duration in days
function calculateDuration(startDate: Date, endDate: Date) {
  const start = parseLocalDate(startDate.toString());
  const end = parseLocalDate(endDate.toString());
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
}

interface RejectedRequestProps {
  request: {
    id: number;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: string;
    supportingDoc: string | null;
    managerComments: string | null;
    createdAt: Date;
    managerId: number | null;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      department: string | null;
      email: string;
      vacationLeave: number;
      mandatoryLeave: number;
      sickLeave: number;
      maternityLeave: number;
      paternityLeave: number;
      specialPrivilegeLeave: number;
    };
  };
}

export function RejectedRequestRow({ request }: RejectedRequestProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {request.user.firstName} {request.user.lastName}
      </TableCell>
      <TableCell>{request.type}</TableCell>
      <TableCell>{request.user.department || "N/A"}</TableCell>
      <TableCell>
        {DateTime.fromJSDate(parseLocalDate(request.startDate.toString()))
          .setZone("Asia/Manila")
          .toFormat("MMM dd, yyyy")}
      </TableCell>
      <TableCell>
        {DateTime.fromJSDate(parseLocalDate(request.endDate.toString()))
          .setZone("Asia/Manila")
          .toFormat("MMM dd, yyyy")}
      </TableCell>
      <TableCell>{calculateDuration(request.startDate, request.endDate)} days</TableCell>
      <TableCell>
        <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>
      </TableCell>
    </TableRow>
  );
}
