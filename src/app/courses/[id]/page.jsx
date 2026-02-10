import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import EnrollButton from "@/ui/EnrollButton";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Settings, Clock, BookOpen } from "lucide-react";
import CourseContent from "../../../components/CourseContent";

export const dynamic = 'force-dynamic';

export default async function CourseDetail({ params }) {
  const { id } = await params;
  const user = await getServerUser();

  const { rows } = await query(
    `SELECT c.*, u.name AS university FROM courses c
     JOIN partner_university u ON u.id = c.university_id
     WHERE c.id = $1`,
    [id]
  );

  const course = rows[0];
  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Course not found</h1>
          <Link href="/courses" className="mt-4 inline-block text-indigo-600 font-bold">
            Return to browse
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "ADMIN";

  const { rows: enrollment } = await query(
    `SELECT 1 FROM enrollments WHERE course_id = $1 AND student_id = $2`,
    [id, user?.id]
  );
  const isEnrolled = enrollment.length > 0;

  const { rows: teaching } = await query(
    `SELECT 1 FROM teaches WHERE course_id = $1 AND instructor_id = $2`,
    [id, user?.id]
  );
  const isInstructor = teaching.length > 0;

  const hasAccess = isEnrolled || isInstructor || isAdmin;
  let contents = [];
  if (hasAccess) {
    const { rows: contentRows } = await query(
      `SELECT id, type, body, created_at FROM contents 
       WHERE course_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    contents = contentRows;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-7xl px-6 pt-12">
        <Link 
          href="/courses" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Courses
        </Link>

        <div className="rounded-[2.5rem] bg-white p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  {course.program_type}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 leading-tight">
                {course.name}
              </h1>
              <p className="mt-2 text-lg text-slate-500 font-medium">
                {course.university}
              </p>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              {user?.role === "STUDENT" && !isEnrolled && (
                <EnrollButton courseId={course.id} />
              )}
              
              {isEnrolled && (
                <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Already Enrolled
                </div>
              )}

              {isAdmin && (
                <Link
                  href={`/courses/${course.id}/manage`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800"
                >
                  <Settings size={18} />
                  Manage Course
                </Link>
              )}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 border-y border-slate-100 py-8">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-slate-50 p-3 text-slate-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                <p className="font-bold text-slate-900">{course.duration} Months</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-slate-50 p-3 text-slate-600">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                <p className="font-bold text-slate-900">{course.program_type}</p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Course Overview</h3>
            <p className="text-lg leading-relaxed text-slate-600 whitespace-pre-wrap">
              {course.description || "Detailed curriculum information coming soon."}
            </p>
          </div>

          {hasAccess ? (
            <CourseContent
              courseId={course.id}
              contents={contents}
              isInstructor={isInstructor}
            />
          ) : (
            <div className="mt-12 rounded-[2rem] bg-slate-50 border border-slate-200 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <Settings size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Content Locked</h4>
              <p className="mt-1 text-slate-500">Access of lectures, notes, and readings is limited to enrolled students and instructors.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}