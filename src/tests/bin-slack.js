import {buildModel} from '../model.js';
import {getState} from '../state.js';
import {channels} from '../utils/channels.js';
import {segments} from '../utils/segments.js';
import {mm} from '../utils/mm.js';

export function testBinSlack(){
  const results = [];

  {
    const S = {...getState(), binSlack:20};
    const M = buildModel(S);
    const bin = M.boxes.find(b=>b.type==='bin');
    const seg = segments(S);
    const chWidth = channels(S, seg)[0].w;
    const expectedBody = Math.min(mm(S.binBody), Math.max(0, chWidth - 2 - mm(S.binSlack)));
    const expectedOverall = expectedBody + 2*mm(S.binFlange) + mm(S.binSlack);
    const pass = Math.abs(bin.w - expectedOverall) < 1e-6;
    results.push({name:'bin width includes slack', pass});
  }

  {
    const rows = getState().rows.map(r=>({...r, overhang:-1000}));
    const S = {...getState(), rows};
    const M = buildModel(S);
    const bins = M.boxes.filter(b=>b.type==='bin');
    const pass = bins.length > 0 && bins.every(b=>b.d === 0);
    results.push({name:'bin depth not negative with large negative overhang', pass});
  }

  return results;
}

