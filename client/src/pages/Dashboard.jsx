import {
  AlertTriangle,
  Boxes,
  CircleCheck,
  PackageCheck,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import StatCard from "../components/common/StatCard";
import ChartBars from "../components/common/ChartBars";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import { countBy, money, totalUnits } from "../utils/formatters";

export default function Dashboard({ store, openAssetModal }) {
  const {
    visibleAssets: assets,
    data,
    canSeeCost,
    setView,
    setFilters,
  } = store;
  const statuses = [
    "Available",
    "Issued",
    "Under repair",
    "Damaged",
    "Lost",
    "Retired",
  ];
  const counts = countBy(assets, "status");
  const unverified = assets.filter((asset) => !asset.verified).length;
  const exited = assets.filter(
    (asset) =>
      asset.holder &&
      data.employees.find((employee) => employee.name === asset.holder)
        ?.status === "Exited",
  );
  const missingDates = assets.filter(
    (asset) => asset.condition === "New" && !asset.purchaseDate,
  );
  const alerts = [
    ...(exited.length
      ? [
          `${exited.length} asset(s) still held by exited employees — return pending`,
        ]
      : []),
    ...(assets.filter((asset) => asset.status === "Under repair").length
      ? [
          `${assets.filter((asset) => asset.status === "Under repair").length} asset(s) currently under repair`,
        ]
      : []),
    ...(unverified
      ? [`${unverified} asset record(s) have not been physically verified`]
      : []),
    ...(missingDates.length
      ? [`${missingDates.length} new asset(s) missing purchase date`]
      : []),
  ];
  const jump = (status) => {
    setFilters((old) => ({ ...old, status, category: "All", search: "" }));
    setView("assets");
  };
  const recent = [...data.activity].reverse().slice(0, 5);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR ORGANIZATION</p>
          <h2>Asset overview</h2>
          <p className="muted">
            A live snapshot of company equipment and allocation.
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={() => openAssetModal()}
        >
          ＋ Add asset
        </button>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Total units"
          value={totalUnits(assets)}
          icon={Boxes}
          onClick={() => jump("All")}
        />
        {statuses.map((status) => (
          <StatCard
            key={status}
            label={status}
            value={counts[status] || 0}
            onClick={() => jump(status)}
          />
        ))}
        <StatCard
          label="Unverified"
          value={unverified}
          icon={ShieldAlert}
          onClick={() => {
            setFilters((old) => ({ ...old, status: "Unverified" }));
            setView("assets");
          }}
        />
        {canSeeCost && (
          <StatCard
            label="Total asset value"
            value={money(
              assets.reduce(
                (sum, asset) => sum + asset.cost * asset.quantity,
                0,
              ),
            )}
            icon={PackageCheck}
          />
        )}
      </div>
      <div className="quick-actions">
        <button
          className="button button-secondary"
          onClick={() => jump("Available")}
        >
          Assign an asset <span>↗</span>
        </button>
        <button
          className="button button-secondary"
          onClick={() => jump("Issued")}
        >
          Return an asset <span>↗</span>
        </button>
      </div>
      <div className="dashboard-grid">
        <ChartBars
          title="Assets by category"
          values={countBy(assets, "category")}
        />
        <ChartBars title="Assets by status" values={counts} />
        <ChartBars
          title="Assets by company"
          values={countBy(assets, "company")}
        />
        <section className="panel attention-panel">
          <div className="panel-heading">
            <h3>Needs attention</h3>
            <AlertTriangle size={17} />
          </div>
          {alerts.length ? (
            alerts.map((alert) => (
              <div className="alert-row" key={alert}>
                <AlertTriangle size={15} />
                <span>{alert}</span>
              </div>
            ))
          ) : (
            <p className="empty-state">
              <CircleCheck size={16} /> Nothing pending
            </p>
          )}
          <p className="panel-footnote">
            Warranty expiry, low stock alerts and overdue returns can be added
            with the backend.
          </p>
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h3>Recent activity</h3>
          <button className="text-button" onClick={() => setView("activity")}>
            View all →
          </button>
        </div>
        <DataTable
          columns={["Date", "Asset", "Action", "Employee", "Note"]}
          rows={recent.map((item) => ({
            cells: [
              item.date,
              item.assetId,
              item.action,
              item.employee || "—",
              item.note || "—",
            ],
          }))}
          empty="No activity recorded yet"
        />
      </section>
    </>
  );
}
