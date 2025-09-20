export const mm = v => {
  const stripped = String(v).replace(/mm$/i, '');
  const parsed = Number.parseFloat(stripped);
  return Number.isFinite(parsed) ? parsed : 0;
};
