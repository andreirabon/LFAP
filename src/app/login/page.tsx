"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { loginUser } from "./actions";
export default function Login() {
  const [state, formAction] = useActionState(loginUser, null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state) {
      setIsLoading(false);
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
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
          <CardDescription className="text-[#01AFF6] text-xl">Leave Filing and Approval System</CardDescription>
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
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Having trouble logging in? Contact the IT Department
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
