"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { registerUser } from "./actions";

export default function Register() {
  const [state, formAction] = useActionState(registerUser, null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [sex, setSex] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state) {
      setIsLoading(false);
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    const errors: Record<string, string> = {};

    if (!role) {
      errors.role = "Role is required";
    }

    if (!department) {
      errors.department = "Department is required";
    }

    if (!sex) {
      errors.sex = "Sex is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsLoading(true);
    formAction(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl rounded-lg border">
        <CardHeader className="text-center">
          <Image
            src="/dost_login.png"
            alt="DOST Logo"
            width={200}
            height={20}
            className="mx-auto h-auto w-auto"
          />
          <CardDescription className="text-[#01AFF6] text-xl">
            Create Account for Leave Filing and Approval System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={handleSubmit}
            className="space-y-4">
            {state?.message && (
              <p className={cn("text-sm font-medium", state.success ? "text-green-600" : "text-red-600")}>
                {state.message}
              </p>
            )}
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Role
              </Label>
              <Select
                name="role"
                value={role}
                onValueChange={setRole}
                required>
                <SelectTrigger
                  className={cn(
                    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    formErrors.role && "border-red-500",
                  )}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="HR Admin">HR Admin</SelectItem>
                  <SelectItem value="Top Management">Top Management</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && <p className="text-sm text-red-500 mt-1">{formErrors.role}</p>}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="department"
                className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Department
              </Label>
              <Select
                name="department"
                value={department}
                onValueChange={setDepartment}
                required>
                <SelectTrigger
                  className={cn(
                    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    formErrors.department && "border-red-500",
                  )}>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Research and Development">Research and Development</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.department && <p className="text-sm text-red-500 mt-1">{formErrors.department}</p>}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="sex"
                className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Sex
              </Label>
              <Select
                name="sex"
                value={sex}
                onValueChange={setSex}
                required>
                <SelectTrigger
                  className={cn(
                    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    formErrors.sex && "border-red-500",
                  )}>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.sex && <p className="text-sm text-red-500 mt-1">{formErrors.sex}</p>}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#01AFF6] hover:bg-[#01AFF6]"
              disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Having trouble registering? Contact the IT Department
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
