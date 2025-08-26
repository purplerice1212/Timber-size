import {mm} from './mm.js';

export function autoHeightFromRows(S){
  const P = S.post;
  const lintels = P * (S.rows.length + 1);
  const heights = S.rows.reduce((a,r)=>a + mm(r.height),0);
  const gaps = S.rows.reduce((a,r)=>a + mm(r.gap),0);
  return lintels + mm(S.bottomClear) + mm(S.topClear) + heights + gaps;
}
