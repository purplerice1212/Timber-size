import {
  describeRowSizing,
  parseNonNegativeMmInput,
  parsePositiveMmInput,
  resolveBinHeightMm,
  resolveTargetHeightMm
} from '../utils/rowSizing.js';

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
  const profileSizing = describeRowSizing(baseState, profileRow, 120);
  const targetFromProfile = resolveTargetHeightMm(baseState, profileRow);

  const customRow = {height: '110mm', binHeight: '200mm'};
  const customSizing = describeRowSizing(baseState, customRow, 120);

  const parseTests = [
    parsePositiveMmInput('283mm') === 283,
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
    resolveBinHeightMm(baseState, {binHeight: '0', binProfileIndex: 0}) === 120,
    ...parseTests
  ];

  return expectations.map((pass, idx) => ({
    name: `row-sizing-${idx + 1}`,
    pass: Boolean(pass)
  }));
}
