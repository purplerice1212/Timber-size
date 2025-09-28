import {
  setHeight,
  setDepth,
  setPost,
  setCamera,
  getState,
  updateRow,
  addRow,
  removeRow,
  setBottomRowRails,
  setRailMode,
  setBinLipThickness,
  toggleRearFrame
} from '../state.js';
import {DEFAULT_POST_MM} from '../config/defaults.js';

export function testStateSetters(){
  const base = JSON.parse(JSON.stringify(getState()));
  const results = [];

  setHeight(-5);
  const heightNeg = getState().height === 0;
  setHeight('abc');
  const heightNaN = getState().height === 0;

  setDepth(-10);
  const depthNeg = getState().depth === 0;
  setDepth('foo');
  const depthNaN = getState().depth === 0;

  setPost(-1);
  const postNeg = getState().post === DEFAULT_POST_MM;
  setPost('bar');
  const postNaN = getState().post === DEFAULT_POST_MM;

  setCamera({yaw:-1, pitch:-0.5});
  const camNeg = getState().yaw === -1 && getState().pitch === -0.5;
  setCamera({yaw:'a', pitch:'b'});
  const camNaN = getState().yaw === -1 && getState().pitch === -0.5;

  // restore original state
  setHeight(base.height);
  setDepth(base.depth);
  setPost(base.post);
  setCamera({yaw:base.yaw, pitch:base.pitch, zoom:base.zoom});
  const state = getState();
  state.autoHeight = base.autoHeight;

  results.push(
    {name:'height negative clamps to 0', pass:heightNeg},
    {name:'height NaN clamps to 0', pass:heightNaN},
    {name:'depth negative clamps to 0', pass:depthNeg},
    {name:'depth NaN clamps to 0', pass:depthNaN},
    {name:'post negative resets to default', pass:postNeg},
    {name:'post NaN resets to default', pass:postNaN},
    {name:'camera allows negative yaw/pitch', pass:camNeg},
    {name:'camera ignores invalid yaw/pitch', pass:camNaN}
  );

  const baseRow = {...base.rows[1]};
  updateRow(1, {gap:25, overhang:5});
  const updatedRow = getState().rows[1];
  const updateRowMerge =
    updatedRow.height === baseRow.height &&
    updatedRow.gap === 25 &&
    updatedRow.overhang === 5;
  const rowsAfterUpdate = getState().rows;
  updateRow(1, null);
  const updateRowIgnoreInvalid = getState().rows === rowsAfterUpdate;

  const beforeAddLength = getState().rows.length;
  addRow({height:199.6, gap:'7', overhang:3});
  const afterAddRows = getState().rows;
  const addedRow = afterAddRows[afterAddRows.length - 1];
  const addRowSanitizes =
    afterAddRows.length === beforeAddLength + 1 &&
    addedRow.height === 200 &&
    addedRow.gap === 7 &&
    addedRow.overhang === 3;

  const beforeRemoveLength = getState().rows.length;
  removeRow();
  const removeRowTrims = getState().rows.length === beforeRemoveLength - 1;

  const bottomRailsStart = getState().bottomRowRails;
  setBottomRowRails('truthy');
  const bottomRailsTrue = getState().bottomRowRails === true;
  setBottomRowRails(0);
  const bottomRailsFalse = getState().bottomRowRails === false;

  const railModeBefore = getState().railMode;
  setRailMode('single');
  const railModeSingle =
    getState().railMode === 'centered' &&
    getState().twoRailsPerOpening === false;
  setRailMode('dual');
  const railModeDual =
    getState().railMode === 'edges' &&
    getState().twoRailsPerOpening === true;
  setRailMode(12);
  const railModeInvalid =
    getState().railMode === 'edges' &&
    getState().twoRailsPerOpening === true;

  setBinLipThickness(12);
  const lipUpdated = getState().binLipThick === 12 && getState().binLip === 12;
  setBinLipThickness(-1);
  const lipRejects = getState().binLipThick === 12 && getState().binLip === 12;

  const rearFrameStart = getState().rearFrame;
  toggleRearFrame(false);
  const rearFrameDisabled = getState().rearFrame === false;
  toggleRearFrame(true);
  const rearFrameEnabled = getState().rearFrame === true;

  results.push(
    {name:'updateRow merges changes into row', pass:updateRowMerge},
    {name:'updateRow ignores invalid patch', pass:updateRowIgnoreInvalid},
    {name:'addRow appends sanitized template', pass:addRowSanitizes},
    {name:'removeRow trims the last row', pass:removeRowTrims},
    {name:'setBottomRowRails coerces truthy to true', pass:bottomRailsTrue && bottomRailsStart !== true},
    {name:'setBottomRowRails coerces falsy to false', pass:bottomRailsFalse},
    {name:'setRailMode normalizes single to centered', pass:railModeSingle && railModeBefore !== 'centered'},
    {name:'setRailMode normalizes dual/edges', pass:railModeDual},
    {name:'setRailMode ignores invalid modes', pass:railModeInvalid},
    {name:'setBinLipThickness updates lip dimensions', pass:lipUpdated},
    {name:'setBinLipThickness rejects invalid values', pass:lipRejects},
    {name:'toggleRearFrame disables frame', pass:rearFrameDisabled && rearFrameStart === true},
    {name:'toggleRearFrame enables frame', pass:rearFrameEnabled}
  );

  Object.assign(state, base);
  state.rows = base.rows.map(row => ({...row}));
  state.binHeightProfiles = [...base.binHeightProfiles];

  return results;
}
