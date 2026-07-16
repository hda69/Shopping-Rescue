import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Report Preview — Shopping Rescue',
};

export default function ReportPreviewLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f5f5f7]">{children}</div>;
}
