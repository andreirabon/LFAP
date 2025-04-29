"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dynamic from "next/dynamic";
import { useState } from "react";

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

interface MockData {
  months: string[];
  departmentData: Record<string, DepartmentData[]>;
  employeeData: Record<string, EmployeeData[]>;
}

// Mock data structure
const mockData: MockData = {
  months: ["January 2024", "February 2024", "March 2024", "April 2024", "May 2024", "June 2024"],
  departmentData: {
    "January 2024": [
      { department: "Engineering", leaveDays: 45, employeeCount: 20 },
      { department: "Sales", leaveDays: 30, employeeCount: 15 },
      { department: "Marketing", leaveDays: 25, employeeCount: 10 },
      { department: "HR", leaveDays: 15, employeeCount: 5 },
    ],
    "February 2024": [
      { department: "Engineering", leaveDays: 40, employeeCount: 20 },
      { department: "Sales", leaveDays: 35, employeeCount: 15 },
      { department: "Marketing", leaveDays: 20, employeeCount: 10 },
      { department: "HR", leaveDays: 10, employeeCount: 5 },
    ],
  },
  employeeData: {
    "January 2024": [
      {
        name: "John Doe",
        department: "Engineering",
        leaveDays: 3,
        leaveType: "Vacation",
      },
      {
        name: "Jane Smith",
        department: "Sales",
        leaveDays: 2,
        leaveType: "Sick",
      },
      {
        name: "Mike Johnson",
        department: "Marketing",
        leaveDays: 5,
        leaveType: "Vacation",
      },
      {
        name: "Sarah Williams",
        department: "HR",
        leaveDays: 1,
        leaveType: "Other",
      },
    ],
    "February 2024": [
      {
        name: "John Doe",
        department: "Engineering",
        leaveDays: 2,
        leaveType: "Sick",
      },
      {
        name: "Jane Smith",
        department: "Sales",
        leaveDays: 3,
        leaveType: "Vacation",
      },
      {
        name: "Mike Johnson",
        department: "Marketing",
        leaveDays: 4,
        leaveType: "Other",
      },
      {
        name: "Sarah Williams",
        department: "HR",
        leaveDays: 2,
        leaveType: "Vacation",
      },
    ],
  },
};

// Add color mapping for departments
const departmentColors: Record<string, { bg: string; text: string; hover: string }> = {
  Engineering: {
    bg: "bg-blue-500",
    text: "text-white",
    hover: "hover:bg-blue-600",
  },
  Sales: {
    bg: "bg-green-500",
    text: "text-white",
    hover: "hover:bg-green-600",
  },
  Marketing: {
    bg: "bg-purple-500",
    text: "text-white",
    hover: "hover:bg-purple-600",
  },
  HR: {
    bg: "bg-orange-500",
    text: "text-white",
    hover: "hover:bg-orange-600",
  },
};

// Dynamically import PDF components with no SSR
const PDFDownloadButton = dynamic(() => import("./PDFDownloadButton"), {
  ssr: false,
  loading: () => <div>Loading PDF Generator...</div>,
});

export default function MonthlyLeaveUtilReportPage() {
  const [selectedMonth, setSelectedMonth] = useState(mockData.months[0]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  // Calculate summary statistics
  const currentMonthData = mockData.departmentData[selectedMonth];
  const totalLeaveDays = currentMonthData.reduce((sum: number, dept: DepartmentData) => sum + dept.leaveDays, 0);
  const totalEmployees = currentMonthData.reduce((sum: number, dept: DepartmentData) => sum + dept.employeeCount, 0);
  const averageUtilization = ((totalLeaveDays / (totalEmployees * 22)) * 100).toFixed(1);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Monthly Leave Utilization Report</h1>
        <div className="flex gap-4">
          <Select
            value={selectedMonth}
            onValueChange={(value) => setSelectedMonth(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {mockData.months.map((month) => (
                <SelectItem
                  key={month}
                  value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <PDFDownloadButton
            selectedMonth={selectedMonth}
            departmentData={currentMonthData}
            employeeData={mockData.employeeData[selectedMonth]}
            totalLeaveDays={totalLeaveDays}
            averageUtilization={averageUtilization}
            totalEmployees={totalEmployees}
          />
        </div>
      </div>

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
            <CardTitle>Average Utilization</CardTitle>
            <CardDescription>Per working day</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{averageUtilization}%</p>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department-wise Leave Distribution</CardTitle>
          <CardDescription>Click on departments to filter the table below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <div className="grid grid-cols-4 gap-4 h-full">
              {currentMonthData.map((dept: DepartmentData) => (
                <div
                  key={dept.department}
                  className={`flex flex-col justify-end cursor-pointer transition-all duration-200 rounded-t-lg min-h-[40px] ${
                    selectedDepartment === dept.department
                      ? `${departmentColors[dept.department].bg} opacity-100 scale-105`
                      : `${departmentColors[dept.department].bg} opacity-80 ${departmentColors[dept.department].hover}`
                  }`}
                  style={{ height: `${Math.max((dept.leaveDays / totalLeaveDays) * 100, 15)}%` }}
                  onClick={() =>
                    setSelectedDepartment(selectedDepartment === dept.department ? null : dept.department)
                  }>
                  <div className={`px-3 py-2 text-center ${departmentColors[dept.department].text}`}>
                    <div className="font-semibold truncate">{dept.department}</div>
                    <div className="text-sm opacity-90 whitespace-nowrap">{dept.leaveDays} days</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {currentMonthData.map((dept: DepartmentData) => (
              <div
                key={`legend-${dept.department}`}
                className="flex items-center justify-center text-sm">
                <div className={`w-3 h-3 rounded-full mr-2 ${departmentColors[dept.department].bg}`} />
                <span className="text-muted-foreground">{dept.department}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee Leave Details</CardTitle>
          <CardDescription>
            {selectedDepartment ? `Filtered by ${selectedDepartment}` : "All departments"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Leave Days</TableHead>
                <TableHead>Leave Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.employeeData[selectedMonth]
                .filter((employee: EmployeeData) => !selectedDepartment || employee.department === selectedDepartment)
                .map((employee: EmployeeData, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.leaveDays}</TableCell>
                    <TableCell>{employee.leaveType}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
