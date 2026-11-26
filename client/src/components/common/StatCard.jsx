export default function StatCard({ label, value, onClick, icon: Icon }) {
  return (
    <button className="stat-card" onClick={onClick} type="button">
      <span className="stat-card-top">
        {Icon && <Icon size={17} />}
        <span>{label}</span>
      </span>
      <strong>{value}</strong>
    </button>
  );
}
