import { GraduationCap, BookOpen, Clock, PlayCircle, ArrowRight } from "lucide-react";
import Card from "@/ui/Card";
import Link from "next/link";

export default function StudentDashboard({ stats, user }) {
  return (
    <div className="space-y-10">

      <div className="grid md:grid-cols-3 gap-6">
        <Card title="My Courses" value={stats.enrollments.length} icon={<GraduationCap className="text-indigo-600" />} />
        <Card title="Skill Level" value={user.profile.skill_level} icon={<PlayCircle className="text-purple-600" />} />
      </div>

      <h3 className="text-xl font-black text-slate-900">Jump Back In</h3>
      <div className="grid md:grid-cols-2 gap-8">
        {stats.enrollments.map(course => (
          <Link key={course.id} href={`/courses/${course.id}`} className="block group">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <BookOpen size={24} />
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{course.university}</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">{course.name}</h4>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                Continue Lesson <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}