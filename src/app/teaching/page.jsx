import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, Clock, ChevronRight, GraduationCap } from "lucide-react";

export default async function TeachingPage() {
  const user = await getServerUser();

  if (!user || user.role !== "INSTRUCTOR") {
    redirect("/dashboard");
  }

  const { rows: courses } = await query(
    `SELECT 
      c.id, c.name, c.program_type, c.duration,
      u.name as university,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count
     FROM courses c
     JOIN teaches t ON t.course_id = c.id
     JOIN partner_university u ON u.id = c.university_id
     WHERE t.instructor_id = $1
     ORDER BY c.created_at DESC`,
    [user.id]
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Courses Teaching</h1>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white py-32 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
              <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No courses assigned</h3>
            <p className="text-slate-500 mt-2">You aren't currently assigned to teach any programs.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group relative flex flex-col rounded-[2.5rem] border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <GraduationCap size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                    {course.program_type}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                  {course.name}
                </h2>
                <p className="text-sm font-medium text-slate-500 mb-6">{course.university}</p>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Users size={14} className="text-indigo-500" />
                      {course.student_count} Students
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Clock size={14} className="text-indigo-500" />
                      {course.duration}M
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}