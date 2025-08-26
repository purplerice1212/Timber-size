import {buildModel} from '../model.js';
import {getState} from '../state.js';

export function testClamp(){
  const base = getState();
  const S = {...base, depth:400, runnerDepth:500};
  const M = buildModel(S);
  const railsClamped = M.boxes.filter(b=>b.type==='rail').every(r=>r.d === 400);
  return [{name:'rail depth clamped', pass:railsClamped}];
}
