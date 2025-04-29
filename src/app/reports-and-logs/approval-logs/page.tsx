import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ApprovalLogsPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Approval Logs</h1>
    </div>
  );
}
