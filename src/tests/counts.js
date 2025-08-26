import {buildModel} from '../model.js';
import {getState} from '../state.js';

export function testCounts(){
  const M = buildModel(getState());
  const count = type => M.boxes.filter(b=>b.type===type).length;
  return [
    {name:'post count', pass: count('post') === 6},
    {name:'rail count', pass: count('rail') === 12},
    {name:'bin count',  pass: count('bin') === 6}
  ];
}
