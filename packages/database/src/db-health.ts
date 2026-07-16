import { sql } from 'drizzle-orm';
import { getDb } from './client';
import { formatDbError } from './db-errors';

export async function checkDbHealth(): Promise<{ ok: boolean; message?: string }> {
  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);

    const result = await db.execute(sql`
      SELECT to_regclass('public.organizations') AS organizations_table
    `);
    const row = result[0] as { organizations_table: string | null } | undefined;

    if (!row?.organizations_table) {
      return {
        ok: false,
        message: 'Database schema is missing. Run: pnpm db:migrate && pnpm db:seed',
      };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, message: formatDbError(error) };
  }
}
