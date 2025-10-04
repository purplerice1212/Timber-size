import {mm} from './mm.js';
import {DEFAULT_ROW_HEIGHT_MM} from '../config/defaults.js';

function parseMmString(value){
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text === '') return null;
  const normalized = text.replace(/mm$/i, '').trim();
  if (normalized === '') return null;
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function roundOrFallback(raw, fallback, min){
  const rounded = Math.round(raw);
  if (Number.isFinite(rounded) && rounded >= min) return rounded;
  const fb = Math.round(fallback);
  if (Number.isFinite(fb) && fb >= min) return fb;
  return min;
}

function nonNegativeRound(raw){
  const rounded = Math.round(raw);
  if (!Number.isFinite(rounded)) return 0;
  return Math.max(0, rounded);
}

export function parsePositiveMmInput(value, min = 1){
  const parsed = parseMmString(value);
  if (parsed === null) return null;
  const rounded = Math.round(parsed);
  return rounded >= min ? rounded : null;
}

export function parseNonNegativeMmInput(value){
  const parsed = parseMmString(value);
  if (parsed === null) return null;
  const rounded = Math.round(parsed);
  return rounded >= 0 ? rounded : null;
}

export function resolveBinHeightMm(state, row){
  const customRaw = mm(row?.binHeight);
  if (customRaw > 0) return Math.max(1, customRaw);
  const idx = Number(row?.binProfileIndex);
  const profiles = Array.isArray(state.binHeightProfiles) ? state.binHeightProfiles : [];
  if (Number.isInteger(idx) && idx >= 0 && idx < profiles.length){
    const profile = profiles[idx];
    const profHeight = mm(profile?.height);
    if (profHeight > 0) return Math.max(1, profHeight);
  }
  const fallbackRaw = mm(state.binHeightDefault);
  if (fallbackRaw > 0) return Math.max(1, fallbackRaw);
  return 95;
}

export function resolveClearancesMm(state){
  return {
    itemTargetMm: nonNegativeRound(mm(state.itemTargetHeight)),
    openClearTopMm: nonNegativeRound(mm(state.openClearTop)),
    openSightClearMm: nonNegativeRound(mm(state.openSightClear)),
    railSafetyMm: nonNegativeRound(mm(state.railSafety)),
    bottomClearMm: nonNegativeRound(mm(state.bottomClear))
  };
}

export function resolveTargetHeightMm(state, row){
  const binHeight = resolveBinHeightMm(state, row);
  const lipSource = state.binLipThick != null ? state.binLipThick : state.binLip;
  const lip = nonNegativeRound(mm(lipSource));
  const {itemTargetMm, openClearTopMm, openSightClearMm, railSafetyMm} = resolveClearancesMm(state);
  const basis = Math.max(binHeight + lip, itemTargetMm);
  return Math.max(1, basis + openClearTopMm + openSightClearMm + railSafetyMm);
}

export function describeRowSizing(state, row, fallbackHeightMm = DEFAULT_ROW_HEIGHT_MM){
  const fallbackHeight = mm(fallbackHeightMm);
  const rawHeight = mm(row?.height);
  const heightFallback = fallbackHeight > 0 ? fallbackHeight : DEFAULT_ROW_HEIGHT_MM;
  const heightMm = roundOrFallback(rawHeight, heightFallback, 1);
  const gapMm = nonNegativeRound(mm(row?.gap));
  const overhangRaw = mm(row?.overhang);
  const overhangMm = Number.isFinite(overhangRaw) ? Math.round(overhangRaw) : 0;
  const customRaw = mm(row?.binHeight);
  const hasCustom = customRaw > 0;
  const customBinHeightMm = hasCustom ? Math.max(1, Math.round(customRaw)) : undefined;
  const profiles = Array.isArray(state.binHeightProfiles) ? state.binHeightProfiles : [];
  const idxRaw = Number(row?.binProfileIndex);
  const profileIndex = Number.isInteger(idxRaw) && idxRaw >= 0 && idxRaw < profiles.length ? idxRaw : undefined;
  const resolvedBinHeight = resolveBinHeightMm(state, row);
  const binHeightMm = Math.max(1, Math.round(resolvedBinHeight));
  const targetHeightMm = Math.max(1, Math.round(resolveTargetHeightMm(state, row)));
  return {
    heightMm,
    gapMm,
    overhangMm,
    binHeightMm,
    targetHeightMm,
    customBinHeightMm,
    binProfileIndex: profileIndex
  };
}
