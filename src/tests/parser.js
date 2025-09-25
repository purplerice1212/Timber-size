import {parseList, normalizeSegments} from '../utils/parse.js';
import {segments} from '../utils/segments.js';
import {DEFAULT_POST_MM, DEFAULT_OPENING_MM} from '../config/defaults.js';

export function testParser(){
  const sampleText = `${DEFAULT_POST_MM}mm, ${DEFAULT_OPENING_MM}, ${DEFAULT_POST_MM}, junk`;
  const p1 = parseList(sampleText);
  const exp1 = [DEFAULT_POST_MM, DEFAULT_OPENING_MM, DEFAULT_POST_MM];
  const parsePass = exp1.every((n,i) => p1[i] === n);

  const p2 = normalizeSegments([
    DEFAULT_POST_MM,
    DEFAULT_POST_MM,
    DEFAULT_OPENING_MM,
    DEFAULT_POST_MM,
    DEFAULT_POST_MM
  ], DEFAULT_POST_MM);
  const normPass = p2.length === 3
    && p2[0]===DEFAULT_POST_MM
    && p2[1]===DEFAULT_OPENING_MM
    && p2[2]===DEFAULT_POST_MM;

  const fallbackSegments = segments({patternText:'junk', post:75});
  const fallbackExpected = [75,DEFAULT_OPENING_MM,75,DEFAULT_OPENING_MM,75];
  const fallbackPass = fallbackSegments.length === fallbackExpected.length
    && fallbackSegments.every((n,i)=>n === fallbackExpected[i]);

  return [
    {name:'parseList basic', pass:parsePass},
    {name:'normalizeSegments dedup', pass:normPass},
    {name:'segments fallback honors post', pass:fallbackPass}
  ];
}
