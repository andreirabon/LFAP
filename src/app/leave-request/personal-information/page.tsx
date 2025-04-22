import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PersonalInfo {
  name: string;
  employeeId: string;
  department: string;
  position: string;
  dateHired: string;
  email: string;
  supervisor: string;
}

interface LeaveHistory {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: "Approved" | "Completed";
  approvedBy: string;
  approvedDate: string;
}

interface LeaveEntitlement {
  type: string;
  color: string;
}

const samplePersonalInfo: PersonalInfo = {
  name: "John Doe",
  employeeId: "EMP-2024-001",
  department: "Information Technology",
  position: "Senior Software Engineer",
  dateHired: "2020-01-15",
  email: "john.doe@company.com",
  supervisor: "Jane Smith",
};

const sampleLeaveHistory: LeaveHistory[] = [
  {
    id: "LR-2024-001",
    type: "Vacation Leave",
    startDate: "2024-01-15",
    endDate: "2024-01-20",
    numberOfDays: 5,
    status: "Completed",
    approvedBy: "Jane Smith",
    approvedDate: "2024-01-05",
  },
  {
    id: "LR-2023-015",
    type: "Sick Leave",
    startDate: "2023-11-28",
    endDate: "2023-11-29",
    numberOfDays: 2,
    status: "Completed",
    approvedBy: "Jane Smith",
    approvedDate: "2023-11-27",
  },
  {
    id: "LR-2023-010",
    type: "Special Privilege Leave",
    startDate: "2023-08-14",
    endDate: "2023-08-14",
    numberOfDays: 1,
    status: "Completed",
    approvedBy: "Jane Smith",
    approvedDate: "2023-08-10",
  },
];

const sampleLeaveEntitlements: LeaveEntitlement[] = [
  {
    type: "Vacation Leave",

    color: "text-blue-600",
  },
  {
    type: "Mandatory/Forced Leave",

    color: "text-purple-600",
  },
  {
    type: "Sick Leave",

    color: "text-red-600",
  },
  {
    type: "Maternity Leave",

    color: "text-pink-600",
  },
  {
    type: "Special Privilege Leave",

    color: "text-green-600",
  },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PersonalInformation() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Personal Information Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{samplePersonalInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{samplePersonalInfo.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{samplePersonalInfo.department}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Position</p>
              <p className="font-medium">{samplePersonalInfo.position}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date Hired</p>
              <p className="font-medium">{formatDate(samplePersonalInfo.dateHired)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{samplePersonalInfo.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Supervisor</p>
              <p className="font-medium">{samplePersonalInfo.supervisor}</p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sampleLeaveEntitlements.map((entitlement) => (
              <div
                key={entitlement.type}
                className="flex justify-between items-center p-3 rounded-lg border">
                <span className={`font-medium ${entitlement.color}`}>{entitlement.type}</span>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Approved Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleLeaveHistory.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.id}</TableCell>
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </TableCell>
                  <TableCell>{leave.numberOfDays}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800`}>
                      {leave.status}
                    </span>
                  </TableCell>
                  <TableCell>{leave.approvedBy}</TableCell>
                  <TableCell>{formatDate(leave.approvedDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
