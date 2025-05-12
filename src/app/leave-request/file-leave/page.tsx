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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Types and interfaces
interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  color: string;
}

// Form schema
const formSchema = z
  .object({
    leaveType: z.string({
      required_error: "Please select a leave type",
    }),
    dateRange: z.object({
      from: z.date({
        required_error: "Start date is required",
      }),
      to: z.date({
        required_error: "End date is required",
      }),
    }),
    reason: z
      .string()
      .min(10, "Reason must be at least 10 characters")
      .max(500, "Reason must not exceed 500 characters"),
    supportingDocs: z
      .array(z.instanceof(File))
      .optional()
      .transform((files) => (files?.length ? files : undefined)),
  })
  .refine(
    (data) => {
      const start = DateTime.fromJSDate(data.dateRange.from);
      const end = DateTime.fromJSDate(data.dateRange.to);
      return end >= start;
    },
    {
      message: "End date must be after start date",
      path: ["dateRange"],
    },
  );

export default function FileLeave() {
  // Replace hardcoded leave balances with state
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const router = useRouter();

  // Fetch leave balances and user's sex
  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        const response = await fetch("/api/leave-requests/leave-balances");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || `Failed to fetch leave balances: ${response.status}`;
          console.error("API Error:", errorMessage);
          throw new Error(errorMessage);
        }
        const data = await response.json();

        if (!data.leaveBalances || !Array.isArray(data.leaveBalances)) {
          console.error("Invalid API response format:", data);
          throw new Error("Invalid leave balances data received from server");
        }

        setLeaveBalances(data.leaveBalances);
      } catch (error) {
        console.error("Error fetching leave balances:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load leave balances");
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchLeaveBalances();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          throw new Error("Failed to fetch session");
        }
        const data = await response.json();

        console.log("Session data:", data); // Debug session data

        if (!data.isLoggedIn) {
          router.replace("/login");
        } else {
          // Store user department from the user object in the session response
          const department = data.user?.department || null;
          console.log("User department:", department); // Debug department value
          setUserDepartment(department);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthError("Failed to verify authentication. Please try refreshing the page or login again.");
        // We'll keep the user on the page but show the error
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Get the selected leave type and remaining days
  const selectedLeaveType = form.watch("leaveType");
  const selectedBalance = leaveBalances.find((balance) => balance.type === selectedLeaveType);

  const handleFileAnother = async () => {
    form.reset();
    setShowConfirmDialog(false);
    // Refresh leave balances
    setIsLoadingBalances(true);
    await fetchLeaveBalances();
  };

  const handleViewStatus = () => {
    router.push("/leave-request/track-status");
  };

  const fetchLeaveBalances = async () => {
    try {
      const response = await fetch("/api/leave-requests/leave-balances");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch leave balances: ${response.status}`;
        console.error("API Error:", errorMessage);
        throw new Error(errorMessage);
      }
      const data = await response.json();

      if (!data.leaveBalances || !Array.isArray(data.leaveBalances)) {
        console.error("Invalid API response format:", data);
        throw new Error("Invalid leave balances data received from server");
      }

      setLeaveBalances(data.leaveBalances);
    } catch (error) {
      console.error("Error fetching leave balances:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load leave balances");
    } finally {
      setIsLoadingBalances(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      console.log("Current department before submission:", userDepartment); // Debug department before sending

      // Handle file uploads first if any files are present
      let uploadedFileUrls: string[] = [];
      if (values.supportingDocs?.length) {
        const formData = new FormData();
        values.supportingDocs.forEach((file) => {
          formData.append("files", file);
        });

        const uploadResponse = await fetch("/api/supporting-documents", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload supporting documents");
        }

        const uploadResult = await uploadResponse.json();
        uploadedFileUrls = uploadResult.fileUrls;
      }

      // Ensure department is included in the payload
      if (!userDepartment) {
        console.warn("Warning: Department is not available for this request");
      }

      // Prepare payload with department
      const payload = {
        leaveType: values.leaveType,
        startDate: values.dateRange.from.toISOString(),
        endDate: values.dateRange.to.toISOString(),
        reason: values.reason,
        supportingDocs: uploadedFileUrls,
        department: userDepartment || "Not assigned", // Use fallback if department is null
      };

      console.log("Sending payload with department:", payload); // Debug the full payload

      // Submit the leave request with file URLs
      const response = await fetch("/api/leave-requests/file-leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit leave request");
      }

      toast.success("Leave request submitted successfully");
      setShowConfirmDialog(true);
    } catch (error: unknown) {
      console.error("Leave request submission failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit leave request");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Update the Calendar disabled dates logic
  const isDateDisabled = (date: Date) => {
    const today = DateTime.now().startOf("day");
    const checkDate = DateTime.fromJSDate(date);
    return checkDate < today || checkDate.weekday > 5; // Disable weekends and past dates
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {isCheckingAuth ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3">Verifying your session...</span>
        </div>
      ) : authError ? (
        <div className="bg-red-50 text-red-800 p-6 rounded-md mb-4">
          <h3 className="text-lg font-medium mb-2">Authentication Error</h3>
          <p>{authError}</p>
          <div className="mt-4">
            <Button
              onClick={() => router.push("/login")}
              className="bg-red-600 hover:bg-red-700 text-white mr-2">
              Go to Login
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      ) : (
        <Card className="shadow-md border-muted">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-2xl font-bold text-primary">File Leave Request</CardTitle>
            <CardDescription className="text-muted-foreground">Submit a new leave request for approval</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-6 sm:px-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6">
                {/* Department Field - Automatically populated and disabled */}
                <div className="space-y-2">
                  <FormLabel className="text-base font-medium">Department</FormLabel>
                  <Input
                    value={isCheckingAuth ? "Loading..." : userDepartment || "Not assigned"}
                    disabled
                    readOnly
                    className="h-11 bg-muted/40 cursor-not-allowed"
                  />
                </div>
                {/* Leave Type Selection */}
                <FormField
                  control={form.control}
                  name="leaveType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Leave Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingBalances}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue
                              placeholder={isLoadingBalances ? "Loading leave balances..." : "Select leave type"}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingBalances ? (
                            <SelectItem
                              value="loading"
                              disabled>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                              Loading...
                            </SelectItem>
                          ) : (
                            leaveBalances.map((leave) => (
                              <SelectItem
                                key={leave.type}
                                value={leave.type}
                                disabled={leave.remaining === 0}>
                                <span className={cn("font-medium", leave.color)}>
                                  {leave.type}{" "}
                                  <span className="text-muted-foreground">({leave.remaining} days remaining)</span>
                                </span>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Show selected leave information if available */}
                {selectedBalance && (
                  <div className="rounded-md bg-muted/50 p-4 text-sm border border-muted mb-6">
                    <p className="mb-1">
                      <span className="font-medium">Selected Leave:</span> {selectedBalance.type}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Total Days:</span> {selectedBalance.total}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Used Days:</span> {selectedBalance.used}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Remaining Days:</span> {selectedBalance.remaining}
                    </p>
                  </div>
                )}

                {/* Date Selection */}
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base font-medium">Leave Duration</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full h-11 pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}>
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {DateTime.fromJSDate(field.value.from).toLocaleString(DateTime.DATE_FULL)} -{" "}
                                    {DateTime.fromJSDate(field.value.to).toLocaleString(DateTime.DATE_FULL)}
                                  </>
                                ) : (
                                  DateTime.fromJSDate(field.value.from).toLocaleString(DateTime.DATE_FULL)
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0"
                          align="start">
                          <Calendar
                            mode="range"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={isDateDisabled}
                            numberOfMonths={2}
                            initialFocus
                            className="rounded-md border shadow-sm"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reason */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Reason for Leave</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide a detailed reason for your leave request"
                          className="resize-none min-h-[120px] shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Upload */}
                <FormField
                  control={form.control}
                  name="supportingDocs"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Supporting Documents</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            onChange(files);
                          }}
                          {...field}
                          value={undefined}
                          className="h-11 shadow-sm"
                        />
                      </FormControl>
                      <FormDescription>Upload any supporting documents (optional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 px-8 text-base font-medium bg-green-600 hover:bg-green-700 text-white transition-colors duration-200">
                  {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Submit Leave Request
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Request Submitted</AlertDialogTitle>
            <AlertDialogDescription>
              Your leave request has been submitted successfully. Would you like to file another leave request or view
              your request status?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleViewStatus}
              className="bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 shadow-sm transition-colors">
              View Status
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFileAnother}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              File Another
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
