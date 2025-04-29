"use client";

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for login functionality
    console.log("Login attempt with:", { email, password });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white via-white to-white">
      <div className="absolute inset-0 bg-grid-gray-100/[0.05] bg-[size:60px_60px]" />
      <div className="w-full max-w-md p-8 rounded-lg shadow-sm bg-background border">
        <h1 className="text-2xl font-semibold text-center mb-2">Department of Science and Technology</h1>
        <h2 className="text-xl font-bold text-[#49C4D3] text-center mb-8">Leave Filing and Approval System</h2>

        <form
          onSubmit={handleLogin}
          className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-9 px-4 py-2 rounded-md bg-[#49C4D3] text-white hover:bg-[#49C4D3]/90 text-sm font-medium shadow-xs transition-colors">
            Login
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Having trouble logging in? Contact the IT Department.
        </p>
      </div>
    </div>
  );
}
