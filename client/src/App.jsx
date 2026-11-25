import { useCallback, useState } from "react";
import { Bell, Command, Menu } from "lucide-react";
import AppHeader from "./components/layout/AppHeader";
import Sidebar from "./components/layout/Sidebar";
import Modal from "./components/common/Modal";
import Field from "./components/common/Field";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Employees from "./pages/Employees";
import Repairs from "./pages/Repairs";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import DeveloperNotes from "./pages/DeveloperNotes";
import { useAssetStore } from "./hooks/useAssetStore";
import { today } from "./utils/formatters";

const pageTitles = {
  dashboard: "Overview",
  assets: "Asset register",
  employees: "Employees",
  repairs: "Damage & repairs",
  activity: "Activity log",
  settings: "Settings & import",
  developer: "Developer notes",
};

function Input({ value, onChange, type = "text", ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      {...props}
    />
  );
}
function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

export default function App() {
  const store = useAssetStore();
  const { data } = store;
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const closeModal = useCallback(() => {
    setModal(null);
    setForm({});
    setError("");
  }, []);
  const open = (type, record = null) => {
    if (type === "edit") type = "editAsset";
    setError("");
    if (type === "asset")
      setForm({
        category: data.categories[0][0],
        model: "",
        serial: "",
        quantity: 1,
        cost: "",
        company: store.company === "All" ? data.companies[0] : store.company,
        condition: "New",
        purchaseDate: today(),
      });
    else if (type === "employee")
      setForm(
        record
          ? { ...record }
          : {
              name: "",
              id: "",
              department: "",
              company:
                store.company === "All" ? data.companies[0] : store.company,
            },
      );
    else if (type === "issue")
      setForm({
        employee:
          data.employees.find(
            (employee) =>
              employee.status === "Active" &&
              employee.company === record.company,
          )?.name || "",
        date: today(),
        note: "",
        quantity: 1,
      });
    else if (type === "return")
      setForm({ date: today(), condition: "Good", negligence: "No", note: "" });
    else if (type === "damage")
      setForm({
        date: today(),
        description: "",
        cause: "Wear and tear",
        negligence: "No",
        quantity: 1,
      });
    else if (type === "transfer")
      setForm({
        company: data.companies.find((company) => company !== record.company),
        date: today(),
        reason: "",
        approvedBy: "Admin (Head)",
        quantity: 1,
      });
    else if (type === "close")
      setForm({ status: "Lost", date: today(), reason: "", negligence: "No" });
    else if (type === "editAsset")
      setForm({
        category: record.category,
        model: record.model,
        serial: record.serial,
        condition: record.condition,
        purchaseDate: record.purchaseDate || "",
        quantity: record.quantity,
        cost: record.cost,
      });
    setModal({ type, record });
  };
  const save = () => {
    const { type, record } = modal || {};
    const f = form;
    if (type === "asset") {
      if (!f.model?.trim()) return setError("Enter the brand or model.");
      const tracking = data.categories.find(
        ([name]) => name === f.category,
      )?.[1];
      const quantity = Number(f.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        return setError("Quantity must be a whole number of at least 1.");
      if (
        f.cost !== "" &&
        (!Number.isFinite(Number(f.cost)) || Number(f.cost) < 0)
      )
        return setError("Cost cannot be negative.");
      if (tracking === "Individual" && !f.serial?.trim())
        return setError("Serial number is required for this category.");
      const serial = f.serial?.trim();
      if (
        serial &&
        data.assets.some((asset) => asset.serial?.trim() === serial)
      )
        return setError("This serial number already exists.");
      if (f.condition === "New" && !f.purchaseDate)
        return setError("Purchase date is required for new items.");
      store.addAsset({
        ...f,
        model: f.model.trim(),
        serial,
        cost: store.canSeeCost ? Number(f.cost) || 0 : 0,
        quantity: tracking === "Quantity" ? Number(f.quantity) || 1 : 1,
      });
    }
    if (type === "employee") {
      if (!f.name?.trim()) return setError("Enter the employee name.");
      const employeeId = f.id?.trim();
      if (
        employeeId &&
        data.employees.some(
          (employee) =>
            employee.id.toLowerCase() === employeeId.toLowerCase() &&
            employee.id !== record?.id,
        )
      )
        return setError("An employee with this employee ID already exists.");
      if (
        data.employees.some(
          (employee) =>
            employee.name.toLowerCase() === f.name.trim().toLowerCase() &&
            employee.id !== record?.id,
        )
      )
        return setError("An employee with this name already exists.");
      if (record)
        store.updateEmployee(record.id, {
          name: f.name.trim(),
          department: f.department,
          company: f.company,
        });
      else store.addEmployee({ ...f, name: f.name.trim(), id: employeeId });
    }
    if (type === "issue") {
      const employee = data.employees.find(
        (item) =>
          item.name === f.employee &&
          item.status === "Active" &&
          item.company === record.company,
      );
      if (!employee)
        return setError("Select an active employee in this asset's company.");
      const quantity = Number(f.quantity);
      if (
        record.quantity > 1 &&
        (!Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > record.quantity)
      )
        return setError(`Enter a quantity between 1 and ${record.quantity}.`);
      store.issueAsset(record.id, f);
    }
    if (type === "return") store.returnAsset(record.id, f);
    if (type === "damage") {
      if (!f.description?.trim()) return setError("Describe the damage.");
      const quantity = Number(f.quantity);
      if (
        record.quantity > 1 &&
        (!Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > record.quantity)
      )
        return setError(`Enter a quantity between 1 and ${record.quantity}.`);
      store.reportDamage(record.id, f);
    }
    if (type === "transfer") {
      if (!f.reason?.trim())
        return setError("Reason for transfer is required.");
      if (record.status === "Issued")
        return setError(
          "This asset is currently issued. Return it before transferring.",
        );
      const quantity = Number(f.quantity);
      if (
        record.quantity > 1 &&
        (!Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > record.quantity)
      )
        return setError(`Enter a quantity between 1 and ${record.quantity}.`);
      store.transferAsset(record.id, f);
    }
    if (type === "close") {
      if (!f.reason.trim()) return setError("Reason is required.");
      store.closeAsset(record.id, f);
    }
    if (type === "editAsset") {
      if (!f.model?.trim()) return setError("Enter the brand or model.");
      if (f.condition === "New" && !f.purchaseDate)
        return setError("Purchase date is required for new items.");
      const quantity = Number(f.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        return setError("Quantity must be a whole number of at least 1.");
      if (
        f.cost !== "" &&
        (!Number.isFinite(Number(f.cost)) || Number(f.cost) < 0)
      )
        return setError("Cost cannot be negative.");
      const serial = f.serial?.trim();
      if (
        serial &&
        data.assets.some(
          (asset) => asset.serial?.trim() === serial && asset.id !== record.id,
        )
      )
        return setError("This serial number already exists.");
      store.updateAsset(record.id, {
        ...f,
        serial,
        quantity: Number(f.quantity) || 1,
        cost: store.canSeeCost ? Number(f.cost) || 0 : record.cost,
      });
    }
    closeModal();
  };

  const title = modal
    ? {
        asset: "Add asset",
        employee: modal.record ? "Edit employee" : "Add employee",
        issue: `Assign ${modal.record?.id ?? ""}`,
        return: `Return ${modal.record?.id ?? ""}`,
        damage: `Report damage · ${modal.record?.id ?? ""}`,
        transfer: `Transfer ${modal.record?.id ?? ""}`,
        close: `Mark lost / retire · ${modal.record?.id ?? ""}`,
        editAsset: `Edit ${modal.record?.id ?? ""}`,
      }[modal.type]
    : "";
  const companyOptions = data.companies;
  const categoryOptions = data.categories.map(([name]) => name);
  const activeEmployees = data.employees
    .filter(
      (employee) =>
        employee.status === "Active" &&
        (!modal?.record?.company || employee.company === modal.record.company),
    )
    .map((employee) => employee.name);
  const modalContent = () => {
    if (!modal) return null;
    const field = (label, key, type = "text", hint) => (
      <Field label={label} hint={hint}>
        <Input
          type={type}
          value={form[key] ?? ""}
          onChange={(value) => set(key, value)}
        />
      </Field>
    );
    const select = (label, key, options) => (
      <Field label={label}>
        <Select
          value={form[key] ?? options[0]}
          onChange={(value) => set(key, value)}
          options={options}
        />
      </Field>
    );
    switch (modal.type) {
      case "asset":
        return (
          <div className="form-grid">
            {select("Category", "category", categoryOptions)}
            {field("Brand / model", "model")}
            {field(
              "Serial number",
              "serial",
              "text",
              "Required for individually tracked assets.",
            )}
            {field("Quantity", "quantity", "number")}
            {store.canSeeCost && field("Cost per unit (NPR)", "cost", "number")}
            {select("Company", "company", companyOptions)}
            {select("Condition", "condition", ["New", "Old stock"])}
            {field("Purchase date", "purchaseDate", "date")}
          </div>
        );
      case "employee":
        return (
          <div className="form-grid">
            {field("Full name", "name")}
            {field("Employee ID (leave blank to auto-generate)", "id")}
            {field("Department", "department")}
            {select("Company", "company", companyOptions)}
          </div>
        );
      case "issue":
        return (
          <div className="form-grid">
            {activeEmployees.length ? (
              select("Assign to employee", "employee", activeEmployees)
            ) : (
              <p className="form-error">
                No active employees are registered for {modal.record.company}.
                Add an employee in the Employees section before assigning this
                asset.
              </p>
            )}
            {field("Issue date", "date", "date")}
            {field("Condition / accessories given", "note")}
            {modal.record.quantity > 1 &&
              field(
                `Quantity to issue (in stock: ${modal.record.quantity})`,
                "quantity",
                "number",
              )}
          </div>
        );
      case "return":
        return (
          <div className="form-grid">
            {field("Return date", "date", "date")}
            {select("Condition on return", "condition", ["Good", "Damaged"])}
            {select("Negligence by employee?", "negligence", ["No", "Yes"])}
            {field("Note", "note")}
          </div>
        );
      case "damage":
        return (
          <div className="form-grid">
            {field("Date", "date", "date")}
            {field("Description", "description")}
            {select("Cause", "cause", [
              "Wear and tear",
              "Accident",
              "Misuse",
              "Unknown",
            ])}
            {select("Negligence by employee?", "negligence", ["No", "Yes"])}
            {modal.record.quantity > 1 &&
              field(
                `Damaged quantity (in stock: ${modal.record.quantity})`,
                "quantity",
                "number",
              )}
          </div>
        );
      case "transfer":
        return (
          <div className="form-grid">
            {select(
              "Transfer to company",
              "company",
              companyOptions.filter(
                (company) => company !== modal.record.company,
              ),
            )}
            {field("Date of transfer", "date", "date")}
            {field("Reason (required)", "reason")}
            {select("Approved by", "approvedBy", ["Admin (Head)"])}
            {modal.record.quantity > 1 &&
              field(
                `Quantity to transfer (available: ${modal.record.quantity})`,
                "quantity",
                "number",
              )}
          </div>
        );
      case "close":
        return (
          <div className="form-grid">
            {select("Outcome", "status", ["Lost", "Retired"])}
            {field("Date", "date", "date")}
            {field("Reason (required)", "reason")}
            {select("Employee negligence?", "negligence", ["No", "Yes"])}
          </div>
        );
      case "editAsset":
        return (
          <div className="form-grid">
            {select("Category", "category", categoryOptions)}
            {field("Brand / model", "model")}
            {field("Serial number", "serial")}
            {select("Condition", "condition", ["New", "Old stock"])}
            {field("Purchase date", "purchaseDate", "date")}
            {modal.record.quantity > 1 &&
              field("Quantity", "quantity", "number")}
            {store.canSeeCost && field("Cost per unit (NPR)", "cost", "number")}
          </div>
        );
      default:
        return null;
    }
  };

  const page = {
    dashboard: <Dashboard store={store} openAssetModal={() => open("asset")} />,
    assets: (
      <Assets
        store={store}
        openAssetModal={() => open("asset")}
        openActionModal={open}
      />
    ),
    employees: (
      <Employees
        store={store}
        openEmployeeModal={(employee) => open("employee", employee)}
      />
    ),
    repairs: <Repairs store={store} />,
    activity: <Activity data={data} />,
    settings: <Settings data={data} addCategory={store.addCategory} />,
    developer: <DeveloperNotes />,
  }[store.view];

  return (
    <div className="app-shell">
      <AppHeader
        company={store.company}
        setCompany={store.setCompany}
        companies={data.companies}
        role={store.role}
        setRole={store.setRole}
      />
      <div className="app-body">
        <div className={mobileNav ? "mobile-sidebar open" : "mobile-sidebar"}>
          <Sidebar
            view={store.view}
            setView={(view) => {
              store.setView(view);
              setMobileNav(false);
            }}
          />
        </div>
        <main className="main-content">
          <div className="mobile-toolbar">
            <button
              className="icon-button"
              onClick={() => setMobileNav((value) => !value)}
            >
              <Menu size={19} />
            </button>
            <span>{pageTitles[store.view]}</span>
            <Command size={17} />
          </div>
          <div className="content-wrap">{page}</div>
          <footer className="app-footer">
            <span>© 2026 Company Asset Dashboard</span>
            <span>
              <i className="online-dot" /> Sample data · Frontend only
            </span>
          </footer>
        </main>
      </div>
      {modal && (
        <Modal
          title={title}
          onClose={closeModal}
          footer={
            <>
              <button className="button button-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="button button-primary" onClick={save}>
                Save changes
              </button>
            </>
          }
        >
          {modalContent()}
          {error && <p className="form-error">{error}</p>}
        </Modal>
      )}
    </div>
  );
}
