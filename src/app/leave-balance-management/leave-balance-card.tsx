"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3, Loader2, Minus, Plus, Save, XCircle } from "lucide-react"; // Added Edit3 for Update button icon
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner"; // Import sonner toast
import { LeaveTypeKey, updateEmployeeLeaveBalance } from "./actions";

interface LeaveBalanceCardClientProps {
  employeeId: number;
  leaveTypeKey: LeaveTypeKey;
  label: string;
  initialValue: number;
  color?: string;
}

export function LeaveBalanceCardClient({
  employeeId,
  leaveTypeKey,
  label,
  initialValue,
  color,
}: LeaveBalanceCardClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  // Sync currentValue if initialValue prop changes (e.g., after a parent re-fetch via router.refresh())
  useEffect(() => {
    if (!isEditing) {
      // Only update if not currently editing to avoid overwriting user input
      setCurrentValue(initialValue);
    }
  }, [initialValue, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    // setCurrentValue(initialValue); // Reset to initial value from prop when starting edit
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentValue(initialValue); // Revert to initial value from prop
  };

  const handleIncrement = () => {
    setCurrentValue((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setCurrentValue((prev) => Math.max(0, prev - 1)); // Ensure not negative
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input (user is typing) or valid positive numbers
    if (value === "" || /^\d+$/.test(value)) {
      // Convert to number if not empty, otherwise keep as is for UX while typing
      const numValue = value === "" ? 0 : parseInt(value, 10);
      setCurrentValue(numValue);
    }
  };

  const handleSave = () => {
    if (currentValue === initialValue) {
      toast.info("No Changes", { description: "The leave balance value is the same as before." });
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const result = await updateEmployeeLeaveBalance({
        employeeId,
        leaveType: leaveTypeKey,
        newValue: currentValue,
      });

      if (result.success) {
        toast.success("Success!", { description: result.message || "Leave balance updated successfully." });
        setIsEditing(false);
        // router.refresh() will be called by the parent page re-render if it needs to update other parts
        // or if global state needs an update. For now, optimistic update is handled by setting isEditing to false
        // and useEffect syncing initialValue.
        // To ensure data consistency across the app or if other components depend on this value,
        // call router.refresh() here or pass a callback from parent to trigger refresh.
        router.refresh(); // Refresh data from server
      } else {
        toast.error("Error", { description: result.message || "Failed to update leave balance." });
        // Optionally revert to initialValue on failure, or keep the current value for user to retry/correct
        // setCurrentValue(initialValue);
      }
    });
  };

  return (
    <div className="bg-card border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
      <div>
        <div className={`text-sm mb-1 ${color ? color : "text-muted-foreground"}`}>{label}</div>
        {!isEditing ? (
          <div className={`text-2xl font-semibold ${color || "text-card-foreground"}`}>
            {initialValue} day{initialValue === 1 ? "" : "s"}
          </div>
        ) : (
          <div className="flex items-center space-x-2 my-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={isPending || currentValue <= 0}>
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={currentValue.toString()}
              onChange={handleInputChange}
              className={`w-16 text-center font-semibold text-lg ${color || "text-card-foreground"}`}
              disabled={isPending}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4">
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="w-full">
            <Edit3 className="mr-2 h-4 w-4" />
            Update
          </Button>
        ) : (
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              onClick={handleSave}
              disabled={isPending || currentValue === initialValue}
              className="flex-1">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isPending}
              className="flex-1">
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
