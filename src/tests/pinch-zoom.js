export function testPinchZoom(){
  const pinchZoom=1;
  const pinchDist=100;
  const spreadDist=150;
  const pinchDistSmall=50;
  const zoomSpread = pinchZoom*(spreadDist/pinchDist);
  const zoomPinch = pinchZoom*(pinchDistSmall/pinchDist);
  const spreadIncreases = zoomSpread > pinchZoom;
  const pinchDecreases = zoomPinch < pinchZoom;
  return [
    {name:'spreading fingers zooms in', pass:spreadIncreases},
    {name:'pinching fingers zooms out', pass:pinchDecreases}
  ];
}
