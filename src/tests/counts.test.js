import {buildModel} from '../model.js';
import {S} from '../state.js';

export function countTests() {
  const model = buildModel(S);
  return [
    {name: 'count: posts', pass: model.boxes.length === 4}
  ];
}
