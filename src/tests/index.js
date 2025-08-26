import {parserTests} from './parser.test.js';
import {clampTests} from './clamp.test.js';
import {countTests} from './counts.test.js';
import {pathToFileURL} from 'url';

export function runTests() {
  const results = [...parserTests(), ...clampTests(), ...countTests()];
  results.forEach(t => console[t.pass ? 'log' : 'error'](`${t.pass ? '✓' : '✗'} ${t.name}`));
  return results;
}

if (typeof window !== 'undefined') {
  window.runTests = runTests;
}

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  runTests();
}
