export default function StatusBadge({ status }) {
  if (!status) return null;
  const className = `status-badge status-${status.toLowerCase().replaceAll(" ", "-")}`;
  return <span className={className}>{status}</span>;
}
