import {parseList, normalizeSegments} from './parse.js';
import {postSize} from './post.js';

export function segments(S){
  const post = postSize(S);
  return normalizeSegments(parseList(S?.patternText, post), post);
}
