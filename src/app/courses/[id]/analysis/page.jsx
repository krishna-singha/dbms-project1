import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import Link from "next/link";
import { ArrowLeft, Users, TrendingUp, Award, Globe, BarChart3, GraduationCap } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

const AnalysisPage = async ({ params }) => {
  const { id } = await params;
  const user = await getServerUser();

  if (!user || (user.role !== "DATA_ANALYST")) {
    redirect(`/courses/${id}`);
  }

  // Get course details
  const { rows: courseRows } = await query(
    `SELECT c.*, u.name AS university FROM courses c
     JOIN partner_university u ON u.id = c.university_id
     WHERE c.id = $1`,
    [id]
  );
  const course = courseRows[0];

  if (!course) {
    redirect("/courses");
  }

  // Get enrollment statistics
  const { rows: enrollmentStats } = await query(
    `SELECT 
       COUNT(*) as total_students,
       AVG(marks) as avg_marks,
       MAX(marks) as max_marks,
       MIN(marks) as min_marks,
       COUNT(CASE WHEN marks >= 50 THEN 1 END) as passed_students,
       COUNT(CASE WHEN marks < 50 AND marks IS NOT NULL THEN 1 END) as failed_students,
       COUNT(CASE WHEN marks IS NULL THEN 1 END) as not_graded
     FROM enrollments WHERE course_id = $1`,
    [id]
  );
  const stats = enrollmentStats[0];

  // Get top performers
  const { rows: topPerformers } = await query(
    `SELECT u.name, s.country, e.marks 
     FROM enrollments e
     JOIN students s ON s.user_id = e.student_id
     JOIN users u ON u.id = s.user_id
     WHERE e.course_id = $1 AND e.marks IS NOT NULL
     ORDER BY e.marks DESC
     LIMIT 5`,
    [id]
  );

  // Get country distribution
  const { rows: countryDist } = await query(
    `SELECT s.country, COUNT(*) as count
     FROM enrollments e
     JOIN students s ON s.user_id = e.student_id
     WHERE e.course_id = $1 AND s.country IS NOT NULL
     GROUP BY s.country
     ORDER BY count DESC
     LIMIT 5`,
    [id]
  );

  // Get marks distribution
  const { rows: marksDist } = await query(
    `SELECT 
       COUNT(CASE WHEN marks >= 90 THEN 1 END) as grade_a,
       COUNT(CASE WHEN marks >= 75 AND marks < 90 THEN 1 END) as grade_b,
       COUNT(CASE WHEN marks >= 60 AND marks < 75 THEN 1 END) as grade_c,
       COUNT(CASE WHEN marks >= 50 AND marks < 60 THEN 1 END) as grade_d,
       COUNT(CASE WHEN marks < 50 AND marks IS NOT NULL THEN 1 END) as grade_f
     FROM enrollments WHERE course_id = $1`,
    [id]
  );
  const distribution = marksDist[0];

  const passRate = stats.total_students > 0 
    ? ((parseInt(stats.passed_students) / parseInt(stats.total_students)) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-7xl px-6 pt-12">
        <Link 
          href={`/courses/${id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Course
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Course Analysis
          </h1>
          <p className="mt-2 text-lg text-slate-500 font-medium">
            {course.name} - {course.university}
          </p>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <Users size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Students</p>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.total_students}</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <TrendingUp size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Marks</p>
            </div>
            <p className="text-3xl font-black text-slate-900">
              {stats.avg_marks ? parseFloat(stats.avg_marks).toFixed(1) : 'N/A'}
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-green-50 p-2 text-green-600">
                <Award size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pass Rate</p>
            </div>
            <p className="text-3xl font-black text-slate-900">{passRate}%</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <GraduationCap size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Highest Score</p>
            </div>
            <p className="text-3xl font-black text-slate-900">
              {stats.max_marks || 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Marks Distribution */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <BarChart3 size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Grade Distribution</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">A (90-100)</span>
                  <span className="text-sm font-bold text-slate-900">{distribution.grade_a}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500"
                    style={{ width: `${stats.total_students > 0 ? (distribution.grade_a / stats.total_students * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">B (75-89)</span>
                  <span className="text-sm font-bold text-slate-900">{distribution.grade_b}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${stats.total_students > 0 ? (distribution.grade_b / stats.total_students * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">C (60-74)</span>
                  <span className="text-sm font-bold text-slate-900">{distribution.grade_c}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500"
                    style={{ width: `${stats.total_students > 0 ? (distribution.grade_c / stats.total_students * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">D (50-59)</span>
                  <span className="text-sm font-bold text-slate-900">{distribution.grade_d}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-orange-500"
                    style={{ width: `${stats.total_students > 0 ? (distribution.grade_d / stats.total_students * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">F (0-49)</span>
                  <span className="text-sm font-bold text-slate-900">{distribution.grade_f}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-red-500"
                    style={{ width: `${stats.total_students > 0 ? (distribution.grade_f / stats.total_students * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-700">Not Yet Graded</span>
                <span className="font-bold text-slate-900">{stats.not_graded}</span>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <Award size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Top Performers</h2>
            </div>
            {topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.map((student, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-black text-sm">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{student.name}</p>
                        <p className="text-sm text-slate-500">{student.country || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900">{student.marks}</p>
                      <p className="text-xs text-slate-500">marks</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No graded students yet</p>
            )}
          </div>

          {/* Country Distribution */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <Globe size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Student Distribution by Country</h2>
            </div>
            {countryDist.length > 0 ? (
              <div className="space-y-4">
                {countryDist.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold text-slate-700">{item.country}</span>
                      <span className="text-sm font-bold text-slate-900">{item.count} students</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500"
                        style={{ width: `${stats.total_students > 0 ? (item.count / stats.total_students * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No country data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
