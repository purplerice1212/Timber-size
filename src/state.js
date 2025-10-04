import {
  DEFAULT_POST_MM,
  DEFAULT_ROW_HEIGHT_MM,
  DEFAULT_PATTERN_TEXT
} from './config/defaults.js';

const INITIAL_ROW_TEMPLATE = {height: DEFAULT_ROW_HEIGHT_MM, gap: 10, overhang: 0};

const state = {
  height: 926,
  autoHeight: true,
  depth: 420,
  runnerDepth: 420,
  post: DEFAULT_POST_MM,
  rearFrame: true,
  patternText: DEFAULT_PATTERN_TEXT,
  rows: Array.from({length: 4}, () => ({...INITIAL_ROW_TEMPLATE})),
  topClear:10,
  bottomClear:10,
  bottomRowRails:false, // default: no base rails (Trofast rule)
  railMode:'edges',
  twoRailsPerOpening:true,
  topSupport:true,
  topOrient:'X',
  topDrop:0,
  topSize:43,
  bottomSupport:true,
  bottomOrient:'X',
  bottomLift:8,
  bottomSize:43,
  extraBottomBeam:false,
  extraBottomOrient:'X',
  extraBottomLift:8,
  binBody:283,
  binFlange:9.5,
  binLip:9,
  binLipThick:9,
  binSlack:6,
  binHeightDefault:95,
  binHeightProfiles:[],
  itemTargetHeight:0,
  openClearTop:0,
  openSightClear:0,
  railSafety:0,
  showBins:true,
  showOverlays:false,

  // view / camera state
  viewMode:'quad', // 'quad' | 'three' | 'plan' | 'front' | 'side'
  yaw:0.5,
  pitch:0.3,
  zoom:1
};

const listeners = new Set();

function notify(){
  for(const fn of listeners) fn(state);
}

function parseNumber(value, min = 0){
  const num = Number(value);
  return Number.isFinite(num) && num >= min ? num : min;
}

export function getState(){
  return state;
}

export function subscribe(fn){
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setHeight(value){
  state.height = parseNumber(value, 0);
  state.autoHeight = false;
  notify();
}

export function setDepth(value){
  state.depth = parseNumber(value, 0);
  notify();
}

export function setPost(value){
  const raw = parseNumber(value, 0);
  state.post = raw > 0 ? raw : DEFAULT_POST_MM;
  notify();
}

export function setBottomClear(value){
  const parsed = parseNumber(value, 0);
  const next = Math.max(0, Math.round(parsed));
  if(state.bottomClear === next) return;
  state.bottomClear = next;
  notify();
}

export function setPatternText(value){
  state.patternText = value;
  notify();
}

export function setRowHeight(index, value){
  if(!Array.isArray(state.rows)) return;
  const idx = Number(index);
  if(!Number.isInteger(idx) || idx < 0 || idx >= state.rows.length) return;
  const next = Math.round(Number(value));
  if(!Number.isFinite(next) || next <= 0) return;
  const current = state.rows[idx];
  if(current && Math.round(Number(current.height)) === next) return;
  const updated = state.rows.map((row, i)=> i===idx ? {...row, height: next} : row);
  state.rows = updated;
  notify();
}

export function updateRow(index, patch){
  if(!Array.isArray(state.rows)) return;
  const idx = Number(index);
  if(!Number.isInteger(idx) || idx < 0 || idx >= state.rows.length) return;
  if(!patch || typeof patch !== 'object') return;
  const current = state.rows[idx] || {};
  const nextRow = {...current};
  let changed = false;

  for (const [key, value] of Object.entries(patch)){
    if(value === undefined){
      if(key in nextRow){
        if(nextRow[key] !== undefined){
          changed = true;
        }
        delete nextRow[key];
      } else if(current[key] !== undefined){
        changed = true;
      }
    }else if(nextRow[key] !== value){
      nextRow[key] = value;
      changed = true;
    }
  }

  if(!changed) return;
  state.rows = state.rows.map((row, i)=> i===idx ? nextRow : row);
  notify();
}

export function addRow(row = {height:DEFAULT_ROW_HEIGHT_MM, gap:0, overhang:0}){
  const base = Array.isArray(state.rows) ? state.rows.slice() : [];
  const rawHeight = Number(row.height);
  const rawGap = Number(row.gap);
  const rawOverhang = Number(row.overhang);
  const template = {
    height: Number.isFinite(rawHeight) && Math.round(rawHeight) > 0 ? Math.round(rawHeight) : DEFAULT_ROW_HEIGHT_MM,
    gap: Number.isFinite(rawGap) ? rawGap : 0,
    overhang: Number.isFinite(rawOverhang) ? rawOverhang : 0
  };
  base.push(template);
  state.rows = base;
  notify();
}

export function removeRow(){
  if(!Array.isArray(state.rows) || state.rows.length <= 1) return;
  state.rows = state.rows.slice(0, -1);
  notify();
}

export function setBottomRowRails(value){
  const next = Boolean(value);
  if(state.bottomRowRails === next) return;
  state.bottomRowRails = next;
  notify();
}

export function setRailMode(mode){
  if(typeof mode !== 'string') return;
  let normalized = mode;
  if(mode === 'dual') normalized = 'edges';
  else if(mode === 'single' || mode === 'center') normalized = 'centered';
  if(!normalized) return;
  const isDual = normalized !== 'centered';
  if(state.railMode === normalized && state.twoRailsPerOpening === isDual) return;
  state.railMode = normalized;
  state.twoRailsPerOpening = isDual;
  notify();
}

export function setBinLipThickness(value){
  const lip = Number(value);
  if(!Number.isFinite(lip) || lip < 0) return;
  if(state.binLipThick === lip && state.binLip === lip) return;
  state.binLipThick = lip;
  state.binLip = lip;
  notify();
}

export function toggleRearFrame(value){
  state.rearFrame = value;
  notify();
}

export function toggleShowBins(value){
  state.showBins = value;
  notify();
}

export function toggleOverlays(value){
  state.showOverlays = value;
  notify();
}

export function setItemTargetHeight(value){
  const next = Math.round(Number(value));
  if(!Number.isFinite(next) || next < 0) return;
  if(state.itemTargetHeight === next) return;
  state.itemTargetHeight = next;
  notify();
}

export function setOpenClearTop(value){
  const next = Math.round(Number(value));
  if(!Number.isFinite(next) || next < 0) return;
  if(state.openClearTop === next) return;
  state.openClearTop = next;
  notify();
}

export function setOpenSightClear(value){
  const next = Math.round(Number(value));
  if(!Number.isFinite(next) || next < 0) return;
  if(state.openSightClear === next) return;
  state.openSightClear = next;
  notify();
}

export function setRailSafety(value){
  const next = Math.round(Number(value));
  if(!Number.isFinite(next) || next < 0) return;
  if(state.railSafety === next) return;
  state.railSafety = next;
  notify();
}

export function setViewMode(mode){
  state.viewMode = mode;
  notify();
}

export function setCamera({yaw=state.yaw, pitch=state.pitch, zoom=state.zoom}, notifyChange=true){
  const y = Number(yaw);
  state.yaw = Number.isFinite(y) ? y : state.yaw;
  const p = Number(pitch);
  state.pitch = Number.isFinite(p) ? p : state.pitch;
  state.zoom = parseNumber(zoom, 0);
  if(notifyChange) notify();
}
