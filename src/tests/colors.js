import {buildModel} from '../model.js';
import {getState} from '../state.js';
import {BOX_TYPES, typeColors, getTypeColorLoose} from '../utils/colors.js';
import {__resetWarnOnce} from '../utils/warnOnce.js';

export function testColors(){
  const declared = Object.keys(typeColors).sort();
  const expected = [...BOX_TYPES].sort();
  const paletteCoverage = JSON.stringify(declared) === JSON.stringify(expected);

  const model = buildModel(getState());
  const missing = new Set();
  model.boxes.forEach(box => {
    const color = getTypeColorLoose(box.type);
    if (!color) missing.add(box.type);
  });
  const allBoxesColored = missing.size === 0;

  __resetWarnOnce();

  return [
    {name:'palette covers all box types', pass: paletteCoverage},
    {name:'model boxes resolve to a colour', pass: allBoxesColored}
  ];
}
