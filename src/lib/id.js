// Lightweight unique id generator (good enough for local records).
export function uid(prefix = 'id') {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}
