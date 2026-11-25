import { Search, SlidersHorizontal } from "lucide-react";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import { money } from "../utils/formatters";

export default function Assets({ store, openAssetModal, openActionModal }) {
  const { visibleAssets, data, filters, setFilters, canSeeCost, STATUSES, verifyAsset, completeRepairForAsset } = store;
  const rows = visibleAssets.filter((asset) =>
    (filters.status === "All" || (filters.status === "Unverified" ? !asset.verified : asset.status === filters.status)) &&
    (filters.category === "All" || asset.category === filters.category) &&
    (!filters.search || `${asset.id} ${asset.model} ${asset.serial} ${asset.holder}`.toLowerCase().includes(filters.search.toLowerCase()))
  );
  const actions = (asset) => <div className="table-actions">
    {asset.status === "Available" && <button onClick={() => openActionModal("issue", asset)}>Assign</button>}
    {asset.status === "Issued" && <button onClick={() => openActionModal("return", asset)}>Return</button>}
    {asset.status === "Under repair" && <button onClick={() => completeRepairForAsset(asset.id)}>Mark repaired</button>}
    {["Available", "Issued"].includes(asset.status) && <button onClick={() => openActionModal("damage", asset)}>Damage</button>}
    <button onClick={() => openActionModal("transfer", asset)}>Transfer</button>
    <button onClick={() => openActionModal("edit", asset)}>Edit</button>
    {!["Lost", "Retired"].includes(asset.status) && <button onClick={() => openActionModal("close", asset)}>Close</button>}
    {!asset.verified && <button onClick={() => verifyAsset(asset.id)}>Verify</button>}
  </div>;
  return <>
    <div className="page-heading"><div><p className="eyebrow">INVENTORY</p><h2>Asset register</h2><p className="muted">Search, filter and manage all company assets.</p></div><button className="button button-primary" onClick={() => openAssetModal()}>＋ Add asset</button></div>
    <div className="filter-bar"><div className="search-box"><Search size={17} /><input placeholder="Search ID, model, serial or employee" value={filters.search} onChange={(e) => setFilters((old) => ({ ...old, search: e.target.value }))} /></div>
      <div className="filter-select"><SlidersHorizontal size={15} /><select value={filters.status} onChange={(e) => setFilters((old) => ({ ...old, status: e.target.value }))}><option>All</option>{[...STATUSES, "Unverified"].map((status) => <option key={status}>{status}</option>)}</select></div>
      <select className="filter-select" value={filters.category} onChange={(e) => setFilters((old) => ({ ...old, category: e.target.value }))}><option>All</option>{data.categories.map(([name]) => <option key={name}>{name}</option>)}</select>
    </div>
    <div className="results-line"><span>{rows.length} asset record(s)</span><span>Company scope: {store.company}</span></div>
    <section className="panel table-panel"><DataTable columns={["Asset ID","Category","Model / serial","Company","Condition / date","Status","Assigned to","Actions"]} rows={rows.map((asset) => ({
      key: asset.id, cells: [<b className="mono">{asset.id}</b>, asset.category, <><b>{asset.model}{asset.quantity > 1 ? ` × ${asset.quantity}` : ""}</b><small className="cell-sub">{asset.serial || "No serial number"}</small></>, asset.company,
      <>{asset.condition}<small className="cell-sub">{asset.purchaseDate || "Purchase date unknown"}</small>{canSeeCost && asset.cost > 0 && <small className="cell-sub">{money(asset.cost)} each</small>}</>,
      <><StatusBadge status={asset.status} />{!asset.verified && <small className="cell-sub warning-text">Unverified</small>}</>, asset.holder || "—", actions(asset)]
    }))} empty="No assets match the selected filters" /></section>
  </>;
}
