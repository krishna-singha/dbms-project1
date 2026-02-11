import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import StudentDashboard from "@/components/StudentDashboard";
import InstructorDashboard from "@/components/InstructorDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DataAnalystDashboard from "@/components/DataAnalystDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/");

  const role = user.role;
  let stats = {};

  // remove last word from name if it has more than one word, otherwise use the full name
  const cleanFirstName =
    user.name.split(" ").length > 1
      ? user.name.split(" ").slice(0, -1).join(" ")
      : user.name;

  if (role === "ADMIN") {
    const { rows } = await query(`
      WITH counts AS (
        SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') as students,
          (SELECT COUNT(*) FROM users WHERE role = 'INSTRUCTOR') as instructors,
          (SELECT COUNT(*) FROM courses) as courses,
          (SELECT COUNT(*) FROM partner_university) as unis,
          (SELECT COUNT(*) FROM enrollments) as enrolls
      )
      SELECT * FROM counts
    `);

    const data = rows[0];
    stats = {
      studentCount: parseInt(data.students),
      instructorCount: parseInt(data.instructors),
      courseCount: parseInt(data.courses),
      universityCount: parseInt(data.unis),
      enrollmentCount: parseInt(data.enrolls),
    };
  } else if (role === "INSTRUCTOR") {
    const { rows: myCourses } = await query(
      `SELECT c.*, (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as students 
       FROM courses c JOIN teaches t ON t.course_id = c.id WHERE t.instructor_id = $1`,
      [user.id],
    );
    const { rows: instrInfo } = await query(
      `SELECT rating FROM instructors WHERE user_id = $1`,
      [user.id],
    );
    stats = {
      courses: myCourses,
      totalStudents: myCourses.reduce(
        (acc, curr) => acc + parseInt(curr.students),
        0,
      ),
      rating: instrInfo[0]?.rating ?? null,
    };
  } else if (role === "STUDENT") {
    const { rows: myEnrolls } = await query(
      `SELECT c.*, u.name as university FROM courses c 
       JOIN enrollments e ON e.course_id = c.id 
       JOIN partner_university u ON u.id = c.university_id WHERE e.student_id = $1`,
      [user.id],
    );
    stats = { enrollments: myEnrolls };
  }

  const portalConfig = {
    STUDENT: { 
      title: "Student Portal", 
      greeting: "Welcome back [Student]," 
    },
    INSTRUCTOR: {
      title: "Faculty Portal",
      greeting: "Welcome back [Instructor],",
    },
    ADMIN: { 
      title: "Admin Portal", 
      greeting: "Welcome back [Admin]," 
    },
    DATA_ANALYST: {
      title: "Data Analyst Portal",
      greeting: "Welcome back [Data Analyst],",
    },
  };

  const config = portalConfig[role] || {
    title: "Portal",
    greeting: "Welcome back,",
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              {config.title}
            </h1>
            <p className="text-slate-500 font-medium italic">
              {config.greeting}{" "}
              <span className="text-indigo-500 font-bold">
                {cleanFirstName}
              </span>
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
