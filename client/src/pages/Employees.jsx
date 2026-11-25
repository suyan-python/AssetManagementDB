import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";

export default function Employees({ store, openEmployeeModal }) {
  const { data, company, toggleEmployee, deleteEmployee } = store;
  const removeEmployee = (employee) => {
    const heldCount = data.assets.filter(
      (asset) => asset.holder === employee.name,
    ).length;
    const heldMessage = heldCount
      ? ` This will release ${heldCount} assigned asset(s) and make them available.`
      : "";

    if (
      window.confirm(
        `Delete ${employee.name}? This cannot be undone.${heldMessage}`,
      )
    ) {
      deleteEmployee(employee.id);
    }
  };
  const employees = data.employees.filter(
    (employee) => company === "All" || employee.company === company,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PEOPLE</p>
          <h2>Employees</h2>
          <p className="muted">
            Track employee records and the equipment assigned to them.
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={() => openEmployeeModal()}
        >
          ＋ Add employee
        </button>
      </div>
      <div className="results-line">
        <span>{employees.length} employee(s)</span>
        <span>Exited employees with assigned assets need clearance.</span>
      </div>
      <section className="panel table-panel">
        <DataTable
          columns={[
            "Employee ID",
            "Name",
            "Department",
            "Company",
            "Status",
            "Assets held",
            "Actions",
          ]}
          rows={employees.map((employee) => {
            const held = data.assets.filter(
              (asset) => asset.holder === employee.name,
            );
            return {
              key: employee.id,
              cells: [
                <b className="mono">{employee.id}</b>,
                <b>{employee.name}</b>,
                employee.department || "—",
                employee.company,
                <StatusBadge status={employee.status} />,
                <>
                  {held.map((asset) => asset.id).join(", ") || "—"}
                  {employee.status === "Exited" && held.length > 0 && (
                    <small className="cell-sub warning-text">
                      Return pending
                    </small>
                  )}
                </>,
                <div className="table-actions">
                  <button onClick={() => openEmployeeModal(employee)}>
                    Edit
                  </button>
                  <button onClick={() => toggleEmployee(employee.id)}>
                    {employee.status === "Active"
                      ? "Mark exited"
                      : "Mark active"}
                  </button>
                  <button
                    className="danger-button"
                    onClick={() => removeEmployee(employee)}
                  >
                    Delete
                  </button>
                </div>,
              ],
            };
          })}
          empty="No employees found"
        />
      </section>
    </>
  );
}
