import {postSize} from './post.js';

export function railXPositions(ch, S){
  const post = postSize(S);
  if(S.railMode === 'centered') return [ch.x + (ch.w - post)/2];
  return [ch.x, ch.x + ch.w - post];
}
