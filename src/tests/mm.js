import {mm} from '../utils/mm.js';
export function testMM(){
  return [
    {name:'mm strips suffix', pass:mm('283mm') === 283},
    {name:'mm preserves fractional values', pass:mm('9.5mm') === 9.5}
  ];
}
