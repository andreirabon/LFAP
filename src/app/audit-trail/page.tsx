import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AuditTrail() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Audit Trail</h1>
    </div>
  );
}
