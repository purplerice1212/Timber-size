import {buildModel} from '../model.js';
import {getState} from '../state.js';

export function testLevels(){
  const base = getState();
  const S = {...base, autoHeight:false, height:300};
  const M = buildModel(S);
  const bottomClearTestValue = 50;
  const withBottomClear = buildModel({...base, autoHeight:true, bottomClear:bottomClearTestValue});
  return [{
    name:'row overflow stops extra levels',
    pass:M.rowOverflow && M.levels.length === 1
  },{
    name:'bottom clearance offsets first level',
    pass:Array.isArray(withBottomClear.levels) && withBottomClear.levels[0] === base.post + bottomClearTestValue
  }];
}

