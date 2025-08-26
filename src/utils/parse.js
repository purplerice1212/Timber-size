export function parseList(text, fallback = []) {
  const parts = String(text).split(',').map(p => p.trim()).filter(Boolean);
  const nums = parts.map(p => {
    const cleaned = p.toLowerCase().endsWith('mm') ? p.slice(0, -2) : p;
    const n = Number(cleaned);
    return Number.isFinite(n) ? Math.ceil(n) : NaN;
  });
  if (nums.some(n => Number.isNaN(n))) {
    return Array.isArray(fallback) ? fallback : String(fallback).split(',').map(s => Number(s)).filter(n => !Number.isNaN(n));
  }
  return nums;
}
