import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import UniversityList from "../../components/UniversityList";

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

export default async function UniversityPage() {
  const user = await getServerUser();

  const { rows: universities } = await query(`
    SELECT 
      u.id,
      u.name,
      u.country,
      COUNT(DISTINCT c.id) as course_count
    FROM partner_university u
    LEFT JOIN courses c ON c.university_id = u.id
    GROUP BY u.id, u.name, u.country
    ORDER BY u.name ASC
  `);

  return <UniversityList universities={universities} userRole={user?.role} />;
}
