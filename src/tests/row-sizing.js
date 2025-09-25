import {
  describeRowSizing,
  parseNonNegativeMmInput,
  parsePositiveMmInput,
  resolveBinHeightMm,
  resolveTargetHeightMm
} from '../utils/rowSizing.js';
import {
  DEFAULT_ROW_HEIGHT_MM,
  DEFAULT_OPENING_MM
} from '../config/defaults.js';

export function testRowSizing(){
  const baseState = {
    binHeightDefault: '95mm',
    binLip: '9.5mm',
    itemTargetHeight: '150mm',
    openClearTop: '10mm',
    openSightClear: '5mm',
    railSafety: '2mm',
    binHeightProfiles: [
      {name: 'Short', height: '120mm'},
      {name: 'Tall', height: '180mm'}
    ]
  };

  const profileRow = {height: '140mm', binProfileIndex: 1};
  const profileSizing = describeRowSizing(baseState, profileRow, DEFAULT_ROW_HEIGHT_MM);
  const targetFromProfile = resolveTargetHeightMm(baseState, profileRow);

  const customRow = {height: '110mm', binHeight: '200mm'};
  const customSizing = describeRowSizing(baseState, customRow, DEFAULT_ROW_HEIGHT_MM);

  const parseTests = [
    parsePositiveMmInput(`${DEFAULT_OPENING_MM}mm`) === DEFAULT_OPENING_MM,
    parsePositiveMmInput('0.4mm') === null,
    parseNonNegativeMmInput('7.2mm') === 7,
    parseNonNegativeMmInput('bad-value') === null
  ];

  const expectations = [
    profileSizing.heightMm === 140,
    profileSizing.binProfileIndex === 1,
    profileSizing.binHeightMm === 180,
    Math.round(targetFromProfile) === 207,
    customSizing.customBinHeightMm === 200,
    customSizing.binProfileIndex === undefined,
    customSizing.binHeightMm === 200,
    resolveBinHeightMm(baseState, {binHeight: '0', binProfileIndex: 0}) === DEFAULT_ROW_HEIGHT_MM,
    ...parseTests
  ];

  return expectations.map((pass, idx) => ({
    name: `row-sizing-${idx + 1}`,
    pass: Boolean(pass)
  }));
}
