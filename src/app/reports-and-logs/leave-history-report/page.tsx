import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LeaveHistoryReportPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Leave History Report</h1>
    </div>
  );
}
