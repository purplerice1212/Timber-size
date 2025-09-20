import {
  getState,
  subscribe,
  setHeight,
  setDepth,
  setPost,
  setPatternText,
  toggleRearFrame,
  toggleShowBins,
  toggleOverlays,
  setViewMode
} from './state.js';
import {buildModel} from './model.js';
import {renderFront} from './views/front.js';
import {renderSide} from './views/side.js';
import {renderPlan} from './views/plan.js';
import {render3d, init3dControls, reset3dCamera} from './views/view3d.js';

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

  subscribe(render);
  render();
}

window.addEventListener('DOMContentLoaded', init);
