export function fitCanvas(canvas, bounds) {
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(canvas.width / bounds.width, canvas.height / bounds.height);
  ctx.setTransform(scale, 0, 0, -scale, 0, canvas.height);
  return ctx;
}
