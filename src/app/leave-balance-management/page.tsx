"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Types and schemas
type LeaveType = "annual" | "sick" | "unpaid";

interface LeaveBalance {
  type: LeaveType;
  current: number;
  entitled: number;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  leaveBalances: LeaveBalance[];
}

const adjustmentFormSchema = z.object({
  leaveType: z.enum(["annual", "sick", "unpaid"] as const),
  adjustment: z.number().min(-365).max(365),
  reason: z.string().min(10, "Please provide a detailed reason"),
});

// Mock data
const mockEmployee: Employee = {
  id: "EMP001",
  name: "John Doe",
  department: "Engineering",
  leaveBalances: [
    { type: "annual", current: 14, entitled: 21 },
    { type: "sick", current: 10, entitled: 14 },
    { type: "unpaid", current: 0, entitled: 30 },
  ],
};

export default function HRAdminPanel() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form handling
  const form = useForm<z.infer<typeof adjustmentFormSchema>>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      leaveType: "annual",
      adjustment: 0,
      reason: "",
    },
  });

  const handleSearch = () => {
    // Simulate employee search
    if (searchQuery.toLowerCase().includes("john")) {
      setSelectedEmployee(mockEmployee);
    } else {
      setSelectedEmployee(null);
    }
  };

  const onSubmitAdjustment = (values: z.infer<typeof adjustmentFormSchema>) => {
    // In a real app, this would make an API call
    console.log("Adjustment submitted:", values);
    // Reset form
    form.reset();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Employee Leave Management</h1>

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Employee</CardTitle>
          <CardDescription>Search for an employee to view and modify their leave balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search by employee name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedEmployee && (
        <>
          {/* Employee Info Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{selectedEmployee.name}</CardTitle>
              <CardDescription>
                Department: {selectedEmployee.department} | Employee ID: {selectedEmployee.id}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Leave Balances Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {selectedEmployee.leaveBalances.map((balance) => (
              <Card key={balance.type}>
                <CardHeader>
                  <CardTitle className="capitalize">{balance.type} Leave</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current Balance:</span>
                      <span className="font-semibold">{balance.current} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Entitlement:</span>
                      <span className="font-semibold">{balance.entitled} days</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full">
                        Adjust Balance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adjust Leave Balance</DialogTitle>
                        <DialogDescription>
                          Make adjustments to the employee&apos;s leave balance. Use negative numbers for deductions.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmitAdjustment)}
                          className="space-y-4">
                          <FormField
                            control={form.control}
                            name="leaveType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Leave Type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={balance.type}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="annual">Annual Leave</SelectItem>
                                    <SelectItem value="sick">Sick Leave</SelectItem>
                                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="adjustment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adjustment (days)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Use positive numbers to add days, negative to subtract
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reason for Adjustment</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Provide a detailed reason for this adjustment..."
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit">Submit Adjustment</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {!selectedEmployee && searchQuery && (
        <Card className="p-6 text-center text-muted-foreground">
          <p>No employee found with the given search criteria</p>
        </Card>
      )}
    </div>
  );
}
