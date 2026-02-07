import { Shield } from "lucide-react";
import SectionTitle from "@/app/ui/SectionTitle";
import Card from "@/app/ui/Card";
import ActionCard from "@/app/ui/ActionCard";

const AdminDashboard = () => {
  return (
    <>
      <SectionTitle
        icon={<Shield />}
        title="Platform Control"
      />

      <div className="grid md:grid-cols-4 gap-6">
        <Card title="Total Users" value="12,430" />
        <Card title="Instructors" value="1,102" />
        <Card title="Students" value="11,214" />
        <Card title="Reports" value="17" />
      </div>

      <SectionTitle title="Admin Actions" />

      <div className="grid md:grid-cols-3 gap-6">
        <ActionCard text="Manage Users" />
        <ActionCard text="Review Courses" />
        <ActionCard text="System Settings" />
      </div>
    </>
  );
};

export default AdminDashboard;
