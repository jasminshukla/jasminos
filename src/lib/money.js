// Money helpers. Formats amounts in Indian-style grouping (₹1,23,456.78) using
// a manual grouper so it works regardless of the JS engine's Intl support.

// Group an integer string the Indian way: last 3 digits, then groups of 2.
function groupIndian(intStr) {
  if (intStr.length <= 3) return intStr;
  const last3 = intStr.slice(-3);
  const rest = intStr.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

// Format a number as rupees. Pass { sign: true } to always show + / − (useful
// for transaction rows). Drops the decimals when the amount is a round number.
export function formatMoney(amount, { sign = false } = {}) {
  const n = Number(amount) || 0;
  const abs = Math.abs(n);
  const fixed = abs.toFixed(2);
  const [intPart, dec] = fixed.split('.');
  const grouped = groupIndian(intPart);
  const body = dec === '00' ? grouped : `${grouped}.${dec}`;
  const neg = n < 0;
  const prefix = sign ? (neg ? '− ' : '+ ') : neg ? '−' : '';
  return `${prefix}₹${body}`;
}

// Parse free-typed amount text ("1,200.50", "₹300") into a positive number.
export function parseAmount(text) {
  const cleaned = String(text == null ? '' : text).replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
