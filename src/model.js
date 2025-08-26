export function buildModel(S) {
  const boxes = [];
  const {width, height, depth, post} = S;
  // Four corner posts
  boxes.push({type:'post', x:0, y:0, z:0, w:post, h:height, d:post});
  boxes.push({type:'post', x:width-post, y:0, z:0, w:post, h:height, d:post});
  boxes.push({type:'post', x:0, y:0, z:depth-post, w:post, h:height, d:post});
  boxes.push({type:'post', x:width-post, y:0, z:depth-post, w:post, h:height, d:post});
  return {
    boxes,
    bounds: {width, height, depth}
  };
}
