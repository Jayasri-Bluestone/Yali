// ─── Shared currency formatter ────────────────────────────────────────────────
// Formats a numeric price as Indian Rupees (₹) with locale formatting
// Usage: formatINR(product.price) → "₹1,499"
export function formatINR(value, decimals = 0) {
  const num = parseFloat(value);
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(num);
}
