import {
  getState,
  subscribe,
  setHeight,
  setDepth,
  setPost,
  setPatternText,
  setRowHeight,
  updateRow,
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
  setRailSafety
} from './state.js';
import {buildModel} from './model.js';
import {renderFront} from './views/front.js';
import {renderSide} from './views/side.js';
import {renderPlan} from './views/plan.js';
import {render3d, init3dControls, reset3dCamera} from './views/view3d.js';
import {segments as stateSegments} from './utils/segments.js';
import {
  describeRowSizing,
  parseNonNegativeMmInput,
  parsePositiveMmInput,
  resolveClearancesMm
} from './utils/rowSizing.js';

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
  const list = document.getElementById('rowsList');
  if (!list) return;
  list.innerHTML = '';

  const rows = Array.isArray(state.rows) && state.rows.length ? state.rows : [{height:DEFAULT_ROW_HEIGHT, gap:0, overhang:0}];
  const clearances = resolveClearancesMm(state);

  rows.forEach((r, i)=>{
    const wrap = document.createElement('div');
    wrap.className = 'row';
    const sizing = describeRowSizing(state, r || {}, DEFAULT_ROW_HEIGHT);
    const sanitizedHeight = sizing.heightMm;
    const profs = Array.isArray(state.binHeightProfiles) ? state.binHeightProfiles : [];
    const hasCustom = sizing.customBinHeightMm !== undefined;
    const selValue = hasCustom ? 'custom' : (sizing.binProfileIndex != null ? String(sizing.binProfileIndex) : '');
    const target = sizing.targetHeightMm;
    const isTargetApplied = sanitizedHeight === target;
    const customValue = hasCustom && sizing.customBinHeightMm !== undefined ? sizing.customBinHeightMm : '';

    wrap.innerHTML = `
      <div class="ctl" style="width:140px">
        <span>Row height (mm)</span>
        <input type="number" min="1" step="1" value="${sanitizedHeight}" data-row="${i}">
      </div>

      <div class="ctl" style="width:160px">
        <span>Bin profile</span>
        <select data-pro="${i}">
          <option value="">(Default)</option>
          ${profs.map((p,idx)=>`<option value="${idx}" ${selValue===String(idx)?'selected':''}>${p.name} (${Math.round(Number(p.height)||0)}mm)</option>`).join('')}
          <option value="custom" ${selValue==='custom'?'selected':''}>Custom…</option>
        </select>
      </div>

      <div class="ctl" style="width:140px; ${selValue==='custom'?'':'display:none'}" data-custom="${i}">
        <span>Bin height (mm)</span>
        <input type="number" min="1" step="1" value="${customValue}">
      </div>

      <div class="ctl" style="width:auto;min-width:200px">
        <span>Target suggestion</span>
        <div class="row">
          <b>${target}</b><span class="dim"> mm</span>
          <button class="pill" type="button" data-apply="${i}" ${isTargetApplied ? 'disabled' : ''}>${isTargetApplied ? 'Applied' : 'Apply'}</button>
        </div>
      </div>
    `;

    list.appendChild(wrap);
  });

  list.querySelectorAll('input[type="number"][data-row]').forEach(inp=>{
    inp.oninput = ()=>{
      const idx = Number(inp.dataset.row);
      if(!Number.isInteger(idx) || idx < 0) return;
      const parsed = parsePositiveMmInput(inp.value);
      if(parsed == null) return;
      setRowHeight(idx, parsed);
    };
  });

  list.querySelectorAll('select[data-pro]').forEach(sel=>{
    sel.onchange = ()=>{
      const idx = Number(sel.dataset.pro);
      if(!Number.isInteger(idx) || idx < 0) return;
      const val = sel.value;
      const current = getState();
      const row = Array.isArray(current.rows) ? current.rows[idx] : undefined;
      if(!row) return;
      const sizing = describeRowSizing(current, row || {}, DEFAULT_ROW_HEIGHT);
      if(val === 'custom'){
        const fallback = sizing.customBinHeightMm ?? sizing.binHeightMm;
        updateRow(idx, {binProfileIndex: undefined, binHeight: Math.max(1, fallback)});
        const box = list.querySelector(`[data-custom="${idx}"]`);
        if(box) box.style.display = '';
      }else if(val === ''){
        updateRow(idx, {binProfileIndex: undefined, binHeight: undefined});
        const box = list.querySelector(`[data-custom="${idx}"]`);
        if(box) box.style.display = 'none';
      }else{
        updateRow(idx, {binProfileIndex: Number(val), binHeight: undefined});
        const box = list.querySelector(`[data-custom="${idx}"]`);
        if(box) box.style.display = 'none';
      }
    };
  });

  list.querySelectorAll('[data-custom] input[type="number"]').forEach(inp=>{
    inp.oninput = ()=>{
      const holder = inp.closest('[data-custom]');
      if(!holder) return;
      const idx = Number(holder.getAttribute('data-custom'));
      if(!Number.isInteger(idx) || idx < 0) return;
      const parsed = parsePositiveMmInput(inp.value);
      if(parsed == null) return;
      updateRow(idx, {binHeight: parsed, binProfileIndex: undefined});
    };
  });

  list.querySelectorAll('button[data-apply]').forEach(btn=>{
    btn.onclick = ()=>{
      const idx = Number(btn.dataset.apply);
      if(!Number.isInteger(idx) || idx < 0) return;
      const current = getState();
      const row = Array.isArray(current.rows) ? current.rows[idx] : undefined;
      if(!row) return;
      const sizing = describeRowSizing(current, row || {}, DEFAULT_ROW_HEIGHT);
      setRowHeight(idx, sizing.targetHeightMm);
    };
  });

  const item = document.getElementById('itemTargetHeight');
  if (item){
    const {itemTargetMm} = clearances;
    if (item.value !== String(itemTargetMm)) item.value = itemTargetMm;
    item.oninput = ()=>{
      const parsed = parseNonNegativeMmInput(item.value);
      if(parsed == null) return;
      setItemTargetHeight(parsed);
    };
  }

  const clearTop = document.getElementById('openClearTop');
  if (clearTop){
    const {openClearTopMm} = clearances;
    if (clearTop.value !== String(openClearTopMm)) clearTop.value = openClearTopMm;
    clearTop.oninput = ()=>{
      const parsed = parseNonNegativeMmInput(clearTop.value);
      if(parsed == null) return;
      setOpenClearTop(parsed);
    };
  }

  const sight = document.getElementById('openSightClear');
  if (sight){
    const {openSightClearMm} = clearances;
    if (sight.value !== String(openSightClearMm)) sight.value = openSightClearMm;
    sight.oninput = ()=>{
      const parsed = parseNonNegativeMmInput(sight.value);
      if(parsed == null) return;
      setOpenSightClear(parsed);
    };
  }

  const rs = document.getElementById('railSafety');
  if (rs){
    const {railSafetyMm} = clearances;
    if (rs.value !== String(railSafetyMm)) rs.value = railSafetyMm;
    rs.oninput = ()=>{
      const parsed = parseNonNegativeMmInput(rs.value);
      if(parsed == null) return;
      setRailSafety(parsed);
    };
  }

  const add = document.getElementById('btnAddRow');
  if (add) add.onclick = ()=>addRow();
  const rm = document.getElementById('btnRemoveRow');
  if (rm) rm.onclick = ()=>removeRow();
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
      // Canvas interactions now solely control the renderers (e.g. orbit, pan, zoom).
      // Layout changes should be triggered via the toolbar controls instead of clicks
      // directly on the viewports, so we intentionally do not wire up any view-mode
      // toggling handlers here.
    }
  }

  const scheduleResizeRender = ()=>scheduleViewDrawing(render);
  window.addEventListener('resize', scheduleResizeRender, {passive: true});
  if(viewsRoot && typeof ResizeObserver === 'function'){
    const resizeObserver = new ResizeObserver(()=>scheduleResizeRender());
    resizeObserver.observe(viewsRoot);
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
