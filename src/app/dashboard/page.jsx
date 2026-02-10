import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import StudentDashboard from "@/components/StudentDashboard";
import InstructorDashboard from "@/components/InstructorDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DataAnalystDashboard from "@/components/DataAnalystDashboard";

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/");

  const role = user.role;
  let stats = {};

  if (role === "ADMIN") {
    const { rows: uStats } = await query(
      `SELECT COUNT(*) FILTER (WHERE role = 'STUDENT') as "students", COUNT(*) FILTER (WHERE role = 'INSTRUCTOR') as "instructors" FROM users`,
    );
    const { rows: cStats } = await query(
      `SELECT COUNT(*) as "courses" FROM courses`,
    );
    const { rows: nStats } = await query(
      `SELECT COUNT(*) as "unis" FROM partner_university`,
    );
    const { rows: eStats } = await query(
      `SELECT COUNT(*) as "enrolls" FROM enrollments`,
    );
    stats = {
      studentCount: parseInt(uStats[0].students),
      instructorCount: parseInt(uStats[0].instructors),
      courseCount: parseInt(cStats[0].courses),
      universityCount: parseInt(nStats[0].unis),
      enrollmentCount: parseInt(eStats[0].enrolls),
    };
  } else if (role === "INSTRUCTOR") {
    const { rows: myCourses } = await query(
      `
      SELECT c.*, (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as students 
      FROM courses c JOIN teaches t ON t.course_id = c.id WHERE t.instructor_id = $1`,
      [user.id],
    );
    const { rows } = await query(
      `SELECT rating FROM instructors WHERE user_id = $1`,
      [user.id],
    );
    stats = {
      courses: myCourses,
      totalStudents: myCourses.reduce(
        (acc, curr) => acc + parseInt(curr.students),
        0,
      ),
      rating: rows[0]?.rating ?? null,
    };
  } else if (role === "STUDENT") {
    const { rows: myEnrolls } = await query(
      `
      SELECT c.*, u.name as university FROM courses c 
      JOIN enrollments e ON e.course_id = c.id 
      JOIN partner_university u ON u.id = c.university_id WHERE e.student_id = $1`,
      [user.id],
    );
    stats = { enrollments: myEnrolls };
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Faculty Portal
            </h1>
            <p className="text-slate-500 font-medium italic">
              Welcome back, Professor {user.name.split(" ")[0]}
            </p>
          </div>
        </div>

        {role === "STUDENT" && <StudentDashboard stats={stats} user={user} />}
        {role === "INSTRUCTOR" && <InstructorDashboard stats={stats} />}
        {role === "ADMIN" && <AdminDashboard stats={stats} />}
        {role === "DATA_ANALYST" && <DataAnalystDashboard />}
      </main>
    </div>
  );
}
