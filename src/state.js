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
  showBins:true
};

const listeners = new Set();

function notify(){
  for(const fn of listeners) fn(state);
}

export function getState(){
  return state;
}

export function subscribe(fn){
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setHeight(value){
  state.height = Number(value);
  state.autoHeight = false;
  notify();
}

export function setDepth(value){
  state.depth = Number(value);
  notify();
}

export function setPost(value){
  state.post = Number(value);
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
