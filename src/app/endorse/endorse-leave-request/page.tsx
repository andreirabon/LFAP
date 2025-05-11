"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Search, X } from "lucide-react";
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
  status: "pending" | "approved" | "rejected" | "returned" | "endorsed";
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
  approved: "Approved",
  rejected: "Rejected",
  returned: "Returned",
  endorsed: "Endorsed",
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
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [managerComments, setManagerComments] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Add loading state for actions
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionDbStatus | null>(null);
  const [dialogAction, setDialogAction] = useState<ActionDbStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      setIsLoading(true);
      setError(null);
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
        setFilteredRequests(fetchedRequests);
      } catch (error) {
        console.error("Error during auth check or data fetching:", error);
        setError(error instanceof Error ? error.message : "An unexpected error occurred");
        toast.error("Failed to load data. Please try refreshing the page.");
        // Optionally, redirect to login for critical auth errors after toast
        // if (error.message.includes("Session check failed")) router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  // Filter requests when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRequests(requests);
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = requests.filter(
      (request) =>
        `${request.employee.firstName} ${request.employee.lastName}`.toLowerCase().includes(lowercasedSearch) ||
        request.type.toLowerCase().includes(lowercasedSearch) ||
        request.employee.department?.toLowerCase().includes(lowercasedSearch),
    );

    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  const handleRequestSelect = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setManagerComments(request.managerComments || "");
    setCommentsError(null);
  };

  // Action types matching DB statuses
  type ActionDbStatus = "approved" | "rejected" | "returned" | "endorsed";

  // Validate comments based on action type
  const validateComments = (action: ActionDbStatus, comments: string): boolean => {
    if (action === "rejected" && !comments.trim()) {
      setCommentsError("Comments are required to reject a request");
      return false;
    }

    if (action === "returned" && !comments.trim()) {
      setCommentsError("Comments are required to return a request");
      return false;
    }

    if ((action === "rejected" || action === "returned") && comments.trim().length < 10) {
      setCommentsError("Comments must be at least 10 characters long when rejecting or returning a request");
      return false;
    }

    setCommentsError(null);
    return true;
  };

  // Updated handleAction to include API call
  const handleAction = async (action: ActionDbStatus) => {
    if (!selectedRequest) {
      toast.error("No request selected.");
      return;
    }

    // Validate comments for reject/return actions
    if (!validateComments(action, managerComments)) {
      return;
    }

    // Set processing state to true to show loading indicator
    setIsProcessing(true);

    try {
      console.log(`Starting ${action} action for request ID ${selectedRequest.id}`);

      // First get the current user's session
      const sessionResponse = await fetch("/api/auth/session");
      if (!sessionResponse.ok) {
        throw new Error("Failed to get user session");
      }

      const sessionData = await sessionResponse.json();
      console.log("Session data:", sessionData);

      // Check session data more carefully
      if (!sessionData.isLoggedIn) {
        toast.error("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      // Use userId from session (the field is named userId, not user.id)
      const managerId = sessionData.userId;
      console.log("Using manager ID:", managerId);

      // Proceed only if we have a valid managerId
      if (!managerId) {
        toast.error("Could not determine your user ID. Please refresh and try again.");
        return;
      }

      console.log(`Sending ${action} request to API with manager ID ${managerId}`);

      // Only include comments for actions that need them or when comments are actually provided
      const requestBody: {
        action: ActionDbStatus;
        managerId: number;
        managerComments?: string;
      } = {
        action: action,
        managerId: managerId,
      };

      // Add comments only if they exist or are required
      if (managerComments.trim() || action === "rejected" || action === "returned") {
        requestBody.managerComments = managerComments.trim() || undefined;
      }

      const response = await fetch(`/api/leave-requests/${selectedRequest.id}/action`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`API response status: ${response.status}`);

      // Get the response content as text first for debugging
      const responseText = await response.text();
      console.log(`API response body: ${responseText}`);

      // Parse the JSON if possible
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        // Handle specific error type for insufficient leave balance
        if (responseData?.type === "leave_balance_error") {
          toast.error(responseData.details || "Insufficient leave balance");
          return;
        }

        // Display more detailed error message if available
        if (responseData?.error) {
          // If there are validation details, display them
          if (responseData.details && Array.isArray(responseData.details)) {
            const errorMessages = responseData.details.map((d: { message: string }) => d.message).join(", ");
            throw new Error(`${responseData.error}: ${errorMessages}`);
          } else {
            throw new Error(responseData.error);
          }
        } else {
          throw new Error(`Failed to ${action} request. Status: ${response.status}`);
        }
      }

      toast.success(`Request successfully ${statusDisplayMap[action].toLowerCase()}.`);

      // Refresh list by filtering out the processed request
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== selectedRequest.id));
      setFilteredRequests((prevRequests) => prevRequests.filter((req) => req.id !== selectedRequest.id));

      setSelectedRequest(null);
      setManagerComments("");
    } catch (error) {
      console.error(`Error during ${action} action:`, error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred while processing the request.",
      );
    } finally {
      setIsProcessing(false); // Reset processing state
    }
  };

  const getStatusColor = (status: LeaveRequest["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      returned: "bg-orange-100 text-orange-800",
      endorsed: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800"; // Default/fallback color
  };

  const handleActionClick = (action: ActionDbStatus) => {
    // For reject and return actions, show confirmation dialog with validation
    if (action === "rejected" || action === "returned") {
      // Pre-validate comments before showing confirmation dialog
      if (!validateComments(action, managerComments)) {
        return;
      }
      // Set both the pending action and dialog action
      setPendingAction(action);
      setDialogAction(action);
      setShowConfirmDialog(true);
    } else if (action === "endorsed") {
      // For endorse action, show confirmation dialog without comment validation
      setPendingAction(action);
      setDialogAction(action);
      setShowConfirmDialog(true);
    } else {
      // For other actions, proceed directly
      handleAction(action);
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      handleAction(pendingAction);
      // Close dialog first
      setShowConfirmDialog(false);
      // Clear states after dialog is closed
      setPendingAction(null);
      // Don't need to clear dialogAction immediately as it won't affect UI once dialog is closed
    }
  };

  const cancelAction = () => {
    // Close dialog first
    setShowConfirmDialog(false);
    // Clear pending action
    setPendingAction(null);
    // Don't need to clear dialogAction immediately as it won't affect UI once dialog is closed
  };

  const renderLoadingSkeleton = () => (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Skeleton className="h-10 w-64 mb-6" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return renderLoadingSkeleton();
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Endorse Leave Requests</h1>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="relative my-4">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="Search by employee name, department, or leave type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2"
        />
      </div>

      {/* Pending Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No matching requests found" : "No pending requests at this time"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      selectedRequest?.id === request.id ? "bg-muted" : ""
                    }`}
                    onClick={() => handleRequestSelect(request)}>
                    <TableCell className="font-medium">
                      {request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : "N/A"}
                    </TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>{request.employee?.department || "N/A"}</TableCell>
                    <TableCell>{formatDate(request.startDate)}</TableCell>
                    <TableCell>{formatDate(request.endDate)}</TableCell>
                    <TableCell>{calculateDuration(request.startDate, request.endDate)} days</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(request.status)}>
                        {statusDisplayMap[request.status] || request.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Selected Request Details */}
      {selectedRequest && (
        <Card className="mx-auto max-w-4xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Request Details</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedRequest(null)}
              aria-label="Close details">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                {selectedRequest.supportingDoc && (
                  <div>
                    <h4 className="text-sm font-semibold">Supporting Document</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1">
                      View Document
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                  <h4>Manager Action</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Comments</label>
                    {(pendingAction === "rejected" || pendingAction === "returned") && (
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800">
                        Required
                      </Badge>
                    )}
                  </div>
                  <Textarea
                    placeholder="Enter your comments here (required for Reject/Return actions)"
                    value={managerComments}
                    onChange={(e) => {
                      setManagerComments(e.target.value);
                      // Clear error when user types
                      if (commentsError && e.target.value.trim().length >= 10) {
                        setCommentsError(null);
                      }
                    }}
                    className={`resize-none ${commentsError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {commentsError && <p className="text-red-500 text-sm">{commentsError}</p>}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleActionClick("endorsed")}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isProcessing}>
                    {isProcessing && pendingAction === "endorsed" ? (
                      <>
                        <span className="mr-2">Processing...</span>
                        <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                      </>
                    ) : (
                      "Endorse Leave Request"
                    )}
                  </Button>
                  <Button
                    onClick={() => handleActionClick("rejected")}
                    variant="destructive"
                    disabled={isProcessing}>
                    {isProcessing && pendingAction === "rejected" ? (
                      <>
                        <span className="mr-2">Processing...</span>
                        <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                      </>
                    ) : (
                      "Reject Leave Request"
                    )}
                  </Button>
                  <Button
                    onClick={() => handleActionClick("returned")}
                    variant="outline"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isProcessing}>
                    {isProcessing && pendingAction === "returned" ? (
                      <>
                        <span className="mr-2">Processing...</span>
                        <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                      </>
                    ) : (
                      "Return for Clarification"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog - Use dialogAction for dialog content instead of pendingAction */}
      <AlertDialog
        open={showConfirmDialog && pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            // Just close the dialog - don't change other states in the handler
            setShowConfirmDialog(false);
          }
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "rejected"
                ? "Reject Leave Request"
                : dialogAction === "returned"
                ? "Return Leave Request"
                : "Endorse Leave Request"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "rejected"
                ? "Are you sure you want to reject this leave request? This action cannot be undone."
                : dialogAction === "returned"
                ? "Are you sure you want to return this leave request for clarification? This action cannot be undone."
                : "Are you sure you want to endorse this leave request? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelAction}
              className="bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 shadow-sm transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                dialogAction === "rejected"
                  ? "bg-red-600 hover:bg-red-700"
                  : dialogAction === "endorsed"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }>
              {dialogAction === "rejected" ? "Reject" : dialogAction === "returned" ? "Return" : "Endorse"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
