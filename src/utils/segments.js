import {parseList, normalizeSegments} from './parse.js';

export function segments(S){
  const post = Number.isFinite(S?.post) ? S.post : 0;
  return normalizeSegments(parseList(S?.patternText, post), post);
}
