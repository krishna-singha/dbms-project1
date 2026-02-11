import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Download,
  GraduationCap,
  BookOpen,
  Building2,
} from "lucide-react";

import Card from "@/ui/Card";

export default function DataAnalystDashboard({ stats }) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Students"
          value={stats.studentCount.toLocaleString()}
          icon={<Users className="text-blue-600" size={20} />}
          className="bg-white"
        />
        <Card
          title="Total Instructors"
          value={stats.instructorCount.toLocaleString()}
          icon={<GraduationCap className="text-purple-600" size={20} />}
          className="bg-white"
        />
        <Card
          title="Total Courses"
          value={stats.courseCount}
          icon={<BookOpen className="text-emerald-600" size={20} />}
          className="bg-white"
        />
        <Card
          title="Total Partner Universities"
          value={stats.universityCount}
          icon={<Building2 className="text-orange-600" size={20} />}
          className="bg-white"
        />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
      </div>
      
    </div>
  );
}
