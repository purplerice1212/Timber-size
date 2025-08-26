import {S} from './state.js';
import {buildModel} from './model.js';
import {renderFront} from './views/front.js';
import {renderSide} from './views/side.js';
import {renderPlan} from './views/plan.js';
import {render3d} from './views/view3d.js';

function init() {
  const model = buildModel(S);
  const opts = {showDimensions: true, showOpenings: true};
  renderFront(document.getElementById('front'), model, opts);
  renderSide(document.getElementById('side'), model, opts);
  renderPlan(document.getElementById('plan'), model, opts);
  render3d(document.getElementById('three'), model, opts);
}

window.addEventListener('DOMContentLoaded', init);
