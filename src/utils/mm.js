export const mm = v => {
  const stripped = String(v).replace(/mm$/i, '');
  const parsed = Number(stripped);
  return Number.isFinite(parsed) ? Math.ceil(parsed) : 0;
};
