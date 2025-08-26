import {mm} from '../utils/mm.js';

export function testMM(){
  return [{name:'mm strips suffix', pass:mm('283mm') === 283}];
}
