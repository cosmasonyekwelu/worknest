export const ADMIN_PAGE_SIZE = 10;

export const getSafePageNumber = (value) => {
  const parsedValue = Number.parseInt(value || "1", 10);
  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
};
