export const TYPE_COLORS = {
  post: '#f5dfe0',
  rail: '#c9e1ff',
  bin: '#ffb3b3',
  support: '#f6c16c',
  lintel: '#e8e8e8'
};

export function colorFor(box) {
  return TYPE_COLORS[box.type] || '#fff';
}
