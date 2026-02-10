import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import CreateCourseForm from "./CreateCourseForm";
import Link from "next/link";

export const runtime = "nodejs";

export default async function CreateCoursePage() {
  const user = await getServerUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/courses");
  }

  const { rows: universities } = await query(
    "SELECT id, name FROM partner_university ORDER BY name"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href="/courses"
          className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm mb-6 inline-block"
        >
          ← Back to Courses
        </Link>

        <h1 className="text-3xl font-black mb-8">Create New Course</h1>

        <CreateCourseForm universities={universities} />
      </main>
    </div>
  );
}
