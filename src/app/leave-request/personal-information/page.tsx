import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import db from "@/db"; // Assuming your Drizzle instance is exported from @/db
import { leaveRequests, users } from "@/db/schema"; // Assuming your schema is here
import { getSession } from "@/lib/session";
import { and, eq } from "drizzle-orm";
import { Briefcase, User } from "lucide-react";
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

// Helper function to format date
function formatDate(dateString: string | Date) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface UserPersonalInfo {
  name: string;
  dateHired: string;
  email: string;
}

interface UserLeaveEntitlement {
  type: string;
  balance: number;
  unit: "days";
  color: string;
}

interface UserLeaveHistory {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: "pending" | "endorsed" | "rejected" | "returned" | "approved" | "tm_approved" | "tm_rejected" | "tm_returned";
  createdAt: string;
}

// Get background color for leave type badge
function getBadgeColor(leaveType: string): string {
  switch (leaveType) {
    case "Vacation Leave":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Sick Leave":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "Mandatory/Forced Leave":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "Special Privilege Leave":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Maternity Leave":
      return "bg-pink-100 text-pink-800 hover:bg-pink-100";
    case "Paternity Leave":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
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
      sex: users.sex, // Add sex to determine gender-specific leaves
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
    dateHired: formatDate(dbUser.createdAt!),
  };

  const leaveEntitlements: UserLeaveEntitlement[] = [
    { type: "Vacation Leave", balance: dbUser.vacationLeave, unit: "days", color: "text-blue-600" },
    { type: "Mandatory/Forced Leave", balance: dbUser.mandatoryLeave, unit: "days", color: "text-purple-600" },
    { type: "Sick Leave", balance: dbUser.sickLeave, unit: "days", color: "text-red-600" },
    { type: "Special Privilege Leave", balance: dbUser.specialPrivilegeLeave, unit: "days", color: "text-green-600" },
  ];

  // Add gender-specific leave types
  if (dbUser.sex === "Female") {
    leaveEntitlements.push({
      type: "Maternity Leave",
      balance: dbUser.maternityLeave,
      unit: "days",
      color: "text-pink-600",
    });
  } else if (dbUser.sex === "Male") {
    leaveEntitlements.push({
      type: "Paternity Leave",
      balance: dbUser.paternityLeave,
      unit: "days",
      color: "text-orange-600",
    });
  }

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
    .where(and(eq(leaveRequests.userId, userId), eq(leaveRequests.status, "tm_approved")))
    .orderBy(leaveRequests.createdAt);

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
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>
                  <b>Name:</b> {personalInfo.name}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Briefcase className="h-4 w-4 mr-2" />
                <span>
                  <b>Date Hired:</b> {personalInfo.dateHired}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Entitlements Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Leave Entitlements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {leaveEntitlements.map((entitlement) => (
              <div
                key={entitlement.type}
                className="flex flex-col items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                <Badge
                  variant="secondary"
                  className={`mb-1 font-normal ${getBadgeColor(entitlement.type)}`}>
                  {entitlement.type}
                </Badge>
                <span className="text-xl font-semibold">{entitlement.balance}</span>
                <span className="text-xs text-gray-500">{entitlement.unit}</span>
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
                  <TableHead>Requested Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveHistory.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.id}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getBadgeColor(leave.type)}>
                        {leave.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {leave.startDate} - {leave.endDate}
                    </TableCell>
                    <TableCell>{leave.numberOfDays}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          leave.status === "tm_approved"
                            ? "bg-green-100 text-green-800"
                            : leave.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : leave.status === "endorsed"
                            ? "bg-blue-100 text-blue-800"
                            : leave.status === "returned"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {leave.status === "tm_approved"
                          ? "Approved"
                          : leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{leave.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4 text-gray-600">No approved leave history found.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default async function PersonalInformationPage() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  const userId = typeof session.userId === "string" ? parseInt(session.userId, 10) : session.userId;

  if (isNaN(userId)) {
    console.error("Invalid userId in session:", session.userId);
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Personal Information </h1>
      <Suspense
        fallback={
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600">Loading personal information...</p>
          </div>
        }>
        <UserDataFetcher userId={userId} />
      </Suspense>
    </div>
  );
}
