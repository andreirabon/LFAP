import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function MonthlyLeaveUtilReportPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Monthly Leave Utilization Report</h1>
    </div>
  );
}
