import {S} from './state.js';
import {buildModel} from './model.js';
import {renderFront} from './views/front.js';
import {renderSide} from './views/side.js';
import {renderPlan} from './views/plan.js';
import {render3d} from './views/view3d.js';
import './tests/index.js';

function init() {
  const model = buildModel(S);
  renderFront(document.getElementById('front'), model);
  renderSide(document.getElementById('side'), model);
  renderPlan(document.getElementById('plan'), model);
  render3d(document.getElementById('three'), model);
}

window.addEventListener('DOMContentLoaded', init);
