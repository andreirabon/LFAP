import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LeaveBalanceManagement() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Leave Balance Management</h1>
    </div>
  );
}
