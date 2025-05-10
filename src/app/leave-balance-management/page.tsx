import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee, LeaveTypeKey, searchEmployees } from "./actions";
import { LeaveBalanceCardClient } from "./leave-balance-card";
import { SearchForm } from "./search-form";

// Define leave type configurations
const leaveTypeDefinitions: Array<{ key: LeaveTypeKey; label: string; color: string }> = [
  { key: "vacationLeave", label: "Vacation Leave", color: "text-blue-600" },
  { key: "mandatoryLeave", label: "Mandatory Leave", color: "text-purple-600" },
  { key: "sickLeave", label: "Sick Leave", color: "text-red-600" },
  { key: "maternityLeave", label: "Maternity Leave", color: "text-pink-600" },
  { key: "paternityLeave", label: "Paternity Leave", color: "text-teal-600" },
  { key: "specialPrivilegeLeave", label: "Special Privilege Leave", color: "text-green-600" },
];

type SearchParamsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams: any;
};

export default async function EmployeeLeaveManagement({ searchParams }: SearchParamsProps) {
  let employees: Employee[] = [];
  let error: string | null = null;
  let hasSearched = false;

  // Type-safe way to get search params
  const employeeId = typeof searchParams.employeeId === "string" ? searchParams.employeeId : "";
  const firstName = typeof searchParams.firstName === "string" ? searchParams.firstName : "";
  const lastName = typeof searchParams.lastName === "string" ? searchParams.lastName : "";

  // Create params object
  const params = {
    employeeId,
    firstName,
    lastName,
  };

  // Use individual checks with the resolved params
  const hasEmployeeId = params.employeeId.trim() !== "";
  const hasFirstName = params.firstName.trim() !== "";
  const hasLastName = params.lastName.trim() !== "";

  // Check if any search parameters are provided
  if (hasEmployeeId || hasFirstName || hasLastName) {
    hasSearched = true;
    try {
      employees = await searchEmployees({
        employeeId: params.employeeId,
        firstName: params.firstName,
        lastName: params.lastName,
      });
    } catch (err) {
      error = "An error occurred while searching for employees. Please try again.";
      console.error("Error searching employees:", err);
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Employee Leave Management</h1>

      {/* Search Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Employee</CardTitle>
          <CardDescription>Search for an employee to view their leave balances</CardDescription>
        </CardHeader>
        <CardContent>
          <SearchForm initialParams={params} />
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-8 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {hasSearched && !error && (
        <>
          {employees.length > 0 ? (
            <div className="space-y-6">
              {employees.map((employee) => (
                <Card
                  key={employee.id}
                  className="mb-8">
                  <CardHeader>
                    <CardTitle>
                      {employee.firstName} {employee.lastName}
                    </CardTitle>
                    <CardDescription>
                      Employee ID: {employee.id} | Deparment: {employee.department}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-4">Leave Balances</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {leaveTypeDefinitions
                        .filter((leaveDef) => {
                          // Filter out maternity leave for males and paternity leave for females
                          if (leaveDef.key === "maternityLeave" && employee.sex.toLowerCase() === "male") {
                            return false;
                          }
                          if (leaveDef.key === "paternityLeave" && employee.sex.toLowerCase() === "female") {
                            return false;
                          }
                          return true;
                        })
                        .map((leaveDef) => {
                          const leaveValue = employee[leaveDef.key];
                          if (typeof leaveValue !== "number") {
                            console.warn(
                              `Employee ID ${employee.id} missing or invalid value for leave type ${leaveDef.key}`,
                            );
                            return null;
                          }
                          return (
                            <LeaveBalanceCardClient
                              key={leaveDef.key}
                              employeeId={employee.id}
                              leaveTypeKey={leaveDef.key}
                              label={leaveDef.label}
                              initialValue={leaveValue}
                              color={leaveDef.color}
                            />
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              <p>No employees found with the given search criteria</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
