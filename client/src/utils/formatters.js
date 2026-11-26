export const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
export const money = (amount) =>
  `NPR ${Number(amount || 0).toLocaleString("en-IN")}`;
export const totalUnits = (assets) =>
  assets.reduce((sum, asset) => sum + (asset.quantity || 1), 0);
export const countBy = (items, key) =>
  items.reduce((result, item) => {
    const value = item[key];
    result[value] = (result[value] || 0) + (item.quantity || 1);
    return result;
  }, {});
export const isQuantityCategory = (categories, category) =>
  categories.find(([name]) => name === category)?.[1] === "Quantity";
