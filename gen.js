// Feladatgenerátorok és elmélet. Minden generátor egy {q, opts, sol} objektumot ad vissza.
// opts: 4 db {t, ok?, why?}; pontosan egy helyes.

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[R(0, a.length - 1)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = R(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const sum = a => a.reduce((s, x) => s + x, 0);
const mean = a => sum(a) / a.length;
const f = (x, d = 2) => Number.isFinite(x) ? (+x.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d }) : '–';
const pc = (x, d = 2) => f(x * 100, d) + '%';
const ratioStr = (a, b) => {
  let s = 1; while ((!Number.isInteger(+(a * s).toFixed(6)) || !Number.isInteger(+(b * s).toFixed(6))) && s < 1e4) s *= 10;
  a = Math.round(a * s); b = Math.round(b * s); const g = gcd(a, b); return `${a / g} : ${b / g}`;
};
const tbl = (head, rows) => `<table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
const hrow = (label1, xs, label2, ys) => `<table><tr><th>${label1}</th>${xs.map(x => `<td>${x}</td>`).join('')}</tr><tr><th>${label2}</th>${ys.map(y => `<td>${y}</td>`).join('')}</tr></table>`;

const FALLBACK = 'Ez az érték egyik tipikus számolásból sem jön ki, valószínűleg számolási vagy kerekítési hiba. Nézd meg a levezetést.';

function Q(q, correct, wrongs, sol, fm = x => x) {
  const opts = [{ t: fm(correct), ok: true }];
  for (const [v, why] of wrongs) {
    if (v === undefined) continue;
    const t = fm(v);
    if (t !== '–' && !opts.some(o => o.t === t)) opts.push({ t, why });
    if (opts.length === 4) break;
  }
  for (let i = 1; opts.length < 4 && typeof correct === 'number' && i < 40; i++) {
    const v = correct + (Math.abs(correct) || 1) * 0.08 * Math.ceil(i / 2) * (i % 2 ? 1 : -1);
    const t = fm(v);
    if (!opts.some(o => o.t === t)) opts.push({ t, why: FALLBACK });
  }
  return { q, opts: shuffle(opts), sol };
}

// ---------- 1. Arányok ----------
const ratio = [
  function unitRatio() {
    const U = [['kg', 'g', 1000, [1, 1.5, 2, 2.5, 3, 4]], ['km', 'm', 1000, [1, 1.5, 2, 3, 5]], ['l', 'ml', 1000, [1, 1.5, 2, 3]], ['hours', 'minutes', 60, [1, 2, 3, 4]]];
    let B, s, fc, A, big, p, q, b;
    for (;;) {
      const u = pick(U); [B, s, fc] = u; A = pick(u[3]); big = A * fc;
      p = R(1, 9); q = R(1, 9); if (p === q || gcd(p, q) !== 1) continue;
      b = big * q / p; if (Number.isInteger(b) && b >= 10 && b !== big) break;
    }
    const g = gcd(big, b);
    return Q(`Find the ratio of <b>${A} ${B}</b> to <b>${b} ${s}</b>.`, ratioStr(big, b), [
      [ratioStr(A, b), 'Nem váltottad át azonos mértékegységre. Arányt csak azonos egységű mennyiségek között számolhatunk.'],
      [ratioStr(b, big), 'Fordított sorrend. A ratio (arány) sorrendje számít: az első mennyiség kerül előre.'],
      [ratioStr(big, big + b), 'Ez part-to-whole ratio (rész az egészhez), de itt két mennyiséget kell egymáshoz viszonyítani.'],
    ], `${A} ${B} = ${big} ${s}\n${big} : ${b}\nlegnagyobb közös osztó = ${g}  →  ${big / g} : ${b / g}`);
  },
  function divide() {
    let p, q; do { p = R(1, 7); q = R(1, 7); } while (p === q || gcd(p, q) !== 1);
    const k = pick([500, 1000, 1500, 2000, 2500, 4000, 5000]), T = k * (p + q), F = x => f(x) + ' Ft';
    return Q(`Divide <b>${f(T)} Ft</b> between two people in the ratio <b>${p} : ${q}</b>. How much does the <b>first</b> person get?`, p * k, [
      [q * k, 'Ez a második személy része. A ratio első tagja (' + p + ') tartozik az első személyhez.'],
      [k, 'Ez csak egy rész (one part) értéke, még meg kell szorozni az első személy részeinek számával.'],
      [T / p, 'A teljes összeget csak az első arányszámmal osztottad. Először az összes rész számát kell kiszámolni (p + q).'],
    ], `részek száma = ${p} + ${q} = ${p + q}\negy rész = ${f(T)} / ${p + q} = ${f(k)} Ft\nelső személy = ${p} × ${f(k)} = ${f(p * k)} Ft`, F);
  },
  function unknown() {
    let p, q; do { p = R(2, 9); q = R(2, 9); } while (p === q || gcd(p, q) !== 1);
    const k = R(2, 12), girls = q * k;
    return Q(`The ratio of boys to girls is <b>${p} : ${q}</b>. There are <b>${girls}</b> girls. How many boys are there?`, p * k, [
      [girls * q / p, 'Fordítva használtad az arányt. A lányokhoz a ' + q + ', a fiúkhoz a ' + p + ' tartozik.'],
      [girls * p, 'Nem osztottad el a lányok számát a lányok részeinek számával, így nem kaptad meg egy rész értékét.'],
      [girls / (p + q) * p, 'Az összes rész számával (p + q) osztottál, pedig a ' + girls + ' lány csak ' + q + ' részt tesz ki.'],
    ], `egy rész = lányok / lány-részek = ${girls} / ${q} = ${k}\nfiúk = ${p} × ${k} = ${p * k}`, x => f(x));
  },
  function compound() {
    let a, b, c, d; do { a = R(1, 9); b = R(1, 9); c = R(1, 9); d = R(1, 9); } while (a === b || c === d || ratioStr(a * c, b * d) === ratioStr(a, d));
    const res = ratioStr(a * c, b * d);
    return Q(`A : B = <b>${a} : ${b}</b> and B : C = <b>${c} : ${d}</b>. Find <b>A : C</b>.`, res, [
      [ratioStr(a, d), 'Csak a szélső tagokat írtad le. Előbb B-t mindkét arányban azonos értékre kell hozni (compound ratio, összetett arány).'],
      [ratioStr(a * d, b * c), 'Rossz párosítás: az első arány tagjait a második arány tagjaival keresztben szoroztad.'],
      [ratioStr(a + c, b + d), 'Arányokat nem lehet összeadni, csak bővíteni (szorozni).'],
    ], `A : B = ${a} : ${b} = ${a * c} : ${b * c}   (×${c})\nB : C = ${c} : ${d} = ${b * c} : ${b * d}   (×${b})\nA : C = ${a * c} : ${b * d} = ${res}`);
  },
];

// ---------- 2. Viszonyszámok ----------
const indices = [
  function vm() {
    const sets = [['Finance', 'Management', 'Tourism'], ['electric', 'petrol', 'diesel'], ['full-time', 'part-time', 'contract'], ['north', 'centre', 'south']];
    const n = pick(sets), u = pick([4, 6, 8, 10, 12]), a = R(5, 30) * u, b = R(5, 30) * u, c = R(5, 30) * u, T = a + b + c;
    return Q(`A group has ${T} members: <b>${n[0]}: ${a}</b>, ${n[1]}: ${b}, ${n[2]}: ${c}. What is the <b>distribution ratio</b> of ${n[0]}?`, a / T, [
      [a / b, 'Ez coordination ratio (koordinációs viszonyszám): két részt hasonlítottál össze, nem a részt az egészhez.'],
      [b / T, 'Ez a(z) ' + n[1] + ' csoport részesedése, nem a kérdezetté.'],
      [T / a, 'Fordítva osztottál (egész / rész). A distribution ratio (megoszlási viszonyszám) = rész / egész.'],
    ], `Vm = rész / egész = ${a} / ${T} = ${pc(a / T)}`, x => pc(x));
  },
  function vk() {
    const pairs = [['women', 'men'], ['students', 'teachers'], ['cars', 'households'], ['female moviegoers', 'male moviegoers']];
    const [A, B] = pick(pairs); let a, b; do { a = R(20, 900); b = R(20, 900); } while (a === b);
    return Q(`There are <b>${a} ${A}</b> and <b>${b} ${B}</b>. Calculate the <b>coordination ratio</b> of ${A} to ${B}.`, a / b, [
      [b / a, 'Fordított sorrend: ' + B + ' / ' + A + '. A kérdés ' + A + ' / ' + B + '.'],
      [a / (a + b), 'Ez distribution ratio (megoszlási viszonyszám), rész / egész. A coordination ratio két részt hasonlít össze.'],
      [(a - b) / b, 'Ez a különbség aránya, nem a két rész hányadosa.'],
    ], `Vk = ${A} / ${B} = ${a} / ${b} = ${f(a / b, 3)}\n(${f(a / b, 3)} ${A} per one ${B.replace(/s$/, '')})`, x => f(x, 3));
  },
  function dynamic() {
    const y0 = R(10, 40) * 10, ys = [y0];
    for (let i = 1; i < 5; i++) ys.push(Math.round(ys[i - 1] * (0.88 + Math.random() * 0.32)));
    const t = R(2, 4), years = [2020, 2021, 2022, 2023, 2024], base = Math.random() < 0.5;
    const chain = ys[t] / ys[t - 1], b = ys[t] / ys[0];
    const q = `Sales (million Ft): ${tbl(years, [ys])} Calculate the <b>${base ? 'base ratio (base year 2020)' : 'chain ratio'}</b> for <b>${years[t]}</b>.`;
    const sol = base ? `Vdb = y(${years[t]}) / y(2020) = ${ys[t]} / ${ys[0]} = ${pc(b)}` : `Vdl = y(${years[t]}) / y(${years[t - 1]}) = ${ys[t]} / ${ys[t - 1]} = ${pc(chain)}`;
    return base
      ? Q(q, b, [[chain, 'Ez a chain ratio (láncviszonyszám): az előző évhez viszonyítottál, nem a 2020-as bázishoz.'], [ys[0] / ys[t], 'Fordítva osztottál: bázis / tárgyév.'], [b - 1, 'Ez a változás mértéke (b − 100%), nem maga a base ratio.']], sol, x => pc(x))
      : Q(q, chain, [[b, 'Ez a base ratio (bázisviszonyszám): 2020-hoz viszonyítottál, de a chain ratio mindig az előző évhez viszonyít.'], [ys[t - 1] / ys[t], 'Fordítva osztottál: előző év / tárgyév.'], [chain - 1, 'Ez a változás mértéke (lánc − 100%), nem maga a chain ratio (láncviszonyszám).']], sol, x => pc(x));
  },
  function baseFromChain() {
    const c = [R(88, 120), R(88, 120), R(88, 120)].map(x => x / 100), prod = c[0] * c[1] * c[2];
    return Q(`The chain ratios of production are: 2021: <b>${pc(c[0], 0)}</b>, 2022: <b>${pc(c[1], 0)}</b>, 2023: <b>${pc(c[2], 0)}</b>. What is the <b>base ratio</b> of 2023 if 2020 = 100%?`, prod, [
      [1 + sum(c.map(x => x - 1)), 'A százalékos változásokat összeadtad. Dinamikus viszonyszámokat szorozni kell, nem összeadni.'],
      [c[2], 'Ez csak a 2023-as chain ratio (láncviszonyszám). A base ratio az összes addigi láncviszonyszám szorzata.'],
      [mean(c), 'Átlagoltad a láncviszonyszámokat. A bázisviszonyszám ezek szorzata.'],
    ], `Vdb(2023) = ${f(c[0])} × ${f(c[1])} × ${f(c[2])} = ${f(prod, 4)} = ${pc(prod)}`, x => pc(x));
  },
  function plan() {
    let B, P, A; do { B = R(40, 200) * 10; P = Math.round(B * (1 + R(2, 20) / 100)); A = Math.round(P * (R(85, 115) / 100)); } while (A === P || A === B);
    const vf = P / B, vt = A / P, vd = A / B, w = pick(['vf', 'vt', 'vd']);
    const name = { vf: 'task indicator ratio (Vf)', vt: 'performance indicator ratio (Vt)', vd: 'dynamic ratio (actual vs last year)' }[w];
    const why = {
      vf: [vf, 'Ez Vf, a task indicator ratio (tervfeladat-viszonyszám): terv / bázis.'],
      vt: [vt, 'Ez Vt, a performance indicator ratio (tervteljesítési viszonyszám): tény / terv.'],
      vd: [vd, 'Ez a dynamic ratio (dinamikus viszonyszám): tény / előző év.'],
    };
    const inv = { vf: B / P, vt: P / A, vd: B / A }[w];
    const sol = `Vf = terv / bázis = ${P} / ${B} = ${pc(vf)}\nVt = tény / terv = ${A} / ${P} = ${pc(vt)}\nVd = tény / bázis = ${A} / ${B} = ${pc(vd)}\nellenőrzés: Vf × Vt = Vd`;
    return Q(`Last year a factory produced <b>${B}</b> units. This year's plan was <b>${P}</b> units, actual production was <b>${A}</b> units. Calculate the <b>${name}</b>.`,
      why[w][0], [...Object.keys(why).filter(k => k !== w).map(k => why[k]), [inv, 'Fordítva osztottál.']], sol, x => pc(x));
  },
  function intensity() {
    const pop = R(20, 400) * 1000, births = Math.round(pop * R(70, 160) / 10000), r = births / pop * 1000;
    return Q(`A city has <b>${f(pop)}</b> inhabitants and there were <b>${f(births)}</b> births in a year. Calculate the <b>birth rate per 1,000 people</b>.`, r, [
      [r / 10, 'Százzal szoroztál ezer helyett, így ez százalék, nem ezrelék (per 1,000).'],
      [r * 10, 'Tízezerrel szoroztál ezer helyett.'],
      [pop / births, 'Ez inverse intensity ratio (fordított intenzitási viszonyszám): hány lakosra jut egy születés.'],
    ], `birth rate = születések / népesség × 1000 = ${f(births)} / ${f(pop)} × 1000 = ${f(r)} ‰`, x => f(x) + ' ‰');
  },
  function oddsRatio() {
    const ctx = pick([['Smokers', 'Non-smokers', 'got sick'], ['Vaccinated', 'Unvaccinated', 'got the disease'], ['Male drivers', 'Female drivers', 'had an accident'], ['Drug A', 'Drug B', 'recovered']]);
    let a, b, c, d; do { a = R(5, 60); b = R(20, 95); c = R(5, 60); d = R(20, 95); } while (Math.abs(a / b - c / d) < 0.05);
    const or = (a / b) / (c / d), rr = (a / (a + b)) / (c / (c + d));
    return Q(`${tbl(['', ctx[2], 'not'], [[ctx[0], a, b], [ctx[1], c, d]])} Calculate the <b>odds ratio</b> (${ctx[0]} vs ${ctx[1]}).`, or, [
      [rr, 'Ez relative risk (relatív kockázat): az összes esettel osztottál (a + b). Az odds a bekövetkezett / nem bekövetkezett esetek hányadosa.'],
      [1 / or, 'Fordítva: a második csoport esélyét osztottad az elsőével.'],
      [(a * b) / (c * d), 'Rossz szorzás: OR = (a/b)/(c/d) = (a·d)/(b·c), nem (a·b)/(c·d).'],
    ], `odds(${ctx[0]}) = a/b = ${a}/${b} = ${f(a / b, 4)}\nodds(${ctx[1]}) = c/d = ${c}/${d} = ${f(c / d, 4)}\nOR = ${f(a / b, 4)} / ${f(c / d, 4)} = ${f(or, 3)}`, x => f(x, 3));
  },
  function relRisk() {
    let n1, n2, e1, e2; do { n1 = R(2, 10) * 50; n2 = R(2, 10) * 50; e1 = R(5, n1 / 3); e2 = R(5, n2 / 3); } while (n1 === n2 || Math.abs(e1 / n1 - e2 / n2) < 0.02);
    const rr = (e1 / n1) / (e2 / n2), or = (e1 / (n1 - e1)) / (e2 / (n2 - e2));
    return Q(`Treatment group: <b>${e1}</b> of <b>${n1}</b> patients were cured. Control group: <b>${e2}</b> of <b>${n2}</b> were cured. Calculate the <b>relative risk (RR)</b>.`, rr, [
      [or, 'Ez odds ratio (esélyhányados): a nem gyógyultak számával osztottál. Az RR valószínűségeket hasonlít: esemény / csoport létszáma.'],
      [1 / rr, 'Fordítva: a kontrollcsoport valószínűségét osztottad a kezelt csoportéval.'],
      [e1 / e2, 'Csak az esetszámokat osztottad, a csoportok eltérő létszámát (' + n1 + ' vs ' + n2 + ') nem vetted figyelembe.'],
    ], `P(treatment) = ${e1}/${n1} = ${f(e1 / n1, 4)}\nP(control) = ${e2}/${n2} = ${f(e2 / n2, 4)}\nRR = ${f(e1 / n1, 4)} / ${f(e2 / n2, 4)} = ${f(rr, 3)}`, x => f(x, 3));
  },
  function notation() {
    const N = [['Vm', 'distribution ratio', 'part / whole', 'm = megoszlási'], ['Vk', 'coordination ratio', 'part / other part', 'k = koordinációs'],
      ['Vdb', 'base ratio', 'current period / fixed base period', 'd = dinamikus, b = bázis'], ['Vdl', 'chain ratio', 'current period / previous period', 'd = dinamikus, l = lánc'],
      ['Vf', 'task indicator ratio', 'plan / base period', 'f = (terv)feladat'], ['Vt', 'performance indicator ratio', 'actual / plan', 't = (terv)teljesítés'],
      ['Vi', 'intensity ratio', 'phenomenon / reference quantity (different units)', 'i = intenzitási'], ['Vö', 'areal comparative ratio', 'data of an area / data of the base area', 'ö = összehasonlító']];
    const c = pick(N), others = shuffle(N.filter(n => n !== c)).slice(0, 3), mode = R(0, 2);
    const why = n => `Ez ${n[0]}: ${n[1]} (${n[3]}), képlete ${n[2]}.`;
    const sol = `${c[0]} = ${c[1]}, képlete ${c[2]}\nA betű a magyar névből jön: V = viszonyszám, ${c[3]}.`;
    if (mode === 0) return Q(`Which symbol is used for the <b>${c[1]}</b>?`, c[0], others.map(n => [n[0], why(n)]), sol);
    if (mode === 1) return Q(`Which ratio is calculated as <b>${c[2]}</b>?`, `${c[0]} – ${c[1]}`, others.map(n => [`${n[0]} – ${n[1]}`, why(n)]), sol);
    return Q(`What does <b>${c[0]}</b> stand for?`, c[1], others.map(n => [n[1], why(n)]), sol);
  },
];

// ---------- 3. Adatok, gyakorisági sorok ----------
function discreteTable() {
  const start = pick([0, 1, 10, 15, 20]), step = pick([1, 2, 5]);
  const xs = [0, 1, 2, 3, 4].map(i => start + i * step), fs = xs.map(() => R(1, 12));
  const n = sum(fs), cf = fs.map((_, i) => sum(fs.slice(0, i + 1)));
  return { xs, fs, n, cf };
}
const series = [
  function relFreq() {
    const { xs, fs, n, cf } = discreteTable(), j = R(1, 4);
    return Q(`Marks of students: ${hrow('x', xs, 'f', fs)} What is the <b>relative frequency</b> of x = ${xs[j]}?`, fs[j] / n, [
      [cf[j] / n, 'Ez a cumulative relative frequency (kumulált relatív gyakoriság), az x ≤ ' + xs[j] + ' értékek aránya.'],
      [fs[j] / xs.length, 'Az értékek számával (' + xs.length + ') osztottál, nem a megfigyelések számával (n = ' + n + ').'],
      [fs[j] / (n - fs[j]), 'A többi megfigyeléshez viszonyítottál, nem az összeshez.'],
    ], `n = Σf = ${fs.join(' + ')} = ${n}\nrelative frequency = f / n = ${fs[j]} / ${n} = ${pc(fs[j] / n)}`, x => pc(x));
  },
  function cumulative() {
    const { xs, fs, n, cf } = discreteTable(), j = R(1, 3);
    return Q(`${hrow('x', xs, 'f', fs)} How many observations are <b>at most ${xs[j]}</b> (x ≤ ${xs[j]})?`, cf[j], [
      [fs[j], 'Ez csak az x = ' + xs[j] + ' érték gyakorisága. A „legfeljebb” a kisebb értékeket is tartalmazza.'],
      [cf[j - 1], 'Kimaradt maga az x = ' + xs[j] + ' érték; a „legfeljebb” (≤) tartalmazza.'],
      [n - cf[j], 'Ez a „több mint ' + xs[j] + '” (x > ' + xs[j] + ') kérdés válasza.'],
    ], `cumulative frequency (kumulált gyakoriság):\n${cf.map((c, i) => `x ≤ ${xs[i]}: ${c}`).join('\n')}\n→ ${cf[j]}`, x => f(x));
  },
  function classWidth() {
    let mn, mx, k, raw, up, dn;
    do { mn = R(5, 40); mx = R(mn + 50, mn + 160); k = R(5, 10); raw = (mx - mn) / k; up = Math.ceil(raw / 5) * 5; dn = Math.floor(raw / 5) * 5; } while (raw % 5 === 0 || dn === 0);
    return Q(`The smallest observation is <b>${mn}</b>, the largest is <b>${mx}</b>. We want <b>${k} classes</b>. What class width should we use (rounded <b>up</b> to a multiple of 5)?`, up, [
      [raw, 'Ez a nyers érték; a diák szerint 5 többszörösére kell felkerekíteni.'],
      [dn, 'Lefelé kerekítettél, így az osztályok nem fednék le az összes adatot.'],
      [Math.ceil((mx + mn) / k / 5) * 5, 'Összeadtad a legnagyobb és a legkisebb értéket ahelyett, hogy kivontad volna.'],
    ], `i = (max − min) / osztályok száma = (${mx} − ${mn}) / ${k} = ${f(raw, 3)}\nfelkerekítve 5 többszörösére → ${up}`, x => f(x, 3));
  },
  function midpoint() {
    const L = pick([0, 10, 20, 50, 100]), w = pick([5, 10, 20, 25]), j = R(2, 5), lo = L + (j - 1) * w;
    const classes = [0, 1, 2, 3, 4].map(i => `${L + i * w}–${L + (i + 1) * w}`);
    return Q(`Classes: ${classes.join(', ')}. What is the <b>midpoint</b> of class number ${j} (${classes[j - 1]})?`, lo + w / 2, [
      [lo + w, 'Ez az osztály felső határa (upper limit), nem a közepe.'],
      [lo, 'Ez az osztály alsó határa (lower limit), nem a közepe.'],
      [lo - w / 2, 'Ez az előző osztály közepe, eggyel elcsúsztál.'],
    ], `midpoint = (lower + upper) / 2 = (${lo} + ${lo + w}) / 2 = ${f(lo + w / 2)}`, x => f(x));
  },
  function groupedRange() {
    const L = pick([0, 10, 20, 40]), w = pick([5, 10, 20]), fs = [0, 1, 2, 3, 4].map(() => R(2, 25));
    const cls = fs.map((_, i) => `${L + i * w}–${L + (i + 1) * w}`);
    return Q(`${hrow('Class', cls, 'f', fs)} What is the <b>range</b>?`, 5 * w, [
      [w, 'Ez a class interval (osztályköz hossza), nem a terjedelem.'],
      [4 * w, 'Az első és az utolsó osztályközépből számoltál. A terjedelem = utolsó osztály felső határa − első osztály alsó határa.'],
      [Math.max(...fs) - Math.min(...fs), 'A gyakoriságokból számoltál. A range (terjedelem) az értékek szóródása, nem a gyakoriságoké.'],
    ], `range = upper limit of last class − lower limit of first class = ${L + 5 * w} − ${L} = ${5 * w}`, x => f(x));
  },
  function varType() {
    const items = [['number of children in a family', 'discrete'], ['height of a student (cm)', 'continuous'], ['passed or failed the exam', 'binary'], ['blood type (A, B, AB, 0)', 'nominal'], ['satisfaction on a 1–5 Likert scale', 'ordinal'],
      ['number of cars sold per day', 'discrete'], ['time to finish a race', 'continuous'], ['smoker or non-smoker', 'binary'], ['country of origin', 'nominal'], ['finishing place in a race (1st, 2nd, ...)', 'ordinal'],
      ['education level (primary, secondary, tertiary)', 'ordinal'], ['favourite colour', 'nominal'], ['number of defective items in a batch', 'discrete'], ['body temperature (°C)', 'continuous'], ['heads or tails', 'binary'], ['car brand', 'nominal']];
    const T = { discrete: 'quantitative – discrete', continuous: 'quantitative – continuous', binary: 'categorical – binary', nominal: 'categorical – nominal', ordinal: 'categorical – ordinal' };
    const W = { discrete: 'A discrete (diszkrét) változó megszámolt érték, csak egész lehet.', continuous: 'A continuous (folytonos) változó mért érték, egy tartományon belül bármilyen értéket felvehet.', binary: 'A binary (bináris) változónak csak két kimenete van.', nominal: 'A nominal (nominális) kategóriák között nincs sorrend.', ordinal: 'Az ordinal (ordinális, sorrendi) kategóriák rangsorolhatók.' };
    const [txt, t] = pick(items), others = shuffle(Object.keys(T).filter(k => k !== t)).slice(0, 3);
    return Q(`What type of variable is <b>${txt}</b>?`, T[t], others.map(o => [T[o], W[o] + ' Ez a változó nem ilyen.']), `${txt} → ${T[t]}\n${W[t]}`);
  },
  function seriesType() {
    const S = [['GDP of Hungary for each year 2015–2024', 'time'], ['monthly sales of a shop in 2025', 'time'], ['car production by country in 2015', 'spatial'], ['population of each Hungarian county in 2024', 'spatial'],
      ['number of students in a class by age (20, 21, 22 ...)', 'condition'], ['number of households by number of children', 'condition'], ['weights of 10 students listed one by one', 'individual'], ['marks of 8 students in the order they were collected', 'individual']];
    const T = { time: 'time series', spatial: 'spatial series', condition: 'condition series', individual: 'individual series' };
    const W = { time: 'A time series (idősor) időrendben rendezi az adatokat.', spatial: 'A spatial series (területi sor) helyek szerint rendez, az időpont rögzített.', condition: 'A condition series (feltétel szerinti sor) egy jellemző értékei (pl. életkor) szerint csoportosít.', individual: 'Az individual series (egyedi sor) minden megfigyelést külön felsorol.' };
    const [txt, t] = pick(S);
    return Q(`What kind of statistical series is this: <b>${txt}</b>?`, T[t], Object.keys(T).filter(k => k !== t).map(o => [T[o], W[o] + ' Itt nem ez a helyzet.']), `${txt} → ${T[t]}\n${W[t]}`);
  },
];

// ---------- 4. Középértékek ----------
function groupedTable(midPeak) {
  const L = pick([0, 10, 20, 40]), w = pick([5, 10, 20]);
  let fs; do { fs = [0, 1, 2, 3, 4].map(() => R(2, 15)); } while (midPeak && !midPeak(fs));
  const lo = fs.map((_, i) => L + i * w), mid = lo.map(l => l + w / 2), cls = lo.map(l => `${l}–${l + w}`);
  const n = sum(fs), cf = fs.map((_, i) => sum(fs.slice(0, i + 1)));
  return { L, w, fs, lo, mid, cls, n, cf, mean: sum(fs.map((x, i) => x * mid[i])) / n };
}
const medClass = t => t.cf.findIndex(c => c >= t.n / 2);
const peakOK = fs => { const m = Math.max(...fs), j = fs.indexOf(m); return j >= 1 && j <= 3 && fs.filter(x => x === m).length === 1 && fs[j - 1] !== fs[j + 1]; };
// A teljes feladatokban a táblázat a feladat elején van, a részkérdésből levágjuk.
const bare = x => (x.q = x.q.replace(/^<table[\s\S]*?<\/table>\s*/, ''), x);
const central = [
  function meanList() {
    let xs, s, md; do { xs = Array.from({ length: R(6, 9) }, () => R(1, 40)); s = [...xs].sort((a, b) => a - b); md = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; } while (Math.abs(mean(xs) - md) < 0.5);
    return Q(`Find the <b>arithmetic mean</b> of: ${xs.join(', ')}.`, mean(xs), [
      [md, 'Ez a median (medián), nem az átlag.'],
      [sum(xs) / (xs.length - 1), 'n − 1-gyel osztottál. A számtani átlagnál n-nel kell (itt n = ' + xs.length + ').'],
      [(s[0] + s[s.length - 1]) / 2, 'Ez csak a legkisebb és a legnagyobb érték átlaga, nem az összes adaté.'],
    ], `Σx = ${sum(xs)},  n = ${xs.length}\nx̄ = Σx / n = ${sum(xs)} / ${xs.length} = ${f(mean(xs), 3)}`, x => f(x, 3));
  },
  function weighted() {
    const names = ['Math', 'Statistics', 'Accounting', 'Economics'], k = R(3, 4);
    let g, w; do { g = Array.from({ length: k }, () => R(1, 5)); w = Array.from({ length: k }, () => R(2, 8)); } while (new Set(w).size < 2 || new Set(g).size < 2);
    const wm = sum(g.map((x, i) => x * w[i])) / sum(w), rw = [...w].reverse();
    return Q(`A student's grades and credits: ${tbl(['Subject', 'Grade', 'Credits'], names.slice(0, k).map((n, i) => [n, g[i], w[i]]))} Calculate the <b>weighted mean</b> of the grades (weights = credits).`, wm, [
      [mean(g), 'Ez az egyszerű átlag, a krediteket (weights, súlyok) nem vetted figyelembe.'],
      [sum(g.map((x, i) => x * w[i])) / k, 'A tárgyak számával osztottál. A súlyozott átlagnál a súlyok összegével (Σw) kell.'],
      [sum(g.map((x, i) => x * rw[i])) / sum(w), 'Rossz párosítás: a súlyokat nem a saját jegyükkel szoroztad.'],
    ], `Σw·x = ${g.map((x, i) => `${w[i]}·${x}`).join(' + ')} = ${sum(g.map((x, i) => x * w[i]))}\nΣw = ${sum(w)}\nweighted mean = ${sum(g.map((x, i) => x * w[i]))} / ${sum(w)} = ${f(wm, 3)}`, x => f(x, 3));
  },
  function geometric() {
    let r; do { r = [R(-10, 25), R(-10, 25), R(-10, 25)]; } while (r.includes(0) || new Set(r).size < 3);
    const fac = r.map(x => 1 + x / 100), prod = fac[0] * fac[1] * fac[2], gm = Math.cbrt(prod) - 1, s = [...r].sort((a, b) => a - b);
    return Q(`Prices changed by <b>${r.map(x => (x > 0 ? '+' : '') + x + '%').join('</b>, <b>')}</b> in three consecutive years. What is the <b>average yearly change</b>?`, gm, [
      [mean(r) / 100, 'Ez a százalékok számtani átlaga. Egymásra épülő változásoknál a növekedési tényezők geometric mean-je (mértani átlaga) kell.'],
      [prod - 1, 'Ez a teljes változás három év alatt, nem az évi átlag.'],
      [s[1] / 100, 'Ez a változások mediánja, nem az átlagos évi változás.'],
    ], `növekedési tényezők: ${fac.map(x => f(x, 2)).join(', ')}\nGM = ∛(${fac.map(x => f(x, 2)).join(' × ')}) = ∛${f(prod, 4)} = ${f(gm + 1, 4)}\nátlagos évi változás = ${f(gm + 1, 4)} − 1 = ${pc(gm)}`, x => (x > 0 ? '+' : '') + pc(x));
  },
  function harmonic() {
    let v1, v2; do { v1 = pick([30, 40, 50, 60, 80, 90, 100, 120]); v2 = pick([30, 40, 50, 60, 80, 90, 100, 120]); } while (v1 === v2);
    const d = R(2, 12) * 10, hm = 2 / (1 / v1 + 1 / v2);
    return Q(`A courier drives <b>${d} km at ${v1} km/h</b>, then another <b>${d} km at ${v2} km/h</b>. What is the <b>average speed</b>?`, hm, [
      [(v1 + v2) / 2, 'Ez a számtani átlag. Azonos távolságokon mért sebességeket a harmonic mean (harmonikus átlag) átlagol helyesen.'],
      [Math.sqrt(v1 * v2), 'Ez a geometric mean (mértani átlag), növekedési ütemekhez való, sebességhez nem.'],
      [1 / (1 / v1 + 1 / v2), 'A reciprokok összegével jól osztottál, de n = 2-vel nem szoroztál.'],
    ], `HM = n / Σ(1/x) = 2 / (1/${v1} + 1/${v2}) = ${f(hm, 2)} km/h\nellenőrzés: idő = ${d}/${v1} + ${d}/${v2} = ${f(d / v1 + d / v2, 4)} h → ${2 * d} km / ${f(d / v1 + d / v2, 4)} h = ${f(hm, 2)} km/h`, x => f(x, 2) + ' km/h');
  },
  function groupedMean(t = groupedTable()) {
    return Q(`${hrow('Class', t.cls, 'f', t.fs)} Find the <b>mean</b> (direct method).`, t.mean, [
      [sum(t.fs.map((x, i) => x * t.lo[i])) / t.n, 'Az alsó határokkal (lower limits) számoltál. Az osztályt az osztályközép (midpoint) képviseli.'],
      [sum(t.fs.map((x, i) => x * t.mid[i])) / 5, 'Az osztályok számával (5) osztottál, nem Σf-fel.'],
      [mean(t.mid), 'Nem súlyoztál a gyakoriságokkal, csak az osztályközepeket átlagoltad.'],
    ], `${tbl(['Class', 'f', 'x (midpoint)', 'f·x'], t.cls.map((c, i) => [c, t.fs[i], t.mid[i], t.fs[i] * t.mid[i]]))}Σf = ${t.n},  Σfx = ${sum(t.fs.map((x, i) => x * t.mid[i]))}\nx̄ = Σfx / Σf = ${f(t.mean, 3)}`, x => f(x, 3));
  },
  function stepDeviation() {
    let t, u, su; do { t = groupedTable(); u = [-2, -1, 0, 1, 2]; su = sum(t.fs.map((x, i) => x * u[i])); } while (su === 0);
    const A = t.mid[2], h = t.w;
    return Q(`${hrow('Class', t.cls, 'f', t.fs)} Find the mean with the <b>step deviation method</b>, A = ${A}, h = ${h}.`, t.mean, [
      [A + su / t.n, 'Elfelejtettél visszaszorozni h-val: x̄ = A + h · Σfu / Σf.'],
      [A + h * su, 'Nem osztottál Σf-fel.'],
      [A - h * su / t.n, 'Előjelhiba: az eltéréseket hozzá kell adni A-hoz.'],
    ], `${tbl(['Class', 'f', 'x', 'u = (x − A)/h', 'f·u'], t.cls.map((c, i) => [c, t.fs[i], t.mid[i], u[i], t.fs[i] * u[i]]))}Σf = ${t.n},  Σfu = ${su}\nx̄ = A + h · Σfu / Σf = ${A} + ${h} · (${su}) / ${t.n} = ${f(t.mean, 3)}`, x => f(x, 3));
  },
  function medianList() {
    let xs, s, n, md, w;
    do {
      n = R(6, 9); xs = Array.from({ length: n }, () => R(10, 99)); s = [...xs].sort((a, b) => a - b);
      if (n % 2) { md = s[(n - 1) / 2]; w = [[xs[(n - 1) / 2], 'Nem rendezted sorba az adatokat, csak a felsorolás középső elemét vetted.'], [mean(xs), 'Ez az átlag, nem a medián.'], [s[(n - 1) / 2 - 1], 'Eggyel elcsúsztál: páratlan n-nél az (n+1)/2-edik elem a medián.']]; }
      else { md = (s[n / 2 - 1] + s[n / 2]) / 2; w = [[s[n / 2 - 1], 'Páros elemszámnál a két középső elem átlaga a medián, nem az alsó.'], [s[n / 2], 'Páros elemszámnál a két középső elem átlaga a medián, nem a felső.'], [mean(xs), 'Ez az átlag, nem a medián.']]; }
    } while (new Set(w.map(x => f(x[0]))).size < 3 || w.some(x => f(x[0]) === f(md)));
    return Q(`Find the <b>median</b> of: ${xs.join(', ')}.`, md, w,
      `rendezve: ${s.join(', ')}   (n = ${n}, ${n % 2 ? 'páratlan' : 'páros'})\n${n % 2 ? `medián = ${(n + 1) / 2}. elem = ${md}` : `medián = (${n / 2}. + ${n / 2 + 1}. elem) / 2 = (${s[n / 2 - 1]} + ${s[n / 2]}) / 2 = ${f(md)}`}`, x => f(x, 2));
  },
  function medianGrouped(t) {
    if (!t) do { t = groupedTable(); } while (medClass(t) < 1);
    const j = medClass(t), cfb = t.cf[j - 1], l = t.lo[j], fj = t.fs[j], h = t.w, md = l + (t.n / 2 - cfb) / fj * h;
    return Q(`${hrow('Class', t.cls, 'f', t.fs)} Find the <b>median</b>.`, md, [
      [l + (t.n / 2 - t.cf[j]) / fj * h, 'A mediánosztály saját kumulált gyakoriságát vontad le. A cf a mediánosztály ELŐTTI osztály kumulált gyakorisága.'],
      [l + (t.n / 2 - cfb) / fj, 'Elfelejtettél h-val (osztályköz hossza) szorozni.'],
      [t.mid[j], 'Ez csak a mediánosztály közepe; a képlettel kell az osztályon belül pontosítani.'],
    ], `kumulált gyakoriság: ${t.cf.join(', ')}\nn/2 = ${t.n}/2 = ${f(t.n / 2)} → mediánosztály: ${t.cls[j]}\nl = ${l}, cf = ${cfb}, f = ${fj}, h = ${h}\nMedian = l + (n/2 − cf)/f × h = ${l} + (${f(t.n / 2)} − ${cfb})/${fj} × ${h} = ${f(md, 3)}`, x => f(x, 3));
  },
  function modeGrouped(t = groupedTable(peakOK)) {
    const j = t.fs.indexOf(Math.max(...t.fs)), f1 = t.fs[j], f0 = t.fs[j - 1], f2 = t.fs[j + 1], l = t.lo[j], h = t.w;
    const mo = l + (f1 - f0) / (2 * f1 - f0 - f2) * h;
    return Q(`${hrow('Class', t.cls, 'f', t.fs)} Find the <b>mode</b>.`, mo, [
      [t.mid[j], 'Ez csak a modális osztály közepe; a képlet a nagyobb gyakoriságú szomszéd felé tolja a móduszt.'],
      [l + (f1 - f2) / (2 * f1 - f0 - f2) * h, 'Felcserélted f₀-t és f₂-t. f₀ az előző, f₂ a következő osztály gyakorisága.'],
      [l + (f1 - f0) / (2 * f1 - f0 - f2), 'Elfelejtettél h-val (osztályköz hossza) szorozni.'],
    ], `modal class = ${t.cls[j]} (legnagyobb f = ${f1})\nl = ${l}, f₁ = ${f1}, f₀ = ${f0}, f₂ = ${f2}, h = ${h}\nMode = l + (f₁ − f₀)/(2f₁ − f₀ − f₂) × h = ${l} + ${f1 - f0}/${2 * f1 - f0 - f2} × ${h} = ${f(mo, 3)}`, x => f(x, 3));
  },
];

// ---------- 5. Szóródás ----------
function intList(n) { let xs; do { xs = Array.from({ length: n }, () => R(1, 20)); const r = sum(xs) % n; xs[n - 1] -= r; } while (xs[n - 1] < 1 || new Set(xs).size < 3); return xs; }
const dispersion = [
  function range() {
    const xs = Array.from({ length: R(6, 9) }, () => R(15, 30)); xs[R(0, xs.length - 1)] = R(40, 60);
    const s = [...xs].sort((a, b) => a - b), mx = s[s.length - 1], mn = s[0];
    return Q(`Ages: ${xs.join(', ')}. Find the <b>range</b>.`, mx - mn, [
      [s[s.length - 2] - mn, 'A második legnagyobb értékből számoltál. A range (terjedelem) a kiugró értéket (outlier) is tartalmazza, ezért érzékeny rá.'],
      [(mx - mn) / 2, 'Ez a terjedelem fele.'],
      [mx - mean(xs), 'A legnagyobb értékből az átlagot vontad le, nem a legkisebb értéket.'],
    ], `max = ${mx}, min = ${mn}\nrange = ${mx} − ${mn} = ${mx - mn}`, x => f(x, 2));
  },
  function variance() {
    const xs = intList(R(5, 7)), n = xs.length, m = mean(xs), ss = sum(xs.map(x => (x - m) ** 2)), pop = Math.random() < 0.5;
    const pv = ss / n, sv = ss / (n - 1), mad = sum(xs.map(x => Math.abs(x - m))) / n;
    const sol = `μ = ${sum(xs)} / ${n} = ${m}\neltérések: ${xs.map(x => x - m).join(', ')}\nnégyzetek: ${xs.map(x => (x - m) ** 2).join(' + ')} = ${ss}\n${pop ? `σ² = Σ(x − μ)² / N = ${ss} / ${n} = ${f(pv, 3)}` : `s² = Σ(x − x̄)² / (n − 1) = ${ss} / ${n - 1} = ${f(sv, 3)}`}`;
    return Q(`Find the <b>${pop ? 'population' : 'sample'} variance</b> of: ${xs.join(', ')}.`, pop ? pv : sv, [
      pop ? [sv, 'Ez a sample variance (mintavariancia), n − 1-gyel osztottál. Population (sokaság) esetén N-nel kell.'] : [pv, 'Ez a population variance (sokasági variancia). Sample (minta) esetén n − 1-gyel kell osztani.'],
      [Math.sqrt(pop ? pv : sv), 'Ez a standard deviation (szórás), a variancia négyzetgyöke. A kérdés a varianciára vonatkozik.'],
      [mad, 'Az eltérések abszolút értékét átlagoltad. A variancia az eltérések négyzetének átlaga.'],
    ], sol, x => f(x, 3));
  },
  function sdFreq() {
    let xs, fs, n, m; do { xs = shuffle([2, 4, 5, 6, 8, 10, 12, 15]).slice(0, R(3, 4)).sort((a, b) => a - b); fs = xs.map(() => R(1, 6)); n = sum(fs); m = sum(xs.map((x, i) => x * fs[i])) / n; } while (new Set(xs).size < xs.length);
    const d2 = xs.map(x => (x - m) ** 2), sfd = sum(d2.map((d, i) => d * fs[i])), sd = Math.sqrt(sfd / n);
    return Q(`${hrow('x', xs, 'f', fs)} Find the <b>standard deviation</b> (population formula).`, sd, [
      [sfd / n, 'Ez a variance (variancia); a szóráshoz még gyököt kell vonni.'],
      [Math.sqrt(sum(d2) / n), 'A négyzetes eltéréseket nem szoroztad meg a gyakoriságokkal (f).'],
      [Math.sqrt(sfd / xs.length), 'A különböző értékek számával (' + xs.length + ') osztottál, nem Σf-fel (' + n + ').'],
    ], `${tbl(['x', 'f', 'f·x', '(x − x̄)²', 'f(x − x̄)²'], xs.map((x, i) => [x, fs[i], x * fs[i], f(d2[i], 3), f(d2[i] * fs[i], 3)]))}x̄ = ${sum(xs.map((x, i) => x * fs[i]))} / ${n} = ${f(m, 3)}\nσ² = ${f(sfd, 3)} / ${n} = ${f(sfd / n, 3)}\nσ = √${f(sfd / n, 3)} = ${f(sd, 3)}`, x => f(x, 3));
  },
  function quartInd() {
    const N = pick([7, 11, 15]); let s; do { s = Array.from({ length: N }, () => R(100, 300)); } while (new Set(s).size < N);
    const xs = [...s]; s.sort((a, b) => a - b);
    const p1 = (N + 1) / 4, q1 = s[p1 - 1], q3 = s[3 * p1 - 1], qd = (q3 - q1) / 2, coef = (q3 - q1) / (q3 + q1), askQD = Math.random() < 0.5;
    const sol = `rendezve: ${s.join(', ')}  (N = ${N})\nQ1 = (N+1)/4 = ${p1}. elem = ${q1}\nQ3 = 3(N+1)/4 = ${3 * p1}. elem = ${q3}\nQD = (Q3 − Q1)/2 = ${f(qd, 3)}\ncoefficient = (Q3 − Q1)/(Q3 + Q1) = ${q3 - q1}/${q3 + q1} = ${f(coef, 4)}`;
    return askQD
      ? Q(`Data: ${xs.join(', ')}. Find the <b>quartile deviation</b>.`, qd, [[q3 - q1, 'Ez az interquartile range (IQR), a kvartiliseltérés ennek a fele.'], [(s[N - 1] - s[0]) / 2, 'A terjedelem felét számoltad, nem a kvartilisekből.'], [coef, 'Ez a coefficient of quartile deviation (relatív kvartiliseltérés).']], sol, x => f(x, 4))
      : Q(`Data: ${xs.join(', ')}. Find the <b>coefficient of quartile deviation</b>.`, coef, [[qd, 'Ez a quartile deviation (kvartiliseltérés), nem az együttható.'], [(q3 + q1) / (q3 - q1), 'Fordítva osztottál.'], [(q3 - q1) / s[(N - 1) / 2], 'A mediánnal osztottál; a képlet (Q3 − Q1)/(Q3 + Q1).']], sol, x => f(x, 4));
  },
  function quartGrouped() {
    const which = pick([1, 3]); let t, j, pos;
    do { t = groupedTable(); pos = which * t.n / 4; j = t.cf.findIndex(c => c >= pos); } while (j < 1 || t.cf[j - 1] === pos);
    const cfb = t.cf[j - 1], l = t.lo[j], fj = t.fs[j], h = t.w, q = l + (pos - cfb) / fj * h;
    const jm = t.cf.findIndex(c => c >= t.n / 2), med = t.lo[jm] + (t.n / 2 - (jm ? t.cf[jm - 1] : 0)) / t.fs[jm] * h;
    return Q(`${hrow('Class', t.cls, 'f', t.fs)} Find <b>Q${which}</b>.`, q, [
      [med, 'Ez a median (medián), N/2-vel számoltál. Q1-nél N/4, Q3-nál 3N/4 kell.'],
      [l + (pos - t.cf[j]) / fj * h, 'A kvartilisosztály saját kumulált gyakoriságát vontad le, nem az előzőét.'],
      [l + (pos - cfb) / fj, 'Elfelejtettél h-val szorozni.'],
    ], `kumulált gyakoriság: ${t.cf.join(', ')}\npozíció = ${which === 1 ? 'N/4' : '3N/4'} = ${f(pos, 2)} → osztály: ${t.cls[j]}\nl = ${l}, cf = ${cfb}, f = ${fj}, h = ${h}\nQ${which} = ${l} + (${f(pos, 2)} − ${cfb})/${fj} × ${h} = ${f(q, 3)}`, x => f(x, 3));
  },
  function nFromSS() {
    const v = R(4, 20), N = R(8, 30), ss = v * N;
    return Q(`The <b>population</b> variance of a data set is <b>${v}</b>, and the sum of squared deviations from the mean is <b>${ss}</b>. How many observations are there?`, N, [
      [N + 1, 'Mintát feltételeztél (n − 1 = ' + N + '), de a feladat population (sokasági) varianciát ad meg.'],
      [Math.sqrt(ss / v), 'Gyököt vontál, de itt nincs szórás: σ² = SS / N, ebből N = SS / σ².'],
      [N - 1, 'Eggyel kevesebb: N = SS / σ² pontosan.'],
    ], `σ² = Σ(x − μ)² / N  →  N = Σ(x − μ)² / σ² = ${ss} / ${v} = ${N}`, x => f(x, 3));
  },
];

// ---------- 6. Mintavétel ----------
const sampling = [
  function probSel() {
    const N = R(5, 60) * 100, n = R(1, 20) * 10, not = Math.random() < 0.4;
    return Q(`From a population of <b>${f(N)}</b>, <b>${n}</b> units are selected by simple random sampling. What is the probability that a given unit is <b>${not ? 'NOT selected' : 'selected'}</b>?`, not ? 1 - n / N : n / N, [
      [not ? n / N : 1 - n / N, not ? 'Ez annak a valószínűsége, hogy kiválasztják; a kérdés a NEM kiválasztásra vonatkozik.' : 'Ez annak a valószínűsége, hogy NEM választják ki.'],
      [1 / N, 'Ez egyetlen húzás esélye. Mivel ' + n + ' elemet választunk, a valószínűség n/N.'],
      [n / (N - n), 'A nem kiválasztottak számával osztottál, nem a teljes sokasággal.'],
    ], `P(selected) = n / N = ${n} / ${f(N)} = ${pc(n / N)}${not ? `\nP(not selected) = 1 − ${pc(n / N)} = ${pc(1 - n / N)}` : ''}`, x => pc(x));
  },
  function atLeastOnce() {
    const N = R(20, 300), n = R(3, 60), p = 1 - (1 - 1 / N) ** n;
    return Q(`<b>${n}</b> draws are made <b>with replacement</b> from a population of <b>${N}</b>. What is the probability that a given person is selected <b>at least once</b>?`, p, [
      [n / N, 'Ez a visszatevés nélküli képlet (n/N). Visszatevéssel ugyanaz az elem többször is kijöhet.'],
      [(1 - 1 / N) ** n, 'Ez annak a valószínűsége, hogy EGYSZER SEM választják ki; ezt még ki kell vonni 1-ből.'],
      [1 / N, 'Ez egyetlen húzás esélye.'],
    ], `P(egyszer sem) = (1 − 1/N)ⁿ = (1 − 1/${N})^${n} = ${f((1 - 1 / N) ** n, 4)}\nP(legalább egyszer) = 1 − ${f((1 - 1 / N) ** n, 4)} = ${pc(p)}`, x => pc(x));
  },
  function stratified() {
    const names = ['1st year', '2nd year', '3rd year', 'MSc'], S = names.map(() => R(2, 30) * 100), N = sum(S), n = N / pick([10, 20, 25, 50]), j = R(0, 3), s = S[j] / N * n;
    return Q(`${tbl(['Stratum', ...names], [['Size', ...S]])} A <b>proportionate</b> stratified sample of <b>${f(n)}</b> is taken. How many units come from the <b>${names[j]}</b> stratum?`, s, [
      [n / 4, 'Egyenlően osztottad szét a rétegek között (disproportionate). Arányos mintánál a réteg méretével arányos rész jár.'],
      [S[j] / N * 100, 'Ez a réteg aránya százalékban, nem a mintába kerülő darabszám.'],
      [S[j] / n, 'A réteg méretét a mintanagysággal osztottad. A képlet s = (S / N) × n.'],
    ], `N = ${S.join(' + ')} = ${f(N)}\ns = (S / N) × n = (${S[j]} / ${f(N)}) × ${f(n)} = ${f(s, 2)}`, x => f(x, 2));
  },
  function systematic() {
    const k = R(5, 50), n = R(20, 200), N = k * n, st = R(1, k), i = R(5, 40);
    return Q(`Systematic sampling: N = <b>${f(N)}</b>, n = <b>${n}</b>, random start = <b>${st}</b>. Which unit is the <b>${i}th</b> in the sample?`, st + (i - 1) * k, [
      [st + i * k, 'Eggyel elcsúsztál: az első elem maga a kezdőpont, ezért (i − 1)·k-t kell hozzáadni.'],
      [i * k, 'Nem a kezdőponttól indultál.'],
      [(i - 1) * k, 'Kimaradt a kezdőpont (random start).'],
    ], `k = N / n = ${f(N)} / ${n} = ${k}\n${i}. elem = start + (i − 1)·k = ${st} + ${i - 1}·${k} = ${st + (i - 1) * k}`, x => f(x));
  },
  function cluster() {
    const V = R(30, 80), a = R(20, 60), c = R(5, 15), m = R(5, 15), two = Math.random() < 0.5;
    return Q(`A region has <b>${V}</b> villages with on average <b>${a}</b> households each. We randomly select <b>${c}</b> villages${two ? ` and then randomly select <b>${m}</b> households in each selected village` : ` and survey every household in them`}. How many households are surveyed?`, two ? c * m : c * a, [
      two ? [c * a, 'Ez az egylépcsős (single-stage) minta. Itt kétlépcsős (two-stage), a falvakon belül újra mintát veszünk.'] : [c * m, 'Kétlépcsős mintát számoltál, de itt a kiválasztott falvak minden háztartását megkérdezzük.'],
      [V * a, 'Ez a teljes sokaság, nem a minta.'],
      [two ? V * m : V * a / c, two ? 'Az összes faluval számoltál, nem csak a kiválasztottakkal.' : 'Rossz művelet: n = ACS × kiválasztott klaszterek száma.'],
    ], two ? `two-stage: kiválasztott falvak × háztartás/falu = ${c} × ${m} = ${c * m}` : `single-stage: n = ACS × kiválasztott klaszterek = ${a} × ${c} = ${c * a}`, x => f(x, 2));
  },
  function methodId() {
    const S = [['Every 20th customer is chosen from an alphabetical list, starting from a random number between 1 and 20.', 'systematic'], ['Names of all employees are put in a hat and 30 are drawn.', 'simple'],
      ['The population is split by income level and a random sample is drawn from each income group in proportion to its size.', 'stratified'], ['5 schools are chosen at random and all students in these schools are surveyed.', 'cluster'],
      ['A random number generator picks 100 student IDs from the full list.', 'simple'], ['Students are grouped by year, and 25 are randomly chosen from each year.', 'stratified'],
      ['10 villages are drawn at random and every household in them is interviewed.', 'cluster'], ['Every 50th invoice is checked after a random start.', 'systematic']];
    const T = { simple: 'simple random sampling', systematic: 'systematic sampling', stratified: 'stratified sampling', cluster: 'cluster sampling' };
    const W = { simple: 'Simple random sampling (egyszerű véletlen): minden elem közvetlenül, azonos eséllyel kerül be, minta nélkül.', systematic: 'Systematic sampling (szisztematikus): véletlen kezdőpont után minden k-adik elem.', stratified: 'Stratified sampling (rétegzett): minden rétegből (stratum) választunk.', cluster: 'Cluster sampling (csoportos): néhány teljes csoportot választunk ki.' };
    const [txt, t] = pick(S);
    return Q(`Which sampling method is this? <i>${txt}</i>`, T[t], Object.keys(T).filter(k => k !== t).map(k => [T[k], W[k] + ' Itt nem ez történik.']), W[t]);
  },
];

// ---------- 7. Hipotézisvizsgálat ----------
const OPT = { rej: 'Reject H₀', fail: 'Fail to reject H₀', rejH1: 'Reject H₁', prove: 'Accept H₀ as proven true' };
const hypothesis = [
  function decideP() {
    const a = pick([0.01, 0.05, 0.1]); let p; do { p = pick([0.001, 0.004, 0.008, 0.012, 0.02, 0.03, 0.045, 0.06, 0.08, 0.12, 0.2, 0.35]); } while (p === a);
    const rej = p <= a;
    return Q(`A test gives <b>p = ${p}</b>. The significance level is <b>α = ${a}</b>. What is the decision?`, rej ? OPT.rej : OPT.fail, [
      [rej ? OPT.fail : OPT.rej, rej ? 'p ≤ α, ezért el kell vetni H₀-t.' : 'p > α, ezért H₀ nem vethető el.'],
      [OPT.rejH1, 'A döntés mindig H₀-ról szól: elvetjük vagy nem vetjük el.'],
      [OPT.prove, 'H₀-t sosem bizonyítjuk, legfeljebb nem vetjük el (fail to reject).'],
    ], `szabály: p ≤ α → reject H₀\n${p} ${rej ? '≤' : '>'} ${a} → ${rej ? OPT.rej : OPT.fail}`);
  },
  function hypPair() {
    const m = R(2, 20) * 5, S = [['more than', '>', '≤', '<', '≥'], ['less than', '<', '≥', '>', '≤'], ['different from', '≠', '=', '>', '≤']];
    const [verb, h1, h0, opp, opp0] = pick(S), ctx = pick(['the average waiting time (minutes)', 'the average number of daily visitors', 'the mean test score', 'the average delivery time (minutes)']);
    const tail = { '>': 'right-tailed', '<': 'left-tailed', '≠': 'two-tailed' }[h1];
    return Q(`We want to test whether ${ctx} is <b>${verb} ${m}</b>. Which hypotheses are correct?`, `H₀: μ ${h0} ${m},  H₁: μ ${h1} ${m}`, [
      [`H₀: μ ${h1} ${m},  H₁: μ ${h0} ${m}`, 'Felcserélted: az egyenlőség (=, ≤, ≥) mindig H₀-ba kerül, a bizonyítandó állítás H₁-be.'],
      [`H₀: μ ${opp0} ${m},  H₁: μ ${opp} ${m}`, 'Rossz irány: H₁ irányát a kérdés szava (' + verb + ') adja meg.'],
      [`H₀: μ ≠ ${m},  H₁: μ = ${m}`, 'H₀ nem tartalmazhat ≠ jelet, és H₁ nem lehet egyenlőség.'],
    ], `a bizonyítandó állítás („${verb}”) → H₁: μ ${h1} ${m}\nH₀ az ellentéte egyenlőséggel: μ ${h0} ${m}\n${tail} test`);
  },
  function errorType() {
    const h0true = Math.random() < 0.5, rej = Math.random() < 0.5;
    const ans = h0true && rej ? 'Type I error' : !h0true && !rej ? 'Type II error' : 'Correct decision';
    const W = { 'Type I error': 'Type I error (elsőfajú hiba, α): igaz H₀-t vetünk el.', 'Type II error': 'Type II error (másodfajú hiba, β): hamis H₀-t nem vetünk el.', 'Correct decision': 'Helyes döntés: igaz H₀-t megtartunk, vagy hamis H₀-t elvetünk.', 'Standard error': 'A standard error (standard hiba) a becslés szórása, nem döntési hiba.' };
    return Q(`In reality <b>H₀ is ${h0true ? 'true' : 'false'}</b>. Based on the sample we <b>${rej ? 'reject' : 'do not reject'} H₀</b>. What is this?`, ans,
      Object.keys(W).filter(k => k !== ans).map(k => [k, W[k]]), `H₀ ${h0true ? 'igaz' : 'hamis'}, döntés: ${rej ? 'elvetés' : 'megtartás'} → ${ans}\n${W[ans]}`);
  },
  function pairedT() {
    let n, b, d, m, s; do { n = R(5, 7); b = Array.from({ length: n }, () => R(50, 90)); d = b.map(() => R(-2, 8)); m = mean(d); s = Math.sqrt(sum(d.map(x => (x - m) ** 2)) / (n - 1)); } while (s === 0 || m === 0);
    const a = b.map((x, i) => x + d[i]), t = m / (s / Math.sqrt(n)), sp = Math.sqrt(sum(d.map(x => (x - m) ** 2)) / n);
    return Q(`Scores before and after a training: ${tbl(['', ...b.map((_, i) => i + 1)], [['before', ...b], ['after', ...a]])} Calculate the <b>paired t statistic</b> (d = after − before).`, t, [
      [m / (sp / Math.sqrt(n)), 'A szórásnál n-nel osztottál; mintából n − 1-gyel kell.'],
      [m / s, 'Nem osztottad s-t √n-nel (standard error).'],
      [m / (s / n), 's-t n-nel osztottad √n helyett.'],
    ], `d: ${d.join(', ')}\nm = ${sum(d)} / ${n} = ${f(m, 3)}\ns = √[Σ(d − m)² / (n − 1)] = √(${f(sum(d.map(x => (x - m) ** 2)), 3)} / ${n - 1}) = ${f(s, 4)}\nt = m / (s/√n) = ${f(m, 3)} / (${f(s, 4)}/√${n}) = ${f(t, 3)}\ndf = n − 1 = ${n - 1}`, x => f(x, 3));
  },
  function tDecision() {
    const crit = pick([[2.262, 9], [2.776, 4], [2.571, 5], [2.447, 6], [2.365, 7], [2.306, 8]]); let t; do { t = (Math.random() < 0.5 ? -1 : 1) * R(5, 60) / 10; } while (Math.abs(Math.abs(t) - crit[0]) < 0.1);
    const rej = Math.abs(t) > crit[0];
    return Q(`Two-tailed test, df = ${crit[1]}, α = 0.05. Critical value: <b>±${crit[0]}</b>. Test statistic: <b>t = ${t}</b>. Decision?`, rej ? OPT.rej : OPT.fail, [
      [rej ? OPT.fail : OPT.rej, rej ? '|t| > kritikus érték, ezért el kell vetni H₀-t.' : '|t| ≤ kritikus érték, ezért H₀ nem vethető el.'],
      [OPT.rejH1, 'A döntés mindig H₀-ról szól.'],
      [OPT.prove, 'H₀-t sosem bizonyítjuk, legfeljebb nem vetjük el.'],
    ], `kétoldali próbánál |t|-t hasonlítjuk a kritikus értékhez\n|${t}| = ${Math.abs(t)} ${rej ? '>' : '≤'} ${crit[0]} → ${rej ? OPT.rej : OPT.fail}`);
  },
];

// ---------- 8. ANOVA ----------
function anova(gs) {
  const all = gs.flat(), gm = mean(all), ms = gs.map(mean);
  const ssb = sum(gs.map((g, i) => g.length * (ms[i] - gm) ** 2)), ssw = sum(gs.map((g, i) => sum(g.map(x => (x - ms[i]) ** 2))));
  const k = gs.length, n = all.length;
  return { gm, ms, ssb, ssw, k, n, msb: ssb / (k - 1), msw: ssw / (n - k), F: (ssb / (k - 1)) / (ssw / (n - k)) };
}
const anovaGens = [
  function dfs() {
    const k = R(3, 5), sizes = Array.from({ length: k }, () => R(4, 10)), n = sum(sizes), w = pick(['within', 'between', 'total']);
    const V = { between: k - 1, within: n - k, total: n - 1 };
    const W = { between: 'Ez df(between) = k − 1.', within: 'Ez df(within) = n − k.', total: 'Ez df(total) = n − 1.' };
    return Q(`One-way ANOVA with <b>${k} groups</b> of sizes ${sizes.join(', ')}. What is <b>df(${w})</b>?`, V[w], [...Object.keys(V).filter(x => x !== w).map(x => [V[x], W[x]]), [n, 'Ez a teljes elemszám, nem szabadságfok.'], [n - k - 1, 'Eggyel többet vontál le: df(within) = n − k.']],
      `k = ${k}, n = ${sizes.join(' + ')} = ${n}\ndf(between) = k − 1 = ${k - 1}\ndf(within) = n − k = ${n - k}\ndf(total) = n − 1 = ${n - 1}`, x => f(x));
  },
  function fFromSS() {
    const k = R(3, 5), n = k * R(4, 8), ssb = R(20, 400), ssw = R(100, 900), F = (ssb / (k - 1)) / (ssw / (n - k));
    return Q(`ANOVA: k = <b>${k}</b> groups, n = <b>${n}</b>, SS(B) = <b>${ssb}</b>, SS(W) = <b>${ssw}</b>. Calculate <b>F</b>.`, F, [
      [ssb / ssw, 'Az SS-eket osztottad, nem az MS-eket. Előbb mindkettőt el kell osztani a szabadságfokával.'],
      [1 / F, 'Fordítva: F = MS(B) / MS(W).'],
      [(ssb / (k - 1)) / (ssw / (n - 1)), 'MS(W)-nél n − 1-gyel osztottál; df(within) = n − k.'],
    ], `MS(B) = SS(B) / (k − 1) = ${ssb} / ${k - 1} = ${f(ssb / (k - 1), 3)}\nMS(W) = SS(W) / (n − k) = ${ssw} / ${n - k} = ${f(ssw / (n - k), 3)}\nF = ${f(ssb / (k - 1), 3)} / ${f(ssw / (n - k), 3)} = ${f(F, 3)}`, x => f(x, 3));
  },
  function fullAnova() {
    let gs, a; do { const sz = R(3, 4); gs = [0, 1, 2].map(() => { const b = R(2, 12); return Array.from({ length: sz }, () => b + R(-2, 2)); }); a = anova(gs); } while (a.ssw === 0 || a.ssb < 0.01);
    const names = ['A', 'B', 'C'];
    return Q(`Three groups: ${tbl(['Group', 'Values'], gs.map((g, i) => [names[i], g.join(', ')]))} Calculate the <b>F statistic</b> of a one-way ANOVA.`, a.F, [
      [a.ssb / a.ssw, 'Az SS-eket osztottad, nem az MS-eket (SS / df).'],
      [1 / a.F, 'Fordítva: F = MS(B) / MS(W).'],
      [(a.ssb / 2) / (a.ssw / (a.n - 1)), 'MS(W)-nél n − 1-gyel osztottál; df(within) = n − k.'],
    ], `csoportátlagok: ${a.ms.map(x => f(x, 3)).join(', ')};  főátlag = ${f(a.gm, 3)}\nSS(B) = Σ nᵢ(x̄ᵢ − x̄)² = ${f(a.ssb, 3)}\nSS(W) = Σ(x − x̄ᵢ)² = ${f(a.ssw, 3)}\ndf(B) = ${a.k - 1}, df(W) = ${a.n - a.k}\nMS(B) = ${f(a.msb, 3)},  MS(W) = ${f(a.msw, 3)}\nF = ${f(a.msb, 3)} / ${f(a.msw, 3)} = ${f(a.F, 3)}`, x => f(x, 3));
  },
  function fDecision() {
    const c = pick([[2, 6, 5.14], [2, 9, 4.26], [2, 12, 3.89], [3, 16, 3.24], [2, 21, 3.47], [3, 20, 3.10]]);
    let F; do { F = R(5, 120) / 10; } while (Math.abs(F - c[2]) < 0.1);
    const rej = F > c[2];
    return Q(`One-way ANOVA: F = <b>${F}</b>, df = (${c[0]}, ${c[1]}), α = 0.05, F<sub>table</sub> = <b>${c[2]}</b>. Decision?`, rej ? OPT.rej : OPT.fail, [
      [rej ? OPT.fail : OPT.rej, rej ? 'F > F(table), ezért H₀-t elvetjük.' : 'F ≤ F(table), ezért H₀ nem vethető el.'],
      [OPT.rejH1, 'A döntés mindig H₀-ról szól.'],
      [OPT.prove, 'H₀-t sosem bizonyítjuk, legfeljebb nem vetjük el.'],
    ], `F-próba mindig jobboldali (right-tailed)\n${F} ${rej ? '>' : '≤'} ${c[2]} → ${rej ? OPT.rej + ': legalább egy csoportátlag eltér' : OPT.fail + ': nincs szignifikáns különbség'}`);
  },
  function ssw() {
    const k = R(3, 4), n = k * R(4, 8), sst = R(300, 1500), ssb = R(50, sst - 100);
    return Q(`SS(Total) = <b>${sst}</b>, SS(Between) = <b>${ssb}</b>, k = ${k}, n = ${n}. What is <b>SS(Within)</b>?`, sst - ssb, [
      [sst + ssb, 'Összeadtad; SS(T) = SS(B) + SS(W), tehát SS(W) = SS(T) − SS(B).'],
      [(sst - ssb) / (n - k), 'Ez már MS(W): SS(W) / df(within).'],
      [ssb / sst, 'Ez az arányuk, nem az SS(W).'],
    ], `SS(Total) = SS(B) + SS(W)\nSS(W) = ${sst} − ${ssb} = ${sst - ssb}`, x => f(x, 3));
  },
];

// ---------- Tippek (generátor neve szerint) ----------
const HINTS = {
  unitRatio: 'Először váltsd át mindkét mennyiséget ugyanarra a mértékegységre, aztán egyszerűsíts a legnagyobb közös osztóval. A sorrend a kérdés sorrendje.',
  divide: 'Add össze az arány tagjait (összes rész), oszd el vele az összeget (egy rész értéke), majd szorozd meg az első tag számával.',
  unknown: 'A megadott lányszám csak a lányokra eső részeknek felel meg. Egy rész = lányok / a lányok aránytagja.',
  compound: 'Hozd a közös B tagot azonos értékre: bővítsd az első arányt a második B-jével, a másodikat az első B-jével.',
  vm: 'Distribution ratio (Vm, megoszlási) = rész / egész. Előbb add össze az összes csoportot.',
  vk: 'Coordination ratio (Vk, koordinációs) = egyik rész / másik rész, a kérdés sorrendjében. Az egész itt nem kell.',
  dynamic: 'Base ratio (Vdb): mindig a bázisévhez (2020) osztasz. Chain ratio (Vdl): mindig az előző évhez.',
  baseFromChain: 'A láncviszonyszámokat (Vdl) tizedes törtként szorozd össze; a szorzat a bázisviszonyszám (Vdb).',
  plan: 'Három szám van: bázis (tavaly), terv, tény. Vf = terv / bázis, Vt = tény / terv, Vd = tény / bázis.',
  intensity: 'Intensity ratio (Vi): jelenség / viszonyítási alap. „Per 1,000 people” → szorozd 1000-rel.',
  oddsRatio: 'Odds = bekövetkezett / NEM bekövetkezett (nem az összes!). OR = az első csoport oddsa / a második csoport oddsa.',
  relRisk: 'Relative risk: előbb a két valószínűség (esetek / csoport létszáma), aztán ezek hányadosa (kezelt / kontroll).',
  notation: 'A betűk a magyar nevekből jönnek: V = viszonyszám, utána a magyar név kezdőbetűje (m = megoszlási, k = koordinációs, d = dinamikus: b = bázis, l = lánc, f = tervfeladat, t = tervteljesítés, i = intenzitási, ö = összehasonlító).',
  relFreq: 'Relative frequency = f / n, ahol n az összes gyakoriság összege (Σf), nem a különböző értékek száma.',
  cumulative: '„At most x” (x ≤): add össze a gyakoriságokat a legkisebb értéktől x-ig, x-et is beleértve.',
  classWidth: 'Class width = (max − min) / osztályok száma, majd felfelé kerekítés 5 többszörösére.',
  midpoint: 'Midpoint = (alsó határ + felső határ) / 2. Figyelj, hányadik osztályról van szó.',
  groupedRange: 'Osztályközös sorban: range = az utolsó osztály felső határa − az első osztály alsó határa. A gyakoriságok itt nem számítanak.',
  varType: 'Előbb: szám (quantitative) vagy kategória (categorical)? Számnál: megszámolt (discrete) vagy mért (continuous)? Kategóriánál: két kimenet (binary), van sorrend (ordinal) vagy nincs (nominal)?',
  seriesType: 'Mi szerint vannak rendezve az adatok: idő (time), hely (spatial), egy jellemző értéke (condition), vagy minden adat külön (individual)?',
  meanList: 'Arithmetic mean (x̄) = Σx / n: add össze az összes értéket, és oszd el a darabszámmal.',
  weighted: 'Weighted mean = Σ(w·x) / Σw. Minden jegyet a saját kreditjével szorozz, és a kreditek összegével oszd.',
  geometric: 'Egymásra épülő százalékos változás → geometric mean (mértani átlag). Írd fel a tényezőket (1 + r), szorozd össze, vonj köbgyököt, végül vonj le 1-et.',
  harmonic: 'Azonos távolságokon mért sebességek átlaga → harmonic mean: n / Σ(1/x). Ellenőrzés: teljes út / teljes idő.',
  groupedMean: 'Minden osztályt az osztályközép (midpoint) képvisel. x̄ = Σ(f·x) / Σf.',
  stepDeviation: 'Számold ki minden osztályközépre: u = (x − A) / h, aztán Σfu-t. x̄ = A + h · Σfu / Σf.',
  medianList: 'Előbb rendezd sorba! Páratlan n: a középső elem; páros n: a két középső átlaga.',
  medianGrouped: 'Kumulált gyakoriságok; a mediánosztály az első, ahol cf ≥ n/2. Median = l + (n/2 − cf)/f × h, ahol cf az ELŐZŐ osztályé.',
  modeGrouped: 'A modális osztály a legnagyobb gyakoriságú. f₀ az előtte, f₂ az utána lévő osztály gyakorisága. Mode = l + (f₁ − f₀)/(2f₁ − f₀ − f₂) × h.',
  range: 'Range = max − min, a kiugró értéket is beleértve.',
  variance: 'Átlag → eltérések → négyzetösszeg. Population: N-nel osztasz, sample: n − 1-gyel. A varianciánál nincs gyökvonás.',
  sdFreq: 'Gyakorisági sornál minden négyzetes eltérést szorozz f-fel: σ² = Σf(x − x̄)² / Σf, a szórás ennek a gyöke.',
  quartInd: 'Rendezd sorba. Q1 = (N+1)/4-edik, Q3 = 3(N+1)/4-edik elem. QD = (Q3 − Q1)/2, coefficient = (Q3 − Q1)/(Q3 + Q1).',
  quartGrouped: 'Mint a medián, csak n/2 helyett N/4 (Q1) vagy 3N/4 (Q3). Keresd az első osztályt, ahol cf ≥ pozíció.',
  nFromSS: 'σ² = SS / N. Rendezd át N-re.',
  probSel: 'Simple random sampling: P(kiválasztás) = n / N. A „NOT selected” ennek a komplementere: 1 − n/N.',
  atLeastOnce: 'Visszatevéssel előbb azt számold ki, hogy egyszer sem választják ki: (1 − 1/N)ⁿ. A „legalább egyszer” ennek a komplementere.',
  stratified: 'Proportionate (arányos): s = (réteg mérete / N) × n. Előbb add össze a rétegeket, így kapod N-et.',
  systematic: 'k = N / n. Az első elem maga a kezdőpont, az i-edik: start + (i − 1)·k.',
  cluster: 'Single-stage: a kiválasztott klaszterekben mindenkit megkérdezünk. Two-stage: a klasztereken belül is mintát veszünk.',
  methodId: 'Kulcsszavak: „every k-th” → systematic; MINDEN csoportból választunk → stratified; néhány teljes csoport → cluster; közvetlen húzás a teljes listából → simple.',
  decideP: 'Csak két döntés van: Reject H₀ vagy Fail to reject H₀. Szabály: p ≤ α → reject.',
  hypPair: 'Az egyenlőség (=, ≤, ≥) mindig H₀-ba kerül. Amit bizonyítani akarunk (more / less / different), az H₁.',
  errorType: 'Type I: igaz H₀-t vetünk el. Type II: hamis H₀-t megtartunk. A másik két eset helyes döntés.',
  pairedT: 'd = after − before minden párra. m = d átlaga, s = d szórása (n − 1-gyel), t = m / (s/√n).',
  tDecision: 'Kétoldali próba: |t|-t hasonlítsd a kritikus értékhez. Ha nagyobb → reject H₀.',
  dfs: 'df(between) = k − 1, df(within) = n − k, df(total) = n − 1; k a csoportok, n az összes elem száma.',
  fFromSS: 'Előbb MS = SS / df mindkettőre: MS(B) = SS(B)/(k − 1), MS(W) = SS(W)/(n − k). Utána F = MS(B) / MS(W).',
  fullAnova: 'Csoportátlagok → főátlag → SS(B) = Σnᵢ(x̄ᵢ − x̄)² → SS(W) = Σ(x − x̄ᵢ)² → MS = SS/df → F = MS(B)/MS(W).',
  fDecision: 'Az F-próba mindig jobboldali: F > F(table) → reject H₀.',
  ssw: 'SS(Total) = SS(B) + SS(W). Rendezd át SS(W)-re.',
};

// ---------- Teljes feladatok ----------
// Egy közös adatsor (stem) több részkérdéssel; minden rész egy Q(...) tippel.
const H = (hint, x) => (x.hint = hint, x);
const byName = (gens, name) => t => H(HINTS[name], bare(gens.find(g => g.name === name)(t)));
const tCrit = { 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262 }; // kétoldali, α = 0,05
const fCrit = { 6: 5.14, 7: 4.74, 8: 4.46, 9: 4.26 }; // F(2, df2), α = 0,05

function classCase() {
  let b, g, add, p, q, k2;
  do { b = R(2, 12) * 5; g = R(2, 12) * 5; add = R(1, 6) * 5; [p, q] = ratioStr(b, g).split(' : ').map(Number); k2 = R(2, 9); } while (b === g || b + add === g || q * k2 === g);
  const G2 = q * k2;
  return { title: 'Osztálylétszám', stem: `A class has <b>${b} boys</b> and <b>${g} girls</b>.`, parts: [
    H('Írd fel fiúk : lányok sorrendben, aztán egyszerűsíts a legnagyobb közös osztóval.', Q('Find the ratio of boys to girls in simplest form.', ratioStr(b, g), [
      [`${b} : ${g}`, 'Az arány jó, de nem egyszerűsítetted (simplest form, legegyszerűbb alak).'],
      [ratioStr(g, b), 'Fordított sorrend: a kérdés boys to girls, tehát a fiúk vannak elöl.'],
      [ratioStr(b, b + g), 'Ez part-to-whole ratio (rész az egészhez), itt két részt kell összehasonlítani.'],
    ], `${b} : ${g}\nlegnagyobb közös osztó = ${gcd(b, g)}  →  ${p} : ${q}`)),
    H('Part-to-whole: a rész (fiúk) kerül előre, az egész (összes tanuló) hátra.', Q('What is the <b>part-to-whole</b> ratio of boys (boys : all students)?', ratioStr(b, b + g), [
      [ratioStr(b, g), 'Ez part-to-part ratio (rész a részhez): fiúk : lányok.'],
      [ratioStr(g, b + g), 'Ez a lányok aránya az egészhez, nem a fiúké.'],
      [ratioStr(b + g, b), 'Fordított sorrend: egész : rész.'],
    ], `összes = ${b} + ${g} = ${b + g}\n${b} : ${b + g} = ${ratioStr(b, b + g)}`)),
    H('Proportion (arány az egészben) = rész / egész, százalékban.', Q('What proportion of the class are <b>girls</b>?', g / (b + g), [
      [b / (b + g), 'Ez a fiúk aránya.'],
      [g / b, 'Ez lányok / fiúk (part-to-part), nem rész / egész.'],
      [g / (b + g + add), 'A később érkező fiúkat is beszámoltad; ez a kérdés az eredeti osztályról szól.'],
    ], `lányok / összes = ${g} / ${b + g} = ${pc(g / (b + g))}`, x => pc(x))),
    H('Előbb a tényleges létszámhoz add hozzá az új fiúkat, utána írd fel és egyszerűsítsd az arányt.', Q(`<b>${add} more boys</b> join the class. What is the new ratio of boys to girls?`, ratioStr(b + add, g), [
      [ratioStr(p + add, q), 'Az egyszerűsített arány tagjához adtad hozzá; a tényleges létszámhoz kell.'],
      [ratioStr(b, g + add), 'A lányokhoz adtad hozzá az új tanulókat.'],
      [ratioStr(g, b + add), 'Fordított sorrend.'],
    ], `fiúk = ${b} + ${add} = ${b + add}\n${b + add} : ${g} = ${ratioStr(b + add, g)}`)),
    H(`Az a) arány ${p} : ${q}. A lányok ${q} részt tesznek ki, egy rész = lányok / ${q}.`, Q(`Another class has the <b>same ratio</b> as in a) and <b>${G2} girls</b>. How many boys are there?`, p * k2, [
      [G2 * q / p, 'Fordítva használtad az arányt.'],
      [G2 * p, 'Nem osztottad el a lányok számát a lány-részek számával.'],
      [G2 / (p + q) * p, `Az összes rész számával osztottál, de a lányok csak ${q} részt tesznek ki.`],
    ], `egy rész = ${G2} / ${q} = ${k2}\nfiúk = ${p} × ${k2} = ${p * k2}`, x => f(x))),
  ] };
}

function productionCase() {
  const years = [2020, 2021, 2022, 2023, 2024]; let ys, P;
  do { ys = [R(20, 60) * 10]; for (let i = 1; i < 5; i++) ys.push(Math.round(ys[i - 1] * (0.9 + Math.random() * 0.25))); P = Math.round(ys[3] * (1 + R(2, 15) / 100)); } while (P === ys[4] || ys[4] === ys[3]);
  const y0 = ys[0], y3 = ys[3], y4 = ys[4], vdb = y4 / y0, vdl = y4 / y3, vf = P / y3, vt = y4 / P, F = x => pc(x);
  return { title: 'Termelés és terv', stem: `Production of a factory (units): ${tbl(years, [ys])} The <b>plan for 2024</b> was <b>${P}</b> units (base period of the plan: 2023).`, parts: [
    H('Base ratio (Vdb): a tárgyévet mindig a rögzített bázisévhez (2020) osztod.', Q('Calculate the <b>base ratio</b> for 2024 (base year 2020).', vdb, [
      [vdl, 'Ez a chain ratio (Vdl): az előző évhez viszonyítottál.'], [y0 / y4, 'Fordítva osztottál: bázis / tárgyév.'], [vdb - 1, 'Ez a változás mértéke (Vdb − 100%), nem maga a base ratio.'],
    ], `Vdb = y(2024) / y(2020) = ${y4} / ${y0} = ${pc(vdb)}`, F)),
    H('Chain ratio (Vdl): a tárgyévet az előző évhez osztod.', Q('Calculate the <b>chain ratio</b> for 2024.', vdl, [
      [vdb, 'Ez a base ratio (Vdb): 2020-hoz viszonyítottál.'], [y3 / y4, 'Fordítva osztottál.'], [vdl - 1, 'Ez a változás mértéke, nem maga a chain ratio.'],
    ], `Vdl = y(2024) / y(2023) = ${y4} / ${y3} = ${pc(vdl)}`, F)),
    H('Task indicator ratio (Vf, tervfeladat): terv / bázis. A bázis itt az előző év tényadata.', Q('Calculate the <b>task indicator ratio (Vf)</b> for 2024.', vf, [
      [vt, 'Ez Vt (performance indicator): tény / terv.'], [P / y0, 'A 2020-as adathoz osztottál; a terv bázisa az előző év (2023).'], [y3 / P, 'Fordítva osztottál: bázis / terv.'],
    ], `Vf = terv / bázis = ${P} / ${y3} = ${pc(vf)}`, F)),
    H('Performance indicator ratio (Vt, tervteljesítés): tény / terv.', Q('Calculate the <b>performance indicator ratio (Vt)</b> for 2024.', vt, [
      [vf, 'Ez Vf (task indicator): terv / bázis.'], [P / y4, 'Fordítva osztottál: terv / tény.'], [vdl, 'Ez a chain ratio (tény / előző év), nem a tervhez viszonyított teljesítés.'],
    ], `Vt = tény / terv = ${y4} / ${P} = ${pc(vt)}`, F)),
    H('Írd fel törtként: (terv / bázis) × (tény / terv). Mi marad, ha a „terv” kiesik?', Q('<b>Vf × Vt</b> equals which ratio?', 'Vdl – chain ratio for 2024 (actual / previous year)', [
      ['Vdb – base ratio for 2024 (actual / 2020)', 'A terv bázisa 2023, nem 2020, ezért a szorzat a 2023-hoz viszonyított dinamikus viszonyszám.'],
      ['Vm – distribution ratio', 'A distribution ratio (megoszlási) rész / egész, ennek itt nincs szerepe.'],
      ['Vk – coordination ratio', 'A coordination ratio (koordinációs) két rész hányadosa, ennek itt nincs szerepe.'],
    ], `Vf × Vt = (terv / bázis) × (tény / terv) = tény / bázis\nbázis = 2023 → Vdl(2024)\nellenőrzés: ${f(vf, 4)} × ${f(vt, 4)} = ${f(vf * vt, 4)} = ${pc(vdl)}`)),
  ] };
}

function marksCase() {
  let xs, fs, n, all, mo, md, j, k, i2;
  do {
    xs = pick([[10, 15, 18, 20, 22], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [5, 10, 15, 20, 25]]); fs = xs.map(() => R(1, 7)); n = sum(fs);
    all = xs.flatMap((x, i) => Array(fs[i]).fill(x)); mo = xs[fs.indexOf(Math.max(...fs))];
    md = n % 2 ? all[(n - 1) / 2] : (all[n / 2 - 1] + all[n / 2]) / 2; j = R(1, 4); k = R(1, 3);
    i2 = fs.indexOf(Math.max(...fs.filter(x => x !== Math.max(...fs))));
  } while (fs.filter(x => x === Math.max(...fs)).length > 1 || i2 < 0);
  const cf = fs.map((_, i) => sum(fs.slice(0, i + 1))), F = x => f(x);
  const table = tbl(['x', 'f', 'cumulative f'], xs.map((x, i) => [x, fs[i], cf[i]]));
  return { title: 'Nyers adatokból gyakorisági sor', stem: `The marks of <b>${n} students</b> in a test: ${shuffle([...all]).join(', ')}.`, parts: [
    H('Készíts gyakorisági táblát (tally marks): írd le a különböző értékeket, és számold meg, melyik hányszor fordul elő.', Q(`How many students got <b>${xs[j]}</b>?`, fs[j], [
      [cf[j], `Ez a kumulált gyakoriság (x ≤ ${xs[j]}), nem csak a ${xs[j]}-esek száma.`], [n - fs[j], 'Ez a többi tanuló száma.'], [fs[j] + 1, 'Eggyel elszámoltad; érdemes strigulázni (tally marks).'],
    ], `${table}f(${xs[j]}) = ${fs[j]}`, F)),
    H('Relative frequency = f / n, n = az összes tanuló száma.', Q(`What is the <b>relative frequency</b> of the mark ${xs[j]}?`, fs[j] / n, [
      [cf[j] / n, 'Ez a cumulative relative frequency (kumulált relatív gyakoriság).'], [fs[j] / xs.length, `A különböző értékek számával (${xs.length}) osztottál, nem n-nel (${n}).`], [fs[j] / (n - fs[j]), 'A többiekhez viszonyítottál, nem az összeshez.'],
    ], `${fs[j]} / ${n} = ${pc(fs[j] / n)}`, x => pc(x))),
    H('„At most” (legfeljebb): a kérdezett értéket és az összes kisebbet is számold.', Q(`How many students got <b>at most ${xs[k]}</b>?`, cf[k], [
      [fs[k], `Ez csak a ${xs[k]}-esek száma.`], [cf[k - 1], `Kimaradt maga a ${xs[k]}; a „legfeljebb” tartalmazza.`], [n - cf[k], `Ez a „több mint ${xs[k]}” válasza.`],
    ], `${table}x ≤ ${xs[k]}: ${fs.slice(0, k + 1).join(' + ')} = ${cf[k]}`, F)),
    H('Mode (módusz) = a leggyakoribb ÉRTÉK (nem a gyakorisága).', Q('What is the <b>mode</b>?', mo, [
      [Math.max(...fs), 'Ez a módusz gyakorisága (hányszor fordul elő), nem maga az érték.'], [xs[i2], 'Ez a második leggyakoribb érték.'], [mean(all), 'Ez az átlag, nem a módusz.'],
    ], `${table}legnagyobb f = ${Math.max(...fs)} → mode = ${mo}`, F)),
    H(`n = ${n}, ${n % 2 ? `páratlan: a(z) ${(n + 1) / 2}. elem` : `páros: a(z) ${n / 2}. és ${n / 2 + 1}. elem átlaga`}. A kumulált gyakoriságból látod, melyik értékre esik.`, Q('What is the <b>median</b>?', md, [
      [mean(all), 'Ez az átlag, nem a medián.'], [n % 2 ? (n + 1) / 2 : n / 2, 'Ez a medián pozíciója (sorszáma), nem az értéke.'], [xs[2], 'Ez a különböző értékek középsője; a gyakoriságokat is figyelembe kell venni.'],
    ], `${table}${n % 2 ? `medián = ${(n + 1) / 2}. elem = ${md}` : `medián = (${n / 2}. + ${n / 2 + 1}. elem) / 2 = (${all[n / 2 - 1]} + ${all[n / 2]}) / 2 = ${f(md)}`}`, F)),
  ] };
}

function groupedCase() {
  let t; do { t = groupedTable(peakOK); } while (medClass(t) < 1);
  const j = medClass(t), mj = t.fs.indexOf(Math.max(...t.fs));
  return { title: 'Osztályközös gyakorisági sor', stem: `Test scores of students: ${hrow('Class', t.cls, 'f', t.fs)}`, parts: [
    byName(central, 'groupedMean')(t),
    H('Számold ki a kumulált gyakoriságokat. A mediánosztály az első osztály, ahol cf ≥ n/2.', Q('Which is the <b>median class</b>?', t.cls[j], [
      [t.cls[mj], 'Ez a modális osztály (legnagyobb gyakoriság), nem a mediánosztály.'], [t.cls[2], 'Ez csak a középső osztály; a mediánosztályt a kumulált gyakoriság dönti el.'],
      ...t.cls.map((c, k) => [c, k < j ? 'Itt a kumulált gyakoriság még kisebb, mint n/2.' : 'Már egy korábbi osztályban eléri a kumulált gyakoriság az n/2-t.']),
    ], `kumulált gyakoriság: ${t.cf.join(', ')}\nn/2 = ${f(t.n / 2)} → első osztály, ahol cf ≥ n/2: ${t.cls[j]}`)),
    byName(central, 'medianGrouped')(t),
    byName(central, 'modeGrouped')(t),
  ] };
}

function sampleCase() {
  const xs = intList(R(5, 7)), n = xs.length, m = mean(xs), dev = xs.map(x => x - m), ss = sum(dev.map(d => d * d)), s2 = ss / (n - 1), s = Math.sqrt(s2);
  const so = [...xs].sort((a, b) => a - b), mx = so[n - 1], mn = so[0], md = n % 2 ? so[(n - 1) / 2] : (so[n / 2 - 1] + so[n / 2]) / 2, F = x => f(x, 3);
  const table = tbl(['x', 'x − x̄', '(x − x̄)²'], xs.map((x, i) => [x, dev[i], dev[i] ** 2]));
  return { title: 'Minta szóródása', stem: `A <b>sample</b> of ${n} employees worked the following overtime hours last month: ${xs.join(', ')}.`, parts: [
    H('Range = legnagyobb − legkisebb érték.', Q('What is the <b>range</b>?', mx - mn, [
      [(mx - mn) / 2, 'Ez a terjedelem fele.'], [mx - m, 'A legnagyobb értékből az átlagot vontad le.'], [so[n - 2] - so[1], 'Kihagytad a szélső értékeket; a range pont azokból számol.'],
    ], `max = ${mx}, min = ${mn}\nrange = ${mx - mn}`, F)),
    H('x̄ = Σx / n.', Q('What is the <b>sample mean</b> x̄?', m, [
      [sum(xs) / (n - 1), 'n − 1-gyel osztottál; az átlagnál mindig n-nel kell.'], [md, 'Ez a medián.'], [(mx + mn) / 2, 'Ez csak a legkisebb és a legnagyobb érték átlaga.'],
    ], `x̄ = ${sum(xs)} / ${n} = ${f(m, 3)}`, F)),
    H('Minden értékből vond le az átlagot, emeld négyzetre, és add össze.', Q('What is the <b>sum of squared deviations</b> Σ(x − x̄)²?', ss, [
      [sum(dev.map(Math.abs)), 'Az eltérések abszolút értékét adtad össze, négyzetre emelés helyett.'], [sum(xs.map(x => x * x)), 'Ez az értékek négyzetösszege, nem az átlagtól való eltéréseké.'], [sum(dev), 'Az eltérések összege mindig 0, ezért kell négyzetre emelni.'],
    ], `${table}Σ(x − x̄)² = ${ss}`, F)),
    H('Sample variance: s² = Σ(x − x̄)² / (n − 1).', Q('What is the <b>sample variance</b> s²?', s2, [
      [ss / n, 'Ez a population variance (sokasági variancia): n-nel osztottál. Mintánál n − 1 kell.'], [s, 'Ez már a szórás (gyököt vontál).'], [sum(dev.map(Math.abs)) / n, 'Ez az abszolút eltérések átlaga, nem a variancia.'],
    ], `s² = ${ss} / ${n - 1} = ${f(s2, 3)}`, F)),
    H('A szórás a variancia négyzetgyöke: s = √s².', Q('What is the <b>sample standard deviation</b> s?', s, [
      [s2, 'Ez a variancia; még gyököt kell vonni.'], [Math.sqrt(ss / n), 'n-nel osztottál (population). Mintánál n − 1 kell.'], [Math.sqrt(ss) / (n - 1), 'Rossz sorrend: előbb osztani kell n − 1-gyel, aztán gyököt vonni.'],
    ], `s = √${f(s2, 3)} = ${f(s, 3)}`, F)),
  ] };
}

function universityCase() {
  const names = ['Finance', 'Management', 'Tourism', 'IT']; let S, N, k, n, j, st, i;
  do { k = pick([10, 20, 25, 50]); S = names.map(() => R(2, 20) * 100); N = sum(S); n = N / k; j = R(0, 3); st = R(1, k); i = R(5, 30); } while (n < i);
  return { title: 'Egyetemi felmérés', stem: `${tbl(['Faculty', ...names], [['Students', ...S]])} The university wants to survey <b>${f(n)}</b> of its <b>${f(N)}</b> students.`, parts: [
    H('Simple random sampling: P = n / N.', Q('With <b>simple random sampling</b>, what is the probability that a given student is selected?', n / N, [
      [1 / N, `Ez egyetlen húzás esélye; ${f(n)} tanulót választunk.`], [n / (N - n), 'A nem kiválasztottak számával osztottál.'], [1 - n / N, 'Ez a NEM kiválasztás valószínűsége.'],
    ], `P = n / N = ${f(n)} / ${f(N)} = ${pc(n / N)}`, x => pc(x))),
    H('Proportionate: s = (a kar létszáma / N) × n.', Q(`With <b>proportionate stratified sampling</b> (strata = faculties), how many students come from <b>${names[j]}</b>?`, S[j] / k, [
      [n / 4, 'Egyenlően osztottad el a karok között; arányos mintánál a kar méretével arányos rész jár.'], [S[j] / N * 100, 'Ez a kar aránya százalékban, nem darabszám.'], [S[j] / n, 'A kar létszámát a mintanagysággal osztottad.'],
    ], `s = (${S[j]} / ${f(N)}) × ${f(n)} = ${f(S[j] / k)}`, x => f(x, 2))),
    H('Systematic sampling: k = N / n.', Q('With <b>systematic sampling</b>, what is the sampling interval k?', k, [
      [n, 'Ez a mintanagyság (n), nem a lépésköz.'], [N - n, 'A különbség nem lépésköz; k = N / n.'], [n / N, 'Fordítva osztottál: k = N / n.'],
    ], `k = N / n = ${f(N)} / ${f(n)} = ${k}`, x => f(x, 4))),
    H('Az első elem maga a kezdőpont; utána mindig k-t lépsz. i-edik = start + (i − 1)·k.', Q(`The random start is <b>${st}</b>. Which student (list number) is the <b>${i}th</b> in the sample?`, st + (i - 1) * k, [
      [st + i * k, 'Eggyel elcsúsztál: az első elem maga a kezdőpont.'], [i * k, 'Nem a kezdőponttól indultál.'], [(i - 1) * k, 'Kimaradt a kezdőpont.'],
    ], `${i}. elem = ${st} + ${i - 1}·${k} = ${st + (i - 1) * k}`, x => f(x))),
    H('Hány kar kerül be: mind (minden karból választunk), vagy csak néhány teljes kar?', Q('<i>Instead, 2 faculties are chosen at random and every student in them is surveyed.</i> Which method is this?', 'cluster sampling', [
      ['stratified sampling', 'Rétegzett mintánál MINDEN karból (rétegből) választanánk; itt csak néhány teljes kar kerül be.'],
      ['systematic sampling', 'Szisztematikus mintánál minden k-adik elemet vennénk egy listáról.'],
      ['simple random sampling', 'Egyszerű véletlen mintánál közvetlenül tanulókat húznánk a teljes listából.'],
    ], 'Néhány teljes csoport (klaszter) kerül be, azokban mindenki → cluster sampling (csoportos mintavétel), single-stage.')),
  ] };
}

function drugCase() {
  let n, b, d, m, s, t;
  do { n = R(6, 8); b = Array.from({ length: n }, () => R(112, 135)); d = b.map(() => R(-9, 3)); m = mean(d); s = Math.sqrt(sum(d.map(x => (x - m) ** 2)) / (n - 1)); t = m / (s / Math.sqrt(n)); } while (s === 0 || m === 0 || Math.abs(Math.abs(t) - tCrit[n - 1]) < 0.1);
  const a = b.map((x, i) => x + d[i]), sp = Math.sqrt(sum(d.map(x => (x - m) ** 2)) / n), c = tCrit[n - 1], rej = Math.abs(t) > c, F = x => f(x, 3);
  const ds = `d = after − before: ${d.join(', ')}`, sq = f(sum(d.map(x => (x - m) ** 2)), 3);
  return { title: 'Páros t-próba: vérnyomás', stem: `A company tests whether a new drug <b>has an effect</b> on blood pressure. ${tbl(['Patient', ...b.map((_, i) => i + 1)], [['Before', ...b], ['After', ...a]])} Use a paired t-test, α = 0.05, d = after − before.`, parts: [
    H('„Has an effect” = bármelyik irányú változás. Az egyenlőség mindig H₀-ba kerül.', Q('Which hypotheses are correct?', 'H₀: μd = 0,  H₁: μd ≠ 0', [
      ['H₀: μd ≠ 0,  H₁: μd = 0', 'Felcserélted: az egyenlőség mindig H₀-ba kerül.'],
      ['H₀: μd ≥ 0,  H₁: μd < 0', 'Ez egyoldali (left-tailed). A „has an effect” bármelyik irányú változást jelent, ezért kétoldali.'],
      ['H₀: μd ≤ 0,  H₁: μd > 0', 'Ez egyoldali (right-tailed); itt kétoldali próba kell.'],
    ], 'kérdés: van-e hatás (bármelyik irányban) → two-tailed\nH₀: μd = 0 (nincs hatás), H₁: μd ≠ 0')),
    H('Számold ki minden betegre: d = after − before, aztán átlagold.', Q('What is the mean difference <b>m</b>?', m, [
      [-m, 'Előjelhiba: d = after − before, nem before − after.'], [sum(d), 'Nem osztottál n-nel.'], [sum(d) / (n - 1), 'n − 1-gyel osztottál; az átlagnál n kell.'],
    ], `${ds}\nm = ${sum(d)} / ${n} = ${f(m, 3)}`, F)),
    H('s = √[Σ(d − m)² / (n − 1)].', Q('What is the standard deviation of the differences <b>s</b>?', s, [
      [sp, 'n-nel osztottál; mintából n − 1-gyel kell.'], [s * s, 'Ez a variancia; még gyököt kell vonni.'], [s / Math.sqrt(n), 'Ez már a standard error (s/√n), nem a szórás.'],
    ], `${ds}\nm = ${f(m, 3)}\nΣ(d − m)² = ${sq}\ns = √(${sq} / ${n - 1}) = ${f(s, 3)}`, F)),
    H('t = m / (s / √n).', Q('What is the <b>t statistic</b>?', t, [
      [m / (sp / Math.sqrt(n)), 'A szórásnál n-nel osztottál; mintából n − 1 kell.'], [m / s, 'Nem osztottad s-t √n-nel.'], [m / (s / n), 's-t n-nel osztottad √n helyett.'],
    ], `t = ${f(m, 3)} / (${f(s, 3)} / √${n}) = ${f(t, 3)}`, F)),
    H('Páros próbánál a különbségek számából indulsz ki: df = n − 1.', Q('How many <b>degrees of freedom</b> does the test have?', n - 1, [
      [n, 'Ez az elemszám, a szabadságfok ennél eggyel kevesebb.'], [n - 2, 'Kettőt vontál le; páros próbánál df = n − 1.'], [2 * n - 2, 'Ez a független kétmintás t-próba df-je; páros próbánál df = n − 1.'],
    ], `df = n − 1 = ${n - 1}`, x => f(x))),
    H('Kétoldali próba: |t|-t hasonlítsd a kritikus értékhez.', Q(`Critical value (two-tailed, df = ${n - 1}, α = 0.05): <b>±${c}</b>. What is the decision?`, rej ? OPT.rej : OPT.fail, [
      [rej ? OPT.fail : OPT.rej, rej ? '|t| > kritikus érték, ezért el kell vetni H₀-t.' : '|t| ≤ kritikus érték, ezért H₀ nem vethető el.'], [OPT.rejH1, 'A döntés mindig H₀-ról szól.'], [OPT.prove, 'H₀-t sosem bizonyítjuk, legfeljebb nem vetjük el.'],
    ], `|t| = ${f(Math.abs(t), 3)} ${rej ? '>' : '≤'} ${c} → ${rej ? OPT.rej + ': a gyógyszernek van hatása' : OPT.fail + ': nincs elég bizonyíték hatásra'}`)),
  ] };
}

function rowsCase() {
  let gs, a;
  do { gs = [R(3, 4), R(3, 4), R(3, 4)].map(sz => { const base = R(6, 16); return Array.from({ length: sz }, () => base + R(-3, 3)); }); a = anova(gs); } while (a.ssw === 0 || a.ssb < 0.01 || Math.abs(a.F - fCrit[a.n - 3]) < 0.1);
  const all = gs.flat(), sst = sum(all.map(x => (x - a.gm) ** 2)), rows = ['Front', 'Middle', 'Back'], ct = fCrit[a.n - 3], rej = a.F > ct, F = x => f(x, 3);
  const vars = gs.map((g, i) => sum(g.map(x => (x - a.ms[i]) ** 2)) / (g.length - 1));
  const means = `csoportátlagok: ${gs.map((g, i) => `${rows[i]} = ${sum(g)}/${g.length} = ${f(a.ms[i], 3)}`).join(', ')}`;
  return { title: 'One-way ANOVA: ülésrend', stem: `Exam scores of randomly chosen students sitting in three rows: ${tbl(['Row', 'Scores'], gs.map((g, i) => [rows[i], g.join(', ')]))} Test at α = 0.05 whether the mean scores of the rows differ.`, parts: [
    H('Grand mean = az összes érték átlaga (a csoportokat figyelmen kívül hagyva).', Q('What is the <b>grand mean</b>?', a.gm, [
      [mean(a.ms), 'A csoportátlagok sima átlaga; eltérő csoportméretnél ez nem egyenlő a főátlaggal.'], [sum(all) / 3, 'A csoportok számával osztottál, nem az összes elemszámmal.'], [a.ms[0], 'Ez csak a Front csoport átlaga.'],
    ], `${means}\nfőátlag = ${sum(all)} / ${a.n} = ${f(a.gm, 3)}`, F)),
    H('SS(B) = Σ nᵢ(x̄ᵢ − x̄)²: minden csoportátlag eltérése a főátlagtól, négyzetre emelve, a csoport elemszámával szorozva.', Q('What is <b>SS(Between)</b>?', a.ssb, [
      [sum(a.ms.map(x => (x - a.gm) ** 2)), 'Nem szoroztál a csoportok elemszámával (nᵢ).'], [a.ssw, 'Ez SS(Within).'], [sst, 'Ez SS(Total).'],
    ], `${means}\nfőátlag = ${f(a.gm, 3)}\nSS(B) = ${gs.map((g, i) => `${g.length}·(${f(a.ms[i], 3)} − ${f(a.gm, 3)})²`).join(' + ')} = ${f(a.ssb, 3)}`, F)),
    H('SS(W) = Σ(x − x̄ᵢ)²: minden értéket a SAJÁT csoportja átlagától mérsz.', Q('What is <b>SS(Within)</b>?', a.ssw, [
      [a.ssb, 'Ez SS(Between).'], [sst, 'Ez SS(Total): a főátlagtól mértél, nem a csoportátlagoktól.'], [sum(vars), 'A csoportvarianciákat adtad össze; SS(W) = Σ(nᵢ − 1)·sᵢ², vagyis az eltérésnégyzetek összege.'],
    ], `${means}\nSS(W) = ${gs.map((g, i) => f(sum(g.map(x => (x - a.ms[i]) ** 2)), 3)).join(' + ')} = ${f(a.ssw, 3)}\nellenőrzés: SS(T) = ${f(sst, 3)} = SS(B) + SS(W)`, F)),
    H('df(B) = k − 1, df(W) = n − k.', Q('What are the degrees of freedom?', `df(B) = 2,  df(W) = ${a.n - 3}`, [
      [`df(B) = 3,  df(W) = ${a.n - 3}`, 'df(B) = k − 1 = 2, nem k.'], [`df(B) = 2,  df(W) = ${a.n - 1}`, `df(W) = n − k = ${a.n} − 3; ${a.n - 1} a df(total).`], [`df(B) = ${a.n - 3},  df(W) = 2`, 'Felcserélted a kettőt.'],
    ], `k = 3, n = ${gs.map(g => g.length).join(' + ')} = ${a.n}\ndf(B) = k − 1 = 2\ndf(W) = n − k = ${a.n - 3}`)),
    H('MS = SS / df mindkettőre, aztán F = MS(B) / MS(W).', Q('What is the <b>F statistic</b>?', a.F, [
      [a.ssb / a.ssw, 'Az SS-eket osztottad; előbb el kell osztani őket a szabadságfokukkal.'], [1 / a.F, 'Fordítva: F = MS(B) / MS(W).'], [(a.ssb / 2) / (a.ssw / (a.n - 1)), 'MS(W)-nél n − 1-gyel osztottál; df(W) = n − k.'],
    ], `MS(B) = ${f(a.ssb, 3)} / 2 = ${f(a.msb, 3)}\nMS(W) = ${f(a.ssw, 3)} / ${a.n - 3} = ${f(a.msw, 3)}\nF = ${f(a.msb, 3)} / ${f(a.msw, 3)} = ${f(a.F, 3)}`, F)),
    H('Az F-próba jobboldali: F > F(table) → reject H₀.', Q(`F<sub>table</sub>(2, ${a.n - 3}) at α = 0.05 is <b>${ct}</b>. What is the decision?`, rej ? OPT.rej : OPT.fail, [
      [rej ? OPT.fail : OPT.rej, rej ? 'F > F(table), ezért H₀-t elvetjük.' : 'F ≤ F(table), ezért H₀ nem vethető el.'], [OPT.rejH1, 'A döntés mindig H₀-ról szól.'], [OPT.prove, 'H₀-t sosem bizonyítjuk, legfeljebb nem vetjük el.'],
    ], `${f(a.F, 3)} ${rej ? '>' : '≤'} ${ct} → ${rej ? OPT.rej + ': legalább egy sor átlaga eltér' : OPT.fail + ': nincs szignifikáns különbség a sorok között'}`)),
  ] };
}

// ---------- Témák + elmélet ----------
const TOPICS = [
  { id: 'ratio', name: 'Arányok', en: 'Ratio I', gens: ratio, cases: [classCase], theory: `
<p>A <b>ratio</b> (arány) két mennyiséget hasonlít össze: p : q, vagy p/q. A sorrend számít.</p>
<ul><li>Előbb közös mértékegység: 2 km : 500 m = 2000 : 500 = 4 : 1.</li>
<li>Egyszerűsítés a legnagyobb közös osztóval: 12 : 18 = 2 : 3.</li>
<li><b>Dividing by a ratio</b> (felosztás arányban): részek = p + q; egy rész = összeg / (p + q); a p-hez tartozó rész = p × egy rész.</li>
<li><b>Unknown</b>: ha a fiúk : lányok = 4 : 3 és 12 lány van, egy rész = 12 / 3 = 4, a fiúk száma 4 × 4 = 16.</li>
<li><b>Compound ratio</b> (összetett arány): A:B = 2:3, B:C = 4:5 → B-t közös értékre hozzuk: 8:12 és 12:15 → A:C = 8:15.</li>
<li><b>Part-to-part</b> (rész a részhez) vs <b>part-to-whole</b> (rész az egészhez).</li>
<li><b>Duplicate ratio</b> (négyzetes arány): a : b → a² : b².</li></ul>` },
  { id: 'index', name: 'Viszonyszámok', en: 'Ratio II', gens: indices, cases: [productionCase], theory: `
<table><tr><th>Mutató</th><th>Képlet</th></tr>
<tr><td>Distribution ratio (megoszlási, Vm)</td><td>rész / egész</td></tr>
<tr><td>Coordination ratio (koordinációs, Vk)</td><td>rész / másik rész</td></tr>
<tr><td>Base ratio (bázis, Vdb)</td><td>y<sub>t</sub> / y<sub>bázis</sub></td></tr>
<tr><td>Chain ratio (lánc, Vdl)</td><td>y<sub>t</sub> / y<sub>t−1</sub></td></tr>
<tr><td>Task indicator (tervfeladat, Vf)</td><td>terv / bázis</td></tr>
<tr><td>Performance indicator (tervteljesítés, Vt)</td><td>tény / terv</td></tr>
<tr><td>Intensity ratio (intenzitási, Vi)</td><td>jelenség / viszonyítási alap (eltérő egység)</td></tr>
<tr><td>Areal comparative (területi összehasonlító, Vö)</td><td>terület adata / bázisterület adata</td></tr>
<tr><td>Odds ratio (esélyhányados, OR)</td><td>(a/b) / (c/d)</td></tr>
<tr><td>Relative risk (relatív kockázat, RR)</td><td>P(A) / P(B)</td></tr></table>
<ul><li>A láncviszonyszámok szorzata = az utolsó bázisviszonyszám. A bázisviszonyszámok hányadosa = láncviszonyszám.</li>
<li>Vf × Vt = Vd (tény / bázis).</li>
<li>A betűk a magyar nevek kezdőbetűi: V = viszonyszám; m = megoszlási, k = koordinációs, d = dinamikus (b = bázis, l = lánc), f = tervfeladat, t = tervteljesítés, i = intenzitási, ö = összehasonlító. A diákon a Coordination és a Task/Performance példák tévesen Vm-mel vannak jelölve.</li>
<li>Egyenes intenzitási: orvos / 1000 lakos (nagyobb = jobb). Fordított: lakos / orvos (kisebb = jobb).</li>
<li>Odds = bekövetkezett / nem bekövetkezett. Probability = bekövetkezett / összes. Ezért OR ≠ RR; ritka eseménynél közel esnek egymáshoz.</li>
<li>OR vagy RR = 1: nincs különbség; &gt; 1: az első csoportban gyakoribb; &lt; 1: ritkább.</li></ul>` },
  { id: 'series', name: 'Adatok és gyakorisági sorok', en: 'Course Introduction', gens: series, cases: [marksCase], theory: `
<p><b>Változótípusok.</b> Quantitative (mennyiségi): <b>discrete</b> (diszkrét, számlált) vagy <b>continuous</b> (folytonos, mért). Categorical (kategorikus): <b>binary</b> (két kimenet), <b>nominal</b> (sorrend nélkül), <b>ordinal</b> (sorrendbe állítható, pl. Likert-skála).</p>
<p>Szerep szerint: <b>independent</b> (független, ok), <b>dependent</b> (függő, okozat), <b>control</b> (kontroll, állandó), <b>confounding</b> (zavaró, mindkettőre hat).</p>
<p><b>Sorok.</b> Time series (idősor), spatial series (területi sor), condition series (feltétel szerinti sor), individual series (egyedi sor: minden érték külön).</p>
<ul><li>Relative frequency (relatív gyakoriság) = f / n; összege 100%.</li>
<li>Cumulative frequency (kumulált gyakoriság): „legfeljebb x” darabszáma; utolsó értéke n.</li>
<li>Class width (osztályköz hossza) = (max − min) / osztályok száma; felfelé kerekítve, lehetőleg 5 többszörösére.</li>
<li>Midpoint (osztályközép) = (alsó határ + felső határ) / 2.</li>
<li>Range (terjedelem) osztályközös sorban = utolsó osztály felső határa − első osztály alsó határa.</li>
<li>Osztályok: exhaustive (minden adatot lefednek) és mutually exclusive (egymást kizárók); 5–15 darab.</li></ul>` },
  { id: 'central', name: 'Középértékek', en: 'Descriptive Statistics I', gens: central, cases: [groupedCase], theory: `
<table><tr><th>Mutató</th><th>Képlet</th></tr>
<tr><td>Arithmetic mean (számtani átlag)</td><td>x̄ = Σx / n</td></tr>
<tr><td>Grouped mean (osztályközös)</td><td>x̄ = Σfx / Σf, x = osztályközép</td></tr>
<tr><td>Assumed mean method</td><td>x̄ = A + Σfd / Σf, d = x − A</td></tr>
<tr><td>Step deviation method</td><td>x̄ = A + h · Σfu / Σf, u = (x − A)/h</td></tr>
<tr><td>Weighted mean (súlyozott)</td><td>Σwx / Σw</td></tr>
<tr><td>Geometric mean (mértani)</td><td>ⁿ√(x₁·x₂·…·xₙ)</td></tr>
<tr><td>Harmonic mean (harmonikus)</td><td>n / Σ(1/x)</td></tr>
<tr><td>Median, grouped</td><td>l + (n/2 − cf)/f × h</td></tr>
<tr><td>Mode, grouped</td><td>l + (f₁ − f₀)/(2f₁ − f₀ − f₂) × h</td></tr></table>
<ul><li>Median (medián): rendezett sor közepe. Páratlan n: az (n+1)/2-edik elem. Páros n: a két középső átlaga.</li>
<li>A csoportos medián képletében a cf a mediánosztály <b>előtti</b> osztály kumulált gyakorisága, az f a mediánosztályé.</li>
<li>Mode (módusz): leggyakoribb érték; lehet unimodal, bimodal, trimodal, multimodal.</li>
<li>Százalékos változások átlaga: mértani átlag a tényezőkből (1 + r). Azonos utakon mért sebességek átlaga: harmonikus átlag.</li></ul>` },
  { id: 'dispersion', name: 'Szóródás', en: 'Descriptive Statistics II', gens: dispersion, cases: [sampleCase], theory: `
<table><tr><th>Mutató</th><th>Képlet</th></tr>
<tr><td>Range (terjedelem)</td><td>max − min</td></tr>
<tr><td>Population variance (sokasági variancia)</td><td>σ² = Σ(x − μ)² / N</td></tr>
<tr><td>Sample variance (mintavariancia)</td><td>s² = Σ(x − x̄)² / (n − 1)</td></tr>
<tr><td>Standard deviation (szórás)</td><td>σ = √σ²</td></tr>
<tr><td>Frequency table</td><td>σ² = Σf(x − x̄)² / Σf</td></tr>
<tr><td>Q1, Q3 (egyedi sor)</td><td>(N+1)/4-edik és 3(N+1)/4-edik elem</td></tr>
<tr><td>Q1, Q3 (osztályközös)</td><td>l + (N/4 − cf)/f × h, illetve 3N/4-gyel</td></tr>
<tr><td>Interquartile range (IQR)</td><td>Q3 − Q1</td></tr>
<tr><td>Quartile deviation (kvartiliseltérés)</td><td>(Q3 − Q1) / 2</td></tr>
<tr><td>Coefficient of QD</td><td>(Q3 − Q1) / (Q3 + Q1)</td></tr></table>
<ul><li>A range érzékeny az outlierekre (kiugró értékek).</li>
<li>Variance négyzetes mértékegységben, standard deviation az eredeti egységben.</li>
<li>Sample → n − 1 (Bessel-korrekció). A diákon a {4, 6, 8, 10} példa hibás: a helyes s² = 20/3 = 6,67.</li>
<li>Empirical rule (normális eloszlás): ±1σ ≈ 68%, ±2σ ≈ 95%, ±3σ ≈ 99,7%.</li>
<li>Binomiális variancia: np(1 − p).</li></ul>` },
  { id: 'sampling', name: 'Mintavétel', en: 'Random Sampling', gens: sampling, cases: [universityCase], theory: `
<ul><li><b>Simple random sampling</b> (egyszerű véletlen): mindenki azonos eséllyel; P(kiválasztás) = n / N.</li>
<li>Visszatevéssel, legalább egyszer: P = 1 − (1 − 1/N)ⁿ. A diák 9,56%-os eredménye hibás, 200 főből 50 húzásnál a helyes érték 22,17%.</li>
<li><b>Systematic</b> (szisztematikus): k = N / n; véletlen kezdőpont 1 és k között, utána minden k-adik. Az i-edik elem: start + (i − 1)·k. Linear: nem ismétel; circular: a lista végén elölről folytatja.</li>
<li><b>Stratified</b> (rétegzett): rétegek (strata) szerint bontunk, mindegyikből mintát veszünk. Arányos (proportionate): s = (S / N) × n. Nem arányos (disproportionate): a fontos rétegből többet.</li>
<li><b>Cluster</b> (csoportos): néhány teljes csoportot választunk. n = ACS × klaszterek száma. Single-stage: a kiválasztott klaszterben mindenki. Two-stage: klaszteren belül újra mintavétel. Multi-stage: több szinten.</li>
<li>Rétegzett: minden rétegből választunk. Klaszteres: csak néhány klasztert választunk.</li>
<li>Non-probability (nem valószínűségi) módszerek: convenience, judgmental, snowball, quota.</li></ul>` },
  { id: 'hypothesis', name: 'Hipotézisvizsgálat', en: 'Hypothesis Testing', gens: hypothesis, cases: [drugCase], theory: `
<ul><li><b>H₀</b> (null hypothesis, nullhipotézis): tartalmazza az egyenlőséget (=, ≤, ≥). <b>H₁</b> (alternative, alternatív): amit bizonyítani akarunk (≠, &gt;, &lt;).</li>
<li>Two-tailed (kétoldali): H₁: μ ≠ μ₀. Right-tailed (jobboldali): H₁: μ &gt; μ₀. Left-tailed (baloldali): H₁: μ &lt; μ₀.</li>
<li><b>Significance level</b> (szignifikanciaszint) α, általában 0,05.</li>
<li>Döntés: p ≤ α → reject H₀. Vagy: |test statistic| &gt; critical value → reject H₀. Egyébként: fail to reject H₀ (nem vetjük el; nem bizonyítjuk!).</li>
<li><b>Type I error</b> (elsőfajú hiba, α): igaz H₀-t elvetünk (false positive). <b>Type II error</b> (másodfajú hiba, β): hamis H₀-t megtartunk (false negative).</li>
<li>Z-test: ismert szórás, nagy minta. T-test: kis minta vagy ismeretlen szórás. Chi-square: kategorikus adatok.</li>
<li><b>Paired t-test</b> (páros t-próba): d = után − előtt; m = átlag(d); s = szórás(d) n − 1-gyel; t = m / (s / √n); df = n − 1.</li></ul>` },
  { id: 'anova', name: 'ANOVA', en: 'ANOVA', gens: anovaGens, cases: [rowsCase], theory: `
<p><b>One-way ANOVA</b> (egyszempontú varianciaelemzés): 3 vagy több csoport átlagát hasonlítja össze. H₀: μ₁ = μ₂ = … = μₖ; H₁: legalább egy átlag eltér.</p>
<table><tr><th>Forrás</th><th>SS</th><th>df</th><th>MS</th><th>F</th></tr>
<tr><td>Between (csoportok között)</td><td>Σ nᵢ(x̄ᵢ − x̄)²</td><td>k − 1</td><td>SS(B)/df(B)</td><td>MS(B)/MS(W)</td></tr>
<tr><td>Within (csoporton belül)</td><td>Σ(x − x̄ᵢ)²</td><td>n − k</td><td>SS(W)/df(W)</td><td></td></tr>
<tr><td>Total</td><td>Σ(x − x̄)²</td><td>n − 1</td><td></td><td></td></tr></table>
<ul><li>SS(T) = SS(B) + SS(W), és df(T) = df(B) + df(W). Az MS-ek viszont nem adódnak össze.</li>
<li>Grand mean (főátlag) = összes érték átlaga, a csoportátlagok súlyozott átlaga.</li>
<li>Az F-próba mindig jobboldali. F &gt; F(table) (df1 = k − 1, df2 = n − k) → reject H₀.</li>
<li>Feltételek: véletlen, független minták; normalitás; azonos szórások (equal variances).</li>
<li>Az ANOVA nem mondja meg, melyik csoport tér el; ehhez post hoc teszt kell.</li>
<li>Two-way ANOVA: két független változó, a fő hatások mellett az interakció is vizsgálható.</li></ul>` },
];

// Újragenerál, amíg mind a 4 opció tipikus hibából jön (nem tartalék érték).
function make(g) {
  let x;
  for (let i = 0; i < 50; i++) { x = g(); if (x.opts.length === 4 && !x.opts.some(o => o.why === FALLBACK)) break; }
  if (x.opts.length !== 4) return make(g);
  x.hint = HINTS[g.name]; return x;
}
const goodCase = x => x.parts.every(p => p.opts.length === 4 && !p.opts.some(o => o.why === FALLBACK));
function makeCase(c) {
  let x;
  for (let i = 0; i < 200; i++) { x = c(); if (goodCase(x)) return x; }
  return x;
}

if (typeof module !== 'undefined') module.exports = { TOPICS, make, makeCase, goodCase, HINTS };
