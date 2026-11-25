export default function ChartBars({ title, values }) {
  const entries = Object.entries(values);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  return <section className="panel chart-panel"><div className="panel-heading"><h3>{title}</h3><span className="muted">BY COUNT</span></div>
    {entries.length ? entries.map(([label, value]) => <div className="chart-row" key={label}>
      <span>{label}</span><div className="chart-track"><i style={{ width: `${(value / max) * 100}%` }} /></div><b>{value}</b>
    </div>) : <p className="empty-state">No data available</p>}
  </section>;
}
