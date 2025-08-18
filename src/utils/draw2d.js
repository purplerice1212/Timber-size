export function drawRect(ctx, x, y, w, h, color = '#fff') {
  ctx.strokeStyle = color;
  ctx.strokeRect(x, y, w, h);
}

export function drawPolygon(ctx, points, color = '#fff') {
  if (points.length === 0) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.stroke();
}
