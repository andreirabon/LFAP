import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import db from "@/db"; // Assuming your Drizzle instance is exported from @/db
import { leaveRequests, users } from "@/db/schema"; // Assuming your schema is here
import { getSession } from "@/lib/session";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Helper function to calculate number of days
function calculateNumberOfDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 1 : diffDays; // If start and end are same, it's 1 day
}

// Helper function to format date (can be kept or modified)
function formatDate(dateString: string | Date) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface UserPersonalInfo {
  name: string;
  // employeeId?: string; // Not in schema
  // department?: string; // Not in schema
  // position?: string; // Not in schema
  dateHired: string;
  email: string;
  // supervisor?: string; // Not in schema
}

interface UserLeaveEntitlement {
  type: string;
  balance: number;
  color: string; // Keep color for styling, or adjust as needed
}

interface UserLeaveHistory {
  id: number; // Assuming ID is number from DB
  type: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: "pending" | "approved" | "rejected"; // From schema
  // approvedBy?: string; // Not in schema
  // approvedDate?: string; // Not in schema
  createdAt: string;
}

async function UserDataFetcher({ userId }: { userId: number }) {
  // Fetch Personal Info
  const userResult = await db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      createdAt: users.createdAt,
      vacationLeave: users.vacationLeave,
      mandatoryLeave: users.mandatoryLeave,
      sickLeave: users.sickLeave,
      maternityLeave: users.maternityLeave,
      paternityLeave: users.paternityLeave,
      specialPrivilegeLeave: users.specialPrivilegeLeave,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userResult || userResult.length === 0) {
    return <p className="text-red-500">User not found.</p>;
  }
  const dbUser = userResult[0];

  const personalInfo: UserPersonalInfo = {
    name: `${dbUser.firstName} ${dbUser.lastName}`,
    email: dbUser.email,
    dateHired: formatDate(dbUser.createdAt!), // Add null check if createdAt can be null
  };

  const leaveEntitlements: UserLeaveEntitlement[] = [
    { type: "Vacation Leave", balance: dbUser.vacationLeave, color: "text-blue-600" },
    { type: "Mandatory/Forced Leave", balance: dbUser.mandatoryLeave, color: "text-purple-600" },
    { type: "Sick Leave", balance: dbUser.sickLeave, color: "text-red-600" },
    { type: "Maternity Leave", balance: dbUser.maternityLeave, color: "text-pink-600" },
    // Assuming Paternity leave also needs to be displayed
    { type: "Paternity Leave", balance: dbUser.paternityLeave, color: "text-teal-600" },
    { type: "Special Privilege Leave", balance: dbUser.specialPrivilegeLeave, color: "text-green-600" },
  ];

  // Fetch Approved Leave History
  const approvedLeavesResult = await db
    .select({
      id: leaveRequests.id,
      type: leaveRequests.type,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      status: leaveRequests.status,
      createdAt: leaveRequests.createdAt,
    })
    .from(leaveRequests)
    .where(and(eq(leaveRequests.userId, userId), eq(leaveRequests.status, "approved")))
    .orderBy(leaveRequests.createdAt); // Or sort by startDate

  const leaveHistory: UserLeaveHistory[] = approvedLeavesResult.map((leave) => ({
    id: leave.id,
    type: leave.type,
    startDate: formatDate(leave.startDate),
    endDate: formatDate(leave.endDate),
    numberOfDays: calculateNumberOfDays(leave.startDate, leave.endDate),
    status: leave.status,
    createdAt: formatDate(leave.createdAt),
  }));

  return (
    <>
      {/* Personal Information Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{personalInfo.name}</p>
            </div>
            {/* Fields not in schema are commented out or removed
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{personalInfo.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{personalInfo.department}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Position</p>
              <p className="font-medium">{personalInfo.position}</p>
            </div>
            */}
            <div>
              <p className="text-sm text-muted-foreground">Date Hired</p>
              <p className="font-medium">{personalInfo.dateHired}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{personalInfo.email}</p>
            </div>
            {/*
            <div>
              <p className="text-sm text-muted-foreground">Supervisor</p>
              <p className="font-medium">{personalInfo.supervisor}</p>
            </div>
            */}
          </div>
        </CardContent>
      </Card>

      {/* Leave Entitlements Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Leave Entitlements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leaveEntitlements.map((entitlement) => (
              <div
                key={entitlement.type}
                className="flex justify-between items-center p-3 rounded-lg border">
                <span className={`font-medium ${entitlement.color}`}>{entitlement.type}</span>
                <span className={`font-semibold ${entitlement.color}`}>{entitlement.balance}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leave History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead>Approved By</TableHead> // Not in schema */}
                  <TableHead>Requested Date</TableHead> {/* Changed from Approved Date */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveHistory.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.id}</TableCell>
                    <TableCell>{leave.type}</TableCell>
                    <TableCell>
                      {leave.startDate} - {leave.endDate}
                    </TableCell>
                    <TableCell>{leave.numberOfDays}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          leave.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : leave.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800" // For rejected, though query filters for approved
                        }`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </TableCell>
                    {/* <TableCell>{leave.approvedBy}</TableCell> // Not in schema */}
                    <TableCell>{leave.createdAt}</TableCell> {/* Using createdAt from leave_requests */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No approved leave history found.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default async function PersonalInformationPage() {
  // Renamed to avoid conflict
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    // Ensure userId exists
    redirect("/login");
  }

  // It's good practice to parse userId to number if it's stored as string in session
  const userId = typeof session.userId === "string" ? parseInt(session.userId, 10) : session.userId;

  if (isNaN(userId)) {
    // Handle cases where userId might not be a valid number after parsing
    // This could be logging an error, redirecting, or showing an error message
    console.error("Invalid userId in session:", session.userId);
    redirect("/login"); // Or an error page
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={<p className="text-center">Loading personal information...</p>}>
        <UserDataFetcher userId={userId} />
      </Suspense>
    </div>
  );
}
