export const STATUSES = ["Available", "Issued", "Under repair", "Damaged", "Lost", "Retired"];
export const COMPANIES = ["Vu Devi Services", "Evolve Vue"];
export const CATEGORIES = [
  ["Laptop", "Individual"], ["Monitor", "Individual"], ["Chair", "Individual"],
  ["Mouse", "Quantity"], ["Keyboard", "Quantity"], ["Headphones", "Quantity"],
  ["Cooler", "Quantity"], ["Mousepad", "Quantity"], ["Other IT Equipment", "Individual"],
];

const employeeRows = [
  ["Employee 01", "Operations", COMPANIES[0]],
  ["Employee 02", "Operations", COMPANIES[0]],
  ["Employee 03", "Support", COMPANIES[1]],
  ["Employee 04", "Operations", COMPANIES[0]],
  ["Employee 05", "Admin", COMPANIES[0]],
  ["Employee 06", "Operations", COMPANIES[0], "Exited"],
];

export const initialEmployees = employeeRows.map((row, index) => ({
  id: `EMP-${String(index + 1).padStart(4, "0")}`,
  name: row[0], department: row[1], company: row[2], status: row[3] || "Active",
}));

const assetRows = [
  ["Laptop","Dell Latitude 5420","SN-DL-1001",COMPANIES[0],"Old stock","","Issued","Employee 01",1],
  ["Laptop","Dell Latitude 5430","SN-DL-1002",COMPANIES[0],"New","2026-09-12","Issued","Employee 02",1],
  ["Laptop","HP ProBook 440","SN-HP-2001",COMPANIES[1],"Old stock","2023-03-05","Issued","Employee 03",0],
  ["Laptop","Lenovo ThinkPad E14","SN-LN-3001",COMPANIES[1],"New","2026-10-20","Available","",1],
  ["Laptop","Acer Aspire 5","SN-AC-4001",COMPANIES[0],"Old stock","","Under repair","",0],
  ["Laptop","Dell Latitude 3420","SN-DL-1003",COMPANIES[0],"Old stock","","Issued","Employee 06",0],
  ["Monitor","Dell P2422H","SN-MD-0101",COMPANIES[0],"New","2026-08-14","Available","",1],
  ["Monitor","LG 24MP400","SN-LG-0202",COMPANIES[0],"Old stock","","Issued","Employee 04",0],
  ["Chair","Ergonomic chair","",COMPANIES[0],"Old stock","","Issued","Employee 05",0],
  ["Mouse","Logitech B100","",COMPANIES[0],"New","2026-10-02","Available","",1,20],
  ["Keyboard","Logitech K120","",COMPANIES[1],"Old stock","","Issued","Employee 03",0],
  ["Headphones","Jabra Evolve 20","",COMPANIES[0],"New","2026-08-14","Issued","Employee 02",1],
  ["Cooler","Laptop cooling pad","",COMPANIES[0],"Old stock","","Damaged","",0],
  ["Mousepad","Standard mousepad","",COMPANIES[1],"New","2026-10-20","Available","",1,15],
];

const costs = { Laptop: 85000, Monitor: 22000, Chair: 12000, Mouse: 800, Keyboard: 1500, Headphones: 6000, Cooler: 2500, Mousepad: 400 };

const categoryCounters = {};
export const initialAssets = assetRows.map((row) => {
  categoryCounters[row[0]] = (categoryCounters[row[0]] || 0) + 1;
  return {
    id: `${row[0].slice(0,3).toUpperCase()}-${String(categoryCounters[row[0]]).padStart(4,"0")}`,
    category: row[0], model: row[1], serial: row[2], company: row[3],
    condition: row[4], purchaseDate: row[5], status: row[6], holder: row[7],
    verified: Boolean(row[8]), quantity: row[9] || 1, added: "2026-11-24",
    cost: costs[row[0]] || 0,
  };
});

export const initialDamageReports = [{
  id: "LAP-0005", date: "2026-11-10", description: "Screen flickering",
  cause: "Unknown", status: "Open",
}];

export const initialState = {
  companies: COMPANIES,
  categories: CATEGORIES,
  employees: initialEmployees,
  assets: initialAssets,
  transfers: [],
  activity: [],
  damageReports: initialDamageReports,
};
