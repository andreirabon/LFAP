"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Updated Types to match schema and API response
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null; // email can be null based on some DB schemas, adjust if always present
  department: string | null;
}

interface LeaveRequest {
  id: number;
  employee: Employee;
  type: string;
  startDate: string; // ISO date string from API
  endDate: string; // ISO date string from API
  reason: string;
  createdAt: string; // ISO date string from API (was submittedDate)
  status: "pending" | "approved" | "rejected" | "returned";
  supportingDoc?: string | null;
  managerComments?: string | null;
}

// Helper to calculate duration (inclusive of start and end dates)
function calculateDuration(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
  // Calculate difference in days
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Add 1 for inclusive duration
}

// Map DB statuses to user-friendly display names
const statusDisplayMap = {
  pending: "Pending Approval",
  approved: "Endorsed",
  rejected: "Rejected",
  returned: "Returned",
};

function formatDate(dateString: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function EndorseLeaveRequest() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]); // Initialize with empty array
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [managerComments, setManagerComments] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      setIsLoading(true);
      try {
        const authResponse = await fetch("/api/auth/session");
        if (!authResponse.ok) {
          // Consider more specific error handling or logging
          throw new Error(`Session check failed: ${authResponse.status}`);
        }
        const authData = await authResponse.json();

        if (!authData.isLoggedIn) {
          router.replace("/login");
          return; // Exit early if not logged in
        }

        // Fetch leave requests if authenticated
        const requestsResponse = await fetch("/api/leave-requests/pending-endorsement");
        if (!requestsResponse.ok) {
          throw new Error(`Fetching leave requests failed: ${requestsResponse.status}`);
        }
        const fetchedRequests: LeaveRequest[] = await requestsResponse.json();
        setRequests(fetchedRequests);
      } catch (error) {
        console.error("Error during auth check or data fetching:", error);
        toast.error("Failed to load data. Please try refreshing the page.");
        // Optionally, redirect to login for critical auth errors after toast
        // if (error.message.includes("Session check failed")) router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  const handleRequestSelect = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setManagerComments(request.managerComments || "");
  };

  // Action types matching DB statuses
  type ActionDbStatus = "approved" | "rejected" | "returned";

  // Updated handleAction to include API call
  const handleAction = async (action: ActionDbStatus) => {
    if (!selectedRequest) {
      toast.error("No request selected.");
      return;
    }
    if (!managerComments.trim() && (action === "rejected" || action === "returned")) {
      toast.error("Comments are required to reject or return a request.");
      return;
    }

    // Replace with actual manager ID from session or context
    // This is a placeholder.
    // Ensure your auth system provides this ID.
    const managerId = 1; // Example: const { user } = useAuth(); const managerId = user?.id;

    try {
      const response = await fetch(`/api/leave-requests/${selectedRequest.id}/action`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: action, // "approved", "rejected", or "returned"
          managerComments: managerComments.trim(),
          managerId: managerId, // Send the manager's ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} request. Status: ${response.status}`);
      }

      // const updatedRequestFromServer = await response.json(); // The updated request from server

      toast.success(`Request successfully ${statusDisplayMap[action].toLowerCase()}.`);

      // Refresh list by filtering out the processed request
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== selectedRequest.id));

      setSelectedRequest(null);
      setManagerComments("");
    } catch (error) {
      console.error(`Error during ${action} action:`, error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred while processing the request.",
      );
    }
  };

  const getStatusColor = (status: LeaveRequest["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      returned: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800"; // Default/fallback color
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Endorse Leave Requests</h1>

      {/* Pending Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests // Already filtered by API to be pending, or handled by local filter in handleAction
                .map((request) => (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRequestSelect(request)}>
                    <TableCell className="font-medium">
                      {request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : "N/A"}
                    </TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{formatDate(request.startDate)}</TableCell>
                    <TableCell>{formatDate(request.endDate)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          request.status,
                        )}`}>
                        {statusDisplayMap[request.status] || request.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Selected Request Details */}
      {selectedRequest && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold">Employee Information</h4>
                <p className="text-sm">
                  Name:{" "}
                  {selectedRequest.employee
                    ? `${selectedRequest.employee.firstName} ${selectedRequest.employee.lastName}`
                    : "N/A"}
                  <br />
                  ID: {selectedRequest.employee ? selectedRequest.employee.id : "N/A"}
                  <br />
                  Department: {selectedRequest.employee?.department || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Leave Information</h4>
                <p className="text-sm">
                  Type: {selectedRequest.type}
                  <br />
                  Duration: {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}
                  <br />
                  Total Days: {calculateDuration(selectedRequest.startDate, selectedRequest.endDate)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Reason</h4>
                <p className="text-sm">{selectedRequest.reason}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Submission Date</h4>
                <p className="text-sm">{formatDate(selectedRequest.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Unit Schedule Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Unit Schedule Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This section would display the team&apos;s availability and schedule during the requested leave
                  period.
                </p>
              </CardContent>
            </Card>

            {/* Manager Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Manager Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comments</label>
                  <Textarea
                    placeholder="Enter your comments here (required for Reject/Return actions)"
                    value={managerComments}
                    onChange={(e) => setManagerComments(e.target.value)}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAction("approved")} // Changed to "approved"
                    className="bg-green-600 hover:bg-green-700">
                    Endorse
                  </Button>
                  <Button
                    onClick={() => handleAction("rejected")} // Changed to "rejected"
                    variant="destructive">
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleAction("returned")} // Changed to "returned"
                    variant="outline"
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    Return for Clarification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
