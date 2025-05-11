import { ApprovedRequestRow } from "@/app/components/ApprovedRequestRow";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import db from "@/db";
import { leaveRequests, users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ApprovedApprovals() {
  // Check if user is authenticated
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/login");
  }

  // Fetch TM approved leave requests with user information
  const approvedRequests = await db
    .select({
      id: leaveRequests.id,
      type: leaveRequests.type,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      reason: leaveRequests.reason,
      status: leaveRequests.status,
      supportingDoc: leaveRequests.supportingDoc,
      managerComments: leaveRequests.managerComments,
      createdAt: leaveRequests.createdAt,
      managerId: leaveRequests.managerId,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        department: users.department,
        email: users.email,
        vacationLeave: users.vacationLeave,
        mandatoryLeave: users.mandatoryLeave,
        sickLeave: users.sickLeave,
        maternityLeave: users.maternityLeave,
        paternityLeave: users.paternityLeave,
        specialPrivilegeLeave: users.specialPrivilegeLeave,
      },
    })
    .from(leaveRequests)
    .innerJoin(users, eq(leaveRequests.userId, users.id))
    .where(eq(leaveRequests.status, "tm_approved"));

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Top Management Approved Leave Requests</h1>

      {/* Main Table */}
      <Card className="overflow-hidden border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvedRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground">
                  No approved leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              approvedRequests.map((request) => (
                <ApprovedRequestRow
                  key={request.id}
                  request={request}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
