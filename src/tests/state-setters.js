import {setHeight, setDepth, setPost, setCamera, getState} from '../state.js';

export function testStateSetters(){
  const base = {...getState()};

  setHeight(-5);
  const heightNeg = getState().height === 0;
  setHeight('abc');
  const heightNaN = getState().height === 0;

  setDepth(-10);
  const depthNeg = getState().depth === 0;
  setDepth('foo');
  const depthNaN = getState().depth === 0;

  setPost(-1);
  const postNeg = getState().post === 0;
  setPost('bar');
  const postNaN = getState().post === 0;

  setCamera({yaw:-1, pitch:-0.5});
  const camNeg = getState().yaw === -1 && getState().pitch === -0.5;
  setCamera({yaw:'a', pitch:'b'});
  const camNaN = getState().yaw === -1 && getState().pitch === -0.5;

  // restore original state
  setHeight(base.height);
  setDepth(base.depth);
  setPost(base.post);
  setCamera({yaw:base.yaw, pitch:base.pitch, zoom:base.zoom});
  const state = getState();
  state.autoHeight = base.autoHeight;

  return [
    {name:'height negative clamps to 0', pass:heightNeg},
    {name:'height NaN clamps to 0', pass:heightNaN},
    {name:'depth negative clamps to 0', pass:depthNeg},
    {name:'depth NaN clamps to 0', pass:depthNaN},
    {name:'post negative clamps to 0', pass:postNeg},
    {name:'post NaN clamps to 0', pass:postNaN},
    {name:'camera allows negative yaw/pitch', pass:camNeg},
    {name:'camera ignores invalid yaw/pitch', pass:camNaN}
  ];
}
