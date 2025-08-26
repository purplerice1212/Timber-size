import {clamp} from '../utils/clamp.js';

export function clampTests() {
  return [
    {name: 'clamp: upper bound', pass: clamp(10, 0, 5) === 5},
    {name: 'clamp: lower bound', pass: clamp(-1, 0, 5) === 0},
    {name: 'clamp: inside range', pass: clamp(3, 0, 5) === 3}
  ];
}
