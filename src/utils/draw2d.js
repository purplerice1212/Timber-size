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

export function drawText(ctx, text, x, y, color = '#fff', align = 'center') {
  const m = ctx.getTransform();
  const sx = x * m.a + m.e;
  const sy = y * m.d + m.f;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, sx, sy);
  ctx.restore();
}
