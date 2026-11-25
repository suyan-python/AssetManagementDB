import DataTable from "../components/common/DataTable";

export default function Activity({ data }) {
  const activity = [...data.activity].reverse();
  const transfers = [...data.transfers].reverse();
  return <>
    <div className="page-heading"><div><p className="eyebrow">AUDIT TRAIL</p><h2>Activity log</h2><p className="muted">Review asset issue and return activity, plus inter-company transfers.</p></div></div>
    <section className="panel table-panel"><div className="panel-heading"><h3>Issue / return history</h3></div><DataTable columns={["Date","Asset","Action","Employee","Note"]} rows={activity.map((item, i) => ({ key: i, cells: [item.date, item.assetId, item.action, item.employee || "—", item.note || "—"] }))} empty="No activity yet" /></section>
    <section className="panel table-panel section-gap"><div className="panel-heading"><h3>Company transfer history</h3></div><DataTable columns={["Date","Asset","From","To","Reason","Approved by"]} rows={transfers.map((item, i) => ({ key: i, cells: [item.date, item.assetId, item.from, item.to, item.reason, item.approvedBy || "—"] }))} empty="No transfers yet" /></section>
  </>;
}
