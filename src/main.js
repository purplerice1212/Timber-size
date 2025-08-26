import {
  getState,
  subscribe,
  setWidth,
  setHeight,
  setDepth,
  setPost,
  setPattern,
  setFeature
} from './state.js';
import {buildModel} from './model.js';
import {renderFront} from './views/front.js';
import {renderSide} from './views/side.js';
import {renderPlan} from './views/plan.js';
import {render3d} from './views/view3d.js';

const canvases = {};

function renderAll() {
  const state = getState();
  const model = buildModel(state);

  canvases.front.style.display = state.features.front ? '' : 'none';
  canvases.side.style.display = state.features.side ? '' : 'none';
  canvases.plan.style.display = state.features.plan ? '' : 'none';
  canvases.three.style.display = state.features.three ? '' : 'none';

  if (state.features.front) {
    renderFront(canvases.front, model);
  }
  if (state.features.side) {
    renderSide(canvases.side, model);
  }
  if (state.features.plan) {
    renderPlan(canvases.plan, model);
  }
  if (state.features.three) {
    render3d(canvases.three, model);
  }
}

function init() {
  canvases.front = document.getElementById('front');
  canvases.side = document.getElementById('side');
  canvases.plan = document.getElementById('plan');
  canvases.three = document.getElementById('three');

  const state = getState();

  document.getElementById('width').value = state.width;
  document.getElementById('height').value = state.height;
  document.getElementById('depth').value = state.depth;
  document.getElementById('post').value = state.post;
  document.getElementById('pattern').value = state.pattern;
  document.getElementById('showFront').checked = state.features.front;
  document.getElementById('showSide').checked = state.features.side;
  document.getElementById('showPlan').checked = state.features.plan;
  document.getElementById('showThree').checked = state.features.three;

  document.getElementById('width').addEventListener('input', e => setWidth(e.target.value));
  document.getElementById('height').addEventListener('input', e => setHeight(e.target.value));
  document.getElementById('depth').addEventListener('input', e => setDepth(e.target.value));
  document.getElementById('post').addEventListener('input', e => setPost(e.target.value));
  document.getElementById('pattern').addEventListener('input', e => setPattern(e.target.value));
  document.getElementById('showFront').addEventListener('change', e => setFeature('front', e.target.checked));
  document.getElementById('showSide').addEventListener('change', e => setFeature('side', e.target.checked));
  document.getElementById('showPlan').addEventListener('change', e => setFeature('plan', e.target.checked));
  document.getElementById('showThree').addEventListener('change', e => setFeature('three', e.target.checked));

  subscribe(renderAll);
}

window.addEventListener('DOMContentLoaded', init);
