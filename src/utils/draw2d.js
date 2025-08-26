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

export function drawLabel(ctx, x, y, text, color = '#fff') {
  ctx.save();
  ctx.scale(1, -1);
  ctx.fillStyle = color;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, -y);
  ctx.restore();
}

export function drawCross(ctx, x, y, w, h, color = '#fff') {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y + h);
  ctx.moveTo(x + w, y);
  ctx.lineTo(x, y + h);
  ctx.stroke();
}
