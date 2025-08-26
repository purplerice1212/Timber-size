import {buildModel} from '../model.js';
import {getState} from '../state.js';
import {mm} from '../utils/mm.js';

export function testBinSlack(){
  const base = getState();
  const opening = Math.ceil(mm(base.binBody) + 2*mm(base.binFlange) + mm(base.binSlack));
  const S = {...base, patternText:`${base.post},${opening},${base.post}`};
  const M = buildModel(S);
  const channelWidth = M.channels[0].w;
  const binBox = M.boxes.find(b=>b.type==='bin');
  const diff = channelWidth - binBox.w;
  return [{name:'bin slack respected', pass: diff === mm(S.binSlack)}];
}

