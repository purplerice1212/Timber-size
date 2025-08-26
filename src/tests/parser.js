import {parseList, normalizeSegments} from '../utils/parse.js';

export function testParser(){
  const p1 = parseList('43mm, 283, 43, junk');
  const exp1 = [43,283,43];
  const parsePass = exp1.every((n,i) => p1[i] === n);

  const p2 = normalizeSegments([43,43,283,43,43], 43);
  const normPass = p2.length === 3 && p2[0]===43 && p2[1]===283 && p2[2]===43;

  return [
    {name:'parseList basic', pass:parsePass},
    {name:'normalizeSegments dedup', pass:normPass}
  ];
}
