"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// TypeScript interfaces
interface LeaveBalance {
  type: string;
  balance: number;
  unit: "days" | "hours";
}

interface Subordinate {
  id: string;
  fullName: string;
  employeeId: string;
  department: string;
  leaveBalances: LeaveBalance[];
}

// Sample data
const sampleSubordinates: Subordinate[] = [
  {
    id: "1",
    fullName: "Andrei",
    employeeId: "EMP001",
    department: "Engineering",
    leaveBalances: [
      { type: "Vacation", balance: 15, unit: "days" },
      { type: "Sick", balance: 10, unit: "days" },
      { type: "Personal", balance: 3, unit: "days" },
    ],
  },
  {
    id: "2",
    fullName: "Therese",
    employeeId: "EMP002",
    department: "Marketing",
    leaveBalances: [
      { type: "Vacation", balance: 12, unit: "days" },
      { type: "Sick", balance: 8, unit: "days" },
      { type: "Personal", balance: 2, unit: "days" },
    ],
  },
  {
    id: "3",
    fullName: "Sweet",
    employeeId: "EMP003",
    department: "Engineering",
    leaveBalances: [
      { type: "Vacation", balance: 20, unit: "days" },
      { type: "Sick", balance: 10, unit: "days" },
      { type: "Personal", balance: 3, unit: "days" },
    ],
  },
];

export default function ViewLeaveBalances() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Subordinate[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

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
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleSearch = () => {
    const results = sampleSubordinates.filter((subordinate) =>
      subordinate.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setSearchResults(results);
    setHasSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">View Subordinate Leave Balances</h1>

      {/* Search Section */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search Subordinate Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Search
        </button>
      </div>

      {/* Results Section */}
      {hasSearched ? (
        searchResults.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="space-y-6">
              {searchResults.map((subordinate) => (
                <div
                  key={subordinate.id}
                  className="bg-white p-6 rounded-lg shadow-md border">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{subordinate.fullName}</h3>
                      <p className="text-gray-600">ID: {subordinate.employeeId}</p>
                      <p className="text-gray-600">Department: {subordinate.department}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Leave Balances</h4>
                    <dl className="grid grid-cols-2 gap-2">
                      {subordinate.leaveBalances.map((leave) => (
                        <div
                          key={leave.type}
                          className="flex justify-between py-1">
                          <dt className="text-gray-600">{leave.type}:</dt>
                          <dd className="font-medium">
                            {leave.balance} {leave.unit}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">No subordinates found matching &apos;{searchTerm}&apos;</div>
        )
      ) : (
        <div className="text-center py-8 text-gray-600">
          Enter a name above and click Search to view leave balances.
        </div>
      )}
    </div>
  );
}
