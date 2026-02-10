import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap, MapPin, BookOpen, Users, Clock, ChevronRight } from "lucide-react";

export default async function UniversityDetailPage({ params }) {
  const { id } = await params;
  const user = await getServerUser();

  const { rows: universityRows } = await query(
    `SELECT id, name, country FROM partner_university WHERE id = $1`, [id]
  );

  if (universityRows.length === 0) notFound();
  const university = universityRows[0];

  const { rows: courses } = await query(
    `SELECT c.id, c.name, c.description, c.program_type, c.duration, COUNT(DISTINCT e.student_id) as enrolled_count
     FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
     WHERE c.university_id = $1 GROUP BY c.id ORDER BY c.created_at DESC`, [id]
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="mx-auto max-w-7xl px-6 pt-12">
        <Link href="/university" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Institutions
        </Link>

        <div className="mb-12 rounded-[2.5rem] bg-white p-10 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-indigo-600 text-white shadow-lg shadow-indigo-100">
              <GraduationCap size={40} />
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{university.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-lg font-medium text-slate-500">
                <MapPin size={20} className="text-indigo-500" />
                {university.country}
              </div>
            </div>

            <div className="flex gap-4 border-l border-slate-100 pl-8 hidden lg:flex">
              <div className="text-center">
                <p className="text-2xl font-black text-indigo-600">{courses.length}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Courses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900">Program Catalog</h2>
          </div>

          {courses.length === 0 ? (
            <div className="py-20 text-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white">
              <p className="font-bold text-slate-400">No active programs available.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}
                  className="group relative flex flex-col rounded-[2.2rem] border border-slate-200 bg-white p-8 transition-all hover:border-indigo-100 hover:shadow-xl"
                >
                  <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {course.name}
                  </h3>

                  <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-slate-500">
                    {course.description}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Clock size={14} className="text-indigo-500" />
                      {course.duration}M
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <BookOpen size={14} className="text-indigo-500" />
                      {course.program_type}
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
                      <Users size={14} />
                      {course.enrolled_count}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}