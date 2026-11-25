const entities = [
  ["Company","id, name"],
  ["Category","id, name, tracking type (Individual / Quantity), active"],
  ["Asset","company-neutral ID, category, quantity, cost per unit, model, serial, condition, purchase date, vendor, invoice, status, current company, holder, verified, date added"],
  ["Employee","id, name, department, company, active status"],
  ["Assignment","asset, employee, issue date, return date, condition at issue / return, acknowledgement file"],
  ["Transfer","asset, from company, to company, date, required reason, approved by, recorded by"],
  ["Damage / Repair","asset, reported date, description, cause, negligence flag, employee charged, status, vendor, cost, outcome"],
  ["Audit log","user, action, record, timestamp"],
];
const rules = [
  "Asset ID has no company prefix, so company transfers never change the ID.",
  "Only Available assets can be issued.",
  "Issued assets cannot be transferred unless the employee moves too, or the asset is returned first.",
  "Returning a damaged asset creates a damage record automatically.",
  "No hard deletes; mark assets Lost or Retired instead.",
  "Damage is charged to the employee only when marked as negligence, not for ordinary wear or breakdown.",
  "Transfers are approved by the Admin (Head).",
  "Small items are tracked by quantity. Issuing, damaging or transferring part of a stock line splits it.",
  "Dates use English (AD) format and company filters apply across screens.",
  "HR Admin has full access; Operations / IT handles assets and repairs; Finance and MD can view costs.",
];
const planned = ["Excel import and export","QR labels","Reports: issued by employee, damaged, transfers, warranty expiry","Physical audit mode","Exit clearance workflow","Email or in-app alerts","Authentication and role permissions"];
export default function DeveloperNotes() {
  return <>
    <div className="page-heading"><div><p className="eyebrow">HANDOVER</p><h2>Developer notes</h2><p className="muted">Functional requirements and backend implementation reference.</p></div></div>
    <div className="info-banner"><b>Frontend prototype</b><span>Data is held in React state only and resets on refresh. No API, database or authentication is connected.</span></div>
    <div className="notes-grid">
      <section className="panel notes-panel"><h3>Suggested data entities</h3><div className="entity-list">{entities.map(([name, fields]) => <div key={name}><b>{name}</b><p>{fields}</p></div>)}</div></section>
      <section className="panel notes-panel"><h3>Business rules</h3><ul className="rule-list">{rules.map((rule) => <li key={rule}>{rule}</li>)}</ul></section>
      <section className="panel notes-panel"><h3>Still to build</h3><ul className="rule-list">{planned.map((item) => <li key={item}>{item}</li>)}</ul></section>
    </div>
  </>;
}
