export function makeCamera(bounds) {
  const width = bounds.max.x - bounds.min.x;
  const height = bounds.max.y - bounds.min.y;
  const depth = bounds.max.z - bounds.min.z;
  const distance = Math.max(width, depth) * 2;
  return {
    distance,
    cx: width / 2,
    cy: height / 2
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
