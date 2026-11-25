import { Activity, Boxes, Building2, ClipboardList, LayoutDashboard, Settings2, Wrench } from "lucide-react";

const links = [
  ["dashboard", "Overview", LayoutDashboard],
  ["assets", "Asset register", Boxes],
  ["employees", "Employees", Building2],
  ["repairs", "Damage & repairs", Wrench],
  ["activity", "Activity log", Activity],
  ["settings", "Settings & import", Settings2],
  ["developer", "Developer notes", ClipboardList],
];

export default function Sidebar({ view, setView }) {
  return <aside className="sidebar">
    <p className="sidebar-label">WORKSPACE</p>
    <nav>{links.map(([id, label, Icon]) => <button key={id} className={view === id ? "nav-link active" : "nav-link"} onClick={() => setView(id)}>
      <Icon size={17} /><span>{label}</span>{view === id && <i />}
    </button>)}</nav>
    <div className="sidebar-bottom"><div className="online-dot" />Frontend prototype <span>v1.0</span></div>
  </aside>;
}
