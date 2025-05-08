import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee, searchEmployees } from "./actions";
import { SearchForm } from "./search-form";

export default async function EmployeeLeaveManagement({
  searchParams,
}: {
  searchParams: { employeeId?: string; firstName?: string; lastName?: string };
}) {
  await Promise.resolve(); // Ensure async context is established

  let employees: Employee[] = [];
  let error: string | null = null;
  let hasSearched = false;

  // Convert searchParams to a regular object after the initial await
  const params = {
    employeeId: searchParams.employeeId || "",
    firstName: searchParams.firstName || "",
    lastName: searchParams.lastName || "",
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
                      Employee ID: {employee.id} | Role: {employee.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-4">Leave Balances</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <LeaveBalanceCard
                        label="Vacation Leave"
                        value={employee.vacationLeave}
                      />
                      <LeaveBalanceCard
                        label="Mandatory Leave"
                        value={employee.mandatoryLeave}
                      />
                      <LeaveBalanceCard
                        label="Sick Leave"
                        value={employee.sickLeave}
                      />
                      <LeaveBalanceCard
                        label="Maternity Leave"
                        value={employee.maternityLeave}
                      />
                      <LeaveBalanceCard
                        label="Paternity Leave"
                        value={employee.paternityLeave}
                      />
                      <LeaveBalanceCard
                        label="Special Privilege Leave"
                        value={employee.specialPrivilegeLeave}
                      />
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

function LeaveBalanceCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-semibold">{value} days</div>
    </div>
  );
}
