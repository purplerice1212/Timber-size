import {
  getState,
  subscribe,
  setHeight,
  setDepth,
  setPost,
  setPatternText,
  toggleRearFrame,
  toggleShowBins
} from './state.js';
import {buildModel} from './model.js';
import {renderFront} from './views/front.js';
import {renderSide} from './views/side.js';
import {renderPlan} from './views/plan.js';
import {render3d} from './views/view3d.js';
import './tests/index.js';

function render(){
  const model = buildModel(getState());
  renderFront(document.getElementById('front'), model);
  renderSide(document.getElementById('side'), model);
  renderPlan(document.getElementById('plan'), model);
  render3d(document.getElementById('three'), model);
}

function init() {
  const s = getState();
  document.getElementById('height-input').value = s.height;
  document.getElementById('depth-input').value = s.depth;
  document.getElementById('post-input').value = s.post;
  document.getElementById('pattern-input').value = s.patternText;
  document.getElementById('rearFrame-toggle').checked = s.rearFrame;
  document.getElementById('showBins-toggle').checked = s.showBins;

  document.getElementById('height-input').addEventListener('input', e=>setHeight(e.target.value));
  document.getElementById('depth-input').addEventListener('input', e=>setDepth(e.target.value));
  document.getElementById('post-input').addEventListener('input', e=>setPost(e.target.value));
  document.getElementById('pattern-input').addEventListener('input', e=>setPatternText(e.target.value));
  document.getElementById('rearFrame-toggle').addEventListener('change', e=>toggleRearFrame(e.target.checked));
  document.getElementById('showBins-toggle').addEventListener('change', e=>toggleShowBins(e.target.checked));

  subscribe(render);
  render();
}

window.addEventListener('DOMContentLoaded', init);
