import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/serverAuth";
import StudentDashboard from "@/components/StudentDashboard";
import InstructorDashboard from "@/components/InstructorDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DataAnalystDashboard from "@/components/DataAnalystDashboard";

export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/");
  }

  const role = user.role;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-10">
        {role === "STUDENT" && <StudentDashboard />}
        {role === "INSTRUCTOR" && <InstructorDashboard />}
        {role === "ADMIN" && <AdminDashboard />}
        {role === "DATA_ANALYST" && <DataAnalystDashboard />}
      </main>
    </div>
  );
}
