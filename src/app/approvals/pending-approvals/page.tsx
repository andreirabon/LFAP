"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { parseLocalDate } from "@/lib/date-utils";
import { X } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string | null;
}

interface EndorsedRequest {
  id: number;
  type: string;
  startDate: Date;
  endDate: Date;
  status: string;
  reason: string;
  supportingDoc: string | null;
  managerComments: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  managerId: number | null;
  manager?: {
    firstName: string;
    lastName: string;
  };
}

export default function PendingApprovals() {
  const router = useRouter();
  const [endorsedRequests, setEndorsedRequests] = useState<EndorsedRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EndorsedRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [managementComments, setManagementComments] = useState("");
  const [isCommentsError, setIsCommentsError] = useState(false);

  // Fetch endorsed leave requests when component mounts
  useEffect(() => {
    const fetchEndorsedRequests = async () => {
      try {
        const response = await fetch("/api/leave-requests/endorsed");
        if (!response.ok) {
          throw new Error("Failed to fetch endorsed requests");
        }
        const data = await response.json();
        setEndorsedRequests(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching endorsed leave requests:", error);
        toast.error("Failed to load endorsed leave requests");
        setIsLoading(false);
      }
    };

    fetchEndorsedRequests();
  }, []);

  const handleSelectRequest = (request: EndorsedRequest) => {
    setSelectedRequest(request);
    setManagementComments("");
    setIsCommentsError(false);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
    setManagementComments("");
    setIsCommentsError(false);
  };

  const validateComments = (action: "approved" | "rejected" | "returned") => {
    if (action === "rejected" && (!managementComments || managementComments.trim().length < 10)) {
      setIsCommentsError(true);
      toast.error("Comments are required when rejecting a request (minimum 10 characters)");
      return false;
    }
    // Comments are optional for 'approved' and 'returned' actions
    setIsCommentsError(false);
    return true;
  };

  const handleAction = async (action: "approved" | "rejected" | "returned") => {
    if (!selectedRequest) return;

    if (!validateComments(action)) return;

    setIsProcessing(true);

    try {
      // Get the current user's session
      const sessionResponse = await fetch("/api/auth/session");
      if (!sessionResponse.ok) {
        throw new Error("Failed to get user session");
      }

      const sessionData = await sessionResponse.json();

      // Check if user is logged in
      if (!sessionData.isLoggedIn) {
        toast.error("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      const managerId = sessionData.userId;

      if (!managerId) {
        toast.error("Could not determine your user ID. Please refresh and try again.");
        return;
      }

      // Map actions to top management actions
      const tmActionMap: Record<string, string> = {
        approved: "tm_approved",
        rejected: "tm_rejected",
        returned: "tm_returned",
      };

      const requestBody = {
        action: tmActionMap[action],
        managerId,
        managerComments: managementComments.trim() || undefined,
      };

      const response = await fetch(`/api/leave-requests/${selectedRequest.id}/action`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process leave request");
      }

      // Get the response data
      const responseData = await response.json();

      // Update the UI - remove the processed request from the list
      setEndorsedRequests(endorsedRequests.filter((req) => req.id !== selectedRequest.id));
      setSelectedRequest(null);

      // Show success message
      toast.success(responseData.message || `Leave request ${action} successfully`);
    } catch (error) {
      console.error(`Error ${action} leave request:`, error);
      toast.error(`Failed to ${action} leave request. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to calculate duration in days
  const calculateDuration = (startDate: Date, endDate: Date) => {
    const start = parseLocalDate(startDate.toString());
    const end = parseLocalDate(endDate.toString());
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Pending Leave Approvals</h1>

      {/* Main Table */}
      <Card className="overflow-hidden border rounded-lg">
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : endorsedRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground">
                  No endorsed leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              endorsedRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSelectRequest(request)}>
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
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending Approval</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Request Details Section */}
      {selectedRequest && (
        <Card className="mx-auto max-w-4xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Request Details</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseDetails}
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
                    Name: {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                    <br />
                    ID: {selectedRequest.user.id}
                    <br />
                    Department: {selectedRequest.user.department || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Leave Information</h4>
                  <p className="text-sm">
                    Type: {selectedRequest.type}
                    <br />
                    Duration:{" "}
                    {DateTime.fromJSDate(parseLocalDate(selectedRequest.startDate.toString()))
                      .setZone("Asia/Manila")
                      .toFormat("MMM dd, yyyy")}{" "}
                    -{" "}
                    {DateTime.fromJSDate(parseLocalDate(selectedRequest.endDate.toString()))
                      .setZone("Asia/Manila")
                      .toFormat("MMM dd, yyyy")}
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
                  <p className="text-sm">
                    {DateTime.fromJSDate(parseLocalDate(selectedRequest.createdAt.toString()))
                      .setZone("Asia/Manila")
                      .toFormat("MMM dd, yyyy")}
                  </p>
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

                {/* Endorsement Information */}
                {selectedRequest.manager && (
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Endorsement Information</h4>
                    <p className="text-sm">
                      Endorsed By: {selectedRequest.manager.firstName} {selectedRequest.manager.lastName}
                      <br />
                      Endorsement Date:{" "}
                      {DateTime.fromJSDate(parseLocalDate(selectedRequest.updatedAt.toString()))
                        .setZone("Asia/Manila")
                        .toFormat("MMM dd, yyyy")}
                      {selectedRequest.managerComments && (
                        <>
                          <br />
                          Endorsement Comments: {selectedRequest.managerComments}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Top Management Action */}
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                  <h4>Top Management Action</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Comments</label>
                    {isCommentsError && (
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800">
                        Required
                      </Badge>
                    )}
                  </div>
                  <Textarea
                    placeholder="Enter your comments here (required when rejecting)"
                    value={managementComments}
                    onChange={(e) => {
                      setManagementComments(e.target.value);
                      // Clear error when user types
                      if (isCommentsError && e.target.value.trim().length >= 10) {
                        setIsCommentsError(false);
                      }
                    }}
                    className={`resize-none ${isCommentsError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {isCommentsError && (
                    <p className="text-red-500 text-sm">
                      Comments are required when rejecting a request (minimum 10 characters)
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleAction("approved")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Approve Leave Request"}
                  </Button>
                  <Button
                    onClick={() => handleAction("rejected")}
                    variant="destructive"
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-700">
                    {isProcessing ? "Processing..." : "Reject Leave Request"}
                  </Button>
                  <Button
                    onClick={() => handleAction("returned")}
                    variant="outline"
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white">
                    {isProcessing ? "Processing..." : "Return to Manager"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
