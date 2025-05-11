"use client";

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
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  color: string;
}

interface LeaveRequest {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  supportingDoc: string | null;
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

export default function EditLeaveRequest() {
  const params = useParams();
  const leaveRequestId = params.id as string;
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leaveType: "",
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
      reason: "",
    },
  });

  // Fetch leave request data
  useEffect(() => {
    const fetchLeaveRequest = async () => {
      try {
        setIsLoadingRequest(true);
        const response = await fetch(`/api/leave-requests/${leaveRequestId}`);

        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Leave request not found");
            router.push("/leave-request/track-status");
            return;
          }
          throw new Error("Failed to fetch leave request");
        }

        const data = await response.json();
        setLeaveRequest(data);

        // Set form default values
        form.setValue("leaveType", data.type);
        form.setValue("dateRange", {
          from: new Date(data.startDate),
          to: new Date(data.endDate),
        });
        form.setValue("reason", data.reason);
      } catch (error) {
        console.error("Error fetching leave request:", error);
        toast.error("Failed to load leave request");
      } finally {
        setIsLoadingRequest(false);
      }
    };

    if (leaveRequestId) {
      fetchLeaveRequest();
    }
  }, [leaveRequestId, form, router]);

  // Fetch leave balances
  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        const response = await fetch("/api/leave-requests/leave-balances");
        if (!response.ok) {
          throw new Error("Failed to fetch leave balances");
        }
        const data = await response.json();
        setLeaveBalances(data.leaveBalances);
      } catch (error) {
        console.error("Error fetching leave balances:", error);
        toast.error("Failed to load leave balances");
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchLeaveBalances();
  }, []);

  // Check auth session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          throw new Error("Failed to fetch session");
        }
        const data = await response.json();

        if (!data.isLoggedIn) {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Get the selected leave type and remaining days
  const selectedLeaveType = form.watch("leaveType");
  const selectedBalance = leaveBalances.find((balance) => balance.type === selectedLeaveType);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // Handle file uploads first if any files are present
      let uploadedFileUrl: string | undefined = undefined;
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
        uploadedFileUrl = uploadResult.fileUrls[0]; // Take first file
      }

      // Submit the updated leave request
      const response = await fetch(`/api/leave-requests/${leaveRequestId}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: values.leaveType,
          startDate: values.dateRange.from.toISOString(),
          endDate: values.dateRange.to.toISOString(),
          reason: values.reason,
          ...(uploadedFileUrl ? { supportingDoc: uploadedFileUrl } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update leave request");
      }

      toast.success("Leave request updated successfully");
      router.push("/leave-request/track-status");
    } catch (error: unknown) {
      console.error("Leave request update failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update leave request");
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

  if (isLoadingRequest) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading leave request...</span>
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <Card className="shadow-md border-muted">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-2xl font-bold text-primary">Leave Request Not Found</CardTitle>
            <CardDescription className="text-muted-foreground">
              The leave request you are trying to edit does not exist or you don&apos;t have permission to edit it.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-6 sm:px-8">
            <Button onClick={() => router.push("/leave-request/track-status")}>Return to Track Status</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <Card className="shadow-md border-muted">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-2xl font-bold text-primary">Edit Leave Request</CardTitle>
          <CardDescription className="text-muted-foreground">
            Update your returned leave request with the required changes
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 px-6 sm:px-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6">
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
                              disabled={leave.remaining <= 0}>
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
                    <FormDescription>
                      Upload any supporting documents (optional)
                      {leaveRequest.supportingDoc && (
                        <div className="mt-2">
                          <p>
                            Current document:{" "}
                            <a
                              href={leaveRequest.supportingDoc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline">
                              View
                            </a>
                          </p>
                        </div>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 px-8 text-base font-medium bg-green-600 hover:bg-green-700 text-white transition-colors duration-200">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Leave Request"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto h-11"
                  onClick={() => router.push("/leave-request/track-status")}
                  disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
