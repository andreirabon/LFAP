"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LeaveEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: "Vacation" | "Sick" | "WFH" | "Special";
  status: "Approved";
}

// Sample data
const sampleLeaveData: LeaveEntry[] = [
  {
    id: "L1",
    employeeId: "EMP001",
    employeeName: "John Doe",
    startDate: "2024-03-15",
    endDate: "2024-03-20",
    leaveType: "Vacation",
    status: "Approved",
  },
  {
    id: "L2",
    employeeId: "EMP002",
    employeeName: "Jane Smith",
    startDate: "2024-03-18",
    endDate: "2024-03-19",
    leaveType: "Sick",
    status: "Approved",
  },
  {
    id: "L3",
    employeeId: "EMP003",
    employeeName: "Bob Wilson",
    startDate: "2024-03-25",
    endDate: "2024-03-29",
    leaveType: "WFH",
    status: "Approved",
  },
];

const leaveTypeColors = {
  Vacation: "bg-blue-200 text-blue-800",
  Sick: "bg-red-200 text-red-800",
  WFH: "bg-green-200 text-green-800",
  Special: "bg-purple-200 text-purple-800",
};

export default function TeamCalendar() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(DateTime.now());
  const [selectedLeave, setSelectedLeave] = useState<LeaveEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "prev" ? prev.minus({ months: 1 }) : prev.plus({ months: 1 })));
  };

  // Get all days in the current month
  const daysInMonth = Array.from({ length: currentDate.daysInMonth }, (_, i) => currentDate.set({ day: i + 1 }));

  // Get leaves for the current month
  const currentMonthLeaves = sampleLeaveData.filter((leave) => {
    const startDate = DateTime.fromISO(leave.startDate);
    const endDate = DateTime.fromISO(leave.endDate);
    return startDate.hasSame(currentDate, "month") || endDate.hasSame(currentDate, "month");
  });

  const handleDayClick = (date: DateTime) => {
    const leavesOnDay = currentMonthLeaves.filter((leave) => {
      const startDate = DateTime.fromISO(leave.startDate);
      const endDate = DateTime.fromISO(leave.endDate);
      return date >= startDate && date <= endDate;
    });

    if (leavesOnDay.length > 0) {
      setSelectedLeave(leavesOnDay[0]);
      setIsDetailsOpen(true);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Team Leave Schedule</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold">{currentDate.toFormat("MMMM yyyy")}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-semibold text-muted-foreground">
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

              return (
                <div
                  key={date.toISODate()}
                  className={`min-h-[100px] p-2 border rounded-md ${
                    date.hasSame(DateTime.now(), "day") ? "bg-muted" : "hover:bg-muted/50"
                  } cursor-pointer`}
                  onClick={() => handleDayClick(date)}>
                  <div className="text-sm font-medium">{date.day}</div>
                  <div className="mt-1 space-y-1">
                    {leavesOnDay.map((leave) => (
                      <div
                        key={leave.id}
                        className={`text-xs p-1 rounded ${leaveTypeColors[leave.leaveType]} truncate`}>
                        {leave.employeeName}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leave Details Sheet */}
      <Sheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Leave Details</SheetTitle>
          </SheetHeader>
          {selectedLeave && (
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-semibold">Employee</h4>
                <p className="text-sm">{selectedLeave.employeeName}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Leave Type</h4>
                <p className="text-sm">{selectedLeave.leaveType}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Duration</h4>
                <p className="text-sm">
                  {DateTime.fromISO(selectedLeave.startDate).toFormat("LLL dd, yyyy")} -{" "}
                  {DateTime.fromISO(selectedLeave.endDate).toFormat("LLL dd, yyyy")}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Status</h4>
                <p className="text-sm">{selectedLeave.status}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
