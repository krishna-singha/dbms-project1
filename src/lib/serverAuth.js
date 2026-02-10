import { cookies } from 'next/headers';
import { verifyToken } from './crypto';
import { query } from './db/pool';

export async function getServerUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    const { userId } = payload;

    // Fetch base user
    const { rows } = await query(
      `
      SELECT id, name, email, role
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    const user = rows[0];
    if (!user) {
      return null;
    }

    // Role-specific profile
    let profile = null;

    switch (user.role) {
      case 'STUDENT': {
        const { rows } = await query(
          `
          SELECT age, country, skill_level, category
          FROM students
          WHERE user_id = $1
          `,
          [user.id]
        );
        profile = rows[0] ?? null;
        break;
      }

      case 'INSTRUCTOR': {
        const { rows } = await query(
          `
          SELECT experience, rating
          FROM instructors
          WHERE user_id = $1
          `,
          [user.id]
        );
        profile = rows[0] ?? null;
        break;
      }

      case 'ADMIN':
      case 'DATA_ANALYST':
        profile = null;
        break;

      default:
        console.error('Unknown role in getServerUser:', user.role);
        return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile,
    };
  } catch (error) {
    console.error('Error getting server user:', {
      message: error.message,
      stack: error.stack,
    });
    return null;
  }
}
