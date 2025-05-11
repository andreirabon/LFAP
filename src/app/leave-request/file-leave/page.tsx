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
  const router = useRouter();

  // Fetch leave balances and user's sex
  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        const response = await fetch("/api/leave-requests/leave-balances");
        if (!response.ok) {
          throw new Error("Failed to fetch leave balances");
        }
        const data = await response.json();
        console.log("API Response:", data);
        console.log("User Sex:", data.userSex);
        console.log("Leave Balances:", data.leaveBalances);
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Get the selected leave type and remaining days
  const selectedLeaveType = form.watch("leaveType");
  const selectedBalance = leaveBalances.find((balance) => balance.type === selectedLeaveType);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

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

      // Submit the leave request with file URLs
      const response = await fetch("/api/leave-requests/file-leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaveType: values.leaveType,
          startDate: values.dateRange.from.toISOString(),
          endDate: values.dateRange.to.toISOString(),
          reason: values.reason,
          supportingDocs: uploadedFileUrls,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit leave request");
      }

      toast.success("Leave request submitted successfully");
      form.reset();
      router.push("/leave-request/track-status");
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
    </div>
  );
}
