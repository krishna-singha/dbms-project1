import { BookOpen, Users, Star, Plus, Settings, ChevronRight } from "lucide-react";
import Card from "@/ui/Card";
import Link from "next/link";

export default function InstructorDashboard({ stats }) {
  return (
    <div className="space-y-10">

      <div className="grid md:grid-cols-3 gap-6">
        <Card title="Your Courses" value={stats.courses.length} icon={<BookOpen className="text-indigo-600" />} />
        <Card title="Active Students" value={stats.totalStudents} icon={<Users className="text-purple-600" />} />
        <Card title="Average Rating" value={`${stats.rating} ★`} icon={<Star className="text-amber-500" />} />
      </div>

      <h3 className="text-xl font-black text-slate-900">Active Curriculum</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {stats.courses.map(course => (
          <div key={course.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 flex items-center justify-between group hover:border-indigo-200 transition-all shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">{course.program_type}</p>
              <h4 className="text-xl font-bold text-slate-900 mb-2">{course.name}</h4>
              <p className="text-sm text-slate-400 font-medium">{course.students} students currently enrolled</p>
            </div>
            <Link href={`/courses/${course.id}`} className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <ChevronRight size={20} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}