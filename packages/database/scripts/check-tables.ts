import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing');
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

try {
  const tables = await sql`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('scan_jobs', 'scans', 'organizations', '_migrations')
    ORDER BY tablename
  `;
  console.log('Tables found:', tables.map((t) => t.tablename));
  if (!tables.some((t) => t.tablename === 'scan_jobs')) {
    console.error('MISSING: scan_jobs');
    process.exit(2);
  }
  console.log('OK: scan_jobs exists');
} finally {
  await sql.end();
}
