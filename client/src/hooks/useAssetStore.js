import { useMemo, useState } from "react";
import { initialState, STATUSES } from "../data/initialData";
import { isQuantityCategory, today } from "../utils/formatters";

const makeId = (category, assets) => {
  const prefix = category.slice(0, 3).toUpperCase();
  const suffixes = assets
    .map((asset) => asset.id?.match(/^([A-Z]+)-(\d+)$/))
    .filter((match) => match?.[1] === prefix)
    .map((match) => Number(match[2]));
  const next = Math.max(0, ...suffixes) + 1;
  return `${prefix}-${String(next).padStart(4, "0")}`;
};

export function useAssetStore() {
  const [data, setData] = useState(initialState);
  const [company, setCompany] = useState("All");
  const [role, setRole] = useState("HR Admin");
  const [view, setView] = useState("dashboard");
  const [filters, setFilters] = useState({
    status: "All",
    category: "All",
    search: "",
  });

  const visibleAssets = useMemo(
    () =>
      data.assets.filter(
        (asset) => company === "All" || asset.company === company,
      ),
    [data.assets, company],
  );
  const canSeeCost = role === "Finance" || role === "MD";

  const update = (updater) => setData((current) => updater(current));
  const addAsset = (payload) =>
    update((current) => {
      const asset = {
        id: makeId(payload.category, current.assets),
        ...payload,
        verified: true,
        added: today(),
        quantity: Math.max(1, Number(payload.quantity) || 1),
        status: "Available",
        holder: "",
      };
      return { ...current, assets: [...current.assets, asset] };
    });
  const addEmployee = (payload) =>
    update((current) => ({
      ...current,
      employees: [
        ...current.employees,
        {
          ...payload,
          id:
            payload.id ||
            `EMP-${String(current.employees.length + 1).padStart(4, "0")}`,
          status: "Active",
        },
      ],
    }));
  const updateEmployee = (id, payload) =>
    update((current) => {
      const old = current.employees.find((employee) => employee.id === id);
      return {
        ...current,
        employees: current.employees.map((employee) =>
          employee.id === id ? { ...employee, ...payload } : employee,
        ),
        assets: current.assets.map((asset) =>
          asset.holder === old?.name
            ? { ...asset, holder: payload.name }
            : asset,
        ),
        activity: current.activity.map((item) =>
          item.employee === old?.name
            ? { ...item, employee: payload.name }
            : item,
        ),
      };
    });
  const toggleEmployee = (id) =>
    update((current) => ({
      ...current,
      employees: current.employees.map((employee) =>
        employee.id === id
          ? {
              ...employee,
              status: employee.status === "Active" ? "Exited" : "Active",
            }
          : employee,
      ),
    }));
  const deleteEmployee = (id) =>
    update((current) => {
      const employee = current.employees.find((item) => item.id === id);
      if (!employee) return current;

      return {
        ...current,
        employees: current.employees.filter((item) => item.id !== id),
        assets: current.assets.map((asset) =>
          asset.holder === employee.name
            ? { ...asset, status: "Available", holder: "" }
            : asset,
        ),
        damageReports: current.damageReports.map((report) =>
          report.employee === employee.name
            ? { ...report, employee: "" }
            : report,
        ),
        activity: [
          ...current.activity,
          {
            date: today(),
            assetId: "",
            action: "Employee deleted",
            employee: employee.name,
            note: "Employee record removed from the system.",
          },
        ],
      };
    });
  const removeEmployee = deleteEmployee;
  const updateAsset = (id, payload) =>
    update((current) => ({
      ...current,
      assets: current.assets.map((asset) =>
        asset.id === id ? { ...asset, ...payload } : asset,
      ),
    }));
  const verifyAsset = (id) => updateAsset(id, { verified: true });
  const logActivity = (entry) =>
    update((current) => ({
      ...current,
      activity: [...current.activity, entry],
    }));
  const issueAsset = (id, { employee, date, note, quantity = 1 }) =>
    update((current) => {
      const source = current.assets.find((asset) => asset.id === id);
      const assignee = current.employees.find(
        (item) =>
          item.name === employee &&
          item.status === "Active" &&
          item.company === source?.company,
      );
      if (!source || source.status !== "Available" || !assignee) return current;
      const count = Math.min(
        source.quantity,
        Math.max(1, Number(quantity) || 1),
      );
      const issued =
        count < source.quantity
          ? {
              ...source,
              id: makeId(source.category, current.assets),
              quantity: count,
            }
          : source;
      const assets =
        count < source.quantity
          ? [
              ...current.assets.map((asset) =>
                asset.id === id
                  ? { ...asset, quantity: asset.quantity - count }
                  : asset,
              ),
              issued,
            ]
          : current.assets.map((asset) =>
              asset.id === id
                ? { ...asset, status: "Issued", holder: employee }
                : asset,
            );
      if (count < source.quantity)
        Object.assign(issued, { status: "Issued", holder: employee });
      return {
        ...current,
        assets,
        activity: [
          ...current.activity,
          {
            date,
            assetId: issued.id,
            action: "Issued",
            employee,
            note: `${count > 1 ? `${count} units. ` : ""}${note || ""}`,
          },
        ],
      };
    });
  const returnAsset = (id, payload) =>
    update((current) => {
      const asset = current.assets.find((item) => item.id === id);
      if (!asset || asset.status !== "Issued") return current;
      const damaged = payload.condition === "Damaged";
      return {
        ...current,
        assets: current.assets.map((item) =>
          item.id === id
            ? {
                ...item,
                status: damaged ? "Under repair" : "Available",
                holder: "",
              }
            : item,
        ),
        activity: [
          ...current.activity,
          {
            date: payload.date,
            assetId: id,
            action: `Returned (${payload.condition})`,
            employee: asset.holder,
            note: payload.note || "",
          },
        ],
        damageReports: damaged
          ? [
              ...current.damageReports,
              {
                id,
                date: payload.date,
                description: payload.note || "Damaged on return",
                cause: "Found at return",
                negligence: payload.negligence,
                employee: asset.holder,
                quantity: asset.quantity || 1,
                status: "Open",
              },
            ]
          : current.damageReports,
      };
    });
  const reportDamage = (id, payload) =>
    update((current) => {
      const source = current.assets.find((item) => item.id === id);
      if (!source) return current;
      const quantityCategory = isQuantityCategory(
        current.categories,
        source.category,
      );
      const count = quantityCategory
        ? Math.min(source.quantity, Math.max(1, Number(payload.quantity) || 1))
        : 1;
      const damaged = {
        ...source,
        quantity: count,
        status: "Under repair",
        holder: "",
      };
      let assets;
      if (quantityCategory && count < source.quantity) {
        damaged.id = makeId(source.category, current.assets);
        assets = current.assets.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - count }
            : item,
        );
        assets.push(damaged);
      } else {
        assets = current.assets.map((item) =>
          item.id === id ? damaged : item,
        );
      }
      return {
        ...current,
        assets,
        activity: source.holder
          ? [
              ...current.activity,
              {
                date: payload.date,
                assetId: id,
                action: "Returned (damaged)",
                employee: source.holder,
                note: payload.description,
              },
            ]
          : current.activity,
        damageReports: [
          ...current.damageReports,
          {
            id: damaged.id,
            date: payload.date,
            description: payload.description,
            cause: payload.cause,
            negligence: payload.negligence,
            employee: source.holder,
            quantity: count,
            status: "Open",
          },
        ],
      };
    });
  const transferAsset = (id, payload) =>
    update((current) => {
      const asset = current.assets.find((item) => item.id === id);
      if (!asset || asset.status === "Issued") return current;
      const quantityCategory = isQuantityCategory(
        current.categories,
        asset.category,
      );
      const count = quantityCategory
        ? Math.min(asset.quantity, Math.max(1, Number(payload.quantity) || 1))
        : asset.quantity;
      let transferred = { ...asset, company: payload.company };
      let assets;
      if (quantityCategory && count < asset.quantity) {
        transferred = {
          ...asset,
          id: makeId(asset.category, current.assets),
          quantity: count,
          company: payload.company,
        };
        assets = current.assets.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - count }
            : item,
        );
        assets.push(transferred);
      } else {
        assets = current.assets.map((item) =>
          item.id === id ? transferred : item,
        );
      }
      return {
        ...current,
        assets,
        transfers: [
          ...current.transfers,
          {
            date: payload.date,
            assetId: id,
            from: asset.company,
            to: payload.company,
            reason: payload.reason,
            approvedBy: payload.approvedBy,
          },
        ],
      };
    });
  const closeAsset = (id, payload) =>
    update((current) => {
      const asset = current.assets.find((item) => item.id === id);
      return {
        ...current,
        assets: current.assets.map((item) =>
          item.id === id
            ? { ...item, status: payload.status, holder: "" }
            : item,
        ),
        activity: [
          ...current.activity,
          {
            date: payload.date,
            assetId: id,
            action: `Marked ${payload.status}`,
            employee: asset.holder,
            note: payload.reason,
          },
        ],
      };
    });
  const completeRepairForAsset = (id) =>
    update((current) => {
      const asset = current.assets.find((item) => item.id === id);
      if (!asset || asset.status !== "Under repair") return current;
      return {
        ...current,
        damageReports: current.damageReports.map((report) =>
          report.id === id && report.status === "Open"
            ? { ...report, status: "Repaired" }
            : report,
        ),
        assets: current.assets.map((item) =>
          item.id === id ? { ...item, status: "Available", holder: "" } : item,
        ),
        activity: [
          ...current.activity,
          {
            date: today(),
            assetId: id,
            action: "Repair completed",
            employee: "",
            note: "Marked repaired from the asset register.",
          },
        ],
      };
    });
  const finishRepair = (index, repaired) =>
    update((current) => {
      const report = current.damageReports[index];
      if (!report || report.status !== "Open") return current;
      const hasOtherOpenReports = current.damageReports.some(
        (item, i) =>
          i !== index && item.id === report.id && item.status === "Open",
      );
      return {
        ...current,
        damageReports: current.damageReports.map((item, i) =>
          i === index
            ? { ...item, status: repaired ? "Repaired" : "Not repairable" }
            : item,
        ),
        assets: current.assets.map((asset) =>
          asset.id === report.id
            ? {
                ...asset,
                status: hasOtherOpenReports
                  ? "Under repair"
                  : repaired
                    ? "Available"
                    : "Damaged",
                holder: "",
              }
            : asset,
        ),
        activity: [
          ...current.activity,
          {
            date: today(),
            assetId: report.id,
            action: repaired ? "Repair completed" : "Marked not repairable",
            employee: report.employee || "",
            note: report.description || "",
          },
        ],
      };
    });
  const addCategory = (name, tracking) =>
    update((current) => ({
      ...current,
      categories: [...current.categories, [name, tracking]],
    }));

  return {
    data,
    company,
    setCompany,
    role,
    setRole,
    view,
    setView,
    filters,
    setFilters,
    visibleAssets,
    canSeeCost,
    addAsset,
    addEmployee,
    updateEmployee,
    toggleEmployee,
    deleteEmployee,
    removeEmployee,
    updateAsset,
    verifyAsset,
    issueAsset,
    returnAsset,
    reportDamage,
    transferAsset,
    closeAsset,
    completeRepairForAsset,
    finishRepair,
    addCategory,
    STATUSES,
    isQuantityCategory,
  };
}
