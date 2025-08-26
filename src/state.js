const state = {
  width: 1000,
  height: 1000,
  depth: 600,
  post: 50,
  pattern: '',
  features: {
    front: true,
    side: true,
    plan: true,
    three: true
  }
};

const listeners = new Set();

function notify() {
  const snapshot = getState();
  listeners.forEach(fn => fn(snapshot));
}

export function getState() {
  return {
    width: state.width,
    height: state.height,
    depth: state.depth,
    post: state.post,
    pattern: state.pattern,
    features: { ...state.features }
  };
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(getState());
  return () => listeners.delete(fn);
}

export function setWidth(v) {
  state.width = Number(v);
  notify();
}

export function setHeight(v) {
  state.height = Number(v);
  notify();
}

export function setDepth(v) {
  state.depth = Number(v);
  notify();
}

export function setPost(v) {
  state.post = Number(v);
  notify();
}

export function setPattern(v) {
  state.pattern = v;
  notify();
}

export function setFeature(name, on) {
  state.features[name] = !!on;
  notify();
}
