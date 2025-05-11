import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getUserLeaveBalances } from "@/lib/leave-balances";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ViewLeaveBalances() {
  // Check if user is logged in
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  // Fetch leave balances for the logged-in user
  const leaveBalances = await getUserLeaveBalances(session.userId);

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
                        value={leave.total > 0 ? (leave.remaining / leave.total) * 100 : 0}
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
