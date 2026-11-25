import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";

export default function Repairs({ store }) {
  const { data, finishRepair } = store;
  return <>
    <div className="page-heading"><div><p className="eyebrow">MAINTENANCE</p><h2>Damage & repairs</h2><p className="muted">Follow damaged equipment through its repair lifecycle.</p></div></div>
    <div className="info-banner"><b>Workflow</b><span>Reported → Under repair → Repaired (back to stock) or Not repairable (Damaged).</span></div>
    <section className="panel table-panel"><DataTable columns={["Asset","Quantity","Reported","Description","Cause","Employee charged?","Status","Action"]} rows={data.damageReports.map((report, index) => ({
      key: `${report.id}-${index}`, cells: [<b className="mono">{report.id}</b>, report.quantity || 1, report.date, report.description, report.cause,
        report.negligence === "Yes" || report.negligence === true ? `Yes — ${report.employee || "employee"}` : "No", <StatusBadge status={report.status} />,
        report.status === "Open" ? <div className="table-actions"><button onClick={() => finishRepair(index, true)}>Mark repaired</button><button onClick={() => finishRepair(index, false)}>Not repairable</button></div> : "—"]
    }))} empty="No damage reports yet" /></section>
  </>;
}
