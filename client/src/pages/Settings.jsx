import { useState } from "react";
import { FileSpreadsheet, Tags } from "lucide-react";

export default function Settings({ data, addCategory }) {
  const [name, setName] = useState("");
  const [tracking, setTracking] = useState("Individual");
  const [error, setError] = useState("");
  const submit = () => {
    const clean = name.trim();
    if (!clean) return setError("Enter a category name.");
    if (data.categories.some(([category]) => category.toLowerCase() === clean.toLowerCase())) return setError("That category already exists.");
    addCategory(clean, tracking); setName(""); setError("");
  };
  return <>
    <div className="page-heading"><div><p className="eyebrow">CONFIGURATION</p><h2>Settings & import</h2><p className="muted">Manage inventory categories and prepare initial data import.</p></div></div>
    <div className="settings-grid">
      <section className="panel settings-panel"><div className="section-icon"><Tags size={19} /></div><h3>Asset categories</h3><p className="muted">Individual items receive their own ID and serial number. Quantity items are tracked by count and can still be issued to a named employee.</p>
        <ul className="category-list">{data.categories.map(([category, type]) => <li key={category}><span>{category}</span><small>{type}</small></li>)}</ul>
        <div className="inline-form"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category (e.g. Webcam)" /><select value={tracking} onChange={(e) => setTracking(e.target.value)}><option>Individual</option><option>Quantity</option></select><button className="button button-primary" onClick={submit}>Add</button></div>
        {error && <p className="form-error">{error}</p>}
      </section>
      <section className="panel settings-panel"><div className="section-icon"><FileSpreadsheet size={19} /></div><h3>Initial data import</h3><p className="muted">One-time load from employee laptop and asset collection. Imported records should remain unverified until physically confirmed.</p>
        <div className="template-box"><b>Template columns</b><p>Company, Category, Brand/Model, Serial No., Condition, Purchase date, Assigned employee, Specs, Accessories, Notes.</p></div>
        <button className="button button-secondary" disabled>Upload Excel file <span>Backend required</span></button>
        <p className="tiny-note">Planned validation: duplicate serials, missing required fields, unknown categories and preview before saving.</p>
      </section>
    </div>
  </>;
}
