import {DEFAULT_POST_MM} from '../config/defaults.js';

export function postSize(source){
  const raw = Number(source?.post);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_POST_MM;
}
