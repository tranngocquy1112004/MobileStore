// Utility helpers for formatting values across the app

/**
 * Format a number to Vietnamese Đồng with no decimal digits.
 * Falls back to 0 ₫ when the value is invalid.
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = (value) => {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

