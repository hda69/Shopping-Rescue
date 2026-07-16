import { loadEnv } from '@shopping-rescue/shared/load-env';
import postgres from 'postgres';

async function seed() {
  loadEnv();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });

  console.log('Seeding system settings...');

  const settings = [
    {
      key: 'plans.free_scan',
      value: { max_pages: 15, max_products: 20, visible_findings: 2 },
      description: 'Free scan plan limits',
    },
    {
      key: 'plans.full_audit',
      value: { price_cents: 7900, max_pages: 150, max_products: 500, retention_months: 12 },
      description: 'Full audit plan configuration',
    },
    {
      key: 'plans.monitoring_pro',
      value: { price_cents: 4900, max_sites: 3, scan_interval_days: 7 },
      description: 'Monitoring Pro plan configuration',
    },
    {
      key: 'plans.agency',
      value: { price_cents: 19900, max_sites: 20, scan_interval_days: 7 },
      description: 'Agency plan configuration',
    },
    {
      key: 'retention.free_scan_days',
      value: 30,
      description: 'Days to retain unconverted free scans',
    },
    {
      key: 'retention.free_screenshot_days',
      value: 7,
      description: 'Days to retain free scan screenshots',
    },
    {
      key: 'retention.paid_report_months',
      value: 12,
      description: 'Months to retain paid reports',
    },
    {
      key: 'retention.logs_days',
      value: 90,
      description: 'Days to retain technical logs',
    },
  ];

  for (const setting of settings) {
    await sql`
      INSERT INTO system_settings (key, value, description)
      VALUES (${setting.key}, ${sql.json(setting.value)}, ${setting.description})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  }

  console.log('Seeding guest organization...');
  await sql`
    INSERT INTO organizations (id, name, slug, plan)
    VALUES (
      'a0000000-0000-4000-8000-000000000001',
      'Guest Scans',
      'guest-scans',
      'free'
    )
    ON CONFLICT (id) DO NOTHING
  `;

  await sql.end();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
