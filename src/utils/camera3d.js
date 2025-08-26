export function project(point, camera) {
  const {x, y, z} = point;
  const scale = camera.distance / (camera.distance + z);
  return {
    x: camera.cx + x * scale,
    y: camera.cy - y * scale
  };
}
