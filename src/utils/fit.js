export function fitCanvas(canvas, bounds) {
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const width = bounds.max[0] - bounds.min[0];
  const height = bounds.max[1] - bounds.min[1];
  const EPSILON = 1e-6;
  let scale = 1;
  if (Math.abs(width) > EPSILON && Math.abs(height) > EPSILON) {
    scale = Math.min(canvas.width / width, canvas.height / height);
  }
  ctx.setTransform(scale, 0, 0, -scale, -bounds.min[0] * scale, canvas.height + bounds.min[1] * scale);
  return ctx;
}
