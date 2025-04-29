import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  description: string;
  color: string;
}

const leaveBalances: LeaveBalance[] = [
  {
    type: "Vacation Leave",
    total: 15,
    used: 5,
    remaining: 10,
    description: "Annual vacation leave for rest and recreation",
    color: "text-blue-600",
  },
  {
    type: "Mandatory/Force Leave",
    total: 5,
    used: 2,
    remaining: 3,
    description: "Required leave days that must be taken within the year",
    color: "text-purple-600",
  },
  {
    type: "Sick Leave",
    total: 15,
    used: 3,
    remaining: 12,
    description: "Leave for medical reasons and recovery",
    color: "text-red-600",
  },
  {
    type: "Maternity Leave",
    total: 105,
    used: 0,
    remaining: 105,
    description: "Leave for childbirth and maternal care",
    color: "text-pink-600",
  },
  {
    type: "Special Privilege Leave",
    total: 3,
    used: 1,
    remaining: 2,
    description: "Leave for special occasions or personal matters",
    color: "text-green-600",
  },
];

export default async function ViewLeaveBalances() {
  // Check if user is logged in
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leave Balances</h1>
        <p className="text-muted-foreground mt-2">All your leave balances by type for the current year.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {leaveBalances.map((leave) => (
          <TooltipProvider key={leave.type}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:bg-accent/5 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-lg ${leave.color}`}>{leave.type}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Progress
                        value={(leave.remaining / leave.total) * 100}
                        className={`h-2 [&>div]:bg-current ${leave.color}`}
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Used: {leave.used} days</span>
                        <span className="font-medium">Remaining: {leave.remaining} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{leave.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
