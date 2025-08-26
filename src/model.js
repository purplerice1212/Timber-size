export function buildModel(S) {
  const boxes = [];
  const {width, height, depth, post} = S;
  // Four corner posts
  boxes.push({x:0, y:0, z:0, w:post, h:height, d:post, type:'post'});
  boxes.push({x:width-post, y:0, z:0, w:post, h:height, d:post, type:'post'});
  boxes.push({x:0, y:0, z:depth-post, w:post, h:height, d:post, type:'post'});
  boxes.push({x:width-post, y:0, z:depth-post, w:post, h:height, d:post, type:'post'});

  // Sample rail across the front
  boxes.push({x:0, y:height - post, z:0, w:width, h:post, d:post, type:'rail'});
  // Sample lintel across the back
  boxes.push({x:0, y:height - post, z:depth - post, w:width, h:post, d:post, type:'lintel'});
  // Sample support in the middle
  boxes.push({x:width/2 - post/2, y:0, z:0, w:post, h:height, d:post, type:'support'});
  // Sample bin inside (also marked as opening for plan overlay)
  boxes.push({x:post, y:post, z:post, w:width - 2*post, h:height/2, d:depth/2, type:'bin', opening:true});

  const bounds = {min:{x:Infinity,y:Infinity,z:Infinity}, max:{x:-Infinity,y:-Infinity,z:-Infinity}};
  boxes.forEach(b => {
    bounds.min.x = Math.min(bounds.min.x, b.x);
    bounds.min.y = Math.min(bounds.min.y, b.y);
    bounds.min.z = Math.min(bounds.min.z, b.z);
    bounds.max.x = Math.max(bounds.max.x, b.x + b.w);
    bounds.max.y = Math.max(bounds.max.y, b.y + b.h);
    bounds.max.z = Math.max(bounds.max.z, b.z + b.d);
  });
  bounds.width = bounds.max.x - bounds.min.x;
  bounds.height = bounds.max.y - bounds.min.y;
  bounds.depth = bounds.max.z - bounds.min.z;

  return {
    boxes,
    bounds
  };
}
