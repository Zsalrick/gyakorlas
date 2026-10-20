// Önellenőrzés: node check.js — minden generátort sokszor lefuttat.
const { TOPICS, make } = require('./gen.js');
let fails = 0, fb = {};
for (const t of TOPICS) for (const g of t.gens) for (let i = 0; i < 2000; i++) {
  const x = make(g), ts = x.opts.map(o => o.t);
  const bad = x.opts.length !== 4 || new Set(ts).size !== 4 || x.opts.filter(o => o.ok).length !== 1 || ts.some(s => s === '–' || /NaN|Infinity|undefined/.test(s)) || /NaN|undefined/.test(x.q + x.sol);
  if (bad) { fails++; if (fails < 5) console.log(g.name, ts, x.q.slice(0, 80)); }
  if (x.opts.some(o => o.why && o.why.startsWith('Ez az érték egyik'))) fb[g.name] = (fb[g.name] || 0) + 1;
}
console.log('fails', fails, 'fallback used (of 2000):', fb);
process.exit(fails ? 1 : 0);
