import {S} from './state.js';
import {buildModel} from './model.js';
import {renderFront} from './views/front.js';
import {renderSide} from './views/side.js';
import {renderPlan} from './views/plan.js';
import {render3d, bind3dControls} from './views/view3d.js';

function init() {
  const model = buildModel(S);
  const canvases = {
    front: document.getElementById('front'),
    side: document.getElementById('side'),
    plan: document.getElementById('plan'),
    three: document.getElementById('three')
  };
  let viewMode = 'quad';

  function renderAll() {
    renderFront(canvases.front, model);
    renderSide(canvases.side, model);
    renderPlan(canvases.plan, model);
    render3d(canvases.three, model);
  }

  function setView(mode) {
    viewMode = mode;
    document.body.classList.toggle('single', mode !== 'quad');
    Object.entries(canvases).forEach(([id, c]) => {
      c.classList.toggle('active', mode === 'quad' || id === mode);
    });
    renderAll();
  }

  Object.entries(canvases).forEach(([id, c]) => {
    c.addEventListener('click', () => {
      setView(viewMode === 'quad' ? id : 'quad');
    });
  });

  bind3dControls(canvases.three, renderAll);
  setView('quad');
}

window.addEventListener('DOMContentLoaded', init);
