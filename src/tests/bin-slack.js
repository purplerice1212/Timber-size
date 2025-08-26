import {buildModel} from '../model.js';
import {getState} from '../state.js';
import {channels} from '../utils/channels.js';
import {mm} from '../utils/mm.js';

export function testBinSlack(){
  const S = {...getState(), binSlack:20};
  const M = buildModel(S);
  const bin = M.boxes.find(b=>b.type==='bin');
  const chWidth = channels(S)[0].w;
  const expectedBody = Math.min(mm(S.binBody), Math.max(0, chWidth - 2 - mm(S.binSlack)));
  const expectedOverall = expectedBody + 2*mm(S.binFlange) + mm(S.binSlack);
  const pass = Math.abs(bin.w - expectedOverall) < 1e-6;
  return [{name:'bin width includes slack', pass}];
}

