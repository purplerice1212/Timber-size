import {mm} from './mm.js';
import {clamp} from './math.js';

export function computeLevels(S){
  const P = S.post;
  let y = P + mm(S.bottomClear);
  const out = [];
  let overflow = false;
  for(const r of S.rows){
    const h = mm(r.height);
    if(!S.autoHeight && (y > S.height - P || y + h > S.height - P)){
      overflow = true;
      break;
    }
    out.push(clamp(y,0,(S.autoHeight?1e9:S.height)-P));
    y += h + P + mm(r.gap);
  }
  return {levels:out, rowOverflow:overflow};
}
