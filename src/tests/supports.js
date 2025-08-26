import {buildModel} from '../model.js';
import {getState} from '../state.js';

export function testExtraSupport(){
  const S = {...getState(), topSupport:false, extraBottomBeam:true, extraBottomOrient:'Z', extraBottomLift:20};
  const M = buildModel(S);
  const supports = M.boxes.filter(b=>b.type==='support');
  const count = supports.length === 2;
  const orientations = supports.map(s => s.w === M.W ? 'X' : 'Z');
  const orientPass = orientations.includes('X') && orientations.includes('Z');
  const lifts = new Set(supports.map(s=>s.y)).size === 2;
  return [
    {name:'extra bottom beam adds second support', pass: count},
    {name:'extra bottom beam orientation configurable', pass: orientPass},
    {name:'extra bottom beam lift configurable', pass: lifts}
  ];
}
