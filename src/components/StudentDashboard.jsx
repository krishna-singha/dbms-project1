import { GraduationCap } from "lucide-react";
import SectionTitle from "@/app/ui/SectionTitle";
import Card from "@/app/ui/Card";
import LargeCard from "@/app/ui/LargeCard";

// import {
//   BookOpen,
//   GraduationCap,
//   Users,
//   Shield,
//   BarChart3
// } from "lucide-react";

const StudentDashboard = () => {
  return (
    <>
      <SectionTitle
        icon={<GraduationCap />}
        title="Your Learning Progress"
      />

      <div className="grid md:grid-cols-3 gap-6">
        <Card title="Enrolled Courses" value="5" />
        <Card title="Completed Lessons" value="42" />
        <Card title="Skill Level" value="Practicing Student" />
      </div>

      <SectionTitle title="Continue Learning" />

      <div className="grid md:grid-cols-2 gap-6">
        <LargeCard
          title="Web Development Fundamentals"
          text="Resume where you left off"
          cta="Continue"
        />
        <LargeCard
          title="Data Structures & Algorithms"
          text="Next lesson unlocked"
          cta="Start"
        />
      </div>
    </>
  );
};

export default StudentDashboard;
