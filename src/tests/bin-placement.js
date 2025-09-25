import {buildModel} from '../model.js';
import {getState} from '../state.js';
import {computeLevels} from '../utils/computeLevels.js';
import {mm} from '../utils/mm.js';

function buildRowTops(state){
  const levelData = computeLevels(state);
  const lipSource = state.binLipThick != null ? state.binLipThick : state.binLip;
  const binLip = mm(lipSource);
  const rowHeights = levelData.rows.map(r => r.heightMm ?? 0);
  const rowTops = [];
  levelData.levels.forEach((level, idx)=>{
    const allow = idx !== 0 || state.bottomRowRails;
    if(!allow) return;
    const height = rowHeights[idx] ?? 0;
    rowTops.push(level + height - binLip);
  });
  return rowTops;
}

export function testBinPlacement(){
  const results = [];
  const baseState = getState();
  const baseModel = buildModel(baseState);
  const bins = baseModel.boxes.filter(b=>b.type==='bin');
  const baseRowTops = buildRowTops(baseState);
  const perChannel = baseRowTops.length;
  const expectedTops = [];
  for(let c=0; c<baseModel.channels.length; c+=1){
    expectedTops.push(...baseRowTops);
  }
  const binTopAligned = bins.length === expectedTops.length && bins.every((bin, idx)=>{
    return Math.abs((bin.y + bin.h) - expectedTops[idx]) < 1e-6;
  });
  results.push({name:'bin top aligns with rails', pass:binTopAligned});

  const delta = 30;
  const customRows = Array.isArray(baseState.rows)
    ? baseState.rows.map((row, idx)=>{
        if(idx !== 1) return {...row};
        const nextHeight = Math.round(Number(row?.height ?? 0)) + delta;
        return {...row, height: nextHeight};
      })
    : [];
  const tallerState = {...baseState, rows: customRows};
  const tallerModel = buildModel(tallerState);
  const tallerRowTops = buildRowTops(tallerState);
  const baseTops = bins.map(bin => bin.y + bin.h);
  const tallerTops = tallerModel.boxes.filter(b=>b.type==='bin').map(bin => bin.y + bin.h);
  const perRowDiff = baseRowTops.map((top, idx)=> tallerRowTops[idx] - top);
  const binsMoveWithRows = baseTops.length === tallerTops.length && baseTops.every((top, idx)=>{
    if(perChannel === 0) return true;
    const rowIdx = idx % perChannel;
    const expectedDiff = perRowDiff[rowIdx] ?? 0;
    return Math.abs((tallerTops[idx] - top) - expectedDiff) < 1e-6;
  });
  results.push({name:'bin height responds to row height changes', pass:binsMoveWithRows});

  return results;
}
