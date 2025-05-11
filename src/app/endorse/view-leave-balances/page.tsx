"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// TypeScript interfaces
interface LeaveBalance {
  type: string;
  remaining: number;
  unit: "days";
  color: string;
}

interface Subordinate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string | null;
  sex: string;
  vacationLeave?: number;
  mandatoryLeave?: number;
  sickLeave?: number;
  maternityLeave?: number;
  paternityLeave?: number;
  specialPrivilegeLeave?: number;
  usedVacationLeave?: number;
  usedMandatoryLeave?: number;
  usedSickLeave?: number;
  usedMaternityLeave?: number;
  usedPaternityLeave?: number;
  usedSpecialPrivilegeLeave?: number;
  leaveBalances: LeaveBalance[];
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string | null;
  isLoggedIn: boolean;
}

function ViewLeaveBalancesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(!!searchQuery);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update URL with search term
  useEffect(() => {
    if (debouncedSearchTerm) {
      router.push(`/endorse/view-leave-balances?search=${encodeURIComponent(debouncedSearchTerm)}`);
      if (!hasSearched) {
        setHasSearched(true);
      }
    } else if (hasSearched && searchTerm === "") {
      // Only clear the URL if search was previously performed and field was cleared
      router.push("/endorse/view-leave-balances");
      // Keep hasSearched true but clear results
      setSubordinates([]);
    }
  }, [debouncedSearchTerm, router, hasSearched, searchTerm]);

  // Check authentication and get user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          throw new Error("Failed to fetch session");
        }
        const data = await response.json();

        console.log("Session data:", data); // Debug session data

        if (!data.isLoggedIn) {
          router.replace("/login");
        } else if (data.role !== "Manager" && data.role !== "Super Admin") {
          // Redirect if not a manager or admin
          router.replace("/");
        } else {
          // Store the current user data including department
          setCurrentUser(data);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Fetch subordinates only when user has searched
  useEffect(() => {
    // Don't fetch if:
    // 1. User hasn't searched yet
    // 2. Search term is empty
    // 3. Current user data is not available
    if (!hasSearched || !debouncedSearchTerm.trim() || !currentUser) return;

    const fetchSubordinates = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First try the specialized endpoint for same-department filtering
        const sameDeptUrl = `/api/subordinates/same-department?search=${encodeURIComponent(debouncedSearchTerm)}`;

        console.log("Current user:", {
          role: currentUser.role,
          department: currentUser.department,
        });
        console.log("Trying API endpoint:", sameDeptUrl);

        let response;
        let data;
        let usedFallback = false;

        try {
          // Try the new specialized endpoint first
          response = await fetch(sameDeptUrl);

          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }

          data = await response.json();
          console.log("API response successful");
        } catch (endpointError: Error) {
          // If the specialized endpoint fails, fall back to the original
          console.warn("Specialized endpoint failed:", endpointError.message);
          console.log("Falling back to original endpoint");

          usedFallback = true;

          // Build the original endpoint URL with department filter
          let fallbackUrl = `/api/subordinates?search=${encodeURIComponent(debouncedSearchTerm)}`;
          if (currentUser.role !== "Super Admin" && currentUser.department) {
            fallbackUrl += `&department=${encodeURIComponent(currentUser.department)}`;
          }

          response = await fetch(fallbackUrl);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Fallback API error response:", errorText);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }

          data = await response.json();
          console.log("Fallback API response successful");
        }

        console.log("Raw API response:", data);

        // Get original data count before filtering
        const originalCount = data.length;

        // STRICT CLIENT-SIDE FILTERING: Only show subordinates from the same department
        if (currentUser.role !== "Super Admin" && currentUser.department) {
          // Only keep subordinates from the same department
          data = data.filter((sub: Subordinate) => {
            const isDepartmentMatch = sub.department === currentUser.department;

            if (!isDepartmentMatch) {
              console.warn(`Filtering out subordinate from different department:
                ID: ${sub.id},
                Name: ${sub.firstName} ${sub.lastName},
                Department: ${sub.department || "None"}
                (Current user department: ${currentUser.department})`);
            }

            return isDepartmentMatch;
          });

          // Log filtering results
          const filteredCount = originalCount - data.length;
          if (filteredCount > 0) {
            console.warn(`Client-side filtering removed ${filteredCount} subordinates from different departments`);
          }

          // If no matching subordinates remain after filtering but results were found initially
          if (data.length === 0 && originalCount > 0) {
            console.log("All subordinates were filtered out - none match current user's department");
            // Set an error message to inform the user they can only view their department
            setError(
              `You can only view subordinates from your department (${currentUser.department}). The search matched people from other departments.`,
            );
            setSubordinates([]);
            setIsLoading(false);
            return; // Exit early since we have no valid data to process
          }
        }

        // Process leave balances for each subordinate
        const processedSubordinates = data.map((sub: Subordinate) => {
          // Filter leave balances based on gender
          const filteredBalances = processLeaveBalances(sub);

          return {
            id: sub.id,
            firstName: sub.firstName,
            lastName: sub.lastName,
            email: sub.email,
            department: sub.department,
            sex: sub.sex,
            vacationLeave: sub.vacationLeave,
            mandatoryLeave: sub.mandatoryLeave,
            sickLeave: sub.sickLeave,
            maternityLeave: sub.maternityLeave,
            paternityLeave: sub.paternityLeave,
            specialPrivilegeLeave: sub.specialPrivilegeLeave,
            usedVacationLeave: sub.usedVacationLeave,
            usedMandatoryLeave: sub.usedMandatoryLeave,
            usedSickLeave: sub.usedSickLeave,
            usedMaternityLeave: sub.usedMaternityLeave,
            usedPaternityLeave: sub.usedPaternityLeave,
            usedSpecialPrivilegeLeave: sub.usedSpecialPrivilegeLeave,
            leaveBalances: filteredBalances,
          };
        });

        setSubordinates(processedSubordinates);
        console.log("Current user department:", currentUser.department);
        console.log("Processed subordinates count:", processedSubordinates.length);

        if (usedFallback) {
          console.log("Note: Used fallback endpoint with client-side filtering");
        }
      } catch (error: Error) {
        console.error("Error fetching subordinates:", error);
        setError(`Failed to load subordinates: ${error.message || "Unknown error"}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubordinates();
  }, [debouncedSearchTerm, hasSearched, currentUser]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setHasSearched(true);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSubordinates([]);
    router.push("/endorse/view-leave-balances");
    // Keep hasSearched state to stay in search mode
  };

  // Process leave balances based on gender
  const processLeaveBalances = (subordinate: Subordinate): LeaveBalance[] => {
    const balances: LeaveBalance[] = [];

    // Vacation Leave
    if (subordinate.vacationLeave !== undefined) {
      balances.push({
        type: "Vacation Leave",
        remaining: subordinate.vacationLeave,
        unit: "days",
        color: "text-blue-600",
      });
    }

    // Sick Leave
    if (subordinate.sickLeave !== undefined) {
      balances.push({
        type: "Sick Leave",
        remaining: subordinate.sickLeave,
        unit: "days",
        color: "text-red-600",
      });
    }

    // Mandatory/Force Leave
    if (subordinate.mandatoryLeave !== undefined) {
      balances.push({
        type: "Mandatory/Force Leave",
        remaining: subordinate.mandatoryLeave,
        unit: "days",
        color: "text-purple-600",
      });
    }

    // Special Privilege Leave
    if (subordinate.specialPrivilegeLeave !== undefined) {
      balances.push({
        type: "Special Privilege Leave",
        remaining: subordinate.specialPrivilegeLeave,
        unit: "days",
        color: "text-green-600",
      });
    }

    // Conditional leave types based on gender
    if (subordinate.sex === "Female" && subordinate.maternityLeave !== undefined) {
      balances.push({
        type: "Maternity Leave",
        remaining: subordinate.maternityLeave,
        unit: "days",
        color: "text-pink-600",
      });
    }

    if (subordinate.sex === "Male" && subordinate.paternityLeave !== undefined) {
      balances.push({
        type: "Paternity Leave",
        remaining: subordinate.paternityLeave,
        unit: "days",
        color: "text-orange-600",
      });
    }

    return balances;
  };

  // Get background color for leave type badge
  const getBadgeColor = (leaveType: string): string => {
    switch (leaveType) {
      case "Vacation Leave":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Sick Leave":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Mandatory/Force Leave":
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
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">View Subordinate Leave Balances</h1>
      {currentUser?.department && (
        <div className="mb-4">
          <p className="text-md text-gray-600">
            Department: <span className="font-medium">{currentUser.department}</span>
          </p>
          {currentUser.role !== "Super Admin" && (
            <p className="text-sm text-amber-600 mt-1">
              <strong>Important:</strong> You can only view subordinates from your department.
            </p>
          )}
        </div>
      )}

      {/* Search Section */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={
              currentUser?.role === "Super Admin"
                ? "Search by name or ID"
                : `Search for ${currentUser?.department} subordinates only`
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchTerm.trim()) {
                handleSearch();
              }
            }}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={handleClearSearch}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          onClick={handleSearch}
          disabled={!searchTerm.trim()}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Results Section */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading subordinates...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : !hasSearched || !searchTerm.trim() ? (
        <div className="text-center py-12">
          <div className="mb-4 text-gray-500">
            <Search className="h-12 w-12 mx-auto opacity-30" />
          </div>
          <h3 className="text-xl font-medium mb-2">Enter a search term to find subordinates</h3>
          <p className="text-gray-600">Search by name or ID to view leave balances of your team members</p>
        </div>
      ) : subordinates.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Subordinates ({subordinates.length})</h2>
          <div className="space-y-6">
            {subordinates.map((subordinate) => (
              <Card
                key={subordinate.id}
                className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-center">
                    {subordinate.firstName} {subordinate.lastName}
                  </CardTitle>
                  {subordinate.department && (
                    <p className="text-center text-sm text-gray-500">Department: {subordinate.department}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="flex flex-col space-y-2"></div>
                    <hr className="my-2 border-gray-200" />
                    <div>
                      <h4 className="font-medium mb-3 text-sm">Leave Balances</h4>
                      <div className="flex flex-wrap gap-2">
                        {subordinate.leaveBalances.map((leave) => (
                          <div
                            key={leave.type}
                            className="flex flex-col items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                            <Badge
                              variant="secondary"
                              className={`mb-1 font-normal ${getBadgeColor(leave.type)}`}>
                              {leave.type}
                            </Badge>
                            <span className="text-xl font-semibold">{leave.remaining}</span>
                            <span className="text-xs text-gray-500">{leave.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">No subordinates found matching &apos;{searchTerm}&apos;</div>
      )}
    </div>
  );
}

export default function ViewLeaveBalances() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-6">Loading...</div>}>
      <ViewLeaveBalancesContent />
    </Suspense>
  );
}
