interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  dark?: boolean;
}

export function MetricCard({ label, value, sub, dark = false }: MetricCardProps) {
  return (
    <div className={`metric-card avoid-page-break ${dark ? 'metric-card--dark' : ''}`}>
      <div className="metric-card__label">{label}</div>
      <div className="metric-card__value">{value}</div>
      {sub ? <div className="metric-card__sub">{sub}</div> : null}
    </div>
  );
}
