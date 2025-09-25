import {DEFAULT_POST_MM, DEFAULT_OPENING_MM} from '../config/defaults.js';

export function parseList(txt, post = DEFAULT_POST_MM){
  const re=/\b(\d+(?:\.\d+)?)\s*(?:mm)?\b/gi;
  const out=[]; let m;
  const str=String(txt);
  while((m=re.exec(str))){
    const n=Math.ceil(parseFloat(m[1]));
    if(Number.isFinite(n) && n>0) out.push(n);
  }
  if(out.length) return out;

  const fallbackPostRaw = Math.round(Number(post));
  const fallbackPost = Number.isFinite(fallbackPostRaw) && fallbackPostRaw > 0 ? fallbackPostRaw : DEFAULT_POST_MM;
  return [
    fallbackPost,
    DEFAULT_OPENING_MM,
    fallbackPost,
    fallbackPost,
    DEFAULT_OPENING_MM,
    fallbackPost,
    fallbackPost
  ];
}

export function normalizeSegments(arr, post){
  const seg = Array.isArray(arr)? arr.slice():[];
  if(seg[0] !== post) seg.unshift(post);
  if(seg[seg.length-1] !== post) seg.push(post);
  const out=[]; let lastWasPost=false;
  for(const n of seg){
    const isPost = n===post;
    if(isPost && lastWasPost) continue;
    out.push(n); lastWasPost=isPost;
  }
  if(out.length<3) out.splice(1,0,DEFAULT_OPENING_MM);
  return out;
}
