export function makeCamera(bounds) {
  const distance = Math.max(bounds.width, bounds.depth) * 2;
  return {
    distance,
    cx: bounds.width / 2,
    cy: bounds.height / 2
  };
}

export function project(point, camera) {
  const {x, y, z} = point;
  const scale = camera.distance / (camera.distance + z);
  return {
    x: camera.cx + x * scale,
    y: camera.cy - y * scale
  };
}
