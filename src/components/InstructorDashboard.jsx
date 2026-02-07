import { BookOpen } from "lucide-react";
import SectionTitle from "@/app/ui/SectionTitle";
import Card from "@/app/ui/Card";
import LargeCard from "@/app/ui/LargeCard";

const InstructorDashboard = () => {
  return (
    <>
      <SectionTitle
        icon={<BookOpen />}
        title="Teaching Overview"
      />

      <div className="grid md:grid-cols-3 gap-6">
        <Card title="Active Courses" value="3" />
        <Card title="Total Students" value="214" />
        <Card title="Avg. Rating" value="4.7★" />
      </div>

      <SectionTitle title="Your Courses" />

      <div className="grid md:grid-cols-2 gap-6">
        <LargeCard
          title="Advanced React Patterns"
          text="120 students enrolled"
          cta="Manage"
        />
        <LargeCard
          title="System Design Basics"
          text="Draft mode"
          cta="Edit"
        />
      </div>
    </>
  );
};

export default InstructorDashboard;
