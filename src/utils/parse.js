export function parseList(txt){
  const re=/\b(\d+(?:\.\d+)?)\s*(?:mm)?\b/gi;
  const out=[]; let m;
  const str=String(txt);
  while((m=re.exec(str))){
    const n=Math.ceil(parseFloat(m[1]));
    if(Number.isFinite(n) && n>0) out.push(n);
  }
  return out.length ? out : [43,283,43,43,283,43,43];
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
  if(out.length<3) out.splice(1,0,283);
  return out;
}
