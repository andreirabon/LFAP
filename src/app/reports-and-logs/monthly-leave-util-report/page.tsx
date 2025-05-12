"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface DepartmentData {
  department: string;
  leaveDays: number;
  employeeCount: number;
}

interface EmployeeData {
  name: string;
  department: string;
  leaveDays: number;
  leaveType: string;
}

interface MostUtilizedLeaveType {
  type: string;
  count: number;
}

interface MonthData {
  month: number;
  monthName: string;
  departmentData: DepartmentData[];
  mostUtilizedLeaveType: MostUtilizedLeaveType | null;
}

// Add color mapping for departments
const departmentColors: Record<string, { bg: string; text: string; hover: string; pie: string; border: string }> = {
  Engineering: {
    bg: "bg-blue-500",
    text: "text-white",
    hover: "hover:bg-blue-600",
    pie: "#3B82F6", // blue-500
    border: "#2563EB", // blue-600
  },
  Sales: {
    bg: "bg-green-500",
    text: "text-white",
    hover: "hover:bg-green-600",
    pie: "#22C55E", // green-500
    border: "#16A34A", // green-600
  },
  Marketing: {
    bg: "bg-purple-500",
    text: "text-white",
    hover: "hover:bg-purple-600",
    pie: "#A855F7", // purple-500
    border: "#9333EA", // purple-600
  },
  HR: {
    bg: "bg-orange-500",
    text: "text-white",
    hover: "hover:bg-orange-600",
    pie: "#F97316", // orange-500
    border: "#EA580C", // orange-600
  },
  "Human Resource": {
    bg: "bg-orange-500",
    text: "text-white",
    hover: "hover:bg-orange-600",
    pie: "#F97316", // orange-500
    border: "#EA580C", // orange-600
  },
  Finance: {
    bg: "bg-red-500",
    text: "text-white",
    hover: "hover:bg-red-600",
    pie: "#EF4444", // red-500
    border: "#DC2626", // red-600
  },
  Operations: {
    bg: "bg-yellow-500",
    text: "text-white",
    hover: "hover:bg-yellow-600",
    pie: "#EAB308", // yellow-500
    border: "#CA8A04", // yellow-600
  },
  IT: {
    bg: "bg-indigo-500",
    text: "text-white",
    hover: "hover:bg-indigo-600",
    pie: "#6366F1", // indigo-500
    border: "#4F46E5", // indigo-600
  },
  Legal: {
    bg: "bg-teal-500",
    text: "text-white",
    hover: "hover:bg-teal-600",
    pie: "#14B8A6", // teal-500
    border: "#0D9488", // teal-600
  },
  Research: {
    bg: "bg-pink-500",
    text: "text-white",
    hover: "hover:bg-pink-600",
    pie: "#EC4899", // pink-500
    border: "#DB2777", // pink-600
  },
  Administration: {
    bg: "bg-emerald-500",
    text: "text-white",
    hover: "hover:bg-emerald-600",
    pie: "#10B981", // emerald-500
    border: "#059669", // emerald-600
  },
  Records: {
    bg: "bg-sky-500",
    text: "text-white",
    hover: "hover:bg-sky-600",
    pie: "#0EA5E9", // sky-500
    border: "#0284C7", // sky-600
  },
  Accounting: {
    bg: "bg-cyan-500",
    text: "text-white",
    hover: "hover:bg-cyan-600",
    pie: "#06B6D4", // cyan-500
    border: "#0891B2", // cyan-600
  },
  "Human Resources": {
    bg: "bg-orange-500",
    text: "text-white",
    hover: "hover:bg-orange-600",
    pie: "#F97316", // orange-500
    border: "#EA580C", // orange-600
  },
  // Default color for any new departments
  default: {
    bg: "bg-violet-500",
    text: "text-white",
    hover: "hover:bg-violet-600",
    pie: "#8B5CF6", // violet-500
    border: "#7C3AED", // violet-600
  },
};

// Add color mapping for leave types
const leaveTypeColors = {
  "Sick Leave": "bg-red-100 text-red-800 hover:bg-red-100",
  "Vacation Leave": "bg-blue-100 text-blue-800 hover:bg-blue-100",
  "Mandatory/Force Leave": "bg-purple-100 text-purple-800 hover:bg-purple-100",
  "Special Privilege Leave": "bg-green-100 text-green-800 hover:bg-green-100",
  "Maternity Leave": "bg-pink-100 text-pink-800 hover:bg-pink-100",
  "Paternity Leave": "bg-orange-100 text-orange-800 hover:bg-orange-100",
  // Default color for any new leave types
  default: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

function getLeaveTypeColor(leaveType: string) {
  return leaveTypeColors[leaveType] || leaveTypeColors.default;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MonthlyLeaveUtilReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current date for default values
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Get year and month from URL or use current date
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");
  const year = yearParam ? parseInt(yearParam) : currentYear;
  const month = monthParam ? parseInt(monthParam) : currentMonth;

  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [isLoading, setIsLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
  const [mostUtilizedLeaveType, setMostUtilizedLeaveType] = useState<MostUtilizedLeaveType | null>(null);
  const [yearlyData, setYearlyData] = useState<MonthData[]>([]);

  // Available years for selection (current year and previous 4 years)
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Update URL when year or month changes
  const updateUrlParams = (newYear: number, newMonth: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("year", newYear.toString());
    params.set("month", newMonth.toString());
    router.push(`?${params.toString()}`);
  };

  // Handle year change
  const handleYearChange = (newYear: string) => {
    updateUrlParams(parseInt(newYear), month);
  };

  // Handle month change
  const handleMonthChange = (newMonth: string) => {
    updateUrlParams(year, parseInt(newMonth));
  };

  // Fetch monthly data with useCallback
  const fetchMonthlyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports/monthly-leave-utilization?year=${year}&month=${month}`);
      if (response.ok) {
        const data = await response.json();
        setDepartmentData(data.departmentData || []);
        setEmployeeData(data.employeeData || []);
        setMostUtilizedLeaveType(data.mostUtilizedLeaveType);
      }
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  // Fetch yearly data with useCallback
  const fetchYearlyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports/leave-utilization-yearly?year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setYearlyData(data.monthlyData || []);
      }
    } catch (error) {
      console.error("Error fetching yearly data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  // Fetch data based on view mode
  useEffect(() => {
    if (viewMode === "month") {
      fetchMonthlyData();
    } else {
      fetchYearlyData();
    }
  }, [viewMode, fetchMonthlyData, fetchYearlyData]);

  // Calculate summary statistics for monthly view
  const totalLeaveDays = departmentData.reduce((sum, dept) => sum + dept.leaveDays, 0);
  const totalEmployees = departmentData.reduce((sum, dept) => sum + dept.employeeCount, 0);

  // Filter employee data based on selected department
  const filteredEmployeeData = selectedDepartment
    ? employeeData.filter((emp) => emp.department === selectedDepartment)
    : employeeData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Monthly Leave Utilization Report</h1>
        <div className="flex gap-4 items-center">
          <Tabs
            defaultValue={viewMode}
            value={viewMode}
            onValueChange={(value: string) => setViewMode(value as "month" | "year")}
            className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="month">Monthly</TabsTrigger>
              <TabsTrigger value="year">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={year.toString()}
            onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem
                  key={year}
                  value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {viewMode === "month" && (
            <Select
              value={month.toString()}
              onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((monthName, index) => (
                  <SelectItem
                    key={index}
                    value={(index + 1).toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {viewMode === "month" ? (
        <>
          {isLoading ? (
            <SkeletonMonthView />
          ) : departmentData.length === 0 ? (
            <NoDataMessage viewMode="month" />
          ) : (
            <MonthlyView
              departmentData={departmentData}
              totalLeaveDays={totalLeaveDays}
              totalEmployees={totalEmployees}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              filteredEmployeeData={filteredEmployeeData}
              mostUtilizedLeaveType={mostUtilizedLeaveType}
            />
          )}
        </>
      ) : (
        <>
          {isLoading ? (
            <SkeletonYearView />
          ) : yearlyData.length === 0 ? (
            <NoDataMessage viewMode="year" />
          ) : (
            <YearlyView
              yearlyData={yearlyData}
              year={year}
            />
          )}
        </>
      )}
    </div>
  );
}

// Monthly View Component
function MonthlyView({
  departmentData,
  totalLeaveDays,
  totalEmployees,
  selectedDepartment,
  setSelectedDepartment,
  filteredEmployeeData,
  mostUtilizedLeaveType,
}: {
  departmentData: DepartmentData[];
  totalLeaveDays: number;
  totalEmployees: number;
  selectedDepartment: string | null;
  setSelectedDepartment: (dept: string | null) => void;
  filteredEmployeeData: EmployeeData[];
  mostUtilizedLeaveType: MostUtilizedLeaveType | null;
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Leave Days</CardTitle>
            <CardDescription>Across all departments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalLeaveDays}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
            <CardDescription>Active this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Utilized Leave Type</CardTitle>
            <CardDescription>Type with most requests</CardDescription>
          </CardHeader>
          <CardContent>
            {mostUtilizedLeaveType ? (
              <>
                <p className="text-2xl font-semibold">
                  <span
                    className={`px-3 py-1 rounded-md inline-block ${getLeaveTypeColor(mostUtilizedLeaveType.type)}`}>
                    {mostUtilizedLeaveType.type}
                  </span>
                </p>
                <p className="text-muted-foreground mt-2">
                  {mostUtilizedLeaveType.count} request{mostUtilizedLeaveType.count !== 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No leave requests found</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Leave Distribution</CardTitle>
              <CardDescription>Click on departments to filter the table below</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-8">
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-3/4 md:pr-4 flex justify-center items-center">
                  <div className="w-full max-w-md">
                    <PieChart
                      data={departmentData}
                      selectedDepartment={selectedDepartment}
                      onSliceClick={setSelectedDepartment}
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/4 flex flex-col gap-y-2.5 mt-4 md:mt-0 pl-4 self-center md:self-start md:border-l md:pl-6">
                  <div className="text-sm font-medium mb-2 text-muted-foreground">Legend:</div>
                  {departmentData.map((dept) => {
                    // Ensure we use the same color as in the pie chart
                    const departmentColor = departmentColors[dept.department]?.pie || departmentColors.default.pie;

                    return (
                      <div
                        key={`legend-${dept.department}`}
                        onClick={() =>
                          setSelectedDepartment(selectedDepartment === dept.department ? null : dept.department)
                        }
                        className={`flex items-center cursor-pointer transition-all duration-200 py-1 ${
                          selectedDepartment === dept.department
                            ? "opacity-100 font-medium"
                            : "opacity-80 hover:opacity-100"
                        }`}>
                        <div
                          className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: departmentColor }}
                        />
                        <span className="text-sm whitespace-nowrap">
                          {dept.department} ({dept.leaveDays} days)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDepartment
              ? `Leave Details - ${selectedDepartment} Department`
              : "Leave Details - All Departments"}
          </CardTitle>
          <CardDescription>
            {selectedDepartment
              ? `Showing leave records for ${selectedDepartment} department only`
              : "Showing leave records for all departments"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEmployeeData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployeeData.map((employee, i) => (
                  <TableRow key={`${employee.name}-${i}`}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(
                          employee.leaveType,
                        )}`}>
                        {employee.leaveType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{employee.leaveDays}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No leave records found {selectedDepartment ? `for ${selectedDepartment} department` : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// Yearly View Component
function YearlyView({ yearlyData, year }: { yearlyData: MonthData[]; year: number }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Yearly Leave Type Utilization - {year}</CardTitle>
          <CardDescription>Most utilized leave type for each month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Most Used Leave Type</TableHead>
                <TableHead className="text-right">Request Count</TableHead>
                <TableHead className="text-right">Total Leave Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearlyData.map((monthData) => {
                const totalDays = monthData.departmentData.reduce((sum, dept) => sum + dept.leaveDays, 0);

                return (
                  <TableRow key={monthData.month}>
                    <TableCell>{monthData.monthName}</TableCell>
                    <TableCell>
                      {monthData.mostUtilizedLeaveType ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(
                            monthData.mostUtilizedLeaveType.type,
                          )}`}>
                          {monthData.mostUtilizedLeaveType.type}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {monthData.mostUtilizedLeaveType ? monthData.mostUtilizedLeaveType.count : 0}
                    </TableCell>
                    <TableCell className="text-right">{totalDays}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Department-wise Leave Distribution - {year}</CardTitle>
          <CardDescription>Monthly breakdown by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  {yearlyData.map((monthData) => (
                    <TableHead
                      key={monthData.month}
                      className="text-right">
                      {monthData.monthName.substring(0, 3)}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getAllDepartments(yearlyData).map((department) => {
                  const deptTotals = getDepartmentMonthlyData(yearlyData, department);
                  const yearTotal = deptTotals.reduce((sum, days) => sum + days, 0);

                  return (
                    <TableRow key={department}>
                      <TableCell>{department}</TableCell>
                      {deptTotals.map((days, index) => (
                        <TableCell
                          key={index}
                          className="text-right">
                          {days}
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-medium">{yearTotal}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Helper function to get all unique departments from yearly data
function getAllDepartments(yearlyData: MonthData[]): string[] {
  const departments = new Set<string>();

  yearlyData.forEach((monthData) => {
    monthData.departmentData.forEach((dept) => {
      departments.add(dept.department);
    });
  });

  return Array.from(departments);
}

// Helper function to get monthly leave days for a specific department
function getDepartmentMonthlyData(yearlyData: MonthData[], department: string): number[] {
  return yearlyData.map((monthData) => {
    const deptData = monthData.departmentData.find((dept) => dept.department === department);
    return deptData ? deptData.leaveDays : 0;
  });
}

// PieChart Component
function PieChart({
  data,
  selectedDepartment,
  onSliceClick,
}: {
  data: DepartmentData[];
  selectedDepartment: string | null;
  onSliceClick: (dept: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });
  const totalDays = data.reduce((sum, dept) => sum + dept.leaveDays, 0);

  // Update canvas size based on container size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const size = Math.min(containerWidth, 320);
        setCanvasSize({ width: size, height: size });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  // Draw the pie chart
  useEffect(() => {
    if (!canvasRef.current || data.length === 0 || totalDays === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up variables
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.85;
    const innerRadius = radius * 0.4; // For donut chart effect

    // Create a stable color assignment for departments
    // This ensures the same department always gets the same color
    const fallbackColors = [
      "#8B5CF6", // violet-500
      "#D946EF", // fuchsia-500
      "#EC4899", // pink-500
      "#F43F5E", // rose-500
      "#F59E0B", // amber-500
      "#10B981", // emerald-500
      "#14B8A6", // teal-500
      "#06B6D4", // cyan-500
      "#3B82F6", // blue-500
      "#6366F1", // indigo-500
    ];

    let colorIndex = 0;
    const departmentColorMap = new Map();

    // First assign known colors
    data.forEach((dept) => {
      if (departmentColors[dept.department]) {
        departmentColorMap.set(dept.department, {
          color: departmentColors[dept.department].pie,
          borderColor: departmentColors[dept.department].border,
        });
      }
    });

    // Then assign fallback colors to any remaining departments
    data.forEach((dept) => {
      if (!departmentColorMap.has(dept.department)) {
        const fallbackColor = fallbackColors[colorIndex % fallbackColors.length];
        const darkerFallbackColor = fallbackColor; // Would create a darker version in a real implementation
        departmentColorMap.set(dept.department, {
          color: fallbackColor,
          borderColor: darkerFallbackColor,
        });
        colorIndex++;
      }
    });

    // Calculate slice angles
    let startAngle = -Math.PI / 2; // Start from top
    const slices: {
      dept: string;
      startAngle: number;
      endAngle: number;
      color: string;
      borderColor: string;
    }[] = [];

    data.forEach((dept) => {
      const sliceRatio = dept.leaveDays / totalDays;
      const sliceAngle = sliceRatio * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      const colors = departmentColorMap.get(dept.department) || {
        color: departmentColors.default.pie,
        borderColor: departmentColors.default.border,
      };

      slices.push({
        dept: dept.department,
        startAngle,
        endAngle,
        color: colors.color,
        borderColor: colors.borderColor,
      });

      startAngle = endAngle;
    });

    // Draw each slice
    slices.forEach((slice, index) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, slice.startAngle, slice.endAngle);
      ctx.closePath();

      // Style the slice
      ctx.fillStyle = slice.color;

      // If slice is selected or hovered, make it pop out
      if (slice.dept === selectedDepartment || index === hoveredSlice) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        // Move the slice slightly out from center
        const midAngle = (slice.startAngle + slice.endAngle) / 2;
        const offsetX = Math.cos(midAngle) * 10;
        const offsetY = Math.sin(midAngle) * 10;
        ctx.translate(offsetX, offsetY);
      }

      ctx.fill();

      // Reset shadow and translation if needed
      if (slice.dept === selectedDepartment || index === hoveredSlice) {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        // Reset translation
        const midAngle = (slice.startAngle + slice.endAngle) / 2;
        const offsetX = Math.cos(midAngle) * 10;
        const offsetY = Math.sin(midAngle) * 10;
        ctx.translate(-offsetX, -offsetY);
      }

      // Add border
      ctx.strokeStyle = slice.borderColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Create donut hole if needed
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e5e7eb"; // gray-200
    ctx.lineWidth = 1;
    ctx.stroke();

    // Add total in center
    ctx.fillStyle = "#111827"; // gray-900
    ctx.font = `bold ${innerRadius / 2.5}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${totalDays}`, centerX, centerY - innerRadius / 6);

    ctx.font = `${innerRadius / 6}px sans-serif`;
    ctx.fillStyle = "#6B7280"; // gray-500
    ctx.fillText("total days", centerX, centerY + innerRadius / 5);
  }, [data, totalDays, selectedDepartment, hoveredSlice, canvasSize]);

  // Handle click on pie chart
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.85;
    const innerRadius = radius * 0.4;

    // Calculate distance from center
    const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

    // Return if click is inside inner circle (donut hole)
    if (distFromCenter < innerRadius) {
      onSliceClick(null); // Deselect
      return;
    }

    // Return if click is outside pie
    if (distFromCenter > radius) {
      return;
    }

    // Calculate angle of click relative to center
    let angle = Math.atan2(y - centerY, x - centerX);
    if (angle < 0) angle += 2 * Math.PI; // Convert to 0-2PI range
    angle = (angle + Math.PI / 2) % (2 * Math.PI); // Adjust to start from top

    // Calculate slice angles
    let startAngle = 0;
    let clickedDepartment: string | null = null;

    for (const dept of data) {
      const sliceRatio = dept.leaveDays / totalDays;
      const sliceAngle = sliceRatio * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      if (angle >= startAngle && angle < endAngle) {
        clickedDepartment = dept.department;
        break;
      }

      startAngle = endAngle;
    }

    if (clickedDepartment === selectedDepartment) {
      onSliceClick(null);
    } else if (clickedDepartment) {
      onSliceClick(clickedDepartment);
    }
  };

  // Handle mouse movement for hover effect
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.85;
    const innerRadius = radius * 0.4;

    // Calculate distance from center
    const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

    // Return if mouse is inside inner circle or outside pie
    if (distFromCenter < innerRadius || distFromCenter > radius) {
      setHoveredSlice(null);
      return;
    }

    // Calculate angle of mouse relative to center
    let angle = Math.atan2(y - centerY, x - centerX);
    if (angle < 0) angle += 2 * Math.PI; // Convert to 0-2PI range
    angle = (angle + Math.PI / 2) % (2 * Math.PI); // Adjust to start from top

    // Find which slice mouse is over
    let startAngle = 0;
    let hovered = -1;

    for (let i = 0; i < data.length; i++) {
      const dept = data[i];
      const sliceRatio = dept.leaveDays / totalDays;
      const sliceAngle = sliceRatio * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      if (angle >= startAngle && angle < endAngle) {
        hovered = i;
        break;
      }

      startAngle = endAngle;
    }

    setHoveredSlice(hovered >= 0 ? hovered : null);
  };

  const handleMouseLeave = () => {
    setHoveredSlice(null);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[250px] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer"
      />
    </div>
  );
}

// No Data Message Component
function NoDataMessage({ viewMode }: { viewMode: "month" | "year" }) {
  return (
    <Card className="mt-6">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {viewMode === "month"
            ? "There are no approved leave requests for the selected month. Try selecting a different month or year."
            : "There are no approved leave requests for the selected year. Try selecting a different year."}
        </p>
      </CardContent>
    </Card>
  );
}

// Skeleton Loaders
function SkeletonMonthView() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-[140px]" />
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    </>
  );
}

function SkeletonYearView() {
  return (
    <>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <Skeleton className="h-6 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    </>
  );
}
