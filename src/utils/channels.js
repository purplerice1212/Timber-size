import {segments} from './segments.js';
import {postSize} from './post.js';

export function channels(S, seg = segments(S)){
  const P=postSize(S); let x=0; const out=[];
  for(const s of seg){
    if(s!==P) out.push({x, w:s});
    x += s;
  }
  return out;
}
