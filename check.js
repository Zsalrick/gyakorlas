// Önellenőrzés: node check.js — minden generátort és teljes feladatot sokszor lefuttat.
const { TOPICS, make, makeCase, goodCase, HINTS } = require('./gen.js');
let fails = 0, fb = {};
const bad = x => {
  const ts = x.opts.map(o => o.t);
  return x.opts.length !== 4 || new Set(ts).size !== 4 || x.opts.filter(o => o.ok).length !== 1 || !x.hint ||
    ts.some(s => s === '–' || /NaN|Infinity|undefined/.test(s)) || /NaN|undefined|Infinity/.test(x.q + x.sol + x.hint);
};
const fail = (name, x) => { fails++; if (fails < 8) console.log(name, x.opts.map(o => o.t), x.q.slice(0, 80)); };
for (const t of TOPICS) {
  for (const g of t.gens) {
    if (!HINTS[g.name]) { fails++; console.log('no hint:', g.name); }
    for (let i = 0; i < 2000; i++) {
      const x = make(g);
      if (bad(x)) fail(g.name, x);
      if (x.opts.some(o => o.why && o.why.startsWith('Ez az érték egyik'))) fb[g.name] = (fb[g.name] || 0) + 1;
    }
  }
  for (const c of t.cases || []) for (let i = 0; i < 1000; i++) {
    const x = makeCase(c);
    if (!goodCase(x)) fb[c.name] = (fb[c.name] || 0) + 1;
    if (/NaN|undefined|Infinity/.test(x.stem + x.title)) fail(c.name, x.parts[0]);
    x.parts.forEach((p, k) => { if (bad(p)) fail(`${c.name}[${k}]`, p); });
  }
}
console.log('fails', fails, 'fallback used:', fb);
process.exit(fails ? 1 : 0);
