import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, GraduationCap, Clock, ChevronRight, PlayCircle } from "lucide-react";

export default async function MyCoursesPage() {
  const user = await getServerUser();

  if (!user || user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const { rows: enrollments } = await query(
    `SELECT 
      c.id, c.name, c.program_type, c.duration,
      u.name as university,
      e.created_at as enrolled_on
     FROM courses c
     JOIN enrollments e ON e.course_id = c.id
     JOIN partner_university u ON u.id = c.university_id
     WHERE e.student_id = $1
     ORDER BY e.created_at DESC`,
    [user.id]
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Learning</h1>
            <p className="mt-2 text-slate-500 font-medium italic">Continue where you left off and master your skills.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600">
            {enrollments.length} Active Courses
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white py-32 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No enrollments yet</h3>
            <p className="text-slate-500 mt-2">Explore our catalog and start your learning journey.</p>
            <Link 
              href="/courses" 
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((item) => (
              <Link
                key={item.id}
                href={`/courses/${item.id}`}
                className="group relative flex flex-col rounded-[2.5rem] border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BookOpen size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    Enrolled
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 leading-tight">
                  {item.name}
                </h2>
                <p className="text-sm font-medium text-slate-500 mb-6">{item.university}</p>
                
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}