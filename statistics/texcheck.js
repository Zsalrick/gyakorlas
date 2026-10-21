// Futtatás: npm i --no-save katex@0.16.11  (egyszer; a node_modules gitignore-olva), aztán: node texcheck.js
// Minden generált szöveg képleteit lefordítja KaTeX-szel; hibát, páratlan $-t és backslash nélküli TeX-parancsot keres.
const katex = require('katex');
const { TOPICS, make, makeCase } = require(process.argv[2] || './gen.js');
const errs = new Map();
const bad = (where, msg, s) => { const k = where + ': ' + msg; if (!errs.has(k)) errs.set(k, s.slice(0, 300)); };
const BARE = /(^|[^\\a-zA-Z])(frac|cdot|text|sqrt|times|bar|sum|quad|approx|vdots|left|right|mu|sigma|alpha|gt|lt|le|ge|ne|to)[{\s(]/;
function check(where, s) {
  if (!s) return;
  s = String(s).replace(/<[^>]+>/g, ' ').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
  const parts = s.split(/(\$\$[\s\S]*?\$\$|\$[^$]*\$)/);
  for (const p of parts) {
    if (p.startsWith('$')) {
      const disp = p.startsWith('$$'), body = disp ? p.slice(2, -2) : p.slice(1, -1);
      try { katex.renderToString(body, { displayMode: disp, throwOnError: true, strict: 'ignore' }); } catch (e) { bad(where, e.message.slice(0, 120), body); }
      if (BARE.test(body.replace(/\\text\{[^}]*\}/g, ''))) bad(where, 'bare TeX word', body);
    } else if (p.includes('$')) bad(where, 'stray $', p);
  }
}
for (const t of TOPICS) {
  check(t.id + '.theory', t.theory);
  for (const g of t.gens) for (let i = 0; i < 300; i++) {
    const x = make(g);
    [x.q, x.sol, x.hint, ...x.opts.map(o => o.why)].forEach(s => check(g.name, s));
  }
  for (const c of t.cases) for (let i = 0; i < 300; i++) {
    const x = makeCase(c); check(c.name, x.stem);
    x.parts.forEach((p, k) => [p.q, p.sol, p.hint, ...p.opts.map(o => o.why)].forEach(s => check(`${c.name}[${k}]`, s)));
  }
}
for (const [k, v] of errs) console.log('✗', k, '\n   ', v);
console.log(errs.size ? `${errs.size} hiba` : 'TeX ok');
process.exit(errs.size ? 1 : 0);
