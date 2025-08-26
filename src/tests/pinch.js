import {init3dControls, render3d} from '../views/view3d.js';
import {getState} from '../state.js';

export function testPinchZoom(){
  const listeners = {};
  const canvas = {
    clientWidth: 100,
    clientHeight: 100,
    width: 100,
    height: 100,
    getContext: () => ({
      clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {},
      fill() {}, stroke() {}, fillText() {},
      lineWidth: 0, fillStyle: '', strokeStyle: '', font: ''
    }),
    addEventListener: (type, handler) => {listeners[type] = handler;},
    setPointerCapture() {}
  };

  const model = {boxes: [], bounds: {min: [0,0,0], max: [0,0,0]}};
  render3d(canvas, model);
  init3dControls(canvas);

  const p1 = {pointerId: 1, clientX: 0, clientY: 0};
  const p2 = {pointerId: 2, clientX: 100, clientY: 0};
  listeners['pointerdown'](p1);
  listeners['pointerdown'](p2);

  listeners['pointermove']({pointerId: 2, clientX: 200, clientY: 0});

  const zoom = getState().zoom;

  listeners['pointerup'](p1);
  listeners['pointerup']({pointerId: 2, clientX: 200, clientY: 0});

  return [{name: 'pinch zoom increases when fingers spread', pass: zoom > 1}];
}
