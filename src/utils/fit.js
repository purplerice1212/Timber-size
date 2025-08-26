export function fitCanvas(canvas, bounds) {
  const {min, max} = bounds;
  const width = max[0] - min[0];
  const height = max[1] - min[1];
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(canvas.width / width, canvas.height / height);
  const tx = -min[0] * scale;
  const ty = canvas.height + min[1] * scale;
  ctx.setTransform(scale, 0, 0, -scale, tx, ty);
  return ctx;
}
