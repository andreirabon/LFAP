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

function ViewLeaveBalancesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(!!searchQuery);

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

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          throw new Error("Failed to fetch session");
        }
        const data = await response.json();
        if (!data.isLoggedIn) {
          router.replace("/login");
        } else if (data.role !== "Manager" && data.role !== "Super Admin") {
          // Redirect if not a manager or admin
          router.replace("/");
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
    if (!hasSearched || !debouncedSearchTerm.trim()) return;

    const fetchSubordinates = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url = `/api/subordinates?search=${encodeURIComponent(debouncedSearchTerm)}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch subordinates");
        }

        const data = await response.json();

        // Process subordinates data
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
      } catch (error) {
        console.error("Error fetching subordinates:", error);
        setError("Failed to load subordinates. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubordinates();
  }, [debouncedSearchTerm, hasSearched]);

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

      {/* Search Section */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search by name or ID"
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
