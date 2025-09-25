import {warnOnce} from './warnOnce.js';

/**
 * @typedef {'post' | 'lintel' | 'support' | 'rail' | 'bin'} BoxType
 */

/** @type {readonly BoxType[]} */
export const BOX_TYPES = Object.freeze(['post', 'lintel', 'support', 'rail', 'bin']);

/**
 * Canonical color palette for box rendering.
 * @type {Record<BoxType, string>}
 */
export const typeColors = {
  post: '#f472b6', // Posts: vivid pink to spotlight the vertical uprights in 3D views.
  lintel: '#9ca3af', // Lintels: neutral gray to convey overhead structural spans.
  support: '#fb923c', // Supports: bright orange to highlight braces and beams.
  rail: '#60a5fa', // Rails: cool blue to emphasise the horizontal run along the frame.
  bin: '#f87171' // Bins: punchy red to differentiate removable storage elements.
};

/**
 * Resolve a colour for a known {@link BoxType}.
 *
 * @param {BoxType} type
 * @returns {string}
 */
export function getTypeColor(type) {
  const color = typeColors[type];
  if (!color) {
    throw new Error(`Missing color for type: ${type}`);
  }
  return color;
}

/**
 * Resolve a colour for arbitrary input with telemetry + fallback.
 *
 * @param {string} type
 * @returns {string}
 */
export function getTypeColorLoose(type) {
  if (type in typeColors) {
    return typeColors[type];
  }
  warnOnce(`Missing color for type: ${type}`);
  return typeColors.post;
}
