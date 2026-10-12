
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Not logged in
  if (!session?.user) {
    redirect("/");
  }

  // Logged in but not an admin
  if (session.user.is_admin !== true) {
    redirect("/");
  }

  return <>{children}</>;
}
