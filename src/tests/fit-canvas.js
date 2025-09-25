import {fitCanvas} from '../utils/fit.js';

function arrayEquals(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function testFitCanvasAlignment() {
  const transforms = [];
  const cleared = [];
  const contextStub = {
    setTransform: (...args) => transforms.push([...args]),
    clearRect: (...args) => cleared.push([...args])
  };
  const canvas = {
    clientWidth: 120,
    clientHeight: 80,
    width: 0,
    height: 0,
    getContext(type) {
      if (type !== '2d') throw new Error(`Unexpected context type: ${type}`);
      return contextStub;
    }
  };

  const bounds = {min: [10, -5], max: [70, 35]};
  const ctx = fitCanvas(canvas, bounds);

  const width = bounds.max[0] - bounds.min[0];
  const height = bounds.max[1] - bounds.min[1];
  const expectedScale = Math.min(canvas.clientWidth / width, canvas.clientHeight / height);
  const expectedTransform = [
    expectedScale,
    0,
    0,
    -expectedScale,
    -bounds.min[0] * expectedScale,
    canvas.clientHeight + bounds.min[1] * expectedScale
  ];
  const identityTransform = [1, 0, 0, 1, 0, 0];

  const pass =
    ctx === contextStub &&
    canvas.width === canvas.clientWidth &&
    canvas.height === canvas.clientHeight &&
    transforms.length === 2 &&
    arrayEquals(transforms[0], identityTransform) &&
    arrayEquals(transforms[1], expectedTransform) &&
    cleared.length === 1 &&
    arrayEquals(cleared[0], [0, 0, canvas.clientWidth, canvas.clientHeight]);

  return [{
    name: 'fitCanvas applies expected scale and translation',
    pass
  }];
}
