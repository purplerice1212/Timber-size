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

  // Large negative overhang shouldn't produce a negative bin depth
  const T = {
    ...getState(),
    bottomRowRails: true,
    rows: [{overhang: -1000}]
  };
  const M2 = buildModel(T);
  const bin2 = M2.boxes.find(b=>b.type==='bin');
  const depthPass = bin2.d === 0;

  return [
    {name:'bin width includes slack', pass},
    {name:'negative overhang yields zero depth', pass: depthPass}
  ];
}

