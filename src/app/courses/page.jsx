import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import CourseList from "../../components/CourseList";

export const runtime = "nodejs";

export default async function CoursesPage() {
  const user = await getServerUser();

  const { rows: courses } = await query(`
    SELECT
      c.id,
      c.name,
      c.description,
      c.program_type,
      c.duration,
      c.university_id,
      u.name AS university
    FROM courses c
    JOIN partner_university u ON u.id = c.university_id
    ORDER BY c.created_at DESC
  `);

  const { rows: universities } = await query(`
    SELECT id, name FROM partner_university ORDER BY name
  `);

  return <CourseList courses={courses} universities={universities} userRole={user?.role} />;
}

