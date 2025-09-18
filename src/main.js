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

function render(){
  const model = buildModel(getState());
  if(model.rowOverflow){
    // Show the warning banner but continue rendering with the
    // clamped levels provided by the model.
    showRowOverflowWarning();
  }else{
    hideRowOverflowWarning();
  }
  const o = getState().showOverlays;
  const frontEl = document.getElementById('front');
  if (frontEl) {
    renderFront(frontEl, model, o);
  } else {
    console.warn('Element #front not found. Skipping renderFront.');
  }
  const sideEl = document.getElementById('side');
  if (sideEl) {
    renderSide(sideEl, model, o);
  } else {
    console.warn('Element #side not found. Skipping renderSide.');
  }
  const planEl = document.getElementById('plan');
  if (planEl) {
    renderPlan(planEl, model, o);
  } else {
    console.warn('Element #plan not found. Skipping renderPlan.');
  }
  const threeEl = document.getElementById('three');
  if (threeEl) {
    render3d(threeEl, model, o);
  } else {
    console.warn('Element #three not found. Skipping render3d.');
  }

  const vm = getState().viewMode;
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

  const viewButtons = document.querySelectorAll('#view-controls button');
  if (viewButtons.length === 0) {
    console.warn('No buttons found under #view-controls.');
  } else {
    viewButtons.forEach(btn=>{
      btn.addEventListener('click', ()=>setViewMode(btn.dataset.view));
    });
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

  const fitThreeButton = document.getElementById('fit-three');
  if (fitThreeButton) {
    fitThreeButton.addEventListener('click', () => reset3dCamera());
  } else {
    console.warn('#fit-three not found. Skipping 3D fit button wiring.');
  }

  subscribe(render);
  render();
}

window.addEventListener('DOMContentLoaded', init);
