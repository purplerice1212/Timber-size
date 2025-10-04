import {testParser} from './parser.js';
import {testClamp} from './clamp.js';
import {testCounts} from './counts.js';
import {testStateSetters} from './state-setters.js';
import {testExtraSupport, testSupportClearance} from './supports.js';
import {testMM} from './mm.js';
import {testLevels} from './levels.js';
import {testPinchZoom} from './pinch-zoom.js';
import {testBinSlack} from './bin-slack.js';
import {testBinPlacement} from './bin-placement.js';
import {testFitCanvasAlignment} from './fit-canvas.js';
import {testRowSizing} from './row-sizing.js';
import {testColors} from './colors.js';
import {fileURLToPath} from 'url';

export function runTests(){
  const results = [
    ...testParser(),
    ...testClamp(),
    ...testCounts(),
    ...testStateSetters(),
    ...testExtraSupport(),
    ...testSupportClearance(),
    ...testMM(),
    ...testLevels(),
    ...testPinchZoom(),
    ...testBinSlack(),
    ...testBinPlacement(),
    ...testFitCanvasAlignment(),
    ...testRowSizing(),
    ...testColors()
  ];
  if (typeof console !== 'undefined' && console.table) console.table(results);
  return results;
}

if (typeof window !== 'undefined') {
  window.runTests = runTests;
}

const isMain = typeof process !== 'undefined' && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) runTests();
