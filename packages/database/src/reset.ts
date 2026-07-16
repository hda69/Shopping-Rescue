import postgres from 'postgres';

async function reset() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });

  console.log('Resetting database...');
  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;
  await sql.end();

  console.log('Database reset. Run pnpm db:migrate && pnpm db:seed');
}

reset().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
