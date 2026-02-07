import { BarChart3 } from "lucide-react";
import SectionTitle from "@/app/ui/SectionTitle";
import Card from "@/app/ui/Card";
import LargeCard from "@/app/ui/LargeCard";

const DataAnalystDashboard = () => {
  return (
    <>
      <SectionTitle
        icon={<BarChart3 />}
        title="Analytics Overview"
      />

      <div className="grid md:grid-cols-4 gap-6">
        <Card title="Daily Active Users" value="3,245" />
        <Card title="Course Completion Rate" value="62%" />
        <Card title="Avg Session Time" value="18m" />
        <Card title="Churn Rate" value="3.2%" />
      </div>

      <SectionTitle title="Insights" />

      <div className="grid md:grid-cols-2 gap-6">
        <LargeCard
          title="Top Performing Courses"
          text="Web Dev, AI, Data Science"
          cta="View Report"
        />
        <LargeCard
          title="User Drop-off Points"
          text="Lesson 3 & onboarding step 2"
          cta="Analyze"
        />
      </div>
    </>
  );
};

export default DataAnalystDashboard;
