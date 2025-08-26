import {buildModel} from '../model.js';
import {getState} from '../state.js';

export function testLevels(){
  const base = getState();
  const S = {...base, autoHeight:false, height:300};
  const M = buildModel(S);
  return [{
    name:'row overflow stops extra levels',
    pass:M.rowOverflow && M.levels.length === 1
  }];
}

