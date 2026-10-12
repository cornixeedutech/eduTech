
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CoursesDashboard from "@/components/admin/CoursesDashboard";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);

  // Check authentication
  if (!session?.user) {
    redirect("/");
  }

  // Check admin authorization
  if (session.user.is_admin !== true) {
    redirect("/");
  }

  return <CoursesDashboard />;
}
