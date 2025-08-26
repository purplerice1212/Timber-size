import {parseList, normalizeSegments} from './parse.js';

export function segments(S){
  return normalizeSegments(parseList(S.patternText), S.post);
}
