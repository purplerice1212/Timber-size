export function railXPositions(ch, S){
  if(S.railMode === 'centered') return [ch.x + (ch.w - S.post)/2];
  return [ch.x, ch.x + ch.w - S.post];
}
