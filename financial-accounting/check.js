// Önellenőrzés: node check.js — betölti az anyagot, és megnézi, hogy minden kérdés és tétel megjeleníthető-e.
const fs = require('fs');
const el = { querySelectorAll: () => [], classList: { toggle() {} } };
Object.assign(global, { document: { querySelector: () => el }, addEventListener() {}, scrollTo() {}, localStorage: { getItem: () => null, setItem() {} },
  fetch: p => Promise.resolve({ json: () => JSON.parse(fs.readFileSync(__dirname + '/' + p, 'utf8')) }) });
const A = require('./app.js');
setTimeout(() => {
  let fails = 0;
  const bad = (m, x) => { fails++; if (fails < 15) console.log(m, JSON.stringify(x).slice(0, 160)); };
  for (const t of A.TOPICS) {
    const qs = A.questions(t.id);
    for (const q of qs) {
      if (!q.id || !q.q) bad('no id/text', q);
      if (q.kind === 'card' && !q.ans) bad('card without answer', q);
      if (/undefined|\[object Object\]/.test(q.q + q.ans + q.mag)) bad('render', q);
    }
    if (new Set(qs.map(q => q.id)).size !== qs.length) bad('duplicate ids in ' + t.id, qs.length);
    A.tasks(t.id).forEach(f => { if (!f.cim) bad('task without title', f.id); });
    console.log(t.id.padEnd(9), 'kérdés', String(qs.length).padStart(3), 'tétel', String(A.drills(t.id).length).padStart(3), 'feladat', A.tasks(t.id).length,
      'típusok', JSON.stringify(qs.reduce((s, q) => (s[q.kind] = (s[q.kind] || 0) + 1, s), {})));
  }
  const cases = [['466', '4661', true], ['4661', '466', true], ['571', '5711', true], ['91', '91-92', true], ['92', '91-92', true], ['4551', '4552', false], ['46', '466', false], ['32', '32-33', true], ['52', '52', true], ['4', '466', false]];
  for (const [u, k, e] of cases) if (A.sameAcct(u, k) !== e) bad('sameAcct', [u, k, e]);
  console.log('fails', fails); process.exit(fails ? 1 : 0);
}, 300);
