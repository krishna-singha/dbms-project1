/**
 * app/courses/[id]/manage/page.tsx
 */
import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import { redirect, notFound } from "next/navigation";
import ManageCourseUsers from "../../../../components/ManageCourseUsers";

export const runtime = "nodejs";

export default async function ManageCoursePage({ params }) {
  const { id } = await params;
  const user = await getServerUser();

  if (!user || user.role !== "ADMIN") redirect("/courses");

  const { rows: courseRows } = await query(
    `SELECT c.id, c.name, u.name as university FROM courses c 
     JOIN partner_university u ON u.id = c.university_id WHERE c.id = $1`,
    [id]
  );

  if (courseRows.length === 0) notFound();
  const course = courseRows[0];

  const { rows: instructors } = await query(
    `SELECT u.id, u.name, u.email FROM users u
     JOIN teaches t ON t.instructor_id = u.id WHERE t.course_id = $1`, [id]
  );

  const { rows: allInstructors } = await query(
    `SELECT u.id, u.name, u.email FROM users u 
     JOIN instructors i ON i.user_id = u.id ORDER BY u.name`
  );

  const { rows: students } = await query(
    `SELECT u.id, u.name, u.email, e.created_at FROM users u
     JOIN enrollments e ON e.student_id = u.id
     WHERE e.course_id = $1 ORDER BY e.created_at DESC`, [id]
  );

  const { rows: allStudents } = await query(
    `SELECT u.id, u.name, u.email FROM users u 
     JOIN students s ON s.user_id = u.id ORDER BY u.name LIMIT 500`
  );

  return (
    <ManageCourseUsers
      course={course}
      instructors={instructors}
      allInstructors={allInstructors}
      students={students}
      allStudents={allStudents}
    />
  );
}