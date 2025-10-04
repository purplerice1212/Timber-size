import {mm} from './mm.js';
import {computeLevels} from './computeLevels.js';
import {postSize} from './post.js';

export function autoHeightFromRows(S, shared){
  const computed = shared ?? computeLevels(S);
  const rows = computed.rows ?? [];
  let heights = 0;
  let gaps = 0;
  for(const row of rows){
    heights += row.heightMm ?? 0;
    gaps += row.gapMm ?? 0;
  }
  const P = postSize(S);
  const lintels = P * ((rows.length || S.rows.length) + 1);
  const bottomClear = computed.bottomClearMm ?? mm(S.bottomClear);
  const topClear = mm(S.topClear);
  return lintels + bottomClear + topClear + heights + gaps;
}
