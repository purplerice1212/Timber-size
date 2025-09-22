import {binHeightProfiles, CUSTOM_BIN_PROFILE_ID, findBinHeightProfile} from './data/binHeightProfiles.js';

const DEFAULT_ROW_HEIGHT = 120;
const DEFAULT_ROW_GAP = 10;
const FALLBACK_BIN_HEIGHT = 95;
const DEFAULT_BIN_PROFILE_ID = binHeightProfiles[0]?.id ?? CUSTOM_BIN_PROFILE_ID;
const DEFAULT_BIN_HEIGHT = sanitizeDimension(binHeightProfiles[0]?.height, FALLBACK_BIN_HEIGHT, 0);

function sanitizeDimension(value, fallback, min = 0){
  const candidate = Math.round(Number(value));
  if(Number.isFinite(candidate) && candidate >= min) return candidate;
  const fallbackCandidate = Math.round(Number(fallback));
  if(Number.isFinite(fallbackCandidate) && fallbackCandidate >= min) return fallbackCandidate;
  return min;
}

function sanitizeGap(value, fallback = 0){
  const numeric = Number(value);
  if(Number.isFinite(numeric)) return numeric;
  const fallbackValue = Number(fallback);
  return Number.isFinite(fallbackValue) ? fallbackValue : 0;
}

function sanitizeOverhang(value){
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function createRow(config = {}, defaults = {}){
  const {gapDefault = 0, binHeightDefault = DEFAULT_BIN_HEIGHT, binProfileDefault = DEFAULT_BIN_PROFILE_ID} = defaults;
  const height = sanitizeDimension(config.height, DEFAULT_ROW_HEIGHT, 1);
  const gap = sanitizeGap(config.gap, gapDefault);
  const overhang = sanitizeOverhang(config.overhang);
  let profile = typeof config.binProfile === 'string' ? config.binProfile : binProfileDefault;
  let profileData = profile !== CUSTOM_BIN_PROFILE_ID ? findBinHeightProfile(profile) : undefined;
  if(profile !== CUSTOM_BIN_PROFILE_ID && !profileData){
    profile = binProfileDefault;
    profileData = profile !== CUSTOM_BIN_PROFILE_ID ? findBinHeightProfile(profile) : undefined;
  }
  const binHeight = profile === CUSTOM_BIN_PROFILE_ID
    ? sanitizeDimension(config.binHeight, binHeightDefault, 0)
    : sanitizeDimension(profileData?.height, binHeightDefault, 0);

  return {
    height,
    gap,
    overhang,
    binHeight,
    binProfile: profile
  };
}

const initialRowDefaults = {
  gapDefault: DEFAULT_ROW_GAP,
  binHeightDefault: DEFAULT_BIN_HEIGHT,
  binProfileDefault: DEFAULT_BIN_PROFILE_ID
};

const state = {
  height: 926,
  autoHeight: true,
  depth: 420,
  runnerDepth: 420,
  post: 43,
  rearFrame: true,
  patternText: '43,283,43,43,283,43,43',
  rows: Array.from({length: 4}, () => createRow({height: 120, gap: DEFAULT_ROW_GAP, overhang: 0}, initialRowDefaults)),
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
  binHeightDefault:DEFAULT_BIN_HEIGHT,
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
  state.post = parseNumber(value, 0);
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

export function addRow(row = {height:120, gap:0, overhang:0}){
  const base = Array.isArray(state.rows) ? state.rows.slice() : [];
  const normalized = createRow(
    row && typeof row === 'object' ? row : {},
    {gapDefault: 0, binHeightDefault: state.binHeightDefault, binProfileDefault: DEFAULT_BIN_PROFILE_ID}
  );
  base.push(normalized);
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

export function setItemTargetHeight(value){
  const next = parseNumber(value, 0);
  if(state.itemTargetHeight === next) return;
  state.itemTargetHeight = next;
  notify();
}

export function setOpenClearTop(value){
  const next = parseNumber(value, 0);
  if(state.openClearTop === next) return;
  state.openClearTop = next;
  notify();
}

export function setOpenSightClear(value){
  const next = parseNumber(value, 0);
  if(state.openSightClear === next) return;
  state.openSightClear = next;
  notify();
}

export function setRailSafety(value){
  const next = parseNumber(value, 0);
  if(state.railSafety === next) return;
  state.railSafety = next;
  notify();
}

export function setRowBinHeight(index, value){
  if(!Array.isArray(state.rows)) return;
  const idx = Number(index);
  if(!Number.isInteger(idx) || idx < 0 || idx >= state.rows.length) return;
  const target = sanitizeDimension(value, state.binHeightDefault, 0);
  const current = state.rows[idx];
  if(current && current.binProfile === CUSTOM_BIN_PROFILE_ID && current.binHeight === target) return;
  const updated = state.rows.map((row, i)=>{
    if(i !== idx) return row;
    return {
      ...row,
      binProfile: CUSTOM_BIN_PROFILE_ID,
      binHeight: target
    };
  });
  state.rows = updated;
  notify();
}

export function setRowBinProfile(index, profileId){
  if(!Array.isArray(state.rows)) return;
  const idx = Number(index);
  if(!Number.isInteger(idx) || idx < 0 || idx >= state.rows.length) return;
  const current = state.rows[idx] || {};
  let profile = typeof profileId === 'string' ? profileId : CUSTOM_BIN_PROFILE_ID;
  let binHeight = current.binHeight;
  if(profile !== CUSTOM_BIN_PROFILE_ID){
    const preset = findBinHeightProfile(profile);
    if(preset){
      binHeight = sanitizeDimension(preset.height, state.binHeightDefault, 0);
    }else{
      profile = CUSTOM_BIN_PROFILE_ID;
      binHeight = sanitizeDimension(binHeight, state.binHeightDefault, 0);
    }
  }else{
    binHeight = sanitizeDimension(binHeight, state.binHeightDefault, 0);
  }

  if(current.binProfile === profile && current.binHeight === binHeight) return;

  const updated = state.rows.map((row, i)=>{
    if(i !== idx) return row;
    return {
      ...row,
      binProfile: profile,
      binHeight
    };
  });
  state.rows = updated;
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
