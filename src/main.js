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
import {render3d, init3dControls} from './views/view3d.js';
import './tests/index.js';

function render(){
  const model = buildModel(getState());
  const o = getState().showOverlays;
  renderFront(document.getElementById('front'), model, o);
  renderSide(document.getElementById('side'), model, o);
  renderPlan(document.getElementById('plan'), model, o);
  render3d(document.getElementById('three'), model, o);

  const vm = getState().viewMode;
  document.body.classList.toggle('single', vm !== 'quad');
  document.querySelectorAll('#views canvas').forEach(c=>{
    c.classList.toggle('active', vm === 'quad' ? true : c.id === vm);
  });
}

function init() {
  const s = getState();
  document.getElementById('height-input').value = s.height;
  document.getElementById('depth-input').value = s.depth;
  document.getElementById('post-input').value = s.post;
  document.getElementById('pattern-input').value = s.patternText;
  document.getElementById('rearFrame-toggle').checked = s.rearFrame;
  document.getElementById('showBins-toggle').checked = s.showBins;
  document.getElementById('overlay-toggle').checked = s.showOverlays;

  document.getElementById('height-input').addEventListener('input', e=>setHeight(e.target.value));
  document.getElementById('depth-input').addEventListener('input', e=>setDepth(e.target.value));
  document.getElementById('post-input').addEventListener('input', e=>setPost(e.target.value));
  document.getElementById('pattern-input').addEventListener('input', e=>setPatternText(e.target.value));
  document.getElementById('rearFrame-toggle').addEventListener('change', e=>toggleRearFrame(e.target.checked));
  document.getElementById('showBins-toggle').addEventListener('change', e=>toggleShowBins(e.target.checked));
  document.getElementById('overlay-toggle').addEventListener('change', e=>toggleOverlays(e.target.checked));

  document.querySelectorAll('#view-controls button').forEach(btn=>{
    btn.addEventListener('click', ()=>setViewMode(btn.dataset.view));
  });

  document.querySelectorAll('#views canvas').forEach(cvs=>{
    cvs.addEventListener('click', ()=>{
      const vm = getState().viewMode;
      setViewMode(vm === 'quad' ? cvs.id : 'quad');
    });
  });

  init3dControls(document.getElementById('three'));

  subscribe(render);
  render();
}

window.addEventListener('DOMContentLoaded', init);
