import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { auditReportFixture } from '../src/pdf/fixture/audit-fixture';
import { generateAuditPdf } from '../src/pdf/generateAuditPdf';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'output');
const outputPath = join(outputDir, 'shopping-rescue-report-fixture.pdf');

async function main() {
  mkdirSync(outputDir, { recursive: true });
  const pdf = await generateAuditPdf(auditReportFixture);
  writeFileSync(outputPath, pdf);
  console.log(`PDF written to ${outputPath} (${pdf.length} bytes)`);
}

main().catch((error) => {
  console.error('PDF generation failed:', error);
  process.exit(1);
});
