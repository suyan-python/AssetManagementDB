import { Boxes, ChevronDown } from "lucide-react";

export default function AppHeader({
  company,
  setCompany,
  companies,
  role,
  setRole,
}) {
  return (
    <header className="app-header">
      <div className="brand-lockup">
        <div className="brand-mark">
          <Boxes size={21} />
        </div>
        <div>
          <p className="eyebrow">OPERATIONS CONSOLE</p>
          <h1>Company Assets</h1>
        </div>
      </div>
      <div className="header-controls">
        <label>
          <span>Company</span>
          <div className="select-wrap">
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option>All</option>
              {companies.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown size={14} />
          </div>
        </label>
        <label>
          <span>View as</span>
          <div className="select-wrap">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {["HR Admin", "Operations / IT", "Finance", "MD"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown size={14} />
          </div>
        </label>
      </div>
    </header>
  );
}
