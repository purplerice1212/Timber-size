import {mm} from './mm.js';
import {clamp} from './math.js';

export function computeLevels(S){
  const P = S.post;
  const bottomClearMm = mm(S.bottomClear);
  let y = P + bottomClearMm;
  const maxLevel = (S.autoHeight ? 1e9 : S.height) - P;
  const levels = [];
  const rows = [];
  let overflow = false;

  for (const r of S.rows){
    const heightMm = mm(r.height);
    const gapMm = mm(r.gap);
    const rowInfo = {heightMm, gapMm};

    if(!overflow && !S.autoHeight && (y > S.height - P || y + heightMm > S.height - P)){
      overflow = true;
    }

    if(!overflow){
      const level = clamp(y, 0, maxLevel);
      rowInfo.level = level;
      levels.push(level);
      y += heightMm + P + gapMm;
    }

    rows.push(rowInfo);
  }

  return {levels, rowOverflow:overflow, rows, bottomClearMm};
}
