const state = {
  height: 926,
  autoHeight: true,
  depth: 420,
  runnerDepth: 420,
  post: 43,
  rearFrame: true,
  patternText: '43,283,43,43,283,43,43',
  rows: [
    {height:120,gap:10,overhang:0},
    {height:120,gap:10,overhang:0},
    {height:120,gap:10,overhang:0},
    {height:120,gap:10,overhang:0}
  ],
  topClear:10,
  bottomClear:10,
  bottomRowRails:false,
  railMode:'edges',
  topSupport:true,
  topOrient:'X',
  topDrop:0,
  topSize:43,
  bottomSupport:true,
  bottomOrient:'X',
  bottomLift:8,
  bottomSize:43,
  extraBottomBeam:false,
  binBody:283,
  binFlange:9.5,
  binLip:9,
  binSlack:6,
  binHeightDefault:95,
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
  state.yaw = parseNumber(yaw, 0);
  state.pitch = parseNumber(pitch, 0);
  state.zoom = parseNumber(zoom, 0);
  if(notifyChange) notify();
}
