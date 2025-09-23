import {mm} from './utils/mm.js';
import {clamp} from './utils/math.js';
import {segments} from './utils/segments.js';
import {channels} from './utils/channels.js';
import {computeLevels} from './utils/computeLevels.js';
import {railXPositions} from './utils/railXPositions.js';
import {autoHeightFromRows} from './utils/autoHeight.js';

// 取每列 bin 高度：自訂 -> profile -> 預設
function binHeightForRow(S, row){
  if (row && Number.isFinite(row.binHeight) && row.binHeight > 0) return row.binHeight;
  const idx = Number(row?.binProfileIndex);
  if (Number.isInteger(idx) && idx >= 0 && Array.isArray(S.binHeightProfiles) && S.binHeightProfiles[idx]){
    return S.binHeightProfiles[idx].height;
  }
  return S.binHeightDefault;
}

export function buildModel(S) {
  const P = S.post;
  const seg = segments(S);
  const ch = channels(S, seg);
  const levelData = computeLevels(S);
  const {levels:L, rowOverflow, rows:rowInfo=[]} = levelData;
  const W = seg.reduce((a,b)=>a+b,0);
  const H = S.autoHeight ? autoHeightFromRows(S, levelData) : S.height;
  const D = S.depth;
  const R = Math.min(S.runnerDepth, S.depth);
  const M = {W,H,D,P,channels:ch,levels:L,rowOverflow,boxes:[]};
  const rowHeights = rowInfo.map(info => (info && Number.isFinite(info.heightMm)) ? info.heightMm : 0);
  const lipSource = S.binLipThick != null ? S.binLipThick : S.binLip;
  const binLip = mm(lipSource);

  // Posts (front)
  let x=0; for(const s of seg){ if(s===P) M.boxes.push({type:'post',x,y:0,z:0,w:P,h:H,d:P}); x+=s; }
  // Posts (rear)
  if(S.rearFrame){ let xb=0; for(const s of seg){ if(s===P) M.boxes.push({type:'post',x:xb,y:0,z:D-P,w:P,h:H,d:P}); xb+=s; } }

  // Lintels
  M.boxes.push({type:'lintel',x:0,y:0,z:0,w:W,h:P,d:P});
  M.boxes.push({type:'lintel',x:0,y:H-P,z:0,w:W,h:P,d:P});
  if(S.rearFrame){
    M.boxes.push({type:'lintel',x:0,y:0,z:D-P,w:W,h:P,d:P});
    M.boxes.push({type:'lintel',x:0,y:H-P,z:D-P,w:W,h:P,d:P});
  }

  // Supports
  const addSupport=(where, opts={})=>{
    const on = opts.on ?? (where==='top'? S.topSupport : S.bottomSupport); if(!on) return;
    const orient= opts.orient ?? (where==='top'? S.topOrient : S.bottomOrient);
    const size  = opts.size  ?? (where==='top'? mm(S.topSize) : mm(S.bottomSize));
    const yPos  = opts.yPos  ?? (where==='top'
      ? clamp(P + mm(S.topDrop), P, H-2*P)
      : clamp(H - 2*P - mm(S.bottomLift), P, H-2*P));
    if(orient==='X'){
      const zMid=(D-size)/2; M.boxes.push({type:'support',x:0,y:yPos,z:zMid,w:W,h:P,d:size});
    }else{
      const xMid=(W-size)/2; M.boxes.push({type:'support',x:xMid,y:yPos,z:0,w:size,h:P,d:D-P});
    }
  };
  addSupport('top');
  addSupport('bottom');
  if(S.extraBottomBeam) addSupport('bottom', {orient:S.extraBottomOrient, yPos:clamp(H - 2*P - mm(S.extraBottomLift), P, H-2*P)});

  // Rails and bins
  const rowsSource = Array.isArray(S.rows) ? S.rows : [];
  ch.forEach((c)=>{
    const xs=railXPositions(c,S);
    for(let idx=0; idx<L.length; idx++){
      const y=L[idx];
      let rowHeight=rowHeights[idx];
      if(!Number.isFinite(rowHeight)){
        const srcRow = rowsSource[idx];
        const fallbackHeight = srcRow && srcRow.height != null ? srcRow.height : S.binHeightDefault;
        rowHeight = mm(fallbackHeight);
      }
      const yOpenTop = y + rowHeight;
      const yRailTop = yOpenTop - binLip;
      const allowRails = (idx!==0 || S.bottomRowRails);
      if(allowRails){
        const yRail = yRailTop - P;
        xs.forEach(bx => M.boxes.push({type:'rail',x:bx,y:yRail,z:0,w:P,h:P,d:R}));
      }
      if(S.showBins && allowRails){
        const row=rowsSource[idx]||{};
        const slack = mm(S.binSlack);
        const bodyW=Math.min(mm(S.binBody), Math.max(0, c.w-2-slack));
        const overall= bodyW + 2*mm(S.binFlange) + slack;
        const bx=c.x + (c.w - overall)/2;
        const binH=mm( binHeightForRow(S, row) );
        const over=mm(row.overhang ?? 0);
        const gap=mm(row.gap ?? 0);
        const dHere = Math.max(0, D + over); // prevent negative bin depth
        const yTop = Math.max(0, y + P - binLip);
        M.boxes.push({type:'bin',x:bx,y:yTop,z:0,w:overall,h:binH,d:dHere,gap});
      }
    }
  });

  // Bounds
  const bMin=[Infinity,Infinity,Infinity];
  const bMax=[-Infinity,-Infinity,-Infinity];
  M.boxes.forEach(b=>{
    bMin[0]=Math.min(bMin[0], b.x);
    bMin[1]=Math.min(bMin[1], b.y);
    bMin[2]=Math.min(bMin[2], b.z);
    bMax[0]=Math.max(bMax[0], b.x + b.w);
    bMax[1]=Math.max(bMax[1], b.y + b.h);
    bMax[2]=Math.max(bMax[2], b.z + b.d);
  });
  M.bounds = {min:bMin, max:bMax};
  return M;
}
