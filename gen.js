// Feladatgenerátorok és elmélet. Minden generátor egy {q, opts, sol} objektumot ad vissza.
// opts: 4 db {t, ok?, why?}; pontosan egy helyes.
// A képletek KaTeX-szel jelennek meg: szövegben $…$, külön blokkban fx(...) (soronként egy számolási lépés).

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

// ---------- Képletek ----------
// TeX`…` = String.raw: a backslash-ek maradnak (\frac, \bar, \sum), a ${…} behelyettesítés működik.
// A < és > jelet \lt, \gt alakban írjuk, mert HTML-be kerül.
const TeX = String.raw;
const tex = s => String(s).replace(/(\d),(?=\d{3})/g, '$1{,}').replace(/(^|[^\\])%/g, '$1\\%').replace(/‰/g, '\\text{‰}');
const im = s => `$${tex(s)}$`;
const REL = /(=|\\approx|\\to|\\le|\\ge|\\ne|\\lt|\\gt)/;
const al = l => l.includes('&') ? l : REL.test(l) ? l.replace(REL, '&$1') : '&' + l;
const fx = (...lines) => `<div class="fx">$$\\begin{aligned}${lines.map(l => tex(al(l))).join(' \\\\ ')}\\end{aligned}$$</div>`;
const fr = (a, b) => `\\frac{${a}}{${b}}`;
const ng = v => String(v).startsWith('-') ? `(${v})` : v;
const tx = s => `\\text{${s}}`;

// Levezetés: számozott lépések [cím, tartalom]; legend = a betűk jelentése.
const steps = (...xs) => `<ol class="sol">${xs.filter(Boolean).map(([t, b]) => `<li><span class="sh">${t}</span>${b}</li>`).join('')}</ol>`;
const para = s => `<p>${s}</p>`;
const legend = rows => tbl(['Jel', 'Jelentés', 'Itt'], rows.map(([a, b, c]) => [im(a), b, c]));
const hl = x => `<b>${x}</b>`;

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
    ], steps(
      ['Közös mértékegység', para(`Arányt csak azonos mértékegységű mennyiségek között írhatunk fel. 1 ${B} = ${fc} ${s}, ezért:`) + fx(TeX`${A}\ ${tx(B)} = ${A} \times ${fc} = ${big}\ ${tx(s)}`)],
      ['Az arány a kérdés sorrendjében', para(`„${A} ${B} to ${b} ${s}”: az első mennyiség kerül előre.`) + fx(`${big} : ${b}`)],
      ['Egyszerűsítés', para(`A két szám legnagyobb közös osztója ${g}, mindkét tagot ezzel osztjuk:`) + fx(TeX`${big} : ${b} = ${fr(big, g)} : ${fr(b, g)}`, `= ${big / g} : ${b / g}`)]));
  },
  function divide() {
    let p, q; do { p = R(1, 7); q = R(1, 7); } while (p === q || gcd(p, q) !== 1);
    const k = pick([500, 1000, 1500, 2000, 2500, 4000, 5000]), T = k * (p + q), F = x => f(x) + ' Ft';
    return Q(`Divide <b>${f(T)} Ft</b> between two people in the ratio <b>${p} : ${q}</b>. How much does the <b>first</b> person get?`, p * k, [
      [q * k, 'Ez a második személy része. A ratio első tagja (' + p + ') tartozik az első személyhez.'],
      [k, 'Ez csak egy rész (one part) értéke, még meg kell szorozni az első személy részeinek számával.'],
      [T / p, `A teljes összeget csak az első arányszámmal osztottad. Először az összes rész számát kell kiszámolni: ${im(`p + q = ${p + q}`)}.`],
    ], steps(
      ['Hány rész van összesen?', para(`A ${p} : ${q} arány szerint az első személy ${p}, a második ${q} részt kap.`) + fx(`${tx('összes rész')} = ${p} + ${q}`, `= ${p + q}`)],
      ['Mennyit ér egy rész?', fx(`${tx('egy rész')} = ${fr(`${f(T)}\\text{ Ft}`, p + q)}`, `= ${f(k)}\\text{ Ft}`)],
      ['Az első személy része', fx(TeX`${p} \times ${f(k)}\text{ Ft} = ${f(p * k)}\text{ Ft}`) + para(`Ellenőrzés: a második személy ${im(TeX`${q} \times ${f(k)} = ${f(q * k)}`)} Ft, együtt ${im(`${f(p * k)} + ${f(q * k)} = ${f(T)}`)} Ft.`)]), F);
  },
  function unknown() {
    let p, q; do { p = R(2, 9); q = R(2, 9); } while (p === q || gcd(p, q) !== 1);
    const k = R(2, 12), girls = q * k;
    return Q(`The ratio of boys to girls is <b>${p} : ${q}</b>. There are <b>${girls}</b> girls. How many boys are there?`, p * k, [
      [girls * q / p, 'Fordítva használtad az arányt. A lányokhoz a ' + q + ', a fiúkhoz a ' + p + ' tartozik.'],
      [girls * p, 'Nem osztottad el a lányok számát a lányok részeinek számával, így nem kaptad meg egy rész értékét.'],
      [girls / (p + q) * p, `Az összes rész számával (${im('p + q')}) osztottál, pedig a ${girls} lány csak ${q} részt tesz ki.`],
    ], steps(
      ['Mit jelent az arány?', para(`fiúk : lányok = ${p} : ${q}, vagyis minden ${q} lányra ${p} fiú jut. A ${girls} lány tehát ${q} egyenlő részt tesz ki.`)],
      ['Egy rész értéke', fx(`${tx('egy rész')} = ${fr(tx('lányok'), tx('lány-részek'))}`, `= ${fr(girls, q)}`, `= ${k}`)],
      ['A fiúk száma', fx(TeX`\text{fiúk} = ${p} \times ${k} = ${p * k}`) + para(`Ellenőrzés: ${p * k} : ${girls} egyszerűsítve ${ratioStr(p * k, girls)}.`)]), x => f(x));
  },
  function compound() {
    let a, b, c, d; do { a = R(1, 9); b = R(1, 9); c = R(1, 9); d = R(1, 9); } while (a === b || c === d || ratioStr(a * c, b * d) === ratioStr(a, d));
    const res = ratioStr(a * c, b * d);
    return Q(`A : B = <b>${a} : ${b}</b> and B : C = <b>${c} : ${d}</b>. Find <b>A : C</b>.`, res, [
      [ratioStr(a, d), 'Csak a szélső tagokat írtad le. Előbb B-t mindkét arányban azonos értékre kell hozni (compound ratio, összetett arány).'],
      [ratioStr(a * d, b * c), 'Rossz párosítás: az első arány tagjait a második arány tagjaival keresztben szoroztad.'],
      [ratioStr(a + c, b + d), 'Arányokat nem lehet összeadni, csak bővíteni (szorozni).'],
    ], steps(
      ['A közös tag: B', para(`Az első arányban B = ${b}, a másodikban B = ${c}. Összekapcsolni csak akkor lehet őket, ha B mindkettőben ugyanannyi. Közös érték: ${im(TeX`${b} \times ${c} = ${b * c}`)}.`)],
      ['Bővítés', fx(TeX`A : B = ${a} : ${b} = ${a * c} : ${b * c} \quad (\times ${c})`, TeX`B : C = ${c} : ${d} = ${b * c} : ${b * d} \quad (\times ${b})`)],
      ['Összeolvasás', para('Most már ugyanaz a B, így a három mennyiség egy sorba írható:') + fx(`A : B : C = ${a * c} : ${b * c} : ${b * d}`, `A : C = ${a * c} : ${b * d}`, `= ${res}`)]));
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
      [T / a, `Fordítva osztottál (egész / rész). A distribution ratio (megoszlási viszonyszám): ${im(TeX`V_m = \frac{\text{rész}}{\text{egész}}`)}.`],
    ], steps(
      ['Melyik viszonyszám?', para(`Distribution ratio (megoszlási viszonyszám): egy rész aránya az egészen belül. ${im(TeX`V_m = \frac{\text{rész}}{\text{egész}}`)}`)],
      ['Az egész', fx(`${tx('egész')} = ${a} + ${b} + ${c}`, `= ${T}`)],
      ['A kérdezett rész aránya', fx(`V_m = ${fr(a, T)}`, `= ${f(a / T, 4)}`, `= ${pc(a / T)}`)],
      ['Az összes csoport', tbl(['Group', 'Members', im('V_m')], [[hl(n[0]), hl(a), hl(pc(a / T))], [n[1], b, pc(b / T)], [n[2], c, pc(c / T)]]) + para('A megoszlási viszonyszámok összege mindig 100%.')]), x => pc(x));
  },
  function vk() {
    const pairs = [['women', 'men'], ['students', 'teachers'], ['cars', 'households'], ['female moviegoers', 'male moviegoers']];
    const [A, B] = pick(pairs); let a, b; do { a = R(20, 900); b = R(20, 900); } while (a === b);
    return Q(`There are <b>${a} ${A}</b> and <b>${b} ${B}</b>. Calculate the <b>coordination ratio</b> of ${A} to ${B}.`, a / b, [
      [b / a, 'Fordított sorrend: ' + B + ' / ' + A + '. A kérdés ' + A + ' / ' + B + '.'],
      [a / (a + b), `Ez distribution ratio (megoszlási viszonyszám), ${im(TeX`\frac{\text{rész}}{\text{egész}}`)}. A coordination ratio két részt hasonlít össze.`],
      [(a - b) / b, 'Ez a különbség aránya, nem a két rész hányadosa.'],
    ], steps(
      ['Melyik viszonyszám?', para(`Coordination ratio (koordinációs viszonyszám): két részt hasonlít egymáshoz, az egész nem szerepel benne. ${im(TeX`V_k = \frac{\text{egyik rész}}{\text{másik rész}}`)}. A sorrend a kérdés sorrendje: „${A} to ${B}”.`)],
      ['Számolás', fx(`V_k = ${fr(tx(A), tx(B))}`, `= ${fr(a, b)}`, `= ${f(a / b, 3)}`)],
      ['Értelmezés', para(`1 ${B.replace(/s$/, '')} → ${f(a / b, 3)} ${A}. Fordítva (${B} / ${A}) ${f(b / a, 3)} jönne ki, ez egy másik kérdés válasza.`)]), x => f(x, 3));
  },
  function dynamic() {
    const y0 = R(10, 40) * 10, ys = [y0];
    for (let i = 1; i < 5; i++) ys.push(Math.round(ys[i - 1] * (0.88 + Math.random() * 0.32)));
    const t = R(2, 4), years = [2020, 2021, 2022, 2023, 2024], base = Math.random() < 0.5;
    const chain = ys[t] / ys[t - 1], b = ys[t] / ys[0];
    const q = `Sales (million Ft): ${tbl(years, [ys])} Calculate the <b>${base ? 'base ratio (base year 2020)' : 'chain ratio'}</b> for <b>${years[t]}</b>.`;
    const v = base ? b : chain, ref = base ? 2020 : years[t - 1];
    const sol = steps(
      ['Melyik viszonyszám?', para(base ? `Base ratio (bázisviszonyszám): minden évet ugyanahhoz a rögzített bázisévhez (2020) hasonlítunk. ${im(TeX`V_{db} = \frac{y_t}{y_{2020}}`)}` : `Chain ratio (láncviszonyszám): minden évet a közvetlenül előtte lévő évhez hasonlítunk. ${im(TeX`V_{dl} = \frac{y_t}{y_{t-1}}`)}`)],
      ['Számolás', base ? fx(`V_{db}(${years[t]}) = ${fr(`y_{${years[t]}}`, 'y_{2020}')}`, `= ${fr(ys[t], ys[0])}`, `= ${pc(b)}`) : fx(`V_{dl}(${years[t]}) = ${fr(`y_{${years[t]}}`, `y_{${years[t - 1]}}`)}`, `= ${fr(ys[t], ys[t - 1])}`, `= ${pc(chain)}`)],
      ['Értelmezés', para(`${pc(v)}: a ${years[t]}. évi eladás ${pc(Math.abs(v - 1))}-kal ${v >= 1 ? 'nagyobb' : 'kisebb'}, mint a ${ref}. évi.`)],
      ['Az összes év egy táblázatban', tbl(['Year', 'Sales', `${im('V_{db}')} (2020 = 100%)`, `${im('V_{dl}')} (előző év = 100%)`], years.map((y, i) => [y, ys[i], i === t && base ? hl(pc(ys[i] / ys[0])) : pc(ys[i] / ys[0]), i === 0 ? '–' : i === t && !base ? hl(pc(ys[i] / ys[i - 1])) : pc(ys[i] / ys[i - 1])]))]);
    return base
      ? Q(q, b, [[chain, 'Ez a chain ratio (láncviszonyszám): az előző évhez viszonyítottál, nem a 2020-as bázishoz.'], [ys[0] / ys[t], 'Fordítva osztottál: bázis / tárgyév.'], [b - 1, `Ez a változás mértéke (${im(TeX`V_{db} - 100\%`)}), nem maga a base ratio.`]], sol, x => pc(x))
      : Q(q, chain, [[b, 'Ez a base ratio (bázisviszonyszám): 2020-hoz viszonyítottál, de a chain ratio mindig az előző évhez viszonyít.'], [ys[t - 1] / ys[t], 'Fordítva osztottál: előző év / tárgyév.'], [chain - 1, `Ez a változás mértéke (${im(TeX`V_{dl} - 100\%`)}), nem maga a chain ratio (láncviszonyszám).`]], sol, x => pc(x));
  },
  function baseFromChain() {
    const c = [R(88, 120), R(88, 120), R(88, 120)].map(x => x / 100), prod = c[0] * c[1] * c[2];
    return Q(`The chain ratios of production are: 2021: <b>${pc(c[0], 0)}</b>, 2022: <b>${pc(c[1], 0)}</b>, 2023: <b>${pc(c[2], 0)}</b>. What is the <b>base ratio</b> of 2023 if 2020 = 100%?`, prod, [
      [1 + sum(c.map(x => x - 1)), 'A százalékos változásokat összeadtad. Dinamikus viszonyszámokat szorozni kell, nem összeadni.'],
      [c[2], 'Ez csak a 2023-as chain ratio (láncviszonyszám). A base ratio az összes addigi láncviszonyszám szorzata.'],
      [mean(c), 'Átlagoltad a láncviszonyszámokat. A bázisviszonyszám ezek szorzata.'],
    ], steps(
      ['Kapcsolat', para(`A bázisviszonyszám a láncviszonyszámok szorzata: ${im(TeX`V_{db}(2023) = V_{dl}(2021) \cdot V_{dl}(2022) \cdot V_{dl}(2023)`)}. Minden év változása a már megváltozott értékre épül, ezért a változások összeszorzódnak, nem összeadódnak.`)],
      ['Százalékból tizedes tört', fx(...c.map((x, i) => `V_{dl}(${2021 + i}) = ${pc(x, 0)} = ${f(x)}`))],
      ['Szorzás', fx(TeX`V_{db}(2023) = ${f(c[0])} \cdot ${f(c[1])} \cdot ${f(c[2])}`, `= ${f(prod, 4)}`, `= ${pc(prod)}`)],
      ['Miért nem összeadás?', para(`A változások (${c.map(x => (x >= 1 ? '+' : '') + pc(x - 1, 0)).join(', ')}) összeadása ${pc(1 + sum(c.map(x => x - 1)))} eredményt adna, de ez hibás.`)]), x => pc(x));
  },
  function plan() {
    let B, P, A; do { B = R(40, 200) * 10; P = Math.round(B * (1 + R(2, 20) / 100)); A = Math.round(P * (R(85, 115) / 100)); } while (A === P || A === B);
    const vf = P / B, vt = A / P, vd = A / B, w = pick(['vf', 'vt', 'vd']);
    const name = { vf: 'task indicator ratio (Vf)', vt: 'performance indicator ratio (Vt)', vd: 'dynamic ratio (actual vs last year)' }[w];
    const why = {
      vf: [vf, `Ez a task indicator ratio (tervfeladat-viszonyszám): ${im(TeX`V_f = \frac{\text{terv}}{\text{bázis}}`)}.`],
      vt: [vt, `Ez a performance indicator ratio (tervteljesítési viszonyszám): ${im(TeX`V_t = \frac{\text{tény}}{\text{terv}}`)}.`],
      vd: [vd, `Ez a dynamic ratio (dinamikus viszonyszám): ${im(TeX`V_d = \frac{\text{tény}}{\text{bázis}}`)}.`],
    };
    const inv = { vf: B / P, vt: P / A, vd: B / A }[w];
    const sol = steps(
      ['A három adat', tbl(['', 'Value', 'Jelentés'], [['bázis', B, 'tavalyi termelés'], ['terv', P, 'idei terv'], ['tény', A, 'idei tényleges termelés']])],
      ['A három viszonyszám', fx(`V_f = ${fr(tx('terv'), tx('bázis'))} = ${fr(P, B)} = ${pc(vf)}`, `V_t = ${fr(tx('tény'), tx('terv'))} = ${fr(A, P)} = ${pc(vt)}`, `V_d = ${fr(tx('tény'), tx('bázis'))} = ${fr(A, B)} = ${pc(vd)}`) + para(`A kérdés: ${name} → ${hl(pc(why[w][0]))}.`)],
      ['Ellenőrzés', fx(TeX`V_f \cdot V_t = ${f(vf, 4)} \cdot ${f(vt, 4)}`, `= ${f(vf * vt, 4)}`, '= V_d')],
      ['A betűk', legend([['V_f', 'task indicator (tervfeladat): terv / bázis', pc(vf)], ['V_t', 'performance indicator (tervteljesítés): tény / terv', pc(vt)], ['V_d', 'dynamic (dinamikus): tény / bázis', pc(vd)]])]);
    return Q(`Last year a factory produced <b>${B}</b> units. This year's plan was <b>${P}</b> units, actual production was <b>${A}</b> units. Calculate the <b>${name}</b>.`,
      why[w][0], [...Object.keys(why).filter(k => k !== w).map(k => why[k]), [inv, 'Fordítva osztottál.']], sol, x => pc(x));
  },
  function intensity() {
    const pop = R(20, 400) * 1000, births = Math.round(pop * R(70, 160) / 10000), r = births / pop * 1000;
    return Q(`A city has <b>${f(pop)}</b> inhabitants and there were <b>${f(births)}</b> births in a year. Calculate the <b>birth rate per 1,000 people</b>.`, r, [
      [r / 10, 'Százzal szoroztál ezer helyett, így ez százalék, nem ezrelék (per 1,000).'],
      [r * 10, 'Tízezerrel szoroztál ezer helyett.'],
      [pop / births, 'Ez inverse intensity ratio (fordított intenzitási viszonyszám): hány lakosra jut egy születés.'],
    ], steps(
      ['Melyik viszonyszám?', para(`Birth rate (születési arányszám): intensity ratio (intenzitási viszonyszám, ${im('V_i')}), két különböző dolgot (születések és lakosok) viszonyít egymáshoz. „Per 1,000 people”: ezer lakosra vetítjük, a mértékegység ‰ (ezrelék).`)],
      ['Számolás', fx(TeX`V_i = \frac{\text{születések}}{\text{lakosok}} \times 1000`, TeX`= \frac{${f(births)}}{${f(pop)}} \times 1000`, TeX`= ${f(births / pop, 5)} \times 1000`, TeX`= ${f(r)}\ \text{(ezer lakosra)}`)],
      ['Értelmezés', para(`Évente ezer lakosra ${f(r)} születés jut.`)]), x => f(x) + ' ‰');
  },
  function oddsRatio() {
    const ctx = pick([['Smokers', 'Non-smokers', 'got sick'], ['Vaccinated', 'Unvaccinated', 'got the disease'], ['Male drivers', 'Female drivers', 'had an accident'], ['Drug A', 'Drug B', 'recovered']]);
    let a, b, c, d; do { a = R(5, 60); b = R(20, 95); c = R(5, 60); d = R(20, 95); } while (Math.abs(a / b - c / d) < 0.05);
    const or = (a / b) / (c / d), rr = (a / (a + b)) / (c / (c + d));
    return Q(`${tbl(['', ctx[2], 'not'], [[ctx[0], a, b], [ctx[1], c, d]])} Calculate the <b>odds ratio</b> (${ctx[0]} vs ${ctx[1]}).`, or, [
      [rr, `Ez relative risk (relatív kockázat): az összes esettel (${im('a + b')}) osztottál. Az odds a bekövetkezett / nem bekövetkezett esetek hányadosa.`],
      [1 / or, 'Fordítva: a második csoport esélyét osztottad az elsőével.'],
      [(a * b) / (c * d), `Rossz szorzás: ${im(TeX`OR = \frac{a/b}{c/d} = \frac{a \cdot d}{b \cdot c}`)}, nem ${im(TeX`\frac{a \cdot b}{c \cdot d}`)}.`],
    ], steps(
      ['A táblázat betűi', tbl(['', ctx[2], 'not'], [[ctx[0], im(`a = ${a}`), im(`b = ${b}`)], [ctx[1], im(`c = ${c}`), im(`d = ${d}`)]])],
      ['Odds (esély) csoportonként', para('Odds = hányszor következett be / hányszor NEM következett be. Nem az összeshez viszonyítunk!') + fx(`${tx('odds')}_1 = ${fr('a', 'b')} = ${fr(a, b)} = ${f(a / b, 4)}`, `${tx('odds')}_2 = ${fr('c', 'd')} = ${fr(c, d)} = ${f(c / d, 4)}`)],
      ['Odds ratio (esélyhányados)', fx(`OR = ${fr(`${tx('odds')}_1`, `${tx('odds')}_2`)}`, `= ${fr(f(a / b, 4), f(c / d, 4))}`, `= ${f(or, 3)}`) + para(`Rövidebben: ${im(TeX`OR = \frac{a \cdot d}{b \cdot c} = \frac{${a} \cdot ${d}}{${b} \cdot ${c}} = ${f(or, 3)}`)}`)],
      ['Értelmezés', para(or > 1 ? `${im(TeX`OR \gt 1`)}: a(z) „${ctx[0]}” csoportban nagyobb az esély (${ctx[2]}).` : `${im(TeX`OR \lt 1`)}: a(z) „${ctx[0]}” csoportban kisebb az esély (${ctx[2]}).`)]), x => f(x, 3));
  },
  function relRisk() {
    let n1, n2, e1, e2; do { n1 = R(2, 10) * 50; n2 = R(2, 10) * 50; e1 = R(5, n1 / 3); e2 = R(5, n2 / 3); } while (n1 === n2 || Math.abs(e1 / n1 - e2 / n2) < 0.02);
    const rr = (e1 / n1) / (e2 / n2), or = (e1 / (n1 - e1)) / (e2 / (n2 - e2));
    return Q(`Treatment group: <b>${e1}</b> of <b>${n1}</b> patients were cured. Control group: <b>${e2}</b> of <b>${n2}</b> were cured. Calculate the <b>relative risk (RR)</b>.`, rr, [
      [or, 'Ez odds ratio (esélyhányados): a nem gyógyultak számával osztottál. Az RR valószínűségeket hasonlít: esemény / csoport létszáma.'],
      [1 / rr, 'Fordítva: a kontrollcsoport valószínűségét osztottad a kezelt csoportéval.'],
      [e1 / e2, 'Csak az esetszámokat osztottad, a csoportok eltérő létszámát (' + n1 + ' vs ' + n2 + ') nem vetted figyelembe.'],
    ], steps(
      ['Valószínűség csoportonként', para('Relative risk (relatív kockázat): valószínűségeket hasonlít. Valószínűség = esetek száma / a csoport teljes létszáma.') + fx(`P(${tx('treatment')}) = ${fr(e1, n1)} = ${f(e1 / n1, 4)}`, `P(${tx('control')}) = ${fr(e2, n2)} = ${f(e2 / n2, 4)}`)],
      ['RR', fx(`RR = ${fr(`P(${tx('treatment')})`, `P(${tx('control')})`)}`, `= ${fr(f(e1 / n1, 4), f(e2 / n2, 4))}`, `= ${f(rr, 3)}`)],
      ['Értelmezés', para(`RR = ${f(rr, 3)}: a kezelt csoportban a gyógyulás valószínűsége ennyiszerese a kontrollcsoportének (${rr > 1 ? 'nagyobb' : 'kisebb'}).`)],
      ['RR vagy OR?', para(`Az odds ratio a nem gyógyultakhoz viszonyítana (${im(TeX`\frac{e}{n - e}`)}), ezért más számot adna: OR = ${f(or, 3)}.`)]), x => f(x, 3));
  },
  function notation() {
    const N = [['V_m', 'Vm', 'distribution ratio', TeX`\frac{\text{part}}{\text{whole}}`, 'm = megoszlási'], ['V_k', 'Vk', 'coordination ratio', TeX`\frac{\text{part}}{\text{other part}}`, 'k = koordinációs'],
      ['V_{db}', 'Vdb', 'base ratio', TeX`\frac{\text{current period}}{\text{fixed base period}}`, 'd = dinamikus, b = bázis'], ['V_{dl}', 'Vdl', 'chain ratio', TeX`\frac{\text{current period}}{\text{previous period}}`, 'd = dinamikus, l = lánc'],
      ['V_f', 'Vf', 'task indicator ratio', TeX`\frac{\text{plan}}{\text{base period}}`, 'f = (terv)feladat'], ['V_t', 'Vt', 'performance indicator ratio', TeX`\frac{\text{actual}}{\text{plan}}`, 't = (terv)teljesítés'],
      ['V_i', 'Vi', 'intensity ratio', TeX`\frac{\text{phenomenon}}{\text{reference quantity}}`, 'i = intenzitási'], ['V_{\text{ö}}', 'Vö', 'areal comparative ratio', TeX`\frac{\text{data of the area}}{\text{data of the base area}}`, 'ö = összehasonlító']];
    const c = pick(N), others = shuffle(N.filter(n => n !== c)).slice(0, 3), mode = R(0, 2);
    const why = n => `Ez ${im(n[0])}: ${n[2]} (${n[4]}), ${im(n[3])}.`;
    const sol = steps(
      ['A jelölés', fx(`${c[0]} = ${c[3]}`) + para(`${im(c[0])} = ${c[2]}.`)],
      ['Honnan jön a betű?', para(`A betűk a magyar nevekből jönnek: V = viszonyszám, ${c[4]}.`)],
      ['Az összes jelölés', tbl(['Jel', 'English', 'Képlet', 'A betű'], N.map(n => [im(n[0]), n[2], im(n[3]), n[4]].map(x => n === c ? hl(x) : x)))]);
    if (mode === 0) return Q(`Which symbol is used for the <b>${c[2]}</b>?`, c[1], others.map(n => [n[1], why(n)]), sol);
    if (mode === 1) return Q(`Which ratio is calculated as ${im(c[3])}?`, `${c[1]} – ${c[2]}`, others.map(n => [`${n[1]} – ${n[2]}`, why(n)]), sol);
    return Q(`What does <b>${c[1]}</b> stand for?`, c[2], others.map(n => [n[2], why(n)]), sol);
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
      [fs[j] / xs.length, `Az értékek számával (${xs.length}) osztottál, nem a megfigyelések számával (${im(`n = ${n}`)}).`],
      [fs[j] / (n - fs[j]), 'A többi megfigyeléshez viszonyítottál, nem az összeshez.'],
    ], steps(
      ['n = az összes megfigyelés', fx(TeX`n = \sum f = ${fs.join(' + ')}`, `= ${n}`)],
      ['Relative frequency (relatív gyakoriság)', para(`Megmutatja, hogy az összes megfigyelés hányadrésze esik az adott értékre: ${im(TeX`\frac{f}{n}`)}.`) + fx(`${fr('f', 'n')} = ${fr(fs[j], n)}`, `= ${f(fs[j] / n, 4)}`, `= ${pc(fs[j] / n)}`)],
      ['Az összes érték', tbl(['x', 'f', im(TeX`\frac{f}{n}`)], xs.map((x, i) => i === j ? [hl(x), hl(fs[i]), hl(pc(fs[i] / n))] : [x, fs[i], pc(fs[i] / n)])) + para('A relatív gyakoriságok összege mindig 100%.')]), x => pc(x));
  },
  function cumulative() {
    const { xs, fs, n, cf } = discreteTable(), j = R(1, 3);
    return Q(`${hrow('x', xs, 'f', fs)} How many observations are <b>at most ${xs[j]}</b> (x ≤ ${xs[j]})?`, cf[j], [
      [fs[j], 'Ez csak az x = ' + xs[j] + ' érték gyakorisága. A „legfeljebb” a kisebb értékeket is tartalmazza.'],
      [cf[j - 1], 'Kimaradt maga az x = ' + xs[j] + ' érték; a „legfeljebb” (≤) tartalmazza.'],
      [n - cf[j], 'Ez a „több mint ' + xs[j] + '” (x > ' + xs[j] + ') kérdés válasza.'],
    ], steps(
      ['Mit kérdez?', para(`„At most ${xs[j]}” = legfeljebb ${xs[j]}, vagyis ${im(TeX`x \le ${xs[j]}`)}: maga a ${xs[j]} is beleszámít, és minden kisebb érték is.`)],
      ['Kumulált gyakoriság (cumulative frequency)', para('Soronként összeadjuk a gyakoriságokat:') + tbl(['x', 'f', 'cumulative f'], xs.map((x, i) => i === j ? [hl(x), hl(fs[i]), hl(cf[i])] : [x, fs[i], cf[i]]))],
      ['Eredmény', fx(TeX`x \le ${xs[j]}:\quad ${fs.slice(0, j + 1).join(' + ')} = ${cf[j]}`)]), x => f(x));
  },
  function classWidth() {
    let mn, mx, k, raw, up, dn;
    do { mn = R(5, 40); mx = R(mn + 50, mn + 160); k = R(5, 10); raw = (mx - mn) / k; up = Math.ceil(raw / 5) * 5; dn = Math.floor(raw / 5) * 5; } while (raw % 5 === 0 || dn === 0);
    return Q(`The smallest observation is <b>${mn}</b>, the largest is <b>${mx}</b>. We want <b>${k} classes</b>. What class width should we use (rounded <b>up</b> to a multiple of 5)?`, up, [
      [raw, 'Ez a nyers érték; a diák szerint 5 többszörösére kell felkerekíteni.'],
      [dn, 'Lefelé kerekítettél, így az osztályok nem fednék le az összes adatot.'],
      [Math.ceil((mx + mn) / k / 5) * 5, 'Összeadtad a legnagyobb és a legkisebb értéket ahelyett, hogy kivontad volna.'],
    ], steps(
      ['Képlet', para('Class width (osztályköz hossza):') + fx(TeX`i = \frac{\max - \min}{\text{osztályok száma}}`, `= ${fr(`${mx} - ${mn}`, k)}`, `= ${fr(mx - mn, k)}`, `= ${f(raw, 3)}`)],
      ['Kerekítés', para(`Mindig felfelé kerekítünk, különben az osztályok nem fednék le a legnagyobb értéket. Itt 5 többszörösére: ${im(TeX`${f(raw, 3)} \to ${up}`)}.`)],
      ['Ellenőrzés', fx(TeX`${k} \times ${up} = ${k * up} \ge ${mx - mn}`) + para('Tehát az osztályok lefedik az összes adatot.')]), x => f(x, 3));
  },
  function midpoint() {
    const L = pick([0, 10, 20, 50, 100]), w = pick([5, 10, 20, 25]), j = R(2, 5), lo = L + (j - 1) * w;
    const classes = [0, 1, 2, 3, 4].map(i => `${L + i * w}–${L + (i + 1) * w}`);
    return Q(`Classes: ${classes.join(', ')}. What is the <b>midpoint</b> of class number ${j} (${classes[j - 1]})?`, lo + w / 2, [
      [lo + w, 'Ez az osztály felső határa (upper limit), nem a közepe.'],
      [lo, 'Ez az osztály alsó határa (lower limit), nem a közepe.'],
      [lo - w / 2, 'Ez az előző osztály közepe, eggyel elcsúsztál.'],
    ], steps(
      ['Melyik osztály?', para(`A(z) ${j}. osztály: ${classes[j - 1]}. Alsó határa ${lo}, felső határa ${lo + w}.`)],
      ['Osztályközép (midpoint)', fx(`${tx('midpoint')} = ${fr(`${tx('alsó')} + ${tx('felső')}`, 2)}`, `= ${fr(`${lo} + ${lo + w}`, 2)}`, `= ${f(lo + w / 2)}`) + para('Az osztályközép képviseli az osztályt például az átlag számolásakor.')]), x => f(x));
  },
  function groupedRange() {
    const L = pick([0, 10, 20, 40]), w = pick([5, 10, 20]), fs = [0, 1, 2, 3, 4].map(() => R(2, 25));
    const cls = fs.map((_, i) => `${L + i * w}–${L + (i + 1) * w}`);
    return Q(`${hrow('Class', cls, 'f', fs)} What is the <b>range</b>?`, 5 * w, [
      [w, 'Ez a class interval (osztályköz hossza), nem a terjedelem.'],
      [4 * w, 'Az első és az utolsó osztályközépből számoltál. A terjedelem = utolsó osztály felső határa − első osztály alsó határa.'],
      [Math.max(...fs) - Math.min(...fs), 'A gyakoriságokból számoltál. A range (terjedelem) az értékek szóródása, nem a gyakoriságoké.'],
    ], steps(
      ['Szabály', para('Osztályközös sorban az egyes értékeket nem ismerjük, ezért a range (terjedelem) = utolsó osztály felső határa − első osztály alsó határa. A gyakoriságok (f) ehhez nem kellenek.')],
      ['Számolás', para(`Első osztály: ${cls[0]}, alsó határa ${L}. Utolsó osztály: ${cls[4]}, felső határa ${L + 5 * w}.`) + fx(`${tx('range')} = ${L + 5 * w} - ${L}`, `= ${5 * w}`)]), x => f(x));
  },
  function varType() {
    const items = [['number of children in a family', 'discrete'], ['height of a student (cm)', 'continuous'], ['passed or failed the exam', 'binary'], ['blood type (A, B, AB, 0)', 'nominal'], ['satisfaction on a 1–5 Likert scale', 'ordinal'],
      ['number of cars sold per day', 'discrete'], ['time to finish a race', 'continuous'], ['smoker or non-smoker', 'binary'], ['country of origin', 'nominal'], ['finishing place in a race (1st, 2nd, ...)', 'ordinal'],
      ['education level (primary, secondary, tertiary)', 'ordinal'], ['favourite colour', 'nominal'], ['number of defective items in a batch', 'discrete'], ['body temperature (°C)', 'continuous'], ['heads or tails', 'binary'], ['car brand', 'nominal']];
    const T = { discrete: 'quantitative – discrete', continuous: 'quantitative – continuous', binary: 'categorical – binary', nominal: 'categorical – nominal', ordinal: 'categorical – ordinal' };
    const W = { discrete: 'A discrete (diszkrét) változó megszámolt érték, csak egész lehet.', continuous: 'A continuous (folytonos) változó mért érték, egy tartományon belül bármilyen értéket felvehet.', binary: 'A binary (bináris) változónak csak két kimenete van.', nominal: 'A nominal (nominális) kategóriák között nincs sorrend.', ordinal: 'Az ordinal (ordinális, sorrendi) kategóriák rangsorolhatók.' };
    const [txt, t] = pick(items), others = shuffle(Object.keys(T).filter(k => k !== t)).slice(0, 3);
    return Q(`What type of variable is <b>${txt}</b>?`, T[t], others.map(o => [T[o], W[o] + ' Ez a változó nem ilyen.']), steps(
      ['Szám vagy kategória?', para(['discrete', 'continuous'].includes(t) ? 'Számszerű érték → quantitative (mennyiségi).' : 'Nem mennyiség, hanem csoport vagy címke → categorical (kategorikus).')],
      ['Milyen fajta?', para(W[t])],
      ['Eredmény', para(`${txt} → ${hl(T[t])}`)],
      ['Az öt típus', tbl(['Típus', 'Jelentés', 'Példa'], [['quantitative – discrete', 'megszámolt egész szám', 'number of children'], ['quantitative – continuous', 'mért érték, egy tartományban bármi lehet', 'height, time'], ['categorical – binary', 'csak két kimenet', 'yes / no'], ['categorical – nominal', 'kategóriák sorrend nélkül', 'blood type, colour'], ['categorical – ordinal', 'sorba rendezhető kategóriák', 'Likert scale, education level']].map(x => x[0] === T[t] ? x.map(hl) : x))]));
  },
  function seriesType() {
    const S = [['GDP of Hungary for each year 2015–2024', 'time'], ['monthly sales of a shop in 2025', 'time'], ['car production by country in 2015', 'spatial'], ['population of each Hungarian county in 2024', 'spatial'],
      ['number of students in a class by age (20, 21, 22 ...)', 'condition'], ['number of households by number of children', 'condition'], ['weights of 10 students listed one by one', 'individual'], ['marks of 8 students in the order they were collected', 'individual']];
    const T = { time: 'time series', spatial: 'spatial series', condition: 'condition series', individual: 'individual series' };
    const W = { time: 'A time series (idősor) időrendben rendezi az adatokat.', spatial: 'A spatial series (területi sor) helyek szerint rendez, az időpont rögzített.', condition: 'A condition series (feltétel szerinti sor) egy jellemző értékei (pl. életkor) szerint csoportosít.', individual: 'Az individual series (egyedi sor) minden megfigyelést külön felsorol.' };
    const [txt, t] = pick(S);
    return Q(`What kind of statistical series is this: <b>${txt}</b>?`, T[t], Object.keys(T).filter(k => k !== t).map(o => [T[o], W[o] + ' Itt nem ez a helyzet.']), steps(
      ['Mi szerint vannak rendezve az adatok?', para(W[t])],
      ['Eredmény', para(`${txt} → ${hl(T[t])}`)],
      ['A négy sortípus', tbl(['Sor', 'Mi szerint rendez?'], [['time series', 'idő (évek, hónapok): idősor'], ['spatial series', 'hely (ország, megye), az idő rögzített: területi sor'], ['condition series', 'egy jellemző értékei (pl. életkor): feltétel szerinti sor'], ['individual series', 'minden megfigyelés külön: egyedi sor']].map(x => x[0] === T[t] ? x.map(hl) : x))]));
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

// Csoportos medián / kvartilis részletes levezetése: pos = n/2, N/4 vagy 3N/4.
function posSol(t, pos, label, name, res) {
  const j = t.cf.findIndex(c => c >= pos), cfb = j ? t.cf[j - 1] : 0, l = t.lo[j], fj = t.fs[j], h = t.w, need = pos - cfb;
  const who = t.cf.map((c, i) => `${(i ? t.cf[i - 1] : 0) + 1}–${c}.`);
  return steps(
    ['Hányadik érték kell?', para(`${im(TeX`n = \sum f = ${t.fs.join(' + ')} = ${t.n}`)}. A sorba rendezett adatok közül a(z) ${im(`${label} = ${f(pos, 2)}`)}. érték kell${Number.isInteger(pos) ? '' : ' (nem egész szám, ez rendben van: két érték között van)'}.`)],
    ['Melyik osztályba esik?', para(`Ehhez kell a kumulált gyakoriság (${im('cf')}): hány érték van összesen az adott osztály felső határáig.`) + tbl(['Class', 'f', 'cf', 'hányadik értékek'], t.cls.map((c, i) => i === j ? [hl(c), hl(t.fs[i]), hl(t.cf[i]), hl(`${who[i]} ← itt van`)] : [c, t.fs[i], t.cf[i], who[i]])) + para(`Az első osztály, ahol ${im(TeX`cf \ge ${f(pos, 2)}`)}: ${hl(t.cls[j])}.`)],
    ['Hol van az osztályon belül?', para(`Az osztály előtt már ${cfb} érték van. Még ${im(`${f(pos, 2)} - ${cfb} = ${f(need, 2)}`)} értéket kell bejárni ebben az osztályban, amelyben összesen ${fj} érték van. Ez az osztály ${im(TeX`\frac{${f(need, 2)}}{${fj}} = ${f(need / fj, 4)}`)} része.`)],
    ['Átváltás értékre', para(`Az osztály (${t.cls[j]}) alsó határa ${l}, szélessége ${h}. Úgy vesszük, hogy az értékek az osztályon belül egyenletesen oszlanak el.`) + fx(TeX`${tx(name)} = l + \frac{${label} - cf}{f} \times h`, TeX`= ${l} + \frac{${f(pos, 2)} - ${cfb}}{${fj}} \times ${h}`, TeX`= ${l} + ${f(need / fj, 4)} \times ${h}`, `= ${l} + ${f(need / fj * h, 3)}`, `= ${f(res, 3)}`)],
    ['A betűk', legend([['l', 'az osztály alsó határa', l], [label, 'hányadik érték kell', f(pos, 2)], ['cf', 'kumulált gyakoriság az osztály ELŐTT', cfb], ['f', 'az osztály gyakorisága', fj], ['h', 'osztályköz hossza', h]])],
    ['Miért nem az osztály közepe?', para(`Az osztály közepe (${t.mid[j]}) csak akkor lenne jó, ha a keresett érték pont az osztály felénél lenne. Itt az osztály ${f(need / fj, 2)} részénél van.`)]);
}

const central = [
  function meanList() {
    let xs, s, md; do { xs = Array.from({ length: R(6, 9) }, () => R(1, 40)); s = [...xs].sort((a, b) => a - b); md = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; } while (Math.abs(mean(xs) - md) < 0.5);
    return Q(`Find the <b>arithmetic mean</b> of: ${xs.join(', ')}.`, mean(xs), [
      [md, 'Ez a median (medián), nem az átlag.'],
      [sum(xs) / (xs.length - 1), `${im('n - 1')}-gyel osztottál. A számtani átlagnál n-nel kell (itt ${im(`n = ${xs.length}`)}).`],
      [(s[0] + s[s.length - 1]) / 2, 'Ez csak a legkisebb és a legnagyobb érték átlaga, nem az összes adaté.'],
    ], steps(
      ['Összeadás', fx(TeX`\sum x = ${xs.join(' + ')}`, `= ${sum(xs)}`)],
      ['Osztás a darabszámmal', fx(TeX`\bar{x} = \frac{\sum x}{n}`, `= ${fr(sum(xs), xs.length)}`, `= ${f(mean(xs), 3)}`)],
      ['Ne keverd össze', para(`A medián más: rendezve ${s.join(', ')}, a közepe ${f(md)}. Az átlag minden értéket felhasznál, a medián csak a középsőt.`)]), x => f(x, 3));
  },
  function weighted() {
    const names = ['Math', 'Statistics', 'Accounting', 'Economics'], k = R(3, 4);
    let g, w; do { g = Array.from({ length: k }, () => R(1, 5)); w = Array.from({ length: k }, () => R(2, 8)); } while (new Set(w).size < 2 || new Set(g).size < 2);
    const wx = sum(g.map((x, i) => x * w[i])), wm = wx / sum(w), rw = [...w].reverse();
    return Q(`A student's grades and credits: ${tbl(['Subject', 'Grade', 'Credits'], names.slice(0, k).map((n, i) => [n, g[i], w[i]]))} Calculate the <b>weighted mean</b> of the grades (weights = credits).`, wm, [
      [mean(g), 'Ez az egyszerű átlag, a krediteket (weights, súlyok) nem vetted figyelembe.'],
      [wx / k, `A tárgyak számával osztottál. A súlyozott átlagnál a súlyok összegével (${im(TeX`\sum w`)}) kell.`],
      [sum(g.map((x, i) => x * rw[i])) / sum(w), 'Rossz párosítás: a súlyokat nem a saját jegyükkel szoroztad.'],
    ], steps(
      ['Szorzatok táblázata', tbl(['Subject', `Grade (${im('x')})`, `Credits (${im('w')})`, im(TeX`w \cdot x`)], [...names.slice(0, k).map((n, i) => [n, g[i], w[i], g[i] * w[i]]), [hl(im(TeX`\sum`)), '', hl(sum(w)), hl(wx)]])],
      ['Súlyozott átlag (weighted mean)', fx(TeX`\bar{x} = \frac{\sum w \cdot x}{\sum w}`, `= ${fr(wx, sum(w))}`, `= ${f(wm, 3)}`)],
      ['Miért súlyozunk?', para(`A több kredites tárgy jobban számít. Sima átlaggal ${f(mean(g), 3)} jönne ki, ez hibás, mert minden tárgyat egyformán számolna.`)]), x => f(x, 3));
  },
  function geometric() {
    let r; do { r = [R(-10, 25), R(-10, 25), R(-10, 25)]; } while (r.includes(0) || new Set(r).size < 3);
    const fac = r.map(x => 1 + x / 100), prod = fac[0] * fac[1] * fac[2], gm = Math.cbrt(prod) - 1, s = [...r].sort((a, b) => a - b);
    return Q(`Prices changed by <b>${r.map(x => (x > 0 ? '+' : '') + x + '%').join('</b>, <b>')}</b> in three consecutive years. What is the <b>average yearly change</b>?`, gm, [
      [mean(r) / 100, 'Ez a százalékok számtani átlaga. Egymásra épülő változásoknál a növekedési tényezők geometric mean-je (mértani átlaga) kell.'],
      [prod - 1, 'Ez a teljes változás három év alatt, nem az évi átlag.'],
      [s[1] / 100, 'Ez a változások mediánja, nem az átlagos évi változás.'],
    ], steps(
      ['Százalékból növekedési tényező', para(`Egy ${im('+r\\%')} változás azt jelenti, hogy az érték ${im(TeX`\left(1 + \frac{r}{100}\right)`)}-szorosára változik.`) + fx(...r.map((x, i) => TeX`${x > 0 ? '+' : ''}${x}\% \to ${f(fac[i], 2)}`))],
      ['A tényezők szorzata', fx(TeX`${fac.map(x => f(x, 2)).join(' \\cdot ')} = ${f(prod, 4)}`) + para(`Ez a teljes változás 3 év alatt: ${prod >= 1 ? '+' : ''}${pc(prod - 1)}.`)],
      ['Mértani átlag (geometric mean)', para('3 év van, ezért köbgyököt vonunk:') + fx(TeX`GM = \sqrt[3]{${fac.map(x => f(x, 2)).join(' \\cdot ')}}`, TeX`= \sqrt[3]{${f(prod, 4)}}`, `= ${f(gm + 1, 4)}`)],
      ['Vissza százalékra', fx(`${f(gm + 1, 4)} - 1 = ${f(gm, 4)}`, `= ${gm > 0 ? '+' : ''}${pc(gm)}\\ ${tx('évente')}`) + para(`Ellenőrzés: ${im(`${f(gm + 1, 4)}^3 = ${f((gm + 1) ** 3, 4)}`)}, ez megegyezik a teljes változás tényezőjével.`)]), x => (x > 0 ? '+' : '') + pc(x));
  },
  function harmonic() {
    let v1, v2; do { v1 = pick([30, 40, 50, 60, 80, 90, 100, 120]); v2 = pick([30, 40, 50, 60, 80, 90, 100, 120]); } while (v1 === v2);
    const d = R(2, 12) * 10, hm = 2 / (1 / v1 + 1 / v2);
    return Q(`A courier drives <b>${d} km at ${v1} km/h</b>, then another <b>${d} km at ${v2} km/h</b>. What is the <b>average speed</b>?`, hm, [
      [(v1 + v2) / 2, 'Ez a számtani átlag. Azonos távolságokon mért sebességeket a harmonic mean (harmonikus átlag) átlagol helyesen.'],
      [Math.sqrt(v1 * v2), 'Ez a geometric mean (mértani átlag), növekedési ütemekhez való, sebességhez nem.'],
      [1 / (1 / v1 + 1 / v2), `A reciprokok összegével jól osztottál, de ${im('n = 2')}-vel nem szoroztál.`],
    ], steps(
      ['Miért nem a sima átlag?', para(`Mindkét sebességgel ugyanakkora utat (${d} km) tesz meg, de a lassabb szakaszon több időt tölt. Ilyenkor a harmonic mean (harmonikus átlag) adja a helyes átlagsebességet.`)],
      ['Harmonikus átlag', fx(TeX`HM = \frac{n}{\sum \frac{1}{x}}`, TeX`= \frac{2}{\frac{1}{${v1}} + \frac{1}{${v2}}}`, TeX`= \frac{2}{${f(1 / v1, 5)} + ${f(1 / v2, 5)}}`, TeX`= ${f(hm, 2)}\ \text{km/h}`)],
      ['Ellenőrzés idővel', fx(TeX`\text{idő} = \frac{${d}}{${v1}} + \frac{${d}}{${v2}}`, `= ${f(d / v1, 4)} + ${f(d / v2, 4)}`, TeX`= ${f(d / v1 + d / v2, 4)}\ \text{h}`, TeX`\text{átlagsebesség} = \frac{\text{teljes út}}{\text{teljes idő}} = \frac{${2 * d}}{${f(d / v1 + d / v2, 4)}}`, TeX`= ${f(hm, 2)}\ \text{km/h}`)]), x => f(x, 2) + ' km/h');
  },
  function groupedMean(t = groupedTable()) {
    const sfx = sum(t.fs.map((x, i) => x * t.mid[i]));
    return Q(`${hrow('Class', t.cls, 'f', t.fs)} Find the <b>mean</b> (direct method).`, t.mean, [
      [sum(t.fs.map((x, i) => x * t.lo[i])) / t.n, 'Az alsó határokkal (lower limits) számoltál. Az osztályt az osztályközép (midpoint) képviseli.'],
      [sfx / 5, `Az osztályok számával (5) osztottál, nem ${im(TeX`\sum f`)}-fel.`],
      [mean(t.mid), 'Nem súlyoztál a gyakoriságokkal, csak az osztályközepeket átlagoltad.'],
    ], steps(
      ['Osztályközép minden osztályra', para(`Az osztályon belüli pontos értékeket nem ismerjük, ezért minden osztályt a közepével (midpoint) helyettesítünk: ${im(TeX`x = \frac{\text{alsó} + \text{felső}}{2}`)}.`)],
      ['Táblázat', tbl(['Class', im('f'), `${im('x')} (midpoint)`, im(TeX`f \cdot x`)], [...t.cls.map((c, i) => [c, t.fs[i], t.mid[i], t.fs[i] * t.mid[i]]), [hl(im(TeX`\sum`)), hl(t.n), '', hl(sfx)]])],
      ['Átlag', fx(TeX`\bar{x} = \frac{\sum f x}{\sum f}`, `= ${fr(sfx, t.n)}`, `= ${f(t.mean, 3)}`)]), x => f(x, 3));
  },
  function stepDeviation() {
    let t, u, su; do { t = groupedTable(); u = [-2, -1, 0, 1, 2]; su = sum(t.fs.map((x, i) => x * u[i])); } while (su === 0);
    const A = t.mid[2], h = t.w;
    return Q(`${hrow('Class', t.cls, 'f', t.fs)} Find the mean with the <b>step deviation method</b>, A = ${A}, h = ${h}.`, t.mean, [
      [A + su / t.n, `Elfelejtettél visszaszorozni h-val: ${im(TeX`\bar{x} = A + \frac{\sum f u}{\sum f} \times h`)}.`],
      [A + h * su, `Nem osztottál ${im(TeX`\sum f`)}-fel.`],
      [A - h * su / t.n, 'Előjelhiba: az eltéréseket hozzá kell adni A-hoz.'],
    ], steps(
      ['A és h', para(`A (assumed mean, feltételezett átlag) = ${A}: a középső osztály közepe. h = ${h}: az osztályköz hossza.`)],
      ['u kiszámítása', para(`Minden osztályközépre ${im(TeX`u = \frac{x - A}{h}`)}. Így kis egész számokkal (−2 … 2) kell számolni.`) + tbl(['Class', im('f'), im('x'), im(TeX`u = \frac{x - A}{h}`), im(TeX`f \cdot u`)], [...t.cls.map((c, i) => [c, t.fs[i], t.mid[i], u[i], t.fs[i] * u[i]]), [hl(im(TeX`\sum`)), hl(t.n), '', '', hl(su)]])],
      ['Átlag', fx(TeX`\bar{x} = A + \frac{\sum f u}{\sum f} \times h`, TeX`= ${A} + \frac{${su}}{${t.n}} \times ${h}`, `= ${A} + (${f(h * su / t.n, 3)})`, `= ${f(t.mean, 3)}`)]), x => f(x, 3));
  },
  function medianList() {
    let xs, s, n, md, w;
    do {
      n = R(6, 9); xs = Array.from({ length: n }, () => R(10, 99)); s = [...xs].sort((a, b) => a - b);
      if (n % 2) { md = s[(n - 1) / 2]; w = [[xs[(n - 1) / 2], 'Nem rendezted sorba az adatokat, csak a felsorolás középső elemét vetted.'], [mean(xs), 'Ez az átlag, nem a medián.'], [s[(n - 1) / 2 - 1], `Eggyel elcsúsztál: páratlan n-nél az ${im(TeX`\frac{n+1}{2}`)}-edik elem a medián.`]]; }
      else { md = (s[n / 2 - 1] + s[n / 2]) / 2; w = [[s[n / 2 - 1], 'Páros elemszámnál a két középső elem átlaga a medián, nem az alsó.'], [s[n / 2], 'Páros elemszámnál a két középső elem átlaga a medián, nem a felső.'], [mean(xs), 'Ez az átlag, nem a medián.']]; }
    } while (new Set(w.map(x => f(x[0]))).size < 3 || w.some(x => f(x[0]) === f(md)));
    return Q(`Find the <b>median</b> of: ${xs.join(', ')}.`, md, w,
      steps(
      ['Sorba rendezés', para(s.map((x, i) => (n % 2 ? i === (n - 1) / 2 : i === n / 2 - 1 || i === n / 2) ? hl(`[${x}]`) : x).join(', ')) + para('Szögletes zárójelben a középső elem(ek).')],
      ['Hányadik a középső?', para(n % 2 ? `${im(`n = ${n}`)} páratlan, ezért egy középső elem van: az ${im(TeX`\frac{n+1}{2} = ${(n + 1) / 2}`)}. elem.` : `${im(`n = ${n}`)} páros, ezért két középső elem van: a(z) ${n / 2}. és a(z) ${n / 2 + 1}. elem.`)],
      ['Medián', n % 2 ? fx(`${tx('medián')} = ${md}`) : fx(`${tx('medián')} = ${fr(`${s[n / 2 - 1]} + ${s[n / 2]}`, 2)}`, `= ${f(md)}`)]), x => f(x, 2));
  },
  function medianGrouped(t) {
    if (!t) do { t = groupedTable(); } while (medClass(t) < 1);
    const j = medClass(t), cfb = t.cf[j - 1], l = t.lo[j], fj = t.fs[j], h = t.w, md = l + (t.n / 2 - cfb) / fj * h;
    return Q(`${hrow('Class', t.cls, 'f', t.fs)} Find the <b>median</b>.`, md, [
      [l + (t.n / 2 - t.cf[j]) / fj * h, `A mediánosztály saját kumulált gyakoriságát vontad le. A ${im('cf')} a mediánosztály ELŐTTI osztály kumulált gyakorisága.`],
      [l + (t.n / 2 - cfb) / fj, 'Elfelejtettél h-val (osztályköz hossza) szorozni.'],
      [t.mid[j], 'Ez csak a mediánosztály közepe; a képlettel kell az osztályon belül pontosítani.'],
    ], posSol(t, t.n / 2, 'n/2', 'Median', md), x => f(x, 3));
  },
  function modeGrouped(t = groupedTable(peakOK)) {
    const j = t.fs.indexOf(Math.max(...t.fs)), f1 = t.fs[j], f0 = t.fs[j - 1], f2 = t.fs[j + 1], l = t.lo[j], h = t.w;
    const mo = l + (f1 - f0) / (2 * f1 - f0 - f2) * h;
    return Q(`${hrow('Class', t.cls, 'f', t.fs)} Find the <b>mode</b>.`, mo, [
      [t.mid[j], 'Ez csak a modális osztály közepe; a képlet a nagyobb gyakoriságú szomszéd felé tolja a móduszt.'],
      [l + (f1 - f2) / (2 * f1 - f0 - f2) * h, `Felcserélted ${im('f_0')}-t és ${im('f_2')}-t. ${im('f_0')} az előző, ${im('f_2')} a következő osztály gyakorisága.`],
      [l + (f1 - f0) / (2 * f1 - f0 - f2), 'Elfelejtettél h-val (osztályköz hossza) szorozni.'],
    ], steps(
      ['Modális osztály', para('A mode (módusz) a leggyakoribb érték. Osztályközös sorban először a legnagyobb gyakoriságú osztályt keressük meg.') + tbl(['Class', 'f'], t.cls.map((c, i) => i === j ? [hl(c), hl(`${t.fs[i]} ← legnagyobb`)] : [c, t.fs[i]]))],
      ['A szomszédok', para(`${im(`f_1 = ${f1}`)} (modális osztály), ${im(`f_0 = ${f0}`)} (előtte), ${im(`f_2 = ${f2}`)} (utána). A módusz a nagyobb gyakoriságú szomszéd felé tolódik, itt ${f0 > f2 ? 'lefelé, az előző osztály felé' : 'felfelé, a következő osztály felé'}.`)],
      ['Képlet', fx(TeX`\text{Mode} = l + \frac{f_1 - f_0}{2f_1 - f_0 - f_2} \times h`, TeX`= ${l} + \frac{${f1} - ${f0}}{2 \cdot ${f1} - ${f0} - ${f2}} \times ${h}`, TeX`= ${l} + \frac{${f1 - f0}}{${2 * f1 - f0 - f2}} \times ${h}`, `= ${l} + ${f((f1 - f0) / (2 * f1 - f0 - f2) * h, 3)}`, `= ${f(mo, 3)}`)],
      ['A betűk', legend([['l', 'a modális osztály alsó határa', l], ['f_1', 'a modális osztály gyakorisága', f1], ['f_0', 'az előző osztály gyakorisága', f0], ['f_2', 'a következő osztály gyakorisága', f2], ['h', 'osztályköz hossza', h]])]), x => f(x, 3));
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
    ], steps(
      ['Legnagyobb és legkisebb érték', para(`Rendezve: ${s.join(', ')}.`) + fx(TeX`\max = ${mx}, \quad \min = ${mn}`)],
      ['Range (terjedelem)', fx(TeX`\text{range} = \max - \min`, `= ${mx} - ${mn}`, `= ${mx - mn}`) + para('A range csak a két szélső értéket használja, ezért egyetlen kiugró érték (outlier) is nagyon megnöveli.')]), x => f(x, 2));
  },
  function variance() {
    const xs = intList(R(5, 7)), n = xs.length, m = mean(xs), ss = sum(xs.map(x => (x - m) ** 2)), pop = Math.random() < 0.5;
    const pv = ss / n, sv = ss / (n - 1), mad = sum(xs.map(x => Math.abs(x - m))) / n, sym = pop ? '\\mu' : '\\bar{x}';
    const sol = steps(
      ['Átlag', fx(`${sym} = ${fr(TeX`\sum x`, 'n')}`, `= ${fr(sum(xs), n)}`, `= ${m}`)],
      ['Eltérések és négyzeteik', tbl([im('x'), im(`x - ${sym}`), im(`(x - ${sym})^2`)], [...xs.map(x => [x, x - m, (x - m) ** 2]), [hl(im(TeX`\sum`)), 0, hl(ss)]]) + para('Az eltérések összege mindig 0, ezért négyzetre emeljük őket.')],
      ['Osztás', pop
        ? para('Population (sokaság): N-nel osztunk.') + fx(TeX`\sigma^2 = \frac{\sum (x - \mu)^2}{N}`, `= ${fr(ss, n)}`, `= ${f(pv, 3)}`)
        : para(`Sample (minta): ${im('n - 1')}-gyel osztunk (Bessel-korrekció).`) + fx(TeX`s^2 = \frac{\sum (x - \bar{x})^2}{n - 1}`, `= ${fr(ss, n - 1)}`, `= ${f(sv, 3)}`)],
      ['Variancia vagy szórás?', para(`A variancia négyzetes mértékegységben van. A szórás ennek a gyöke (${im(TeX`\sqrt{${f(pop ? pv : sv, 3)}} = ${f(Math.sqrt(pop ? pv : sv), 3)}`)}), de most a varianciát kérdezik.`)]);
    return Q(`Find the <b>${pop ? 'population' : 'sample'} variance</b> of: ${xs.join(', ')}.`, pop ? pv : sv, [
      pop ? [sv, `Ez a sample variance (mintavariancia), ${im('n - 1')}-gyel osztottál. Population (sokaság) esetén N-nel kell.`] : [pv, `Ez a population variance (sokasági variancia). Sample (minta) esetén ${im('n - 1')}-gyel kell osztani.`],
      [Math.sqrt(pop ? pv : sv), 'Ez a standard deviation (szórás), a variancia négyzetgyöke. A kérdés a varianciára vonatkozik.'],
      [mad, 'Az eltérések abszolút értékét átlagoltad. A variancia az eltérések négyzetének átlaga.'],
    ], sol, x => f(x, 3));
  },
  function sdFreq() {
    let xs, fs, n, m; do { xs = shuffle([2, 4, 5, 6, 8, 10, 12, 15]).slice(0, R(3, 4)).sort((a, b) => a - b); fs = xs.map(() => R(1, 6)); n = sum(fs); m = sum(xs.map((x, i) => x * fs[i])) / n; } while (new Set(xs).size < xs.length);
    const d2 = xs.map(x => (x - m) ** 2), sfd = sum(d2.map((d, i) => d * fs[i])), sd = Math.sqrt(sfd / n), sfx = sum(xs.map((x, i) => x * fs[i]));
    return Q(`${hrow('x', xs, 'f', fs)} Find the <b>standard deviation</b> (population formula).`, sd, [
      [sfd / n, 'Ez a variance (variancia); a szóráshoz még gyököt kell vonni.'],
      [Math.sqrt(sum(d2) / n), 'A négyzetes eltéréseket nem szoroztad meg a gyakoriságokkal (f).'],
      [Math.sqrt(sfd / xs.length), `A különböző értékek számával (${xs.length}) osztottál, nem ${im(TeX`\sum f`)}-fel (${n}).`],
    ], steps(
      ['Átlag a gyakoriságokkal', fx(TeX`\bar{x} = \frac{\sum f x}{\sum f}`, `= ${fr(sfx, n)}`, `= ${f(m, 3)}`)],
      ['Négyzetes eltérések, gyakorisággal szorozva', tbl([im('x'), im('f'), im(TeX`f \cdot x`), im(TeX`(x - \bar{x})^2`), im(TeX`f \cdot (x - \bar{x})^2`)], [...xs.map((x, i) => [x, fs[i], x * fs[i], f(d2[i], 3), f(d2[i] * fs[i], 3)]), [hl(im(TeX`\sum`)), hl(n), hl(sfx), '', hl(f(sfd, 3))]])],
      ['Variancia', fx(TeX`\sigma^2 = \frac{\sum f (x - \bar{x})^2}{\sum f}`, `= ${fr(f(sfd, 3), n)}`, `= ${f(sfd / n, 3)}`)],
      ['Szórás (standard deviation)', fx(TeX`\sigma = \sqrt{\sigma^2}`, TeX`= \sqrt{${f(sfd / n, 3)}}`, `= ${f(sd, 3)}`)]), x => f(x, 3));
  },
  function quartInd() {
    const N = pick([7, 11, 15]); let s; do { s = Array.from({ length: N }, () => R(100, 300)); } while (new Set(s).size < N);
    const xs = [...s]; s.sort((a, b) => a - b);
    const p1 = (N + 1) / 4, q1 = s[p1 - 1], q3 = s[3 * p1 - 1], qd = (q3 - q1) / 2, coef = (q3 - q1) / (q3 + q1), askQD = Math.random() < 0.5;
    const sol = steps(
      ['Sorba rendezés', para(s.map((x, i) => i === p1 - 1 || i === 3 * p1 - 1 ? hl(`[${x}]`) : x).join(', ')) + para(`${im(`N = ${N}`)}. Szögletes zárójelben ${im('Q_1')} és ${im('Q_3')}.`)],
      ['Q₁ és Q₃ helye', fx(TeX`Q_1:\ \frac{N + 1}{4} = \frac{${N} + 1}{4} = ${p1}.\ \text{elem} = ${q1}`, TeX`Q_3:\ \frac{3(N + 1)}{4} = ${3 * p1}.\ \text{elem} = ${q3}`)],
      ['Mutatók', fx(`IQR = Q_3 - Q_1 = ${q3} - ${q1} = ${q3 - q1}`, `QD = ${fr('Q_3 - Q_1', 2)} = ${fr(q3 - q1, 2)} = ${f(qd, 3)}`, `${tx('coeff. of QD')} = ${fr('Q_3 - Q_1', 'Q_3 + Q_1')} = ${fr(q3 - q1, q3 + q1)} = ${f(coef, 4)}`) + para(`A kérdés: ${askQD ? 'quartile deviation (kvartiliseltérés)' : 'coefficient of quartile deviation (relatív kvartiliseltérés, mértékegység nélküli)'}.`)]);
    return askQD
      ? Q(`Data: ${xs.join(', ')}. Find the <b>quartile deviation</b>.`, qd, [[q3 - q1, 'Ez az interquartile range (IQR), a kvartiliseltérés ennek a fele.'], [(s[N - 1] - s[0]) / 2, 'A terjedelem felét számoltad, nem a kvartilisekből.'], [coef, 'Ez a coefficient of quartile deviation (relatív kvartiliseltérés).']], sol, x => f(x, 4))
      : Q(`Data: ${xs.join(', ')}. Find the <b>coefficient of quartile deviation</b>.`, coef, [[qd, 'Ez a quartile deviation (kvartiliseltérés), nem az együttható.'], [(q3 + q1) / (q3 - q1), 'Fordítva osztottál.'], [(q3 - q1) / s[(N - 1) / 2], `A mediánnal osztottál; a képlet ${im(TeX`\frac{Q_3 - Q_1}{Q_3 + Q_1}`)}.`]], sol, x => f(x, 4));
  },
  function quartGrouped() {
    const which = pick([1, 3]); let t, j, pos;
    do { t = groupedTable(); pos = which * t.n / 4; j = t.cf.findIndex(c => c >= pos); } while (j < 1 || t.cf[j - 1] === pos);
    const cfb = t.cf[j - 1], l = t.lo[j], fj = t.fs[j], h = t.w, q = l + (pos - cfb) / fj * h;
    const jm = t.cf.findIndex(c => c >= t.n / 2), med = t.lo[jm] + (t.n / 2 - (jm ? t.cf[jm - 1] : 0)) / t.fs[jm] * h;
    return Q(`${hrow('Class', t.cls, 'f', t.fs)} Find <b>Q${which}</b>.`, q, [
      [med, `Ez a median (medián), ${im('N/2')}-vel számoltál. ${im('Q_1')}-nél ${im('N/4')}, ${im('Q_3')}-nál ${im('3N/4')} kell.`],
      [l + (pos - t.cf[j]) / fj * h, 'A kvartilisosztály saját kumulált gyakoriságát vontad le, nem az előzőét.'],
      [l + (pos - cfb) / fj, 'Elfelejtettél h-val szorozni.'],
    ], posSol(t, pos, which === 1 ? 'N/4' : '3N/4', 'Q' + which, q), x => f(x, 3));
  },
  function nFromSS() {
    const v = R(4, 20), N = R(8, 30), ss = v * N;
    return Q(`The <b>population</b> variance of a data set is <b>${v}</b>, and the sum of squared deviations from the mean is <b>${ss}</b>. How many observations are there?`, N, [
      [N + 1, `Mintát feltételeztél (${im(`n - 1 = ${N}`)}), de a feladat population (sokasági) varianciát ad meg.`],
      [Math.sqrt(ss / v), `Gyököt vontál, de itt nincs szórás: ${im(TeX`\sigma^2 = \frac{SS}{N}`)}, ebből ${im(TeX`N = \frac{SS}{\sigma^2}`)}.`],
      [N - 1, `Eggyel kevesebb: ${im(TeX`N = \frac{SS}{\sigma^2}`)} pontosan.`],
    ], steps(
      ['Képlet', fx(TeX`\sigma^2 = \frac{\sum (x - \mu)^2}{N}`)],
      ['Átrendezés N-re', fx(TeX`N = \frac{\sum (x - \mu)^2}{\sigma^2}`, `= ${fr(ss, v)}`, `= ${N}`)],
      ['Vigyázz', para(`Population (sokasági) varianciánál N-nel osztunk. Ha minta lenne (${im('n - 1')}-gyel), akkor ${im(`n - 1 = ${N}`)}, vagyis ${im(`n = ${N + 1}`)} jönne ki.`)]), x => f(x, 3));
  },
];

// ---------- 6. Mintavétel ----------
const sampling = [
  function probSel() {
    const N = R(5, 60) * 100, n = R(1, 20) * 10, not = Math.random() < 0.4;
    return Q(`From a population of <b>${f(N)}</b>, <b>${n}</b> units are selected by simple random sampling. What is the probability that a given unit is <b>${not ? 'NOT selected' : 'selected'}</b>?`, not ? 1 - n / N : n / N, [
      [not ? n / N : 1 - n / N, not ? 'Ez annak a valószínűsége, hogy kiválasztják; a kérdés a NEM kiválasztásra vonatkozik.' : 'Ez annak a valószínűsége, hogy NEM választják ki.'],
      [1 / N, `Ez egyetlen húzás esélye. Mivel ${n} elemet választunk, a valószínűség ${im(TeX`\frac{n}{N}`)}.`],
      [n / (N - n), 'A nem kiválasztottak számával osztottál, nem a teljes sokasággal.'],
    ], steps(
      ['Képlet', para('Simple random sampling (egyszerű véletlen mintavétel): mindenkinek ugyanakkora az esélye, hogy bekerül.') + fx(TeX`P(\text{selected}) = \frac{n}{N}`, `= ${fr(n, f(N))}`, `= ${f(n / N, 4)}`, `= ${pc(n / N)}`)],
      not && ['Komplementer', para('„NOT selected” = 1 − P(selected).') + fx(TeX`P(\text{not selected}) = 1 - ${pc(n / N)}`, `= ${pc(1 - n / N)}`)]), x => pc(x));
  },
  function atLeastOnce() {
    const N = R(20, 300), n = R(3, 60), p = 1 - (1 - 1 / N) ** n;
    return Q(`<b>${n}</b> draws are made <b>with replacement</b> from a population of <b>${N}</b>. What is the probability that a given person is selected <b>at least once</b>?`, p, [
      [n / N, `Ez a visszatevés nélküli képlet (${im(TeX`\frac{n}{N}`)}). Visszatevéssel ugyanaz az elem többször is kijöhet.`],
      [(1 - 1 / N) ** n, 'Ez annak a valószínűsége, hogy EGYSZER SEM választják ki; ezt még ki kell vonni 1-ből.'],
      [1 / N, 'Ez egyetlen húzás esélye.'],
    ], steps(
      ['Egy húzás', fx(TeX`P(\text{kijön}) = \frac{1}{${N}}`, TeX`P(\text{nem jön ki}) = 1 - \frac{1}{${N}} = ${f(1 - 1 / N, 5)}`)],
      ['Egyszer sem', para(`Visszatevéssel (with replacement) a ${n} húzás független egymástól, ezért a valószínűségek összeszorzódnak:`) + fx(TeX`P(\text{egyszer sem}) = \left(1 - \frac{1}{${N}}\right)^{${n}}`, `= ${f((1 - 1 / N) ** n, 4)}`)],
      ['Legalább egyszer', para('„At least once” = 1 − „egyszer sem”.') + fx(TeX`P = 1 - ${f((1 - 1 / N) ** n, 4)}`, `= ${pc(p)}`)]), x => pc(x));
  },
  function stratified() {
    const names = ['1st year', '2nd year', '3rd year', 'MSc'], S = names.map(() => R(2, 30) * 100), N = sum(S), n = N / pick([10, 20, 25, 50]), j = R(0, 3), s = S[j] / N * n;
    return Q(`${tbl(['Stratum', ...names], [['Size', ...S]])} A <b>proportionate</b> stratified sample of <b>${f(n)}</b> is taken. How many units come from the <b>${names[j]}</b> stratum?`, s, [
      [n / 4, 'Egyenlően osztottad szét a rétegek között (disproportionate). Arányos mintánál a réteg méretével arányos rész jár.'],
      [S[j] / N * 100, 'Ez a réteg aránya százalékban, nem a mintába kerülő darabszám.'],
      [S[j] / n, `A réteg méretét a mintanagysággal osztottad. A képlet ${im(TeX`s = \frac{S}{N} \times n`)}.`],
    ], steps(
      ['Az egész sokaság', fx(`N = ${S.join(' + ')}`, `= ${f(N)}`)],
      ['Arányos rész', para('Proportionate (arányos) rétegzett mintánál minden réteg akkora részt kap a mintából, amekkora a sokaságból.') + fx(TeX`s = \frac{S}{N} \times n`, TeX`= \frac{${S[j]}}{${f(N)}} \times ${f(n)}`, TeX`= ${f(S[j] / N, 4)} \times ${f(n)}`, `= ${f(s, 2)}`)],
      ['Minden réteg', tbl(['Stratum', 'Size', 'In sample'], names.map((x, i) => i === j ? [hl(x), hl(S[i]), hl(f(S[i] / N * n, 2))] : [x, S[i], f(S[i] / N * n, 2)]))]), x => f(x, 2));
  },
  function systematic() {
    const k = R(5, 50), n = R(20, 200), N = k * n, st = R(1, k), i = R(5, 40);
    return Q(`Systematic sampling: N = <b>${f(N)}</b>, n = <b>${n}</b>, random start = <b>${st}</b>. Which unit is the <b>${i}th</b> in the sample?`, st + (i - 1) * k, [
      [st + i * k, `Eggyel elcsúsztál: az első elem maga a kezdőpont, ezért ${im(TeX`(i - 1) \cdot k`)}-t kell hozzáadni.`],
      [i * k, 'Nem a kezdőponttól indultál.'],
      [(i - 1) * k, 'Kimaradt a kezdőpont (random start).'],
    ], steps(
      ['Lépésköz (sampling interval)', fx(TeX`k = \frac{N}{n}`, `= ${fr(f(N), n)}`, `= ${k}`)],
      ['A minta elemei', para(`Az első elem a kezdőpont (${st}), utána mindig ${im(`k = ${k}`)} lépéssel haladunk:`) + fx(`1.\\ ${tx('elem')} = ${st}`, `2.\\ ${tx('elem')} = ${st} + ${k} = ${st + k}`, TeX`3.\ \text{elem} = ${st} + 2 \cdot ${k} = ${st + 2 * k}`, TeX`\quad\vdots`, TeX`${i}.\ \text{elem} = ${st} + (${i} - 1) \cdot ${k} = ${st + (i - 1) * k}`)]), x => f(x));
  },
  function cluster() {
    const V = R(30, 80), a = R(20, 60), c = R(5, 15), m = R(5, 15), two = Math.random() < 0.5;
    return Q(`A region has <b>${V}</b> villages with on average <b>${a}</b> households each. We randomly select <b>${c}</b> villages${two ? ` and then randomly select <b>${m}</b> households in each selected village` : ` and survey every household in them`}. How many households are surveyed?`, two ? c * m : c * a, [
      two ? [c * a, 'Ez az egylépcsős (single-stage) minta. Itt kétlépcsős (two-stage), a falvakon belül újra mintát veszünk.'] : [c * m, 'Kétlépcsős mintát számoltál, de itt a kiválasztott falvak minden háztartását megkérdezzük.'],
      [V * a, 'Ez a teljes sokaság, nem a minta.'],
      [two ? V * m : V * a / c, two ? 'Az összes faluval számoltál, nem csak a kiválasztottakkal.' : 'Rossz művelet: n = ACS × kiválasztott klaszterek száma.'],
    ], steps(
      ['Milyen mintavétel?', para(two ? 'Two-stage cluster (kétlépcsős csoportos): először falvakat (klasztereket) választunk, aztán a kiválasztott falvakon belül háztartásokat.' : 'Single-stage cluster (egylépcsős csoportos): falvakat választunk, és a kiválasztott falvakban minden háztartást megkérdezünk.')],
      ['Számolás', fx(two ? TeX`n = ${c}\ \text{falu} \times ${m}\ \text{háztartás} = ${c * m}` : TeX`n = ${c}\ \text{falu} \times ${a}\ \text{háztartás (átlag)} = ${c * a}`) + para(`A többi ${V - c} falu egyáltalán nem kerül be.`)]), x => f(x, 2));
  },
  function methodId() {
    const S = [['Every 20th customer is chosen from an alphabetical list, starting from a random number between 1 and 20.', 'systematic'], ['Names of all employees are put in a hat and 30 are drawn.', 'simple'],
      ['The population is split by income level and a random sample is drawn from each income group in proportion to its size.', 'stratified'], ['5 schools are chosen at random and all students in these schools are surveyed.', 'cluster'],
      ['A random number generator picks 100 student IDs from the full list.', 'simple'], ['Students are grouped by year, and 25 are randomly chosen from each year.', 'stratified'],
      ['10 villages are drawn at random and every household in them is interviewed.', 'cluster'], ['Every 50th invoice is checked after a random start.', 'systematic']];
    const T = { simple: 'simple random sampling', systematic: 'systematic sampling', stratified: 'stratified sampling', cluster: 'cluster sampling' };
    const W = { simple: 'Simple random sampling (egyszerű véletlen): minden elem közvetlenül, azonos eséllyel kerül be, minta nélkül.', systematic: 'Systematic sampling (szisztematikus): véletlen kezdőpont után minden k-adik elem.', stratified: 'Stratified sampling (rétegzett): minden rétegből (stratum) választunk.', cluster: 'Cluster sampling (csoportos): néhány teljes csoportot választunk ki.' };
    const [txt, t] = pick(S);
    return Q(`Which sampling method is this? <i>${txt}</i>`, T[t], Object.keys(T).filter(k => k !== t).map(k => [T[k], W[k] + ' Itt nem ez történik.']), steps(
      ['Kulcs a szövegben', para(W[t])],
      ['A négy módszer', tbl(['Módszer', 'Hogyan választ?'], Object.keys(T).map(k => k === t ? [hl(T[k]), hl(W[k].split(': ')[1])] : [T[k], W[k].split(': ')[1]]))]));
  },
];

// ---------- 7. Hipotézisvizsgálat ----------
const OPT = { rej: 'Reject H₀', fail: 'Fail to reject H₀', rejH1: 'Reject H₁', prove: 'Accept H₀ as proven true' };
const hypothesis = [
  function decideP() {
    const a = pick([0.01, 0.05, 0.1]); let p; do { p = pick([0.001, 0.004, 0.008, 0.012, 0.02, 0.03, 0.045, 0.06, 0.08, 0.12, 0.2, 0.35]); } while (p === a);
    const rej = p <= a;
    return Q(`A test gives <b>p = ${p}</b>. The significance level is <b>α = ${a}</b>. What is the decision?`, rej ? OPT.rej : OPT.fail, [
      [rej ? OPT.fail : OPT.rej, rej ? `${im(TeX`p \le \alpha`)}, ezért el kell vetni H₀-t.` : `${im(TeX`p \gt \alpha`)}, ezért H₀ nem vethető el.`],
      [OPT.rejH1, 'A döntés mindig H₀-ról szól: elvetjük vagy nem vetjük el.'],
      [OPT.prove, 'H₀-t sosem bizonyítjuk, legfeljebb nem vetjük el (fail to reject).'],
    ], steps(
      ['Szabály', para(`A p-value azt mutatja, mennyire meglepő az eredmény, ha H₀ igaz. Ha ${im(TeX`p \le \alpha`)}, az eredmény túl meglepő ahhoz, hogy véletlen legyen, ezért elvetjük H₀-t.`)],
      ['Összehasonlítás', fx(TeX`p = ${p} ${rej ? '\\le' : '\\gt'} \alpha = ${a}`, TeX`\to \text{${rej ? 'Reject' : 'Fail to reject'} } H_0`)],
      ['Megfogalmazás', para(rej ? 'Reject H₀: van szignifikáns hatás vagy különbség.' : 'Fail to reject H₀: nincs elég bizonyíték. Ez NEM jelenti, hogy H₀ biztosan igaz.')]));
  },
  function hypPair() {
    const m = R(2, 20) * 5, S = [['more than', '>', '≤', '<', '≥'], ['less than', '<', '≥', '>', '≤'], ['different from', '≠', '=', '>', '≤']];
    const [verb, h1, h0, opp, opp0] = pick(S), ctx = pick(['the average waiting time (minutes)', 'the average number of daily visitors', 'the mean test score', 'the average delivery time (minutes)']);
    const tail = { '>': 'right-tailed', '<': 'left-tailed', '≠': 'two-tailed' }[h1];
    const K = { '>': '\\gt', '<': '\\lt', '≠': '\\ne', '=': '=', '≤': '\\le', '≥': '\\ge' };
    return Q(`We want to test whether ${ctx} is <b>${verb} ${m}</b>. Which hypotheses are correct?`, `H₀: μ ${h0} ${m},  H₁: μ ${h1} ${m}`, [
      [`H₀: μ ${h1} ${m},  H₁: μ ${h0} ${m}`, 'Felcserélted: az egyenlőség (=, ≤, ≥) mindig H₀-ba kerül, a bizonyítandó állítás H₁-be.'],
      [`H₀: μ ${opp0} ${m},  H₁: μ ${opp} ${m}`, 'Rossz irány: H₁ irányát a kérdés szava (' + verb + ') adja meg.'],
      [`H₀: μ ≠ ${m},  H₁: μ = ${m}`, 'H₀ nem tartalmazhat ≠ jelet, és H₁ nem lehet egyenlőség.'],
    ], steps(
      ['Mit akarunk bizonyítani?', para(`A kérdés: „${verb} ${m}”. A bizonyítandó állítás mindig H₁ (alternative hypothesis):`) + fx(`H_1: \\mu ${K[h1]} ${m}`)],
      ['H₀ az ellentéte, egyenlőséggel', para('H₀ (null hypothesis) mindig tartalmazza az egyenlőséget (=, ≤ vagy ≥):') + fx(`H_0: \\mu ${K[h0]} ${m}`)],
      ['A próba iránya', para(`${tail}: ${{ 'right-tailed': 'H₁-ben > van, csak a nagy értékek szólnak H₀ ellen.', 'left-tailed': 'H₁-ben < van, csak a kis értékek szólnak H₀ ellen.', 'two-tailed': 'H₁-ben ≠ van, mindkét irány számít.' }[tail]}`)],
      ['Kulcsszavak', tbl(['Kulcsszó', 'H₀', 'H₁', 'Próba'], [['more than, greater, increased', '≤', '>', 'right-tailed'], ['less than, fewer, decreased', '≥', '<', 'left-tailed'], ['different, changed, has an effect', '=', '≠', 'two-tailed']].map(x => x[2] === h1 ? x.map(hl) : x))]));
  },
  function errorType() {
    const h0true = Math.random() < 0.5, rej = Math.random() < 0.5;
    const ans = h0true && rej ? 'Type I error' : !h0true && !rej ? 'Type II error' : 'Correct decision';
    const W = { 'Type I error': 'Type I error (elsőfajú hiba, α): igaz H₀-t vetünk el.', 'Type II error': 'Type II error (másodfajú hiba, β): hamis H₀-t nem vetünk el.', 'Correct decision': 'Helyes döntés: igaz H₀-t megtartunk, vagy hamis H₀-t elvetünk.', 'Standard error': 'A standard error (standard hiba) a becslés szórása, nem döntési hiba.' };
    return Q(`In reality <b>H₀ is ${h0true ? 'true' : 'false'}</b>. Based on the sample we <b>${rej ? 'reject' : 'do not reject'} H₀</b>. What is this?`, ans,
      Object.keys(W).filter(k => k !== ans).map(k => [k, W[k]]), steps(
      ['A helyzet', para(`Valóság: H₀ ${hl(h0true ? 'igaz' : 'hamis')}. Döntés: ${hl(rej ? 'elvetjük H₀-t' : 'nem vetjük el H₀-t')}.`)],
      ['Döntési táblázat', tbl(['', 'H₀ igaz', 'H₀ hamis'], [['H₀-t elvetjük', 'Type I error (α)', 'helyes döntés'], ['H₀-t nem vetjük el', 'helyes döntés', 'Type II error (β)']].map((row, ri) => row.map((c, ci) => ci && (ri === 0) === rej && (ci === 1) === h0true ? hl(c) : c)))],
      ['Eredmény', para(W[ans])]));
  },
  function pairedT() {
    let n, b, d, m, s; do { n = R(5, 7); b = Array.from({ length: n }, () => R(50, 90)); d = b.map(() => R(-2, 8)); m = mean(d); s = Math.sqrt(sum(d.map(x => (x - m) ** 2)) / (n - 1)); } while (s === 0 || m === 0);
    const a = b.map((x, i) => x + d[i]), t = m / (s / Math.sqrt(n)), sp = Math.sqrt(sum(d.map(x => (x - m) ** 2)) / n), ssd = sum(d.map(x => (x - m) ** 2));
    return Q(`Scores before and after a training: ${tbl(['', ...b.map((_, i) => i + 1)], [['before', ...b], ['after', ...a]])} Calculate the <b>paired t statistic</b> (d = after − before).`, t, [
      [m / (sp / Math.sqrt(n)), `A szórásnál n-nel osztottál; mintából ${im('n - 1')}-gyel kell.`],
      [m / s, `Nem osztottad s-t ${im(TeX`\sqrt{n}`)}-nel (standard error).`],
      [m / (s / n), `s-t n-nel osztottad ${im(TeX`\sqrt{n}`)} helyett.`],
    ], steps(
      ['Különbségek', tbl(['', ...b.map((_, i) => i + 1)], [['before', ...b], ['after', ...a], [hl(im(TeX`d = \text{after} - \text{before}`)), ...d.map(hl)]])],
      ['Átlag', fx(TeX`m = \frac{\sum d}{n}`, `= ${fr(sum(d), n)}`, `= ${f(m, 3)}`)],
      ['Szórás (n − 1-gyel, mert minta)', fx(TeX`s = \sqrt{\frac{\sum (d - m)^2}{n - 1}}`, TeX`= \sqrt{\frac{${f(ssd, 3)}}{${n - 1}}}`, `= ${f(s, 4)}`) + para(`Ahol ${im(TeX`\sum (d - m)^2 = ${d.map(x => `(${x} - ${ng(f(m, 2))})^2`).join(' + ')} = ${f(ssd, 3)}`)}.`)],
      ['t statisztika', fx(TeX`t = \frac{m}{s / \sqrt{n}}`, TeX`= \frac{${f(m, 3)}}{${f(s, 4)} / \sqrt{${n}}}`, `= ${fr(f(m, 3), f(s / Math.sqrt(n), 4))}`, `= ${f(t, 3)}`)],
      ['Szabadságfok', fx(`df = n - 1 = ${n - 1}`)]), x => f(x, 3));
  },
  function tDecision() {
    const crit = pick([[2.262, 9], [2.776, 4], [2.571, 5], [2.447, 6], [2.365, 7], [2.306, 8]]); let t; do { t = (Math.random() < 0.5 ? -1 : 1) * R(5, 60) / 10; } while (Math.abs(Math.abs(t) - crit[0]) < 0.1);
    const rej = Math.abs(t) > crit[0];
    return Q(`Two-tailed test, df = ${crit[1]}, α = 0.05. Critical value: <b>±${crit[0]}</b>. Test statistic: <b>t = ${t}</b>. Decision?`, rej ? OPT.rej : OPT.fail, [
      [rej ? OPT.fail : OPT.rej, rej ? `${im('|t|')} > kritikus érték, ezért el kell vetni H₀-t.` : `${im('|t|')} ≤ kritikus érték, ezért H₀ nem vethető el.`],
      [OPT.rejH1, 'A döntés mindig H₀-ról szól.'],
      [OPT.prove, 'H₀-t sosem bizonyítjuk, legfeljebb nem vetjük el.'],
    ], steps(
      ['Kétoldali próba', para(`Kétoldali (two-tailed) próbánál ${im('|t|')}-t hasonlítjuk a kritikus értékhez: a nagyon pozitív és a nagyon negatív t is H₀ ellen szól.`)],
      ['Összehasonlítás', fx(`|t| = |${t}| = ${Math.abs(t)}`, TeX`${Math.abs(t)} ${rej ? '\\gt' : '\\le'} ${crit[0]}`, TeX`\to \text{${rej ? 'Reject' : 'Fail to reject'} } H_0`)],
      ['Szemléletesen', para(`Az elfogadási tartomány ${im(`-${crit[0]}`)} és ${im(`+${crit[0]}`)} között van. A ${im(`t = ${t}`)} ${rej ? 'ezen kívül esik (elutasítási tartomány).' : 'ezen belül van.'}`)]));
  },
];

// ---------- 8. ANOVA ----------
function anova(gs) {
  const all = gs.flat(), gm = mean(all), ms = gs.map(mean);
  const ssb = sum(gs.map((g, i) => g.length * (ms[i] - gm) ** 2)), ssw = sum(gs.map((g, i) => sum(g.map(x => (x - ms[i]) ** 2))));
  const k = gs.length, n = all.length;
  return { gm, ms, ssb, ssw, k, n, msb: ssb / (k - 1), msw: ssw / (n - k), F: (ssb / (k - 1)) / (ssw / (n - k)) };
}
const anovaTbl = a => tbl(['Source', 'SS', 'df', 'MS', 'F'], [['Between', f(a.ssb, 3), a.k - 1, f(a.msb, 3), hl(f(a.F, 3))], ['Within', f(a.ssw, 3), a.n - a.k, f(a.msw, 3), ''], ['Total', f(a.ssb + a.ssw, 3), a.n - 1, '', '']]);
const groupTbl = (gs, a, names) => tbl(['Group', 'Values', im('n_i'), im(TeX`\sum x`), im(TeX`\bar{x}_i`)], gs.map((g, i) => [names[i], g.join(', '), g.length, sum(g), f(a.ms[i], 3)]));
const ssbLines = (gs, a, names) => [TeX`SS(B) = \sum n_i (\bar{x}_i - \bar{x})^2`, ...gs.map((g, i) => `${i ? '+' : '='}\\ ${g.length} \\cdot (${f(a.ms[i], 3)} - ${f(a.gm, 3)})^2 \\quad ${tx(`(${names[i]})`)}`), `= ${f(a.ssb, 3)}`];
function sswLines(gs, a, names) {
  const ss = gs.map((g, i) => sum(g.map(x => (x - a.ms[i]) ** 2)));
  return [...gs.map((g, i) => `${tx(names[i])}: &\\ ${g.map(x => `(${x} - ${f(a.ms[i], 2)})^2`).join(' + ')} = ${f(ss[i], 3)}`), `SS(W) = ${ss.map(x => f(x, 3)).join(' + ')}`, `= ${f(a.ssw, 3)}`];
}
const anovaGens = [
  function dfs() {
    const k = R(3, 5), sizes = Array.from({ length: k }, () => R(4, 10)), n = sum(sizes), w = pick(['within', 'between', 'total']);
    const V = { between: k - 1, within: n - k, total: n - 1 };
    const W = { between: `Ez ${im('df(B) = k - 1')}.`, within: `Ez ${im('df(W) = n - k')}.`, total: `Ez ${im('df(T) = n - 1')}.` };
    return Q(`One-way ANOVA with <b>${k} groups</b> of sizes ${sizes.join(', ')}. What is <b>df(${w})</b>?`, V[w], [...Object.keys(V).filter(x => x !== w).map(x => [V[x], W[x]]), [n, 'Ez a teljes elemszám, nem szabadságfok.'], [n - k - 1, `Eggyel többet vontál le: ${im('df(W) = n - k')}.`]],
      steps(
      ['Adatok', fx(`k = ${k}\\ ${tx('csoport')}`, `n = ${sizes.join(' + ')} = ${n}`)],
      ['Szabadságfokok', tbl(['Source', 'Képlet', 'Érték'], [['Between', im('k - 1'), im(`${k} - 1 = ${k - 1}`)], ['Within', im('n - k'), im(`${n} - ${k} = ${n - k}`)], ['Total', im('n - 1'), im(`${n} - 1 = ${n - 1}`)]].map(x => x[0].toLowerCase() === w ? x.map(hl) : x)) + para(`Ellenőrzés: ${im(`df(B) + df(W) = ${k - 1} + ${n - k} = ${n - 1} = df(T)`)}.`)]), x => f(x));
  },
  function fFromSS() {
    const k = R(3, 5), n = k * R(4, 8), ssb = R(20, 400), ssw = R(100, 900), F = (ssb / (k - 1)) / (ssw / (n - k));
    return Q(`ANOVA: k = <b>${k}</b> groups, n = <b>${n}</b>, SS(B) = <b>${ssb}</b>, SS(W) = <b>${ssw}</b>. Calculate <b>F</b>.`, F, [
      [ssb / ssw, 'Az SS-eket osztottad, nem az MS-eket. Előbb mindkettőt el kell osztani a szabadságfokával.'],
      [1 / F, `Fordítva: ${im(TeX`F = \frac{MS(B)}{MS(W)}`)}.`],
      [(ssb / (k - 1)) / (ssw / (n - 1)), `MS(W)-nél ${im('n - 1')}-gyel osztottál; ${im('df(W) = n - k')}.`],
    ], steps(
      ['Szabadságfokok', fx(`df(B) = k - 1 = ${k} - 1 = ${k - 1}`, `df(W) = n - k = ${n} - ${k} = ${n - k}`)],
      ['Mean squares (MS = SS / df)', fx(`MS(B) = ${fr('SS(B)', 'df(B)')} = ${fr(ssb, k - 1)} = ${f(ssb / (k - 1), 3)}`, `MS(W) = ${fr('SS(W)', 'df(W)')} = ${fr(ssw, n - k)} = ${f(ssw / (n - k), 3)}`)],
      ['F statisztika', fx(`F = ${fr('MS(B)', 'MS(W)')}`, `= ${fr(f(ssb / (k - 1), 3), f(ssw / (n - k), 3))}`, `= ${f(F, 3)}`)],
      ['ANOVA-tábla', tbl(['Source', 'SS', 'df', 'MS', 'F'], [['Between', ssb, k - 1, f(ssb / (k - 1), 3), hl(f(F, 3))], ['Within', ssw, n - k, f(ssw / (n - k), 3), ''], ['Total', ssb + ssw, n - 1, '', '']])]), x => f(x, 3));
  },
  function fullAnova() {
    let gs, a; do { const sz = R(3, 4); gs = [0, 1, 2].map(() => { const b = R(2, 12); return Array.from({ length: sz }, () => b + R(-2, 2)); }); a = anova(gs); } while (a.ssw === 0 || a.ssb < 0.01);
    const names = ['A', 'B', 'C'];
    return Q(`Three groups: ${tbl(['Group', 'Values'], gs.map((g, i) => [names[i], g.join(', ')]))} Calculate the <b>F statistic</b> of a one-way ANOVA.`, a.F, [
      [a.ssb / a.ssw, 'Az SS-eket osztottad, nem az MS-eket (SS / df).'],
      [1 / a.F, `Fordítva: ${im(TeX`F = \frac{MS(B)}{MS(W)}`)}.`],
      [(a.ssb / 2) / (a.ssw / (a.n - 1)), `MS(W)-nél ${im('n - 1')}-gyel osztottál; ${im('df(W) = n - k')}.`],
    ], steps(
      ['Csoportátlagok és főátlag', groupTbl(gs, a, names) + fx(TeX`\bar{x} = \frac{\sum x}{n} = \frac{${sum(gs.flat())}}{${a.n}}`, `= ${f(a.gm, 3)}`)],
      ['SS(B): a csoportátlagok eltérése a főátlagtól', fx(...ssbLines(gs, a, names))],
      ['SS(W): eltérés a saját csoport átlagától', fx(...sswLines(gs, a, names))],
      ['Szabadságfok és MS', fx(`df(B) = k - 1 = ${a.k - 1}`, `df(W) = n - k = ${a.n - a.k}`, `MS(B) = ${fr(f(a.ssb, 3), a.k - 1)} = ${f(a.msb, 3)}`, `MS(W) = ${fr(f(a.ssw, 3), a.n - a.k)} = ${f(a.msw, 3)}`)],
      ['F', fx(`F = ${fr('MS(B)', 'MS(W)')}`, `= ${fr(f(a.msb, 3), f(a.msw, 3))}`, `= ${f(a.F, 3)}`) + anovaTbl(a)]), x => f(x, 3));
  },
  function fDecision() {
    const c = pick([[2, 6, 5.14], [2, 9, 4.26], [2, 12, 3.89], [3, 16, 3.24], [2, 21, 3.47], [3, 20, 3.10]]);
    let F; do { F = R(5, 120) / 10; } while (Math.abs(F - c[2]) < 0.1);
    const rej = F > c[2];
    return Q(`One-way ANOVA: F = <b>${F}</b>, df = (${c[0]}, ${c[1]}), α = 0.05, F<sub>table</sub> = <b>${c[2]}</b>. Decision?`, rej ? OPT.rej : OPT.fail, [
      [rej ? OPT.fail : OPT.rej, rej ? `${im(TeX`F \gt F_{table}`)}, ezért H₀-t elvetjük.` : `${im(TeX`F \le F_{table}`)}, ezért H₀ nem vethető el.`],
      [OPT.rejH1, 'A döntés mindig H₀-ról szól.'],
      [OPT.prove, 'H₀-t sosem bizonyítjuk, legfeljebb nem vetjük el.'],
    ], steps(
      ['Az F-próba jobboldali', para('Nagy F azt jelenti, hogy a csoportok közötti eltérés nagy a csoportokon belülihez képest. Ezért csak a jobb oldali szél számít.')],
      ['Összehasonlítás', fx(TeX`F = ${F} ${rej ? '\\gt' : '\\le'} F_{table}(${c[0]}, ${c[1]}) = ${c[2]}`, TeX`\to \text{${rej ? 'Reject' : 'Fail to reject'} } H_0`)],
      ['Megfogalmazás', para(rej ? 'Legalább egy csoport átlaga szignifikánsan eltér. Hogy melyik, azt az ANOVA nem mondja meg, ahhoz post hoc teszt kell.' : 'Nincs elég bizonyíték arra, hogy a csoportátlagok különböznek.')]));
  },
  function ssw() {
    const k = R(3, 4), n = k * R(4, 8), sst = R(300, 1500), ssb = R(50, sst - 100);
    return Q(`SS(Total) = <b>${sst}</b>, SS(Between) = <b>${ssb}</b>, k = ${k}, n = ${n}. What is <b>SS(Within)</b>?`, sst - ssb, [
      [sst + ssb, `Összeadtad; ${im('SS(T) = SS(B) + SS(W)')}, tehát ${im('SS(W) = SS(T) - SS(B)')}.`],
      [(sst - ssb) / (n - k), `Ez már MS(W): ${im(TeX`\frac{SS(W)}{df(W)}`)}.`],
      [ssb / sst, 'Ez az arányuk, nem az SS(W).'],
    ], steps(
      ['Összefüggés', fx('SS(T) = SS(B) + SS(W)')],
      ['Átrendezés', fx('SS(W) = SS(T) - SS(B)', `= ${sst} - ${ssb}`, `= ${sst - ssb}`)],
      ['Vigyázz', para(`Ez csak az SS-ekre igaz, az MS-ek nem adódnak össze. MS(W) például ${im(TeX`\frac{${sst - ssb}}{n - k} = \frac{${sst - ssb}}{${n - k}} = ${f((sst - ssb) / (n - k), 3)}`)} lenne.`)]), x => f(x, 3));
  },
];

// ---------- Tippek (generátor neve szerint) ----------
const HINTS = {
  unitRatio: 'Először váltsd át mindkét mennyiséget ugyanarra a mértékegységre, aztán egyszerűsíts a legnagyobb közös osztóval. A sorrend a kérdés sorrendje.',
  divide: TeX`Add össze az arány tagjait (összes rész: $p + q$), oszd el vele az összeget (egy rész értéke), majd szorozd meg az első tag számával.`,
  unknown: TeX`A megadott lányszám csak a lányokra eső részeknek felel meg: $\text{egy rész} = \frac{\text{lányok}}{\text{lányok aránytagja}}$.`,
  compound: 'Hozd a közös B tagot azonos értékre: bővítsd az első arányt a második B-jével, a másodikat az első B-jével.',
  vm: TeX`Distribution ratio (megoszlási viszonyszám): $V_m = \frac{\text{rész}}{\text{egész}}$. Előbb add össze az összes csoportot.`,
  vk: TeX`Coordination ratio (koordinációs viszonyszám): $V_k = \frac{\text{egyik rész}}{\text{másik rész}}$, a kérdés sorrendjében. Az egész itt nem kell.`,
  dynamic: TeX`Base ratio: $V_{db} = \frac{y_t}{y_{2020}}$ (mindig a bázisévhez). Chain ratio: $V_{dl} = \frac{y_t}{y_{t-1}}$ (mindig az előző évhez).`,
  baseFromChain: TeX`A láncviszonyszámokat tizedes törtként szorozd össze: $V_{db} = V_{dl,1} \cdot V_{dl,2} \cdot V_{dl,3}$.`,
  plan: TeX`Három szám van: bázis (tavaly), terv, tény. $V_f = \frac{\text{terv}}{\text{bázis}}$, $V_t = \frac{\text{tény}}{\text{terv}}$, $V_d = \frac{\text{tény}}{\text{bázis}}$.`,
  intensity: TeX`Intensity ratio: $V_i = \frac{\text{születések}}{\text{lakosok}} \times 1000$ („per 1,000 people”).`,
  oddsRatio: TeX`Odds = bekövetkezett / NEM bekövetkezett (nem az összes!). $OR = \frac{a/b}{c/d} = \frac{a \cdot d}{b \cdot c}$.`,
  relRisk: TeX`Előbb a két valószínűség (esetek / csoport létszáma), aztán ezek hányadosa: $RR = \frac{P(\text{treatment})}{P(\text{control})}$.`,
  notation: 'A betűk a magyar nevekből jönnek: V = viszonyszám, utána a magyar név kezdőbetűje (m = megoszlási, k = koordinációs, d = dinamikus: b = bázis, l = lánc, f = tervfeladat, t = tervteljesítés, i = intenzitási, ö = összehasonlító).',
  relFreq: TeX`Relative frequency $= \frac{f}{n}$, ahol $n = \sum f$ az összes gyakoriság összege, nem a különböző értékek száma.`,
  cumulative: TeX`„At most x” ($\le x$): add össze a gyakoriságokat a legkisebb értéktől x-ig, x-et is beleértve.`,
  classWidth: TeX`$i = \frac{\max - \min}{\text{osztályok száma}}$, majd felfelé kerekítés 5 többszörösére.`,
  midpoint: TeX`$\text{midpoint} = \frac{\text{alsó határ} + \text{felső határ}}{2}$. Figyelj, hányadik osztályról van szó.`,
  groupedRange: 'Osztályközös sorban: range = az utolsó osztály felső határa − az első osztály alsó határa. A gyakoriságok itt nem számítanak.',
  varType: 'Előbb: szám (quantitative) vagy kategória (categorical)? Számnál: megszámolt (discrete) vagy mért (continuous)? Kategóriánál: két kimenet (binary), van sorrend (ordinal) vagy nincs (nominal)?',
  seriesType: 'Mi szerint vannak rendezve az adatok: idő (time), hely (spatial), egy jellemző értéke (condition), vagy minden adat külön (individual)?',
  meanList: TeX`$\bar{x} = \frac{\sum x}{n}$: add össze az összes értéket, és oszd el a darabszámmal.`,
  weighted: TeX`$\bar{x} = \frac{\sum w \cdot x}{\sum w}$. Minden jegyet a saját kreditjével szorozz, és a kreditek összegével oszd.`,
  geometric: TeX`Egymásra épülő százalékos változás → mértani átlag: $GM = \sqrt[3]{(1 + r_1)(1 + r_2)(1 + r_3)}$, végül vonj le 1-et.`,
  harmonic: TeX`Azonos távolságokon mért sebességek átlaga: $HM = \frac{n}{\sum \frac{1}{x}}$. Ellenőrzés: teljes út / teljes idő.`,
  groupedMean: TeX`Minden osztályt az osztályközép (midpoint) képvisel: $\bar{x} = \frac{\sum f x}{\sum f}$.`,
  stepDeviation: TeX`Minden osztályközépre $u = \frac{x - A}{h}$, aztán $\bar{x} = A + \frac{\sum f u}{\sum f} \times h$.`,
  medianList: TeX`Előbb rendezd sorba! Páratlan n: az $\frac{n+1}{2}$-edik elem; páros n: a két középső átlaga.`,
  medianGrouped: TeX`A mediánosztály az első, ahol $cf \ge \frac{n}{2}$. $\text{Median} = l + \frac{n/2 - cf}{f} \times h$, ahol $cf$ az ELŐZŐ osztályé.`,
  modeGrouped: TeX`A modális osztály a legnagyobb gyakoriságú. $\text{Mode} = l + \frac{f_1 - f_0}{2f_1 - f_0 - f_2} \times h$, ahol $f_0$ az előző, $f_2$ a következő osztály gyakorisága.`,
  range: TeX`$\text{range} = \max - \min$, a kiugró értéket is beleértve.`,
  variance: TeX`Átlag → eltérések → négyzetösszeg. Population: $\sigma^2 = \frac{\sum (x - \mu)^2}{N}$, sample: $s^2 = \frac{\sum (x - \bar{x})^2}{n - 1}$. A varianciánál nincs gyökvonás.`,
  sdFreq: TeX`Gyakorisági sornál: $\sigma^2 = \frac{\sum f (x - \bar{x})^2}{\sum f}$, a szórás ennek a gyöke.`,
  quartInd: TeX`Rendezd sorba. $Q_1$ = az $\frac{N+1}{4}$-edik, $Q_3$ = a $\frac{3(N+1)}{4}$-edik elem. $QD = \frac{Q_3 - Q_1}{2}$, együttható: $\frac{Q_3 - Q_1}{Q_3 + Q_1}$.`,
  quartGrouped: TeX`Mint a medián, csak $\frac{n}{2}$ helyett $\frac{N}{4}$ ($Q_1$) vagy $\frac{3N}{4}$ ($Q_3$). Keresd az első osztályt, ahol $cf \ge$ pozíció.`,
  nFromSS: TeX`$\sigma^2 = \frac{SS}{N}$. Rendezd át N-re.`,
  probSel: TeX`Simple random sampling: $P = \frac{n}{N}$. A „NOT selected” ennek a komplementere: $1 - \frac{n}{N}$.`,
  atLeastOnce: TeX`Előbb azt számold ki, hogy egyszer sem választják ki: $\left(1 - \frac{1}{N}\right)^n$. A „legalább egyszer” ennek a komplementere.`,
  stratified: TeX`Proportionate (arányos): $s = \frac{S}{N} \times n$. Előbb add össze a rétegeket, így kapod N-et.`,
  systematic: TeX`$k = \frac{N}{n}$. Az első elem maga a kezdőpont, az i-edik: $\text{start} + (i - 1) \cdot k$.`,
  cluster: 'Single-stage: a kiválasztott klaszterekben mindenkit megkérdezünk. Two-stage: a klasztereken belül is mintát veszünk.',
  methodId: 'Kulcsszavak: „every k-th” → systematic; MINDEN csoportból választunk → stratified; néhány teljes csoport → cluster; közvetlen húzás a teljes listából → simple.',
  decideP: TeX`Csak két döntés van: Reject $H_0$ vagy Fail to reject $H_0$. Szabály: $p \le \alpha$ → reject.`,
  hypPair: TeX`Az egyenlőség ($=$, $\le$, $\ge$) mindig $H_0$-ba kerül. Amit bizonyítani akarunk (more / less / different), az $H_1$.`,
  errorType: TeX`Type I: igaz $H_0$-t vetünk el. Type II: hamis $H_0$-t megtartunk. A másik két eset helyes döntés.`,
  pairedT: TeX`$d = \text{after} - \text{before}$ minden párra. $m$ = d átlaga, $s$ = d szórása ($n - 1$-gyel), $t = \frac{m}{s / \sqrt{n}}$.`,
  tDecision: TeX`Kétoldali próba: $|t|$-t hasonlítsd a kritikus értékhez. Ha nagyobb → reject $H_0$.`,
  dfs: TeX`$df(B) = k - 1$, $df(W) = n - k$, $df(T) = n - 1$; k a csoportok, n az összes elem száma.`,
  fFromSS: TeX`Előbb $MS = \frac{SS}{df}$ mindkettőre, utána $F = \frac{MS(B)}{MS(W)}$.`,
  fullAnova: TeX`Csoportátlagok → főátlag → $SS(B) = \sum n_i (\bar{x}_i - \bar{x})^2$ → $SS(W) = \sum (x - \bar{x}_i)^2$ → $MS = \frac{SS}{df}$ → $F = \frac{MS(B)}{MS(W)}$.`,
  fDecision: TeX`Az F-próba mindig jobboldali: $F \gt F_{table}$ → reject $H_0$.`,
  ssw: TeX`$SS(T) = SS(B) + SS(W)$. Rendezd át $SS(W)$-re.`,
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
  const G2 = q * k2, [pw, qw] = ratioStr(b, b + g).split(' : '), d = gcd(b, g);
  return { title: 'Osztálylétszám', stem: `A class has <b>${b} boys</b> and <b>${g} girls</b>.`, parts: [
    H('Írd fel fiúk : lányok sorrendben, aztán egyszerűsíts a legnagyobb közös osztóval.', Q('Find the ratio of boys to girls in simplest form.', ratioStr(b, g), [
      [`${b} : ${g}`, 'Az arány jó, de nem egyszerűsítetted (simplest form, legegyszerűbb alak).'],
      [ratioStr(g, b), 'Fordított sorrend: a kérdés boys to girls, tehát a fiúk vannak elöl.'],
      [ratioStr(b, b + g), 'Ez part-to-whole ratio (rész az egészhez), itt két részt kell összehasonlítani.'],
    ], steps(
      ['Sorrend', para('„Boys to girls”: előre a fiúk, hátra a lányok.') + fx(`${tx('fiúk')} : ${tx('lányok')} = ${b} : ${g}`)],
      ['Egyszerűsítés', para(`A két szám legnagyobb közös osztója ${d}, mindkét tagot ezzel osztjuk:`) + fx(`${b} : ${g} = ${fr(b, d)} : ${fr(g, d)}`, `= ${p} : ${q}`) + para(`Jelentése: minden ${q} lányra ${p} fiú jut.`)]))),
    H('Part-to-whole: a rész (fiúk) kerül előre, az egész (összes tanuló) hátra.', Q('What is the <b>part-to-whole</b> ratio of boys (boys : all students)?', ratioStr(b, b + g), [
      [ratioStr(b, g), 'Ez part-to-part ratio (rész a részhez): fiúk : lányok.'],
      [ratioStr(g, b + g), 'Ez a lányok aránya az egészhez, nem a fiúké.'],
      [ratioStr(b + g, b), 'Fordított sorrend: egész : rész.'],
    ], steps(
      ['Az egész', fx(`${tx('összes')} = ${b} + ${g}`, `= ${b + g}`)],
      ['Rész : egész', fx(`${tx('fiúk')} : ${tx('összes')} = ${b} : ${b + g}`, `= ${pw} : ${qw}`) + para(`Jelentése: minden ${qw} tanulóból ${pw} fiú.`)]))),
    H(TeX`Proportion $= \frac{\text{rész}}{\text{egész}}$, százalékban.`, Q('What proportion of the class are <b>girls</b>?', g / (b + g), [
      [b / (b + g), 'Ez a fiúk aránya.'],
      [g / b, 'Ez lányok / fiúk (part-to-part), nem rész / egész.'],
      [g / (b + g + add), 'A később érkező fiúkat is beszámoltad; ez a kérdés az eredeti osztályról szól.'],
    ], steps(
      ['Rész / egész', fx(`${fr(tx('lányok'), tx('összes'))} = ${fr(g, b + g)}`, `= ${f(g / (b + g), 4)}`, `= ${pc(g / (b + g))}`)],
      ['Ellenőrzés', para(`A fiúk aránya ${pc(b / (b + g))}, a kettő együtt 100%.`)]), x => pc(x))),
    H('Előbb a tényleges létszámhoz add hozzá az új fiúkat, utána írd fel és egyszerűsítsd az arányt.', Q(`<b>${add} more boys</b> join the class. What is the new ratio of boys to girls?`, ratioStr(b + add, g), [
      [ratioStr(p + add, q), 'Az egyszerűsített arány tagjához adtad hozzá; a tényleges létszámhoz kell.'],
      [ratioStr(b, g + add), 'A lányokhoz adtad hozzá az új tanulókat.'],
      [ratioStr(g, b + add), 'Fordított sorrend.'],
    ], steps(
      ['Új létszám', fx(`${tx('fiúk')} = ${b} + ${add} = ${b + add}`, `${tx('lányok')} = ${g}`) + para('A lányok száma nem változik.')],
      ['Új arány', fx(`${b + add} : ${g} = ${ratioStr(b + add, g)}`) + para(`Az új tanulókat mindig a tényleges létszámhoz adjuk, nem az egyszerűsített arányhoz (${p} : ${q}).`)]))),
    H(`Az a) arány ${p} : ${q}. A lányok ${q} részt tesznek ki, egy rész = lányok / ${q}.`, Q(`Another class has the <b>same ratio</b> as in a) and <b>${G2} girls</b>. How many boys are there?`, p * k2, [
      [G2 * q / p, 'Fordítva használtad az arányt.'],
      [G2 * p, 'Nem osztottad el a lányok számát a lány-részek számával.'],
      [G2 / (p + q) * p, `Az összes rész számával osztottál, de a lányok csak ${q} részt tesznek ki.`],
    ], steps(
      ['Az arány', para(`Az a) részből: fiúk : lányok = ${p} : ${q}. A ${G2} lány tehát ${q} egyenlő rész.`)],
      ['Egy rész', fx(`${tx('egy rész')} = ${fr(G2, q)}`, `= ${k2}`)],
      ['A fiúk száma', fx(TeX`\text{fiúk} = ${p} \times ${k2} = ${p * k2}`) + para(`Ellenőrzés: ${p * k2} : ${G2} = ${ratioStr(p * k2, G2)}.`)]), x => f(x))),
  ] };
}

function productionCase() {
  const years = [2020, 2021, 2022, 2023, 2024]; let ys, P;
  do { ys = [R(20, 60) * 10]; for (let i = 1; i < 5; i++) ys.push(Math.round(ys[i - 1] * (0.9 + Math.random() * 0.25))); P = Math.round(ys[3] * (1 + R(2, 15) / 100)); } while (P === ys[4] || ys[4] === ys[3]);
  const y0 = ys[0], y3 = ys[3], y4 = ys[4], vdb = y4 / y0, vdl = y4 / y3, vf = P / y3, vt = y4 / P, F = x => pc(x);
  const dyn = col => tbl(['Year', 'Production', `${im('V_{db}')} (2020 = 100%)`, `${im('V_{dl}')} (előző év = 100%)`], years.map((y, i) => [y, ys[i], i === 4 && col === 'b' ? hl(pc(ys[i] / y0)) : pc(ys[i] / y0), i === 0 ? '–' : i === 4 && col === 'l' ? hl(pc(ys[i] / ys[i - 1])) : pc(ys[i] / ys[i - 1])]));
  const data = tbl(['', 'Value', 'Jelentés'], [['bázis', y3, '2023 tényleges termelés'], ['terv', P, '2024 terv'], ['tény', y4, '2024 tényleges termelés']]);
  const chg = (v, ref) => `${pc(Math.abs(v - 1))}-kal ${v >= 1 ? 'több' : 'kevesebb'}, mint ${ref}`;
  return { title: 'Termelés és terv', stem: `Production of a factory (units): ${tbl(years, [ys])} The <b>plan for 2024</b> was <b>${P}</b> units (base period of the plan: 2023).`, parts: [
    H(HINTS.dynamic, Q('Calculate the <b>base ratio</b> for 2024 (base year 2020).', vdb, [
      [vdl, 'Ez a chain ratio (láncviszonyszám): az előző évhez viszonyítottál.'], [y0 / y4, 'Fordítva osztottál: bázis / tárgyév.'], [vdb - 1, `Ez a változás mértéke (${im(TeX`V_{db} - 100\%`)}), nem maga a base ratio.`],
    ], steps(
      ['Képlet', para('Base ratio (bázisviszonyszám): tárgyév / rögzített bázisév.') + fx(`V_{db}(2024) = ${fr('y_{2024}', 'y_{2020}')}`, `= ${fr(y4, y0)}`, `= ${pc(vdb)}`)],
      ['Értelmezés', para(`A 2024. évi termelés ${chg(vdb, 'a 2020. évi')}.`)],
      ['Minden év', dyn('b')]), F)),
    H(HINTS.dynamic, Q('Calculate the <b>chain ratio</b> for 2024.', vdl, [
      [vdb, 'Ez a base ratio (bázisviszonyszám): 2020-hoz viszonyítottál.'], [y3 / y4, 'Fordítva osztottál.'], [vdl - 1, 'Ez a változás mértéke, nem maga a chain ratio.'],
    ], steps(
      ['Képlet', para('Chain ratio (láncviszonyszám): tárgyév / előző év.') + fx(`V_{dl}(2024) = ${fr('y_{2024}', 'y_{2023}')}`, `= ${fr(y4, y3)}`, `= ${pc(vdl)}`)],
      ['Értelmezés', para(`A 2024. évi termelés ${chg(vdl, 'a 2023. évi')}.`)],
      ['Minden év', dyn('l')]), F)),
    H(TeX`Task indicator ratio (tervfeladat): $V_f = \frac{\text{terv}}{\text{bázis}}$. A bázis itt az előző év tényadata.`, Q('Calculate the <b>task indicator ratio (Vf)</b> for 2024.', vf, [
      [vt, `Ez ${im('V_t')} (performance indicator): tény / terv.`], [P / y0, 'A 2020-as adathoz osztottál; a terv bázisa az előző év (2023).'], [y3 / P, 'Fordítva osztottál: bázis / terv.'],
    ], steps(
      ['A három adat', data],
      [`${im('V_f')} (tervfeladat-viszonyszám)`, para('Mennyit terveztek a bázishoz képest:') + fx(`V_f = ${fr(tx('terv'), tx('bázis'))}`, `= ${fr(P, y3)}`, `= ${pc(vf)}`)],
      ['Értelmezés', para(`A terv ${chg(vf, 'a 2023. évi termelés')}.`)]), F)),
    H(TeX`Performance indicator ratio (tervteljesítés): $V_t = \frac{\text{tény}}{\text{terv}}$.`, Q('Calculate the <b>performance indicator ratio (Vt)</b> for 2024.', vt, [
      [vf, `Ez ${im('V_f')} (task indicator): terv / bázis.`], [P / y4, 'Fordítva osztottál: terv / tény.'], [vdl, 'Ez a chain ratio (tény / előző év), nem a tervhez viszonyított teljesítés.'],
    ], steps(
      ['A három adat', data],
      [`${im('V_t')} (tervteljesítési viszonyszám)`, para('A tényt a tervhez hasonlítja:') + fx(`V_t = ${fr(tx('tény'), tx('terv'))}`, `= ${fr(y4, P)}`, `= ${pc(vt)}`)],
      ['Értelmezés', para(vt >= 1 ? `A tervet ${pc(vt - 1)}-kal túlteljesítették.` : `A tervet nem teljesítették, ${pc(1 - vt)} hiányzik.`)]), F)),
    H(TeX`Írd fel törtként: $\frac{\text{terv}}{\text{bázis}} \cdot \frac{\text{tény}}{\text{terv}}$. Mi marad, ha a „terv” kiesik?`, Q(TeX`<b>$V_f \cdot V_t$</b> equals which ratio?`, 'Vdl – chain ratio for 2024 (actual / previous year)', [
      ['Vdb – base ratio for 2024 (actual / 2020)', 'A terv bázisa 2023, nem 2020, ezért a szorzat a 2023-hoz viszonyított dinamikus viszonyszám.'],
      ['Vm – distribution ratio', 'A distribution ratio (megoszlási) rész / egész, ennek itt nincs szerepe.'],
      ['Vk – coordination ratio', 'A coordination ratio (koordinációs) két rész hányadosa, ennek itt nincs szerepe.'],
    ], steps(
      ['Törtekkel', fx(TeX`V_f \cdot V_t = \frac{\text{terv}}{\text{bázis}} \cdot \frac{\text{tény}}{\text{terv}}`, TeX`= \frac{\text{tény}}{\text{bázis}}`) + para('A „terv” kiesik.')],
      ['Melyik bázis?', para(`A terv bázisa 2023 (az előző év), ezért tény / bázis = 2024 / 2023, ez a ${im('V_{dl}(2024)')} láncviszonyszám.`)],
      ['Számokkal', fx(TeX`V_f \cdot V_t = ${f(vf, 4)} \cdot ${f(vt, 4)}`, `= ${f(vf * vt, 4)}`, `= ${pc(vdl)} = V_{dl}(2024)`)]))),
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
  const tally = c => '<s>||||</s> '.repeat(Math.floor(c / 5)) + '|'.repeat(c % 5);
  const table = (mark = -1) => tbl(['x', 'tally', 'f', 'cumulative f', 'hányadik értékek'], xs.map((x, i) => [x, tally(fs[i]), fs[i], cf[i], `${(i ? cf[i - 1] : 0) + 1}–${cf[i]}.`].map(c => i === mark ? hl(c) : c)));
  const midPos = n % 2 ? [(n + 1) / 2] : [n / 2, n / 2 + 1];
  return { title: 'Nyers adatokból gyakorisági sor', stem: `The marks of <b>${n} students</b> in a test: ${shuffle([...all]).join(', ')}.`, parts: [
    H('Készíts gyakorisági táblát (tally marks): írd le a különböző értékeket, és számold meg, melyik hányszor fordul elő.', Q(`How many students got <b>${xs[j]}</b>?`, fs[j], [
      [cf[j], `Ez a kumulált gyakoriság (${im(TeX`x \le ${xs[j]}`)}), nem csak a ${xs[j]}-esek száma.`], [n - fs[j], 'Ez a többi tanuló száma.'], [fs[j] + 1, 'Eggyel elszámoltad; érdemes strigulázni (tally marks).'],
    ], steps(
      ['Gyakorisági tábla strigulákkal', para('Végigmegyünk a listán, és minden jegyhez húzunk egy vonalat; az ötödik vonal áthúzza az előző négyet.') + table(j)],
      ['Eredmény', fx(`f(${xs[j]}) = ${fs[j]}`)]), F)),
    H(TeX`Relative frequency $= \frac{f}{n}$, n = az összes tanuló száma.`, Q(`What is the <b>relative frequency</b> of the mark ${xs[j]}?`, fs[j] / n, [
      [cf[j] / n, 'Ez a cumulative relative frequency (kumulált relatív gyakoriság).'], [fs[j] / xs.length, `A különböző értékek számával (${xs.length}) osztottál, nem n-nel (${n}).`], [fs[j] / (n - fs[j]), 'A többiekhez viszonyítottál, nem az összeshez.'],
    ], steps(
      ['n = összes tanuló', fx(`n = ${fs.join(' + ')}`, `= ${n}`)],
      [im(TeX`\frac{f}{n}`), fx(`${fr('f', 'n')} = ${fr(fs[j], n)}`, `= ${f(fs[j] / n, 4)}`, `= ${pc(fs[j] / n)}`) + para(`A tanulók ${pc(fs[j] / n)}-a kapott ${xs[j]}-t.`)]), x => pc(x))),
    H('„At most” (legfeljebb): a kérdezett értéket és az összes kisebbet is számold.', Q(`How many students got <b>at most ${xs[k]}</b>?`, cf[k], [
      [fs[k], `Ez csak a ${xs[k]}-esek száma.`], [cf[k - 1], `Kimaradt maga a ${xs[k]}; a „legfeljebb” tartalmazza.`], [n - cf[k], `Ez a „több mint ${xs[k]}” válasza.`],
    ], steps(
      ['Mit kérdez?', para(`„At most ${xs[k]}” = ${xs[k]} vagy kisebb, ${im(TeX`x \le ${xs[k]}`)}.`)],
      ['Kumulált gyakoriság', table(k)],
      ['Eredmény', fx(TeX`x \le ${xs[k]}:\quad ${fs.slice(0, k + 1).join(' + ')} = ${cf[k]}`)]), F)),
    H('Mode (módusz) = a leggyakoribb ÉRTÉK (nem a gyakorisága).', Q('What is the <b>mode</b>?', mo, [
      [Math.max(...fs), 'Ez a módusz gyakorisága (hányszor fordul elő), nem maga az érték.'], [xs[i2], 'Ez a második leggyakoribb érték.'], [mean(all), 'Ez az átlag, nem a módusz.'],
    ], steps(
      ['Leggyakoribb érték', table(xs.indexOf(mo)) + para(`A legnagyobb gyakoriság ${Math.max(...fs)}, ez a(z) ${mo} jegyhez tartozik.`)],
      ['Eredmény', fx(`${tx('mode')} = ${mo}`) + para('A módusz maga az érték (a jegy), nem az, hogy hányszor fordul elő.')]), F)),
    H(`n = ${n}, ${n % 2 ? `páratlan: a(z) ${(n + 1) / 2}. elem` : `páros: a(z) ${n / 2}. és ${n / 2 + 1}. elem átlaga`}. A kumulált gyakoriságból látod, melyik értékre esik.`, Q('What is the <b>median</b>?', md, [
      [mean(all), 'Ez az átlag, nem a medián.'], [n % 2 ? (n + 1) / 2 : n / 2, 'Ez a medián pozíciója (sorszáma), nem az értéke.'], [xs[2], 'Ez a különböző értékek középsője; a gyakoriságokat is figyelembe kell venni.'],
    ], steps(
      ['Hányadik érték kell?', para(n % 2 ? `${im(`n = ${n}`)} páratlan, a középső az ${im(TeX`\frac{n+1}{2} = ${(n + 1) / 2}`)}. érték.` : `${im(`n = ${n}`)} páros, a két középső a(z) ${n / 2}. és a(z) ${n / 2 + 1}. érték.`)],
      ['Melyik jegyre esnek?', table() + para(midPos.map(q => `A(z) ${q}. érték: ${all[q - 1]}.`).join(' '))],
      ['Medián', n % 2 ? fx(`${tx('medián')} = ${md}`) : fx(`${tx('medián')} = ${fr(`${all[n / 2 - 1]} + ${all[n / 2]}`, 2)}`, `= ${f(md)}`)]), F)),
  ] };
}

function groupedCase() {
  let t; do { t = groupedTable(peakOK); } while (medClass(t) < 1);
  const j = medClass(t), mj = t.fs.indexOf(Math.max(...t.fs));
  return { title: 'Osztályközös gyakorisági sor', stem: `Test scores of students: ${hrow('Class', t.cls, 'f', t.fs)}`, parts: [
    byName(central, 'groupedMean')(t),
    H(TeX`Számold ki a kumulált gyakoriságokat. A mediánosztály az első osztály, ahol $cf \ge \frac{n}{2}$.`, Q('Which is the <b>median class</b>?', t.cls[j], [
      [t.cls[mj], 'Ez a modális osztály (legnagyobb gyakoriság), nem a mediánosztály.'], [t.cls[2], 'Ez csak a középső osztály; a mediánosztályt a kumulált gyakoriság dönti el.'],
      ...t.cls.map((c, k) => [c, k < j ? `Itt a kumulált gyakoriság még kisebb, mint ${im('n/2')}.` : `Már egy korábbi osztályban eléri a kumulált gyakoriság az ${im('n/2')}-t.`]),
    ], steps(
      ['Hányadik érték a középső?', fx(`n = ${t.fs.join(' + ')} = ${t.n}`, `${fr('n', 2)} = ${f(t.n / 2)}`)],
      ['Kumulált gyakoriság', tbl(['Class', 'f', 'cf'], t.cls.map((c, i) => i === j ? [hl(c), hl(t.fs[i]), hl(`${t.cf[i]} ← először ≥ ${f(t.n / 2)}`)] : [c, t.fs[i], t.cf[i]]))],
      ['Eredmény', para(`A mediánosztály ${hl(t.cls[j])}. Ez nem feltétlenül a legnagyobb gyakoriságú osztály (az a modális osztály: ${t.cls[mj]}).`)]))),
    byName(central, 'medianGrouped')(t),
    byName(central, 'modeGrouped')(t),
  ] };
}

function sampleCase() {
  const xs = intList(R(5, 7)), n = xs.length, m = mean(xs), dev = xs.map(x => x - m), ss = sum(dev.map(d => d * d)), s2 = ss / (n - 1), s = Math.sqrt(s2);
  const so = [...xs].sort((a, b) => a - b), mx = so[n - 1], mn = so[0], md = n % 2 ? so[(n - 1) / 2] : (so[n / 2 - 1] + so[n / 2]) / 2, F = x => f(x, 3);
  const table = tbl([im('x'), im(TeX`x - \bar{x}`), im(TeX`(x - \bar{x})^2`)], [...xs.map((x, i) => [x, dev[i], dev[i] ** 2]), [hl(im(TeX`\sum`)), 0, hl(ss)]]);
  return { title: 'Minta szóródása', stem: `A <b>sample</b> of ${n} employees worked the following overtime hours last month: ${xs.join(', ')}.`, parts: [
    H(HINTS.range, Q('What is the <b>range</b>?', mx - mn, [
      [(mx - mn) / 2, 'Ez a terjedelem fele.'], [mx - m, 'A legnagyobb értékből az átlagot vontad le.'], [so[n - 2] - so[1], 'Kihagytad a szélső értékeket; a range pont azokból számol.'],
    ], steps(
      ['Szélső értékek', para(`Rendezve: ${so.join(', ')}.`) + fx(TeX`\max = ${mx}, \quad \min = ${mn}`)],
      ['Range', fx(TeX`\text{range} = ${mx} - ${mn}`, `= ${mx - mn}`)]), F)),
    H(HINTS.meanList, Q(TeX`What is the <b>sample mean</b> $\bar{x}$?`, m, [
      [sum(xs) / (n - 1), `${im('n - 1')}-gyel osztottál; az átlagnál mindig n-nel kell.`], [md, 'Ez a medián.'], [(mx + mn) / 2, 'Ez csak a legkisebb és a legnagyobb érték átlaga.'],
    ], steps(
      ['Összeg', fx(TeX`\sum x = ${xs.join(' + ')}`, `= ${sum(xs)}`)],
      ['Átlag', fx(TeX`\bar{x} = \frac{\sum x}{n}`, `= ${fr(sum(xs), n)}`, `= ${f(m, 3)}`) + para(`Az átlagnál mindig n-nel osztunk, mintánál is. Az ${im('n - 1')} csak a varianciánál jön elő.`)]), F)),
    H('Minden értékből vond le az átlagot, emeld négyzetre, és add össze.', Q(TeX`What is the <b>sum of squared deviations</b> $\sum (x - \bar{x})^2$?`, ss, [
      [sum(dev.map(Math.abs)), 'Az eltérések abszolút értékét adtad össze, négyzetre emelés helyett.'], [sum(xs.map(x => x * x)), 'Ez az értékek négyzetösszege, nem az átlagtól való eltéréseké.'], [sum(dev), 'Az eltérések összege mindig 0, ezért kell négyzetre emelni.'],
    ], steps(
      [`Eltérések az átlagtól (${im(TeX`\bar{x} = ${f(m, 3)}`)})`, table],
      ['Összeg', fx(TeX`\sum (x - \bar{x})^2 = ${dev.map(d => d * d).join(' + ')}`, `= ${ss}`) + para(`Az eltérések (${im(TeX`x - \bar{x}`)}) összege mindig 0, ezért kell négyzetre emelni őket.`)]), F)),
    H(TeX`Sample variance: $s^2 = \frac{\sum (x - \bar{x})^2}{n - 1}$.`, Q(TeX`What is the <b>sample variance</b> $s^2$?`, s2, [
      [ss / n, `Ez a population variance (sokasági variancia): n-nel osztottál. Mintánál ${im('n - 1')} kell.`], [s, 'Ez már a szórás (gyököt vontál).'], [sum(dev.map(Math.abs)) / n, 'Ez az abszolút eltérések átlaga, nem a variancia.'],
    ], steps(
      ['Minta → n − 1', para('Sample (minta) varianciánál n − 1-gyel osztunk (Bessel-korrekció).') + fx(TeX`s^2 = \frac{\sum (x - \bar{x})^2}{n - 1}`, TeX`= \frac{${ss}}{${n} - 1}`, `= ${fr(ss, n - 1)}`, `= ${f(s2, 3)}`)],
      ['Összehasonlítás', para(`Population (sokasági) varianciánál n-nel osztanánk: ${im(TeX`\frac{${ss}}{${n}} = ${f(ss / n, 3)}`)}.`)]), F)),
    H(TeX`A szórás a variancia négyzetgyöke: $s = \sqrt{s^2}$.`, Q('What is the <b>sample standard deviation</b> s?', s, [
      [s2, 'Ez a variancia; még gyököt kell vonni.'], [Math.sqrt(ss / n), `n-nel osztottál (population). Mintánál ${im('n - 1')} kell.`], [Math.sqrt(ss) / (n - 1), `Rossz sorrend: előbb osztani kell ${im('n - 1')}-gyel, aztán gyököt vonni.`],
    ], steps(
      ['Gyökvonás', fx(TeX`s = \sqrt{s^2}`, TeX`= \sqrt{${f(s2, 3)}}`, `= ${f(s, 3)}`)],
      ['Értelmezés', para(`Az adatok jellemzően kb. ${f(s, 1)} órával térnek el az átlagtól (${f(m, 3)} óra). A szórás mértékegysége ugyanaz, mint az adatoké (óra), a varianciáé óra².`)]), F)),
  ] };
}

function universityCase() {
  const names = ['Finance', 'Management', 'Tourism', 'IT']; let S, N, k, n, j, st, i;
  do { k = pick([10, 20, 25, 50]); S = names.map(() => R(2, 20) * 100); N = sum(S); n = N / k; j = R(0, 3); st = R(1, k); i = R(5, 30); } while (n < i);
  return { title: 'Egyetemi felmérés', stem: `${tbl(['Faculty', ...names], [['Students', ...S]])} The university wants to survey <b>${f(n)}</b> of its <b>${f(N)}</b> students.`, parts: [
    H(HINTS.probSel, Q('With <b>simple random sampling</b>, what is the probability that a given student is selected?', n / N, [
      [1 / N, `Ez egyetlen húzás esélye; ${f(n)} tanulót választunk.`], [n / (N - n), 'A nem kiválasztottak számával osztottál.'], [1 - n / N, 'Ez a NEM kiválasztás valószínűsége.'],
    ], steps(
      ['Képlet', para('Egyszerű véletlen mintánál mindenkinek ugyanakkora az esélye.') + fx(TeX`P = \frac{n}{N}`, `= ${fr(f(n), f(N))}`, `= ${f(n / N, 4)}`, `= ${pc(n / N)}`)],
      ['Értelmezés', para(`Minden tanuló ${pc(n / N)} eséllyel kerül be a mintába, karon függetlenül.`)]), x => pc(x))),
    H(HINTS.stratified, Q(`With <b>proportionate stratified sampling</b> (strata = faculties), how many students come from <b>${names[j]}</b>?`, S[j] / k, [
      [n / 4, 'Egyenlően osztottad el a karok között; arányos mintánál a kar méretével arányos rész jár.'], [S[j] / N * 100, 'Ez a kar aránya százalékban, nem darabszám.'], [S[j] / n, 'A kar létszámát a mintanagysággal osztottad.'],
    ], steps(
      ['Képlet', fx(TeX`s = \frac{S}{N} \times n`, TeX`= \frac{${S[j]}}{${f(N)}} \times ${f(n)}`, TeX`= ${f(S[j] / N, 4)} \times ${f(n)}`, `= ${f(S[j] / k)}`) + para('A kar akkora részt kap a mintából, amekkora a sokaságból.')],
      ['Minden kar', tbl(['Faculty', 'Students', 'In sample'], [...names.map((x, i) => i === j ? [hl(x), hl(S[i]), hl(f(S[i] / k))] : [x, S[i], f(S[i] / k)]), [im(TeX`\sum`), f(N), f(n)]])]), x => f(x, 2))),
    H(HINTS.systematic, Q('With <b>systematic sampling</b>, what is the sampling interval k?', k, [
      [n, 'Ez a mintanagyság (n), nem a lépésköz.'], [N - n, `A különbség nem lépésköz; ${im(TeX`k = \frac{N}{n}`)}.`], [n / N, `Fordítva osztottál: ${im(TeX`k = \frac{N}{n}`)}.`],
    ], steps(
      ['Képlet', fx(TeX`k = \frac{N}{n}`, `= ${fr(f(N), f(n))}`, `= ${k}`) + para(`Vagyis a listáról minden ${k}. tanulót választjuk, egy 1 és ${k} közötti véletlen kezdőponttól.`)]), x => f(x, 4))),
    H(HINTS.systematic, Q(`The random start is <b>${st}</b>. Which student (list number) is the <b>${i}th</b> in the sample?`, st + (i - 1) * k, [
      [st + i * k, 'Eggyel elszámoltad: az első elem maga a kezdőpont.'], [i * k, 'Nem a kezdőponttól indultál.'], [(i - 1) * k, 'Kimaradt a kezdőpont.'],
    ], steps(
      ['Lépésenként', fx(`1.\\ ${tx('elem')} = ${st}`, `2.\\ ${tx('elem')} = ${st} + ${k} = ${st + k}`, TeX`3.\ \text{elem} = ${st} + 2 \cdot ${k} = ${st + 2 * k}`, TeX`\quad\vdots`, TeX`${i}.\ \text{elem} = ${st} + (${i} - 1) \cdot ${k} = ${st + (i - 1) * k}`)],
      ['Miért i − 1?', para('Az első elemhez még nem léptünk egyet sem, a másodikhoz egyet, … az i-edikhez i − 1 lépést.')]), x => f(x))),
    H('Hány kar kerül be: mind (minden karból választunk), vagy csak néhány teljes kar?', Q('<i>Instead, 2 faculties are chosen at random and every student in them is surveyed.</i> Which method is this?', 'cluster sampling', [
      ['stratified sampling', 'Rétegzett mintánál MINDEN karból (rétegből) választanánk; itt csak néhány teljes kar kerül be.'],
      ['systematic sampling', 'Szisztematikus mintánál minden k-adik elemet vennénk egy listáról.'],
      ['simple random sampling', 'Egyszerű véletlen mintánál közvetlenül tanulókat húznánk a teljes listából.'],
    ], steps(
      ['Mi történik?', para('Csak néhány teljes csoport (kar) kerül be, és azokban mindenki. Ez cluster sampling (csoportos mintavétel), egylépcsős (single-stage).')],
      ['A négy módszer', tbl(['Módszer', 'Hogyan választ?'], [['stratified', 'MINDEN rétegből (karból) választ néhány tanulót'], [hl('cluster'), hl('csak NÉHÁNY csoportot (kart) választ, abban mindenkit')], ['systematic', 'listáról minden k-adik elemet'], ['simple random', 'közvetlenül húz a teljes listából']])]))),
  ] };
}

function drugCase() {
  let n, b, d, m, s, t;
  do { n = R(6, 8); b = Array.from({ length: n }, () => R(112, 135)); d = b.map(() => R(-9, 3)); m = mean(d); s = Math.sqrt(sum(d.map(x => (x - m) ** 2)) / (n - 1)); t = m / (s / Math.sqrt(n)); } while (s === 0 || m === 0 || Math.abs(Math.abs(t) - tCrit[n - 1]) < 0.1);
  const a = b.map((x, i) => x + d[i]), sp = Math.sqrt(sum(d.map(x => (x - m) ** 2)) / n), c = tCrit[n - 1], rej = Math.abs(t) > c, F = x => f(x, 3);
  const ssd = sum(d.map(x => (x - m) ** 2)), se = s / Math.sqrt(n);
  const dt = tbl(['Patient', ...b.map((_, i) => i + 1)], [['Before', ...b], ['After', ...a], [hl(im(TeX`d = \text{after} - \text{before}`)), ...d.map(hl)]]);
  return { title: 'Páros t-próba: vérnyomás', stem: `A company tests whether a new drug <b>has an effect</b> on blood pressure. ${tbl(['Patient', ...b.map((_, i) => i + 1)], [['Before', ...b], ['After', ...a]])} Use a paired t-test, α = 0.05, d = after − before.`, parts: [
    H(TeX`„Has an effect” = bármelyik irányú változás. Az egyenlőség mindig $H_0$-ba kerül.`, Q('Which hypotheses are correct?', 'H₀: μd = 0,  H₁: μd ≠ 0', [
      ['H₀: μd ≠ 0,  H₁: μd = 0', 'Felcserélted: az egyenlőség mindig H₀-ba kerül.'],
      ['H₀: μd ≥ 0,  H₁: μd < 0', 'Ez egyoldali (left-tailed). A „has an effect” bármelyik irányú változást jelent, ezért kétoldali.'],
      ['H₀: μd ≤ 0,  H₁: μd > 0', 'Ez egyoldali (right-tailed); itt kétoldali próba kell.'],
    ], steps(
      ['Mit kérdez?', para('„Has an effect” = a vérnyomás bármelyik irányba változhat, ezért két irányt vizsgálunk: two-tailed (kétoldali) próba.')],
      ['Hipotézisek', fx(TeX`H_0: \mu_d = 0 \quad \text{(nincs hatás; az egyenlőség mindig } H_0\text{-ba kerül)}`, TeX`H_1: \mu_d \ne 0 \quad \text{(van hatás)}`) + para(`${im(TeX`\mu_d`)} = a különbségek (after − before) sokasági átlaga.`)]))),
    H(TeX`Számold ki minden betegre: $d = \text{after} - \text{before}$, aztán átlagold.`, Q('What is the mean difference <b>m</b>?', m, [
      [-m, 'Előjelhiba: d = after − before, nem before − after.'], [sum(d), 'Nem osztottál n-nel.'], [sum(d) / (n - 1), `${im('n - 1')}-gyel osztottál; az átlagnál n kell.`],
    ], steps(
      ['Különbségek', dt],
      ['Átlag', fx(TeX`m = \frac{\sum d}{n}`, `= ${fr(d.map(ng).join(' + '), n)}`, `= ${fr(sum(d), n)}`, `= ${f(m, 3)}`) + para(m < 0 ? 'Negatív: átlagosan csökkent a vérnyomás.' : 'Pozitív: átlagosan nőtt a vérnyomás.')]), F)),
    H(TeX`$s = \sqrt{\frac{\sum (d - m)^2}{n - 1}}$.`, Q('What is the standard deviation of the differences <b>s</b>?', s, [
      [sp, `n-nel osztottál; mintából ${im('n - 1')}-gyel kell.`], [s * s, 'Ez a variancia; még gyököt kell vonni.'], [s / Math.sqrt(n), `Ez már a standard error (${im(TeX`s / \sqrt{n}`)}), nem a szórás.`],
    ], steps(
      [`Eltérések négyzete (${im(`m = ${f(m, 3)}`)})`, tbl([im('d'), im('d - m'), im('(d - m)^2')], [...d.map(x => [x, f(x - m, 3), f((x - m) ** 2, 3)]), [hl(im(TeX`\sum`)), '0', hl(f(ssd, 3))]])],
      ['Szórás', para('Minta, ezért n − 1-gyel osztunk:') + fx(TeX`s = \sqrt{\frac{\sum (d - m)^2}{n - 1}}`, TeX`= \sqrt{\frac{${f(ssd, 3)}}{${n - 1}}}`, TeX`= \sqrt{${f(ssd / (n - 1), 3)}}`, `= ${f(s, 3)}`)]), F)),
    H(TeX`$t = \frac{m}{s / \sqrt{n}}$.`, Q('What is the <b>t statistic</b>?', t, [
      [m / (sp / Math.sqrt(n)), `A szórásnál n-nel osztottál; mintából ${im('n - 1')} kell.`], [m / s, `Nem osztottad s-t ${im(TeX`\sqrt{n}`)}-nel.`], [m / (s / n), `s-t n-nel osztottad ${im(TeX`\sqrt{n}`)} helyett.`],
    ], steps(
      ['Standard error', para('A különbségek átlagának bizonytalansága:') + fx(TeX`SE = \frac{s}{\sqrt{n}}`, TeX`= \frac{${f(s, 3)}}{\sqrt{${n}}}`, `= ${fr(f(s, 3), f(Math.sqrt(n), 4))}`, `= ${f(se, 4)}`)],
      ['t', fx(TeX`t = \frac{m}{SE}`, `= ${fr(f(m, 3), f(se, 4))}`, `= ${f(t, 3)}`) + para('A t azt mutatja, hány standard errornyira van az átlagos különbség a 0-tól.')]), F)),
    H(TeX`Páros próbánál a különbségek számából indulsz ki: $df = n - 1$.`, Q('How many <b>degrees of freedom</b> does the test have?', n - 1, [
      [n, 'Ez az elemszám, a szabadságfok ennél eggyel kevesebb.'], [n - 2, `Kettőt vontál le; páros próbánál ${im('df = n - 1')}.`], [2 * n - 2, `Ez a független kétmintás t-próba df-je; páros próbánál ${im('df = n - 1')}.`],
    ], steps(
      ['Képlet', fx(`df = n - 1`, `= ${n} - 1`, `= ${n - 1}`) + para(`Páros próbánál a különbségek (d) számítanak, ezekből ${n} darab van.`)]), x => f(x))),
    H(TeX`Kétoldali próba: $|t|$-t hasonlítsd a kritikus értékhez.`, Q(`Critical value (two-tailed, df = ${n - 1}, α = 0.05): <b>±${c}</b>. What is the decision?`, rej ? OPT.rej : OPT.fail, [
      [rej ? OPT.fail : OPT.rej, rej ? `${im('|t|')} > kritikus érték, ezért el kell vetni H₀-t.` : `${im('|t|')} ≤ kritikus érték, ezért H₀ nem vethető el.`], [OPT.rejH1, 'A döntés mindig H₀-ról szól.'], [OPT.prove, 'H₀-t sosem bizonyítjuk, legfeljebb nem vetjük el.'],
    ], steps(
      ['Összehasonlítás', fx(TeX`|t| = ${f(Math.abs(t), 3)} ${rej ? '\\gt' : '\\le'} ${c}`) + para(`Az elfogadási tartomány ${im(`-${c}`)} és ${im(`+${c}`)} között van; ${im(`t = ${f(t, 3)}`)} ${rej ? 'ezen kívül esik.' : 'ezen belül van.'}`)],
      ['Döntés', para(rej ? `${OPT.rej}: a gyógyszernek szignifikáns hatása van a vérnyomásra.` : `${OPT.fail}: nincs elég bizonyíték arra, hogy a gyógyszer hatna. Ez nem bizonyítja, hogy nincs hatása.`)]))),
  ] };
}

function rowsCase() {
  let gs, a;
  do { gs = [R(3, 4), R(3, 4), R(3, 4)].map(sz => { const base = R(6, 16); return Array.from({ length: sz }, () => base + R(-3, 3)); }); a = anova(gs); } while (a.ssw === 0 || a.ssb < 0.01 || Math.abs(a.F - fCrit[a.n - 3]) < 0.1);
  const all = gs.flat(), sst = sum(all.map(x => (x - a.gm) ** 2)), rows = ['Front', 'Middle', 'Back'], ct = fCrit[a.n - 3], rej = a.F > ct, F = x => f(x, 3);
  const vars = gs.map((g, i) => sum(g.map(x => (x - a.ms[i]) ** 2)) / (g.length - 1)), gt = groupTbl(gs, a, rows);
  return { title: 'One-way ANOVA: ülésrend', stem: `Exam scores of randomly chosen students sitting in three rows: ${tbl(['Row', 'Scores'], gs.map((g, i) => [rows[i], g.join(', ')]))} Test at α = 0.05 whether the mean scores of the rows differ.`, parts: [
    H('Grand mean = az összes érték átlaga (a csoportokat figyelmen kívül hagyva).', Q('What is the <b>grand mean</b>?', a.gm, [
      [mean(a.ms), 'A csoportátlagok sima átlaga; eltérő csoportméretnél ez nem egyenlő a főátlaggal.'], [sum(all) / 3, 'A csoportok számával osztottál, nem az összes elemszámmal.'], [a.ms[0], 'Ez csak a Front csoport átlaga.'],
    ], steps(
      ['Csoportonként', gt],
      ['Főátlag (grand mean)', fx(TeX`\bar{x} = \frac{\text{összes érték összege}}{\text{összes elemszám}}`, `= ${fr(sum(all), a.n)}`, `= ${f(a.gm, 3)}`) + para('Ez a csoportátlagok súlyozott átlaga (súly = a csoport mérete).')]), F)),
    H(TeX`$SS(B) = \sum n_i (\bar{x}_i - \bar{x})^2$: minden csoportátlag eltérése a főátlagtól, négyzetre emelve, a csoport elemszámával szorozva.`, Q('What is <b>SS(Between)</b>?', a.ssb, [
      [sum(a.ms.map(x => (x - a.gm) ** 2)), `Nem szoroztál a csoportok elemszámával (${im('n_i')}).`], [a.ssw, 'Ez SS(Within).'], [sst, 'Ez SS(Total).'],
    ], steps(
      ['Csoportátlagok', gt + para(`Főátlag: ${im(TeX`\bar{x} = ${f(a.gm, 3)}`)}.`)],
      ['SS(B): mennyire térnek el a csoportátlagok a főátlagtól', fx(...ssbLines(gs, a, rows))]), F)),
    H(TeX`$SS(W) = \sum (x - \bar{x}_i)^2$: minden értéket a SAJÁT csoportja átlagától mérsz.`, Q('What is <b>SS(Within)</b>?', a.ssw, [
      [a.ssb, 'Ez SS(Between).'], [sst, 'Ez SS(Total): a főátlagtól mértél, nem a csoportátlagoktól.'], [sum(vars), `A csoportvarianciákat adtad össze; ${im(TeX`SS(W) = \sum (n_i - 1) s_i^2`)}, vagyis az eltérésnégyzetek összege.`],
    ], steps(
      ['Csoportonként a saját átlagtól', fx(...sswLines(gs, a, rows))],
      ['Ellenőrzés', para(`${im(TeX`SS(T) = \sum (x - \bar{x})^2 = ${f(sst, 3)}`)}, és ${im(`SS(B) + SS(W) = ${f(a.ssb, 3)} + ${f(a.ssw, 3)} = ${f(a.ssb + a.ssw, 3)}`)}.`)]), F)),
    H(TeX`$df(B) = k - 1$, $df(W) = n - k$.`, Q('What are the degrees of freedom?', `df(B) = 2,  df(W) = ${a.n - 3}`, [
      [`df(B) = 3,  df(W) = ${a.n - 3}`, `${im('df(B) = k - 1 = 2')}, nem k.`], [`df(B) = 2,  df(W) = ${a.n - 1}`, `${im(`df(W) = n - k = ${a.n} - 3`)}; ${a.n - 1} a df(total).`], [`df(B) = ${a.n - 3},  df(W) = 2`, 'Felcserélted a kettőt.'],
    ], steps(
      ['Adatok', fx(`k = 3`, `n = ${gs.map(g => g.length).join(' + ')} = ${a.n}`)],
      ['Szabadságfokok', fx('df(B) = k - 1 = 3 - 1 = 2', `df(W) = n - k = ${a.n} - 3 = ${a.n - 3}`, `df(T) = n - 1 = ${a.n} - 1 = ${a.n - 1}`) + para(`Ellenőrzés: ${im(`2 + ${a.n - 3} = ${a.n - 1}`)}.`)]))),
    H(TeX`$MS = \frac{SS}{df}$ mindkettőre, aztán $F = \frac{MS(B)}{MS(W)}$.`, Q('What is the <b>F statistic</b>?', a.F, [
      [a.ssb / a.ssw, 'Az SS-eket osztottad; előbb el kell osztani őket a szabadságfokukkal.'], [1 / a.F, `Fordítva: ${im(TeX`F = \frac{MS(B)}{MS(W)}`)}.`], [(a.ssb / 2) / (a.ssw / (a.n - 1)), `MS(W)-nél ${im('n - 1')}-gyel osztottál; ${im('df(W) = n - k')}.`],
    ], steps(
      ['Mean squares', fx(`MS(B) = ${fr('SS(B)', 'df(B)')} = ${fr(f(a.ssb, 3), 2)} = ${f(a.msb, 3)}`, `MS(W) = ${fr('SS(W)', 'df(W)')} = ${fr(f(a.ssw, 3), a.n - 3)} = ${f(a.msw, 3)}`)],
      ['F', fx(`F = ${fr('MS(B)', 'MS(W)')}`, `= ${fr(f(a.msb, 3), f(a.msw, 3))}`, `= ${f(a.F, 3)}`)],
      ['ANOVA-tábla', anovaTbl(a)]), F)),
    H(TeX`Az F-próba jobboldali: $F \gt F_{table}$ → reject $H_0$.`, Q(`F<sub>table</sub>(2, ${a.n - 3}) at α = 0.05 is <b>${ct}</b>. What is the decision?`, rej ? OPT.rej : OPT.fail, [
      [rej ? OPT.fail : OPT.rej, rej ? `${im(TeX`F \gt F_{table}`)}, ezért H₀-t elvetjük.` : `${im(TeX`F \le F_{table}`)}, ezért H₀ nem vethető el.`], [OPT.rejH1, 'A döntés mindig H₀-ról szól.'], [OPT.prove, 'H₀-t sosem bizonyítjuk, legfeljebb nem vetjük el.'],
    ], steps(
      ['Összehasonlítás', para('Az F-próba mindig jobboldali.') + fx(TeX`F = ${f(a.F, 3)} ${rej ? '\\gt' : '\\le'} F_{table} = ${ct}`)],
      ['Döntés', para(rej ? `${OPT.rej}: legalább egy sor átlaga szignifikánsan eltér. Hogy melyik, ahhoz post hoc teszt kellene.` : `${OPT.fail}: nincs szignifikáns különbség a sorok átlagai között.`)]))),
  ] };
}

// ---------- Témák + elmélet ----------
const TOPICS = [
  { id: 'ratio', name: 'Arányok', en: 'Ratio I', gens: ratio, cases: [classCase], theory: TeX`
<p>A <b>ratio</b> (arány) két mennyiséget hasonlít össze: $p : q$, vagy $\frac{p}{q}$. A sorrend számít.</p>
<ul><li>Előbb közös mértékegység: $2\text{ km} : 500\text{ m} = 2000 : 500 = 4 : 1$.</li>
<li>Egyszerűsítés a legnagyobb közös osztóval: $12 : 18 = 2 : 3$.</li>
<li><b>Dividing by a ratio</b> (felosztás arányban): összes rész $= p + q$; $\text{egy rész} = \frac{\text{összeg}}{p + q}$; a p-hez tartozó rész $= p \times \text{egy rész}$.</li>
<li><b>Unknown</b>: ha fiúk : lányok $= 4 : 3$ és 12 lány van, egy rész $= \frac{12}{3} = 4$, a fiúk száma $4 \times 4 = 16$.</li>
<li><b>Compound ratio</b> (összetett arány): $A:B = 2:3$, $B:C = 4:5$ → B-t közös értékre hozzuk: $8:12$ és $12:15$ → $A:C = 8:15$.</li>
<li><b>Part-to-part</b> (rész a részhez) vs <b>part-to-whole</b> (rész az egészhez).</li>
<li><b>Duplicate ratio</b> (négyzetes arány): $a : b \to a^2 : b^2$.</li></ul>` },
  { id: 'index', name: 'Viszonyszámok', en: 'Ratio II', gens: indices, cases: [productionCase], theory: TeX`
<table><tr><th>Mutató</th><th>Jel</th><th>Képlet</th></tr>
<tr><td>Distribution ratio (megoszlási)</td><td>$V_m$</td><td>$\frac{\text{rész}}{\text{egész}}$</td></tr>
<tr><td>Coordination ratio (koordinációs)</td><td>$V_k$</td><td>$\frac{\text{rész}}{\text{másik rész}}$</td></tr>
<tr><td>Base ratio (bázis)</td><td>$V_{db}$</td><td>$\frac{y_t}{y_{\text{bázis}}}$</td></tr>
<tr><td>Chain ratio (lánc)</td><td>$V_{dl}$</td><td>$\frac{y_t}{y_{t-1}}$</td></tr>
<tr><td>Task indicator (tervfeladat)</td><td>$V_f$</td><td>$\frac{\text{terv}}{\text{bázis}}$</td></tr>
<tr><td>Performance indicator (tervteljesítés)</td><td>$V_t$</td><td>$\frac{\text{tény}}{\text{terv}}$</td></tr>
<tr><td>Intensity ratio (intenzitási)</td><td>$V_i$</td><td>$\frac{\text{jelenség}}{\text{viszonyítási alap}}$ (eltérő egység)</td></tr>
<tr><td>Areal comparative (területi összehasonlító)</td><td>$V_{\text{ö}}$</td><td>$\frac{\text{terület adata}}{\text{bázisterület adata}}$</td></tr>
<tr><td>Odds ratio (esélyhányados)</td><td>$OR$</td><td>$\frac{a/b}{c/d} = \frac{a \cdot d}{b \cdot c}$</td></tr>
<tr><td>Relative risk (relatív kockázat)</td><td>$RR$</td><td>$\frac{P(A)}{P(B)}$</td></tr></table>
<ul><li>A láncviszonyszámok szorzata = az utolsó bázisviszonyszám: $V_{db}(t) = V_{dl}(1) \cdot V_{dl}(2) \cdots V_{dl}(t)$. A bázisviszonyszámok hányadosa = láncviszonyszám.</li>
<li>$V_f \cdot V_t = V_d$, mert $\frac{\text{terv}}{\text{bázis}} \cdot \frac{\text{tény}}{\text{terv}} = \frac{\text{tény}}{\text{bázis}}$.</li>
<li>A betűk a magyar nevek kezdőbetűi: V = viszonyszám; m = megoszlási, k = koordinációs, d = dinamikus (b = bázis, l = lánc), f = tervfeladat, t = tervteljesítés, i = intenzitási, ö = összehasonlító. A diákon a Coordination és a Task/Performance példák tévesen $V_m$-mel vannak jelölve.</li>
<li>Egyenes intenzitási: orvos / 1000 lakos (nagyobb = jobb). Fordított: lakos / orvos (kisebb = jobb).</li>
<li>Odds = bekövetkezett / nem bekövetkezett. Probability = bekövetkezett / összes. Ezért $OR \ne RR$; ritka eseménynél közel esnek egymáshoz.</li>
<li>$OR$ vagy $RR = 1$: nincs különbség; $\gt 1$: az első csoportban gyakoribb; $\lt 1$: ritkább.</li></ul>` },
  { id: 'series', name: 'Adatok és gyakorisági sorok', en: 'Course Introduction', gens: series, cases: [marksCase], theory: TeX`
<p><b>Változótípusok.</b> Quantitative (mennyiségi): <b>discrete</b> (diszkrét, számlált) vagy <b>continuous</b> (folytonos, mért). Categorical (kategorikus): <b>binary</b> (két kimenet), <b>nominal</b> (sorrend nélkül), <b>ordinal</b> (sorrendbe állítható, pl. Likert-skála).</p>
<p>Szerep szerint: <b>independent</b> (független, ok), <b>dependent</b> (függő, okozat), <b>control</b> (kontroll, állandó), <b>confounding</b> (zavaró, mindkettőre hat).</p>
<p><b>Sorok.</b> Time series (idősor), spatial series (területi sor), condition series (feltétel szerinti sor), individual series (egyedi sor: minden érték külön).</p>
<ul><li>Relative frequency (relatív gyakoriság) $= \frac{f}{n}$; összege 100%.</li>
<li>Cumulative frequency (kumulált gyakoriság): „legfeljebb x” darabszáma; utolsó értéke n.</li>
<li>Class width (osztályköz hossza): $i = \frac{\max - \min}{\text{osztályok száma}}$, felfelé kerekítve, lehetőleg 5 többszörösére.</li>
<li>Midpoint (osztályközép) $= \frac{\text{alsó határ} + \text{felső határ}}{2}$.</li>
<li>Range (terjedelem) osztályközös sorban = utolsó osztály felső határa − első osztály alsó határa.</li>
<li>Osztályok: exhaustive (minden adatot lefednek) és mutually exclusive (egymást kizárók); 5–15 darab.</li></ul>` },
  { id: 'central', name: 'Középértékek', en: 'Descriptive Statistics I', gens: central, cases: [groupedCase], theory: TeX`
<table><tr><th>Mutató</th><th>Képlet</th></tr>
<tr><td>Arithmetic mean (számtani átlag)</td><td>$\bar{x} = \frac{\sum x}{n}$</td></tr>
<tr><td>Grouped mean (osztályközös)</td><td>$\bar{x} = \frac{\sum f x}{\sum f}$, x = osztályközép</td></tr>
<tr><td>Assumed mean method</td><td>$\bar{x} = A + \frac{\sum f d}{\sum f}$, $d = x - A$</td></tr>
<tr><td>Step deviation method</td><td>$\bar{x} = A + \frac{\sum f u}{\sum f} \times h$, $u = \frac{x - A}{h}$</td></tr>
<tr><td>Weighted mean (súlyozott)</td><td>$\bar{x} = \frac{\sum w x}{\sum w}$</td></tr>
<tr><td>Geometric mean (mértani)</td><td>$GM = \sqrt[n]{x_1 \cdot x_2 \cdots x_n}$</td></tr>
<tr><td>Harmonic mean (harmonikus)</td><td>$HM = \frac{n}{\sum \frac{1}{x}}$</td></tr>
<tr><td>Median, grouped</td><td>$l + \frac{n/2 - cf}{f} \times h$</td></tr>
<tr><td>Mode, grouped</td><td>$l + \frac{f_1 - f_0}{2f_1 - f_0 - f_2} \times h$</td></tr></table>
<ul><li>Median (medián): rendezett sor közepe. Páratlan n: az $\frac{n+1}{2}$-edik elem. Páros n: a két középső átlaga.</li>
<li>A csoportos medián képletében a $cf$ a mediánosztály <b>előtti</b> osztály kumulált gyakorisága, az $f$ a mediánosztályé.</li>
<li>Mode (módusz): leggyakoribb érték; lehet unimodal, bimodal, trimodal, multimodal.</li>
<li>Százalékos változások átlaga: mértani átlag a tényezőkből $(1 + r)$. Azonos utakon mért sebességek átlaga: harmonikus átlag.</li></ul>` },
  { id: 'dispersion', name: 'Szóródás', en: 'Descriptive Statistics II', gens: dispersion, cases: [sampleCase], theory: TeX`
<table><tr><th>Mutató</th><th>Képlet</th></tr>
<tr><td>Range (terjedelem)</td><td>$\max - \min$</td></tr>
<tr><td>Population variance (sokasági variancia)</td><td>$\sigma^2 = \frac{\sum (x - \mu)^2}{N}$</td></tr>
<tr><td>Sample variance (mintavariancia)</td><td>$s^2 = \frac{\sum (x - \bar{x})^2}{n - 1}$</td></tr>
<tr><td>Standard deviation (szórás)</td><td>$\sigma = \sqrt{\sigma^2}$</td></tr>
<tr><td>Frequency table</td><td>$\sigma^2 = \frac{\sum f (x - \bar{x})^2}{\sum f}$</td></tr>
<tr><td>$Q_1$, $Q_3$ (egyedi sor)</td><td>az $\frac{N+1}{4}$-edik és a $\frac{3(N+1)}{4}$-edik elem</td></tr>
<tr><td>$Q_1$, $Q_3$ (osztályközös)</td><td>$l + \frac{N/4 - cf}{f} \times h$, illetve $\frac{3N}{4}$-gyel</td></tr>
<tr><td>Interquartile range (IQR)</td><td>$Q_3 - Q_1$</td></tr>
<tr><td>Quartile deviation (kvartiliseltérés)</td><td>$\frac{Q_3 - Q_1}{2}$</td></tr>
<tr><td>Coefficient of QD</td><td>$\frac{Q_3 - Q_1}{Q_3 + Q_1}$</td></tr></table>
<ul><li>A range érzékeny az outlierekre (kiugró értékek).</li>
<li>Variance négyzetes mértékegységben, standard deviation az eredeti egységben.</li>
<li>Sample → $n - 1$ (Bessel-korrekció). A diákon a {4, 6, 8, 10} példa hibás: a helyes $s^2 = \frac{20}{3} = 6{,}67$.</li>
<li>Empirical rule (normális eloszlás): $\pm 1\sigma \approx 68\%$, $\pm 2\sigma \approx 95\%$, $\pm 3\sigma \approx 99{,}7\%$.</li>
<li>Binomiális variancia: $np(1 - p)$.</li></ul>` },
  { id: 'sampling', name: 'Mintavétel', en: 'Random Sampling', gens: sampling, cases: [universityCase], theory: TeX`
<ul><li><b>Simple random sampling</b> (egyszerű véletlen): mindenki azonos eséllyel; $P(\text{kiválasztás}) = \frac{n}{N}$.</li>
<li>Visszatevéssel, legalább egyszer: $P = 1 - \left(1 - \frac{1}{N}\right)^n$. A diák 9,56%-os eredménye hibás, 200 főből 50 húzásnál a helyes érték 22,17%.</li>
<li><b>Systematic</b> (szisztematikus): $k = \frac{N}{n}$; véletlen kezdőpont 1 és k között, utána minden k-adik. Az i-edik elem: $\text{start} + (i - 1) \cdot k$. Linear: nem ismétel; circular: a lista végén elölről folytatja.</li>
<li><b>Stratified</b> (rétegzett): rétegek (strata) szerint bontunk, mindegyikből mintát veszünk. Arányos (proportionate): $s = \frac{S}{N} \times n$. Nem arányos (disproportionate): a fontos rétegből többet.</li>
<li><b>Cluster</b> (csoportos): néhány teljes csoportot választunk. $n = \text{ACS} \times \text{klaszterek száma}$. Single-stage: a kiválasztott klaszterben mindenki. Two-stage: klaszteren belül újra mintavétel. Multi-stage: több szinten.</li>
<li>Rétegzett: minden rétegből választunk. Klaszteres: csak néhány klasztert választunk.</li>
<li>Non-probability (nem valószínűségi) módszerek: convenience, judgmental, snowball, quota.</li></ul>` },
  { id: 'hypothesis', name: 'Hipotézisvizsgálat', en: 'Hypothesis Testing', gens: hypothesis, cases: [drugCase], theory: TeX`
<ul><li><b>$H_0$</b> (null hypothesis, nullhipotézis): tartalmazza az egyenlőséget ($=$, $\le$, $\ge$). <b>$H_1$</b> (alternative, alternatív): amit bizonyítani akarunk ($\ne$, $\gt$, $\lt$).</li>
<li>Two-tailed (kétoldali): $H_1: \mu \ne \mu_0$. Right-tailed (jobboldali): $H_1: \mu \gt \mu_0$. Left-tailed (baloldali): $H_1: \mu \lt \mu_0$.</li>
<li><b>Significance level</b> (szignifikanciaszint) $\alpha$, általában 0,05.</li>
<li>Döntés: $p \le \alpha$ → reject $H_0$. Vagy: $|\text{test statistic}| \gt \text{critical value}$ → reject $H_0$. Egyébként: fail to reject $H_0$ (nem vetjük el; nem bizonyítjuk!).</li>
<li><b>Type I error</b> (elsőfajú hiba, $\alpha$): igaz $H_0$-t elvetünk (false positive). <b>Type II error</b> (másodfajú hiba, $\beta$): hamis $H_0$-t megtartunk (false negative).</li>
<li>Z-test: ismert szórás, nagy minta. T-test: kis minta vagy ismeretlen szórás. Chi-square: kategorikus adatok.</li>
<li><b>Paired t-test</b> (páros t-próba): $d = \text{után} - \text{előtt}$; $m = \bar{d}$; $s$ = d szórása $(n - 1)$-gyel; $t = \frac{m}{s / \sqrt{n}}$; $df = n - 1$.</li></ul>` },
  { id: 'anova', name: 'ANOVA', en: 'ANOVA', gens: anovaGens, cases: [rowsCase], theory: TeX`
<p><b>One-way ANOVA</b> (egyszempontú varianciaelemzés): 3 vagy több csoport átlagát hasonlítja össze. $H_0: \mu_1 = \mu_2 = \dots = \mu_k$; $H_1$: legalább egy átlag eltér.</p>
<table><tr><th>Forrás</th><th>SS</th><th>df</th><th>MS</th><th>F</th></tr>
<tr><td>Between (csoportok között)</td><td>$\sum n_i (\bar{x}_i - \bar{x})^2$</td><td>$k - 1$</td><td>$\frac{SS(B)}{df(B)}$</td><td>$\frac{MS(B)}{MS(W)}$</td></tr>
<tr><td>Within (csoporton belül)</td><td>$\sum (x - \bar{x}_i)^2$</td><td>$n - k$</td><td>$\frac{SS(W)}{df(W)}$</td><td></td></tr>
<tr><td>Total</td><td>$\sum (x - \bar{x})^2$</td><td>$n - 1$</td><td></td><td></td></tr></table>
<ul><li>$SS(T) = SS(B) + SS(W)$, és $df(T) = df(B) + df(W)$. Az MS-ek viszont nem adódnak össze.</li>
<li>Grand mean (főátlag) = összes érték átlaga, a csoportátlagok súlyozott átlaga.</li>
<li>Az F-próba mindig jobboldali. $F \gt F_{table}$ ($df_1 = k - 1$, $df_2 = n - k$) → reject $H_0$.</li>
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
