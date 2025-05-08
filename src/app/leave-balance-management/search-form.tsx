"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchFormProps {
  initialParams: {
    employeeId?: string;
    firstName?: string;
    lastName?: string;
  };
}

export function SearchForm({ initialParams }: SearchFormProps) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState(initialParams.employeeId || "");
  const [firstName, setFirstName] = useState(initialParams.firstName || "");
  const [lastName, setLastName] = useState(initialParams.lastName || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build query string from form values
    const params = new URLSearchParams();

    if (employeeId.trim()) {
      params.append("employeeId", employeeId.trim());
    }

    if (firstName.trim()) {
      params.append("firstName", firstName.trim());
    }

    if (lastName.trim()) {
      params.append("lastName", lastName.trim());
    }

    // Navigate to the same page with search params
    const queryString = params.toString();
    router.push(`/leave-balance-management${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="employeeId"
            className="block text-sm font-medium mb-1">
            Employee ID
          </label>
          <Input
            id="employeeId"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter employee ID"
          />
        </div>

        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium mb-1">
            First Name
          </label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium mb-1">
            Last Name
          </label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full md:w-auto">
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </form>
  );
}
