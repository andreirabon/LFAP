"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LeaveEntry {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  managerComments?: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    department: string | null;
  };
}

const leaveTypeColors = {
  "Vacation Leave": "bg-blue-100 text-blue-800 border-blue-300",
  "Sick Leave": "bg-red-100 text-red-800 border-red-300",
  "Work From Home": "bg-green-100 text-green-800 border-green-300",
  "Special Privilege Leave": "bg-green-100 text-green-800 border-green-300",
  "Maternity Leave": "bg-pink-100 text-pink-800 border-pink-300",
  "Paternity Leave": "bg-orange-100 text-orange-800 border-orange-300",
  "Mandatory Leave": "bg-purple-100 text-purple-800 border-purple-300",
  "Mandatory/Force Leave": "bg-purple-100 text-purple-800 border-purple-300",
  default: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function TeamCalendar() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(DateTime.now());
  const [selectedLeave, setSelectedLeave] = useState<LeaveEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [leaveEntries, setLeaveEntries] = useState<LeaveEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DateTime | null>(null);
  const [dayLeaves, setDayLeaves] = useState<LeaveEntry[]>([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthChecking(true);
      setAuthError(null);
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.status}`);
        }
        const data = await response.json();
        if (!data.isLoggedIn) {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthError(error instanceof Error ? error.message : "An unexpected error occurred");
        // Don't redirect immediately, show error instead
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchLeaveData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/leave-requests/tm-approved");
        if (!response.ok) {
          throw new Error("Failed to fetch approved leave data");
        }
        const data = await response.json();
        setLeaveEntries(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching leave data:", err);
        setError("Failed to load leave data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveData();
  }, []);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "prev" ? prev.minus({ months: 1 }) : prev.plus({ months: 1 })));
  };

  // Get all days in the current month
  const daysInMonth = Array.from({ length: currentDate.daysInMonth }, (_, i) => currentDate.set({ day: i + 1 }));

  // Get leaves for the current month
  const currentMonthLeaves = leaveEntries.filter((leave) => {
    const startDate = DateTime.fromISO(leave.startDate);
    const endDate = DateTime.fromISO(leave.endDate);
    return (
      startDate.hasSame(currentDate, "month") ||
      endDate.hasSame(currentDate, "month") ||
      (startDate < currentDate.startOf("month") && endDate > currentDate.endOf("month"))
    );
  });

  const handleDayClick = (date: DateTime) => {
    const leavesOnDay = currentMonthLeaves.filter((leave) => {
      const startDate = DateTime.fromISO(leave.startDate);
      const endDate = DateTime.fromISO(leave.endDate);
      return date >= startDate && date <= endDate;
    });

    if (leavesOnDay.length > 0) {
      setSelectedDay(date);
      setDayLeaves(leavesOnDay);
      setIsDetailsOpen(true);
    }
  };

  const handleViewLeaveDetails = (leave: LeaveEntry) => {
    setSelectedLeave(leave);
  };

  const getLeaveTypeColor = (leaveType: string) => {
    return leaveTypeColors[leaveType as keyof typeof leaveTypeColors] || leaveTypeColors.default;
  };

  const getLeaveDurationLabel = (startDate: string, endDate: string) => {
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);

    if (start.hasSame(end, "day")) {
      return `${start.toFormat("LLL dd, yyyy")}`;
    }

    if (start.hasSame(end, "month")) {
      return `${start.toFormat("LLL dd")} - ${end.toFormat("dd, yyyy")}`;
    }

    if (start.hasSame(end, "year")) {
      return `${start.toFormat("LLL dd")} - ${end.toFormat("LLL dd, yyyy")}`;
    }

    return `${start.toFormat("LLL dd, yyyy")} - ${end.toFormat("LLL dd, yyyy")}`;
  };

  const getNumberOfDays = (startDate: string, endDate: string) => {
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);
    const diff = end.diff(start, "days").days;
    return Math.ceil(diff) + 1;
  };

  const isWeekend = (date: DateTime) => {
    return date.weekday === 6 || date.weekday === 7; // 6 is Saturday, 7 is Sunday
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {isAuthChecking ? (
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
        <Card className="shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Team Leave Schedule</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium min-w-32 text-center">{currentDate.toFormat("MMMM yyyy")}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-4 md:px-6">
            {isLoading ? (
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="min-h-[100px] p-2 border rounded-md">
                    <Skeleton className="h-6 w-6 rounded-md mb-2" />
                    <Skeleton className="h-4 w-full rounded-md mb-1" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="h-96 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <div
                    key={day}
                    className={`p-2 text-center text-sm font-medium ${
                      index === 0 || index === 6 ? "text-red-500" : "text-muted-foreground"
                    }`}>
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before the start of the month */}
                {Array.from({ length: daysInMonth[0].weekday % 7 }).map((_, i) => (
                  <div
                    key={`empty-start-${i}`}
                    className="p-2"
                  />
                ))}

                {/* Calendar days */}
                {daysInMonth.map((date) => {
                  const leavesOnDay = currentMonthLeaves.filter((leave) => {
                    const startDate = DateTime.fromISO(leave.startDate);
                    const endDate = DateTime.fromISO(leave.endDate);
                    return date >= startDate && date <= endDate;
                  });

                  const isWeekendDay = isWeekend(date);
                  const isToday = date.hasSame(DateTime.now(), "day");

                  return (
                    <div
                      key={date.toISODate()}
                      className={`min-h-[100px] p-2 border rounded-lg transition-all
                        ${isToday ? "bg-blue-50 border-blue-300 shadow-sm" : ""}
                        ${isWeekendDay ? "bg-gray-50/80" : ""}
                        ${leavesOnDay.length ? "hover:bg-muted/70 hover:shadow-sm" : "hover:bg-muted/30"}
                        ${leavesOnDay.length ? "cursor-pointer" : ""}`}
                      onClick={() => leavesOnDay.length > 0 && handleDayClick(date)}>
                      <div
                        className={`text-sm font-medium flex justify-center items-center h-7 w-7 rounded-full mb-1
                          ${isToday ? "bg-primary text-white" : ""}
                          ${isWeekendDay && !isToday ? "text-red-500" : ""}`}>
                        {date.day}
                      </div>
                      <div className="mt-1 space-y-1 max-h-[75px] overflow-y-auto scrollbar-thin">
                        {leavesOnDay.map((leave) => (
                          <div
                            key={leave.id}
                            className={`text-xs p-1.5 rounded-md border ${getLeaveTypeColor(leave.type)} truncate`}>
                            {leave.employee.firstName} {leave.employee.lastName.charAt(0)}.
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isAuthChecking && !authError && (
        <Dialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-5 w-5 text-primary" />
                {selectedDay && <span>Leaves for {selectedDay.toFormat("MMMM d, yyyy")}</span>}
              </DialogTitle>
            </DialogHeader>

            {selectedDay && dayLeaves.length > 0 ? (
              <div className="mt-6 space-y-4">
                {dayLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className={`p-4 rounded-lg border hover:bg-muted/30 transition-colors
                      ${selectedLeave?.id === leave.id ? "ring-2 ring-primary bg-muted/20" : ""}`}
                    onClick={() => handleViewLeaveDetails(leave)}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        {leave.employee.firstName} {leave.employee.lastName}
                      </h3>
                      <Badge className={`${getLeaveTypeColor(leave.type)} px-2 py-1`}>{leave.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{leave.employee.department || "No Department"}</span>
                      <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/50"></span>
                      <span>{getNumberOfDays(leave.startDate, leave.endDate)} day(s)</span>
                    </div>
                    <div className="text-sm font-medium mt-2">
                      {getLeaveDurationLabel(leave.startDate, leave.endDate)}
                    </div>

                    {selectedLeave?.id === leave.id && (
                      <div className="mt-4 space-y-3 pt-3 border-t text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground mb-1">Reason</div>
                          <p className="bg-muted/30 p-2 rounded-md">{leave.reason}</p>
                        </div>

                        {leave.managerComments && (
                          <div>
                            <div className="font-medium text-muted-foreground mb-1">Manager Comments</div>
                            <p className="bg-muted/30 p-2 rounded-md">{leave.managerComments}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No leave details to display</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
