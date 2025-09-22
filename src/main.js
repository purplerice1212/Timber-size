import {
  getState,
  subscribe,
  setHeight,
  setDepth,
  setPost,
  setPatternText,
  setRowHeight,
  addRow,
  removeRow,
  setBottomRowRails,
  setRailMode,
  setBinLipThickness,
  toggleRearFrame,
  toggleShowBins,
  toggleOverlays,
  setViewMode,
  setItemTargetHeight,
  setOpenClearTop,
  setOpenSightClear,
  setRailSafety,
  setRowBinHeight,
  setRowBinProfile
} from './state.js';
import {buildModel} from './model.js';
import {renderFront} from './views/front.js';
import {renderSide} from './views/side.js';
import {renderPlan} from './views/plan.js';
import {render3d, init3dControls, reset3dCamera} from './views/view3d.js';
import {segments as stateSegments} from './utils/segments.js';
import {binHeightProfiles, CUSTOM_BIN_PROFILE_ID, findBinHeightProfile} from './data/binHeightProfiles.js';

function showRowOverflowWarning(){
  let banner=document.getElementById('rowoverflow-warning');
  if(!banner){
    banner=document.createElement('div');
    banner.id='rowoverflow-warning';
    banner.textContent='Too many rows specified for the available height.';
    Object.assign(banner.style,{
      background:'#c00',color:'#fff',padding:'8px',textAlign:'center'
    });
    document.body.prepend(banner);
  }
  banner.style.display='block';
  console.warn('Row overflow: some rows exceed available height');
}

function hideRowOverflowWarning(){
  const banner=document.getElementById('rowoverflow-warning');
  if(banner) banner.style.display='none';
}

let pendingDrawFrame = null;
let pendingDrawUsesTimeout = false;

function scheduleViewDrawing(callback){
  if(pendingDrawFrame!==null){
    if(pendingDrawUsesTimeout){
      clearTimeout(pendingDrawFrame);
    }else if(typeof cancelAnimationFrame==='function'){
      cancelAnimationFrame(pendingDrawFrame);
    }
    pendingDrawFrame=null;
  }

  if(typeof requestAnimationFrame==='function'){
    pendingDrawFrame=requestAnimationFrame(()=>{
      pendingDrawFrame=null;
      pendingDrawUsesTimeout=false;
      callback();
    });
    pendingDrawUsesTimeout=false;
  }else{
    pendingDrawFrame=setTimeout(()=>{
      pendingDrawFrame=null;
      pendingDrawUsesTimeout=false;
      callback();
    },0);
    pendingDrawUsesTimeout=true;
  }
}

const DEFAULT_COLUMN_WIDTH = 325;
const DEFAULT_ROW_HEIGHT = 120;
function toNumber(value){
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getRowProfileId(row){
  if(row && typeof row.binProfile === 'string'){
    if(row.binProfile === CUSTOM_BIN_PROFILE_ID) return CUSTOM_BIN_PROFILE_ID;
    const profile = findBinHeightProfile(row.binProfile);
    if(profile) return row.binProfile;
  }
  return CUSTOM_BIN_PROFILE_ID;
}

function getRowBinHeight(row, state){
  if(row){
    const custom = Math.round(Number(row.binHeight));
    if(Number.isFinite(custom) && custom >= 0) return custom;
    const profileId = typeof row.binProfile === 'string' ? row.binProfile : undefined;
    if(profileId && profileId !== CUSTOM_BIN_PROFILE_ID){
      const preset = findBinHeightProfile(profileId);
      if(preset && Number.isFinite(preset.height)) return Math.round(Number(preset.height));
    }
  }
  const fallback = Math.round(toNumber(state.binHeightDefault));
  return Number.isFinite(fallback) && fallback >= 0 ? fallback : 0;
}

function computeRowTarget(state, row){
  const binHeight = getRowBinHeight(row, state);
  const itemHeight = Math.round(toNumber(state.itemTargetHeight));
  const topClear = toNumber(state.openClearTop);
  const sightClear = toNumber(state.openSightClear);
  const safety = toNumber(state.railSafety);
  const base = Math.max(binHeight, itemHeight, 0);
  const total = base + topClear + sightClear + safety;
  if(!Number.isFinite(total)) return 0;
  return Math.max(0, Math.round(total));
}

function getColumnWidthsFromState(state){
  const seg = stateSegments(state);
  const widths = [];
  for(let i=1;i<seg.length;i+=2){
    const width = Math.round(Number(seg[i]));
    widths.push(Number.isFinite(width) && width>0 ? width : DEFAULT_COLUMN_WIDTH);
  }
  return widths.length ? widths : [DEFAULT_COLUMN_WIDTH];
}

function applyColumnWidths(widths){
  const state = getState();
  const sanitized = widths
    .map(v=>Math.round(Number(v)))
    .filter(v=>Number.isFinite(v) && v>0);
  const values = sanitized.length ? sanitized : [DEFAULT_COLUMN_WIDTH];
  const postRaw = Math.round(Number(state.post));
  const post = Number.isFinite(postRaw) && postRaw>0 ? postRaw : 1;
  const seg = [post];
  values.forEach(w=>{
    seg.push(w);
    seg.push(post);
  });
  const nextPattern = seg.join(', ');
  if(nextPattern === state.patternText) return;
  setPatternText(nextPattern);
}

function renderColumnsUI(state){
  const list = document.getElementById('columnsList');
  if(!list) return;
  list.innerHTML='';

  const widths = getColumnWidthsFromState(state);
  widths.forEach((w,i)=>{
    const wrap=document.createElement('div');
    wrap.className='row';
    const value = Math.round(Number(w));
    wrap.innerHTML=`
      <div class="ctl" style="width:160px">
        <span>Opening width (mm)</span>
        <input type="number" min="1" step="1" value="${Number.isFinite(value) && value>0 ? value : DEFAULT_COLUMN_WIDTH}" data-col="${i}">
      </div>`;
    list.appendChild(wrap);
  });

  list.querySelectorAll('input[type="number"]').forEach(inp=>{
    inp.addEventListener('input', ()=>{
      const idx=Number(inp.dataset.col);
      if(!Number.isInteger(idx) || idx<0) return;
      const val=Math.round(Number(inp.value));
      if(!Number.isFinite(val) || val<=0) return;
      const current=getColumnWidthsFromState(getState());
      if(idx>=current.length) return;
      if(current[idx]===val) return;
      const next=current.slice();
      next[idx]=val;
      applyColumnWidths(next);
    });
  });

  const add=document.getElementById('btnAddCol');
  if(add) add.onclick=()=>{
    const current=getColumnWidthsFromState(getState());
    const rawLast=current[current.length-1];
    const fallback=Number.isFinite(rawLast) && rawLast>0 ? rawLast : DEFAULT_COLUMN_WIDTH;
    const next=current.slice();
    next.push(Math.round(fallback));
    applyColumnWidths(next);
  };

  const rm=document.getElementById('btnRemoveCol');
  if(rm) rm.onclick=()=>{
    const current=getColumnWidthsFromState(getState());
    if(current.length<=1) return;
    applyColumnWidths(current.slice(0,-1));
  };
}

function renderRowsUI(state){
  const list=document.getElementById('rowsList');
  if(!list) return;
  list.innerHTML='';

  const rows=Array.isArray(state.rows)? state.rows : [];
  rows.forEach((row,i)=>{
    const heightValue=Math.round(Number(row && row.height));
    const safe=Number.isFinite(heightValue) && heightValue>0 ? heightValue : DEFAULT_ROW_HEIGHT;
    const wrap=document.createElement('div');
    wrap.className='row row-stack';

    const heightCtl=document.createElement('div');
    heightCtl.className='ctl';
    heightCtl.style.width='160px';
    const heightLabel=document.createElement('span');
    heightLabel.textContent='Row height (mm)';
    const heightInput=document.createElement('input');
    heightInput.type='number';
    heightInput.min='1';
    heightInput.step='1';
    heightInput.value=safe;
    heightCtl.appendChild(heightLabel);
    heightCtl.appendChild(heightInput);
    wrap.appendChild(heightCtl);

    heightInput.addEventListener('input', ()=>{
      const val=Math.round(Number(heightInput.value));
      if(!Number.isFinite(val) || val<=0) return;
      setRowHeight(i, val);
    });

    const targetCtl=document.createElement('div');
    targetCtl.className='ctl';
    const targetLabel=document.createElement('span');
    targetLabel.textContent='Target height (mm)';
    const targetRow=document.createElement('div');
    targetRow.className='row';
    targetRow.style.alignItems='center';
    targetRow.style.gap='.5rem';
    const targetValue=document.createElement('strong');
    const target=computeRowTarget(state, row);
    targetValue.textContent=`${target} mm`;
    const applyBtn=document.createElement('button');
    applyBtn.type='button';
    applyBtn.className='pill';
    applyBtn.textContent='Apply';
    const currentHeight=Number.isFinite(heightValue)?heightValue:NaN;
    const disableApply=!Number.isFinite(target) || target<=0 || (Number.isFinite(currentHeight) && currentHeight===target);
    applyBtn.disabled=disableApply;
    applyBtn.addEventListener('click', ()=>{
      if(applyBtn.disabled) return;
      setRowHeight(i, target);
    });
    targetRow.appendChild(targetValue);
    targetRow.appendChild(applyBtn);
    targetCtl.appendChild(targetLabel);
    targetCtl.appendChild(targetRow);
    wrap.appendChild(targetCtl);

    const profileRow=document.createElement('div');
    profileRow.className='row';
    profileRow.style.flexWrap='wrap';
    profileRow.style.gap='.5rem';

    const profileCtl=document.createElement('div');
    profileCtl.className='ctl';
    profileCtl.style.width='220px';
    const profileLabel=document.createElement('span');
    profileLabel.textContent='Bin model';
    const profileSelect=document.createElement('select');
    const selectedProfile=getRowProfileId(row);
    const options=[...binHeightProfiles.map(p=>({value:p.id,label:p.label})), {value:CUSTOM_BIN_PROFILE_ID,label:'Custom'}];
    options.forEach(opt=>{
      const option=document.createElement('option');
      option.value=opt.value;
      option.textContent=opt.label;
      if(opt.value===selectedProfile) option.selected=true;
      profileSelect.appendChild(option);
    });
    profileCtl.appendChild(profileLabel);
    profileCtl.appendChild(profileSelect);
    profileRow.appendChild(profileCtl);

    const binHeightCtl=document.createElement('div');
    binHeightCtl.className='ctl';
    binHeightCtl.style.width='160px';
    const binHeightLabel=document.createElement('span');
    binHeightLabel.textContent='Bin height (mm)';
    const binHeightInput=document.createElement('input');
    binHeightInput.type='number';
    binHeightInput.min='0';
    binHeightInput.step='1';
    const binHeightValue=getRowBinHeight(row, state);
    binHeightInput.value=binHeightValue;
    const isCustom=selectedProfile===CUSTOM_BIN_PROFILE_ID;
    binHeightInput.disabled=!isCustom;
    binHeightCtl.appendChild(binHeightLabel);
    binHeightCtl.appendChild(binHeightInput);
    profileRow.appendChild(binHeightCtl);

    wrap.appendChild(profileRow);
    list.appendChild(wrap);

    profileSelect.addEventListener('change', ()=>{
      setRowBinProfile(i, profileSelect.value);
    });

    binHeightInput.addEventListener('input', ()=>{
      if(binHeightInput.value==='') return;
      const val=Number(binHeightInput.value);
      if(!Number.isFinite(val) || val<0) return;
      setRowBinHeight(i, val);
    });
  });

  const add=document.getElementById('btnAddRow');
  if(add) add.onclick=()=>addRow();
  const rm=document.getElementById('btnRemoveRow');
  if(rm) rm.onclick=()=>removeRow();
}

function bindRailsAndBins(state){
  const twoRails=document.getElementById('twoRails');
  if(twoRails){
    const mode=state.railMode;
    const isDual=mode ? !(mode==='centered' || mode==='single' || mode==='center') : !!state.twoRailsPerOpening;
    if(twoRails.checked !== isDual) twoRails.checked = isDual;
    twoRails.onchange=()=>setRailMode(twoRails.checked ? 'dual' : 'single');
  }

  const brRails=document.getElementById('bottomRowRails');
  if(brRails){
    const checked=Boolean(state.bottomRowRails);
    if(brRails.checked !== checked) brRails.checked = checked;
    brRails.onchange=()=>setBottomRowRails(brRails.checked);
  }

  const showBinsCtl=document.getElementById('showBinsCtl');
  if(showBinsCtl){
    const show=Boolean(state.showBins);
    if(showBinsCtl.checked !== show) showBinsCtl.checked = show;
    showBinsCtl.onchange=()=>toggleShowBins(showBinsCtl.checked);
  }

  const lip=document.getElementById('binLipThick');
  if(lip){
    const lipValue = state.binLipThick != null ? state.binLipThick : state.binLip;
    if(lipValue != null && lip.value !== String(lipValue)){
      lip.value = lipValue;
    }
    lip.oninput=()=>{
      const v=Number(lip.value);
      if(!Number.isFinite(v) || v<0) return;
      setBinLipThickness(v);
    };
  }
}

function updateAuxControls(state){
  renderColumnsUI(state);
  renderRowsUI(state);
  bindRailsAndBins(state);

  const itemTargetInput=document.getElementById('itemTargetHeight');
  if(itemTargetInput){
    const val = state.itemTargetHeight ?? '';
    const str = val === '' ? '' : String(val);
    if(itemTargetInput.value !== str) itemTargetInput.value = str;
  }

  const topClearInput=document.getElementById('openClearTop');
  if(topClearInput){
    const val = state.openClearTop ?? '';
    const str = val === '' ? '' : String(val);
    if(topClearInput.value !== str) topClearInput.value = str;
  }

  const sightClearInput=document.getElementById('openSightClear');
  if(sightClearInput){
    const val = state.openSightClear ?? '';
    const str = val === '' ? '' : String(val);
    if(sightClearInput.value !== str) sightClearInput.value = str;
  }

  const railSafetyInput=document.getElementById('railSafety');
  if(railSafetyInput){
    const val = state.railSafety ?? '';
    const str = val === '' ? '' : String(val);
    if(railSafetyInput.value !== str) railSafetyInput.value = str;
  }

  const patternInput=document.getElementById('pattern-input');
  if(patternInput){
    const text=state.patternText ?? '';
    if(patternInput.value !== text) patternInput.value = text;
  }

  const legacyShowBins=document.getElementById('showBins-toggle');
  if(legacyShowBins){
    const checked=Boolean(state.showBins);
    if(legacyShowBins.checked !== checked) legacyShowBins.checked = checked;
  }
}

function render(){
  const state = getState();
  const model = buildModel(state);
  if(model.rowOverflow){
    // Show the warning banner but continue rendering with the
    // clamped levels provided by the model.
    showRowOverflowWarning();
  }else{
    hideRowOverflowWarning();
  }

  const vm = state.viewMode;
  document.body.classList.toggle('single', vm !== 'quad');
  const viewsRoot = document.getElementById('views');
  if (!viewsRoot) {
    console.warn('Element #views not found. Skipping view visibility updates.');
  } else {
    const viewPanels = viewsRoot.querySelectorAll('.view');
    if (viewPanels.length === 0) {
      console.warn('No .view containers found under #views.');
    } else {
      viewPanels.forEach(panel=>{
        const canvas = panel.querySelector('canvas');
        const panelView = panel.dataset.view || (canvas && canvas.id);
        const isActive = vm === 'quad' ? true : panelView === vm;
        panel.classList.toggle('active', Boolean(isActive));
        if (canvas) {
          canvas.classList.toggle('active', Boolean(isActive));
        }
      });
    }
  }

  const viewButtons = document.querySelectorAll('.toolbar .seg[data-view]');
  viewButtons.forEach(btn=>{
    const isActive = btn.dataset.view === vm;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  const toggleQuad3DButton = document.getElementById('toggleQuad3D');
  if (toggleQuad3DButton) {
    const isThreeDee = vm === 'three';
    toggleQuad3DButton.setAttribute('aria-pressed', String(isThreeDee));
  }

  const overlays = state.showOverlays;
  const viewSpecs = [
    {id:'front', mode:'front', renderer:renderFront},
    {id:'side', mode:'side', renderer:renderSide},
    {id:'plan', mode:'plan', renderer:renderPlan},
    {id:'three', mode:'three', renderer:render3d}
  ];
  let retryCount = 0;
  const maxRetries = 5;

  const drawViews = ()=>{
    const pending = [];

    viewSpecs.forEach(({id, mode, renderer})=>{
      const shouldDraw = vm === 'quad' || vm === mode;
      if(!shouldDraw) return;

      const canvas = document.getElementById(id);
      if(!canvas){
        console.warn(`Element #${id} not found. Skipping ${renderer.name || 'renderer'}.`);
        return;
      }

      if(canvas.clientWidth===0 || canvas.clientHeight===0){
        pending.push(`#${id}`);
        return;
      }

      renderer(canvas, model, overlays);
    });

    if(pending.length>0){
      if(retryCount<maxRetries){
        retryCount+=1;
        scheduleViewDrawing(drawViews);
      }else{
        console.warn(`Skipping render for zero-sized canvas${pending.length>1?'es':''}: ${pending.join(', ')}.`);
      }
    }else{
      retryCount=0;
    }
  };

  scheduleViewDrawing(drawViews);
}

function init() {
  const s = getState();
  const heightInput = document.getElementById('height-input');
  if (heightInput) {
    heightInput.value = s.height;
    heightInput.addEventListener('input', e=>setHeight(e.target.value));
  } else {
    console.warn('#height-input not found. Skipping height input setup.');
  }

  const depthInput = document.getElementById('depth-input');
  if (depthInput) {
    depthInput.value = s.depth;
    depthInput.addEventListener('input', e=>setDepth(e.target.value));
  } else {
    console.warn('#depth-input not found. Skipping depth input setup.');
  }

  const postInput = document.getElementById('post-input');
  if (postInput) {
    postInput.value = s.post;
    postInput.addEventListener('input', e=>setPost(e.target.value));
  } else {
    console.warn('#post-input not found. Skipping post input setup.');
  }

  const patternInput = document.getElementById('pattern-input');
  if (patternInput) {
    patternInput.value = s.patternText;
    patternInput.addEventListener('input', e=>setPatternText(e.target.value));
  } else {
    console.warn('#pattern-input not found. Skipping pattern input setup.');
  }

  const rearFrameToggle = document.getElementById('rearFrame-toggle');
  if (rearFrameToggle) {
    rearFrameToggle.checked = s.rearFrame;
    rearFrameToggle.addEventListener('change', e=>toggleRearFrame(e.target.checked));
  } else {
    console.warn('#rearFrame-toggle not found. Skipping rear frame toggle setup.');
  }

  const showBinsToggle = document.getElementById('showBins-toggle');
  if (showBinsToggle) {
    showBinsToggle.checked = s.showBins;
    showBinsToggle.addEventListener('change', e=>toggleShowBins(e.target.checked));
  } else {
    console.warn('#showBins-toggle not found. Skipping show bins toggle setup.');
  }

  const overlayToggle = document.getElementById('overlay-toggle');
  if (overlayToggle) {
    overlayToggle.checked = s.showOverlays;
    overlayToggle.addEventListener('change', e=>toggleOverlays(e.target.checked));
  } else {
    console.warn('#overlay-toggle not found. Skipping overlay toggle setup.');
  }

  const itemTargetInput = document.getElementById('itemTargetHeight');
  if(itemTargetInput){
    itemTargetInput.value = s.itemTargetHeight ?? '';
    itemTargetInput.addEventListener('input', e=>setItemTargetHeight(e.target.value));
  }else{
    console.warn('#itemTargetHeight not found. Skipping item target input setup.');
  }

  const topClearInput = document.getElementById('openClearTop');
  if(topClearInput){
    topClearInput.value = s.openClearTop ?? '';
    topClearInput.addEventListener('input', e=>setOpenClearTop(e.target.value));
  }else{
    console.warn('#openClearTop not found. Skipping top clearance input setup.');
  }

  const sightClearInput = document.getElementById('openSightClear');
  if(sightClearInput){
    sightClearInput.value = s.openSightClear ?? '';
    sightClearInput.addEventListener('input', e=>setOpenSightClear(e.target.value));
  }else{
    console.warn('#openSightClear not found. Skipping sight clearance input setup.');
  }

  const railSafetyInput = document.getElementById('railSafety');
  if(railSafetyInput){
    railSafetyInput.value = s.railSafety ?? '';
    railSafetyInput.addEventListener('input', e=>setRailSafety(e.target.value));
  }else{
    console.warn('#railSafety not found. Skipping rail safety input setup.');
  }

  const viewButtons = document.querySelectorAll('.toolbar .seg[data-view]');
  if (viewButtons.length === 0) {
    console.warn('No segmented view buttons found.');
  } else {
    viewButtons.forEach(btn=>{
      btn.addEventListener('click', ()=>setViewMode(btn.dataset.view));
    });
  }

  const toggleQuad3DButton = document.getElementById('toggleQuad3D');
  if (toggleQuad3DButton) {
    toggleQuad3DButton.addEventListener('click', ()=>{
      const vm = getState().viewMode;
      setViewMode(vm === 'three' ? 'quad' : 'three');
    });
  } else {
    console.warn('#toggleQuad3D not found. Skipping Quad ⇄ 3D toggle setup.');
  }

  const cutListPanel = document.getElementById('cutListPanel');
  const toggleCutListButton = document.getElementById('toggleCutList');
  const closeCutListButton = document.getElementById('closeCutList');

  const setCutListOpen = open=>{
    if (!cutListPanel) {
      console.warn('#cutListPanel not found. Cannot toggle cut list panel.');
      return;
    }
    if (open) {
      cutListPanel.removeAttribute('hidden');
    } else {
      cutListPanel.setAttribute('hidden', '');
    }
    if (toggleCutListButton) {
      toggleCutListButton.setAttribute('aria-expanded', String(open));
    }
  };

  if (toggleCutListButton) {
    const isOpen = Boolean(cutListPanel && !cutListPanel.hasAttribute('hidden'));
    toggleCutListButton.setAttribute('aria-expanded', String(isOpen));
    toggleCutListButton.addEventListener('click', ()=>{
      if (!cutListPanel) {
        console.warn('#cutListPanel not found. Cannot toggle cut list panel.');
        return;
      }
      const shouldOpen = cutListPanel.hasAttribute('hidden');
      setCutListOpen(shouldOpen);
    });
  } else {
    console.warn('#toggleCutList not found. Skipping cut list toggle setup.');
  }

  if (closeCutListButton) {
    closeCutListButton.addEventListener('click', ()=>setCutListOpen(false));
  } else if (cutListPanel) {
    console.warn('#closeCutList not found. Cut list panel can only be toggled via main button.');
  }

  const viewsRoot = document.getElementById('views');
  if (!viewsRoot) {
    console.warn('Element #views not found. Skipping canvas event binding.');
  } else {
    const canvases = viewsRoot.querySelectorAll('canvas');
    if (canvases.length === 0) {
      console.warn('No canvases found under #views.');
    } else {
      canvases.forEach(cvs=>{
        cvs.addEventListener('click', ()=>{
          const vm = getState().viewMode;
          setViewMode(vm === 'quad' ? cvs.id : 'quad');
        });
      });
    }
  }

  const threeEl = document.getElementById('three');
  if (threeEl) {
    init3dControls(threeEl);
  } else {
    console.warn('Element #three not found. Skipping 3D controls initialization.');
  }

  const fitThreeButtons = document.querySelectorAll('[data-fit="three"]');
  if (fitThreeButtons.length > 0) {
    fitThreeButtons.forEach(btn => {
      btn.addEventListener('click', () => reset3dCamera());
    });
  } else {
    const legacyFitButton = document.getElementById('fit-three');
    if (legacyFitButton) {
      legacyFitButton.addEventListener('click', () => reset3dCamera());
    } else {
      console.warn('No 3D fit view buttons found. Skipping 3D fit button wiring.');
    }
  }

  subscribe(updateAuxControls);
  subscribe(render);
  updateAuxControls(getState());
  render();
}

window.addEventListener('DOMContentLoaded', init);
