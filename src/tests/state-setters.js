import {setHeight, setDepth, setPost, getState} from '../state.js';

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

  // restore original state
  setHeight(base.height);
  setDepth(base.depth);
  setPost(base.post);
  const state = getState();
  state.autoHeight = base.autoHeight;

  return [
    {name:'height negative clamps to 0', pass:heightNeg},
    {name:'height NaN clamps to 0', pass:heightNaN},
    {name:'depth negative clamps to 0', pass:depthNeg},
    {name:'depth NaN clamps to 0', pass:depthNaN},
    {name:'post negative clamps to 0', pass:postNeg},
    {name:'post NaN clamps to 0', pass:postNaN}
  ];
}
