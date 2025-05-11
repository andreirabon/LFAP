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
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LeaveBalance {
  annual: number;
  sick: number;
  unpaid: number;
}

interface StatusUpdate {
  status: string;
  updatedBy: string;
  updatedAt: Date;
  comments?: string;
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  leaveType: "Annual" | "Sick" | "Unpaid";
  reason: string;
  status: "Endorsed" | "Approved" | "Rejected";
  leaveBalance: LeaveBalance;
  statusTrail: StatusUpdate[];
}

// Sample data
const sampleLeaveRequests: LeaveRequest[] = [
  {
    id: "LR001",
    employeeName: "John Doe",
    employeeId: "EMP001",
    startDate: new Date("2024-03-20"),
    endDate: new Date("2024-03-25"),
    duration: 5,
    leaveType: "Annual",
    reason: "Family vacation",
    status: "Endorsed",
    leaveBalance: {
      annual: 15,
      sick: 10,
      unpaid: 0,
    },
    statusTrail: [
      {
        status: "Submitted",
        updatedBy: "John Doe",
        updatedAt: new Date("2024-03-10"),
      },
      {
        status: "Endorsed",
        updatedBy: "Jane Smith (Manager)",
        updatedAt: new Date("2024-03-12"),
        comments: "Employee has sufficient leave balance",
      },
    ],
  },
  {
    id: "LR002",
    employeeName: "Alice Johnson",
    employeeId: "EMP002",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-04-03"),
    duration: 3,
    leaveType: "Sick",
    reason: "Medical appointment and recovery",
    status: "Endorsed",
    leaveBalance: {
      annual: 12,
      sick: 8,
      unpaid: 0,
    },
    statusTrail: [
      {
        status: "Submitted",
        updatedBy: "Alice Johnson",
        updatedAt: new Date("2024-03-15"),
      },
      {
        status: "Endorsed",
        updatedBy: "Bob Wilson (Manager)",
        updatedAt: new Date("2024-03-16"),
        comments: "Medical certificate provided",
      },
    ],
  },
];

type ActionStatus = "Approved" | "Rejected";

export default function PendingApprovals() {
  const [requests, setRequests] = useState<LeaveRequest[]>(sampleLeaveRequests);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>(sampleLeaveRequests);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [comments, setComments] = useState("");
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          throw new Error("Failed to fetch session");
        }
        const data = await response.json();
        if (!data.isLoggedIn) {
          router.replace("/login");
          return; // Exit early if not logged in
        }

        // In a real app, you would fetch data from your API here
        // For now, we'll just use the sample data
        setRequests(sampleLeaveRequests);
        setFilteredRequests(sampleLeaveRequests);
      } catch (error) {
        console.error("Error checking auth:", error);
        setError(error instanceof Error ? error.message : "An unexpected error occurred");
        toast.error("Failed to load data. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
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
        request.employeeName.toLowerCase().includes(lowercasedSearch) ||
        request.leaveType.toLowerCase().includes(lowercasedSearch) ||
        request.employeeId.toLowerCase().includes(lowercasedSearch),
    );

    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  const handleRequestSelect = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setComments("");
    setCommentsError(null);
  };

  // Validate comments based on action type
  const validateComments = (action: ActionStatus, comments: string): boolean => {
    if (action === "Rejected" && !comments.trim()) {
      setCommentsError("Comments are required to reject a request");
      return false;
    }

    if (action === "Rejected" && comments.trim().length < 10) {
      setCommentsError("Comments must be at least 10 characters long when rejecting a request");
      return false;
    }

    setCommentsError(null);
    return true;
  };

  const handleActionClick = (action: ActionStatus) => {
    if (action === "Rejected") {
      // Pre-validate comments before showing confirmation dialog
      if (!validateComments(action, comments)) {
        return;
      }
    }

    setPendingAction(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (pendingAction) {
      handleAction(selectedRequest?.id || "", pendingAction);
      setPendingAction(null);
      setShowConfirmDialog(false);
    }
  };

  const cancelAction = () => {
    setPendingAction(null);
    setShowConfirmDialog(false);
  };

  const handleAction = (requestId: string, action: ActionStatus) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  status: action,
                  statusTrail: [
                    ...request.statusTrail,
                    {
                      status: action,
                      updatedBy: "Top Management",
                      updatedAt: new Date(),
                      comments: comments || `Leave request ${action.toLowerCase()} by top management`,
                    },
                  ],
                }
              : request,
          ),
        );

        // Update filtered requests
        setFilteredRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));

        setSelectedRequest(null);
        setComments("");
        toast.success(`Request successfully ${action.toLowerCase()}.`);
        setIsProcessing(false);
      }, 500);
    } catch (error) {
      console.error(`Error during ${action} action:`, error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred while processing the request.",
      );
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: LeaveRequest["status"]) => {
    const colors = {
      Endorsed: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800"; // Default/fallback color
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
      <h1 className="text-2xl font-bold">Pending Leave Approvals</h1>

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
          placeholder="Search by employee name, ID, or leave type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2"
        />
      </div>

      {/* Pending Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Approvals ({filteredRequests.length})</CardTitle>
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
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Leave Type</TableHead>
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
                    <TableCell className="font-medium">{request.employeeName}</TableCell>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>{DateTime.fromJSDate(request.startDate).toFormat("dd LLL yyyy")}</TableCell>
                    <TableCell>{DateTime.fromJSDate(request.endDate).toFormat("dd LLL yyyy")}</TableCell>
                    <TableCell>{request.duration} days</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(request.status)}>
                        {request.status}
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
            <CardTitle>Leave Request Details</CardTitle>
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
                    Name: {selectedRequest.employeeName}
                    <br />
                    ID: {selectedRequest.employeeId}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Leave Details</h4>
                  <p className="text-sm">
                    Type: {selectedRequest.leaveType}
                    <br />
                    Duration: {DateTime.fromJSDate(selectedRequest.startDate).toFormat("dd LLL yyyy")} -{" "}
                    {DateTime.fromJSDate(selectedRequest.endDate).toFormat("dd LLL yyyy")}
                    <br />
                    Total Days: {selectedRequest.duration} days
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Reason</h4>
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Leave Balances</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Annual Leave</p>
                      <p className="text-sm font-semibold">{selectedRequest.leaveBalance.annual} days</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Sick Leave</p>
                      <p className="text-sm font-semibold">{selectedRequest.leaveBalance.sick} days</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Unpaid Leave</p>
                      <p className="text-sm font-semibold">{selectedRequest.leaveBalance.unpaid} days</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold">Status History</h4>
                  <div className="space-y-2 mb-4">
                    {selectedRequest.statusTrail.map((status, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded-lg flex justify-between">
                        <div>
                          <p className="text-sm font-medium">{status.status}</p>
                          <p className="text-xs text-gray-600">{status.updatedBy}</p>
                          {status.comments && <p className="text-xs text-gray-600 mt-1">{status.comments}</p>}
                        </div>
                        <p className="text-xs text-gray-600">
                          {DateTime.fromJSDate(status.updatedAt).toFormat("dd LLL yyyy HH:mm")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Top Management Action</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Comments</label>
                    {pendingAction === "Rejected" && (
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800">
                        Required
                      </Badge>
                    )}
                  </div>
                  <Textarea
                    placeholder="Enter your comments here (required for Reject action)"
                    value={comments}
                    onChange={(e) => {
                      setComments(e.target.value);
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
                    onClick={() => handleActionClick("Approved")}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isProcessing}>
                    {isProcessing && pendingAction === "Approved" ? (
                      <>
                        <span className="mr-2">Processing...</span>
                        <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                      </>
                    ) : (
                      "Approve"
                    )}
                  </Button>
                  <Button
                    onClick={() => handleActionClick("Rejected")}
                    variant="destructive"
                    disabled={isProcessing}>
                    {isProcessing && pendingAction === "Rejected" ? (
                      <>
                        <span className="mr-2">Processing...</span>
                        <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                      </>
                    ) : (
                      "Reject"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === "Rejected" ? "Reject Leave Request" : "Approve Leave Request"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "Rejected"
                ? "Are you sure you want to reject this leave request? This action cannot be undone."
                : "Are you sure you want to approve this leave request? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                pendingAction === "Rejected" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              }>
              {pendingAction === "Rejected" ? "Reject" : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
