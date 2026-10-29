// Pénzügyi számvitel I. gyakorló. A tartalom az anyag/*.json fájlokban van (a zh-anyag adatbázis, séma: anyag/README.md),
// ez a fájl csak megjeleníti: elmélet, kérdések, könyvelési gyakorló (T/K beírása), teljes feladatok.

const $ = s => document.querySelector(s);
const app = $('#app');
const KEY = 'szamv-gyakorlo-v1';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const R = n => Math.floor(Math.random() * n);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = x => typeof x === 'number' ? x.toLocaleString('hu-HU').replace(/-/g, '−') : esc(x);
const p2 = x => String(x).padStart(2, '0');
const now = (d = new Date()) => `${d.getFullYear()}.${p2(d.getMonth() + 1)}.${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {} }
const store = Object.assign({ n: 20, hist: [], wrong: {} }, load());

// Bármilyen JSON-érték olvasható HTML-ként (adatok, számítások, kalkuláció, Moodle-válaszok).
function rv(v) {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'boolean') return v ? 'Igaz' : 'Hamis';
  if (typeof v !== 'object') return fmt(v);
  if (Array.isArray(v)) {
    if (!v.length) return '';
    if (v.every(Array.isArray)) return `<table class="l sch">${v.map(r => `<tr>${r.map(c => `<td>${rv(c)}</td>`).join('')}</tr>`).join('')}</table>`;
    if (v.every(x => x && typeof x === 'object')) {
      const keys = [...new Set(v.flatMap(Object.keys))];
      return `<table class="l sch"><tr>${keys.map(k => `<th>${esc(k)}</th>`).join('')}</tr>${v.map(r => `<tr>${keys.map(k => `<td>${rv(r[k])}</td>`).join('')}</tr>`).join('')}</table>`;
    }
    return `<ul>${v.map(x => `<li>${rv(x)}</li>`).join('')}</ul>`;
  }
  return `<table class="l sch">${Object.entries(v).map(([k, x]) => `<tr><th>${esc(k.replace(/_/g, ' '))}</th><td>${rv(x)}</td></tr>`).join('')}</table>`;
}

// ---------- Számlaszámok ----------
const CLS = ['nyilvántartási számlák', 'befektetett eszközök', 'készletek', 'követelések, pénzeszközök, aktív elhatárolások',
  'saját tőke, céltartalék, kötelezettségek, passzív elhatárolások', 'költségnemek', 'költséghelyek', 'költségviselők',
  'értékesítés önköltsége és ráfordítások', 'árbevétel és bevételek'];
const acct = s => String(s ?? '').replace(/[–—]/g, '-').replace(/\s/g, '');
const isAcct = s => /^\d{2,5}(-\d{2,5})?$/.test(acct(s));
// Elfogadjuk a pontosabb vagy a 3 jegyű főszámlát is (466 ~ 4661, 571 ~ 5711), a „91-92” bármelyik tagját.
function sameAcct(user, key) {
  const u = acct(user).replace(/-/g, '');
  if (u.length < 2) return false;
  return acct(key).split('-').some(a => u.startsWith(a) || (u.length >= 3 && a.startsWith(u))) || u === acct(key).replace(/-/g, '');
}
const clsHint = s => `${acct(s)[0]}. számlaosztály (${CLS[+acct(s)[0]]})`;

// ---------- Témák ----------
const TOPICS = [
  { id: 'minta', file: '00_zh_info.json', name: 'Minta-ZH', sub: 'A tanár szerint a zh nagyon hasonló lesz. Mindkét gyakorlati feladat végig, megoldással.' },
  { id: 'sajat', file: 'sajat_termelesu_keszletek.json', name: 'Saját termelésű készletek', sub: '1. feladat (31 pont): kalkuláció, könyvelés (csak 5-ös osztály), eredménykimutatás' },
  { id: 'ceg', file: 'cegalapitas.json', name: 'Cégalapítás', sub: '2. feladat váza (40,5 pont); fogalom nem lesz belőle' },
  { id: 'targyi', file: 'targyi_eszkozok.json', name: 'Tárgyi eszközök', sub: 'teszt, fogalom, a 2. feladat beruházás- és ÉCS-tételei' },
  { id: 'immat', file: 'immaterialis_javak.json', name: 'Immateriális javak', sub: 'fogalom (pl. alapítás-átszervezés aktivált értéke), teszt' },
  { id: 'vasarolt', file: 'vasarolt_keszletek.json', name: 'Vásárolt készletek', sub: 'teszt, fogalom; a gyakorlatban legfeljebb 1–2 tétel' },
  { id: 'merleg', file: 'merlegsema.json', name: 'Mérlegséma', sub: '9 pont: bármelyik mérlegsor jöhet, oszlopnevekkel' },
  { id: 'alapelv', file: 'alapelvek_beszamolo.json', name: 'Alapelvek, beszámoló', sub: '7 pont: tartalmi és formai elvek, egy alapelv kifejtése' },
  { id: 'ismetlo', file: 'ismetlo_feladatsor.json', name: 'Könyvviteli alapok', sub: 'ismétlő feladatsor: alap könyvelési tételek' },
  { id: 'moodle', file: 'tesztkerdesek_moodle.json', name: 'Moodle-tesztek', sub: 'a 6 Moodle-teszt kérdései a javított válasszal, kártyaként' },
];
const D = {};
const topic = id => TOPICS.find(t => t.id === id);

// Kérdések egységes alakra: choice | multi | tf | pair | card.
function normQ(q, tid) {
  const base = { id: `${tid}:${q.id}`, tid, q: esc(q.kerdes), mag: q.magyarazat ? esc(q.magyarazat) : '', ans: rv(q.helyes) };
  const o = Array.isArray(q.opciok) ? q.opciok : null;
  if (o && typeof q.helyes === 'string' && o.includes(q.helyes)) return { ...base, kind: 'choice', opts: o, right: [o.indexOf(q.helyes)] };
  if (q.tipus === 'igaz_hamis') {
    const h = q.helyes === true || q.helyes === 'Igaz';
    return { ...base, kind: 'choice', tf: true, opts: ['Igaz', 'Hamis'], right: [h ? 0 : 1], ans: h ? 'Igaz' : 'Hamis' };
  }
  if (o && Array.isArray(q.helyes)) {
    const idx = q.helyes.map(h => o.indexOf(h) >= 0 ? o.indexOf(h) : o.findIndex(x => x.startsWith(h + ')')));
    if (idx.every(i => i >= 0)) return { ...base, kind: 'multi', opts: o, right: idx };
  }
  if (q.helyes && typeof q.helyes === 'object' && !Array.isArray(q.helyes) && Object.values(q.helyes).every(v => typeof v === 'string'))
    return { ...base, kind: 'pair', pairs: Object.entries(q.helyes) };
  return { ...base, kind: 'card' };
}

function questions(id) {
  if (id === 'hibak') return TOPICS.flatMap(t => questions(t.id)).filter(q => store.wrong[q.id]);
  if (id === 'mind') return TOPICS.flatMap(t => questions(t.id));
  const d = D[topic(id).file];
  if (id === 'moodle') return d.tesztek.flatMap((t, ti) => t.kerdesek.map(k => ({
    id: `m${ti}_${k.n}`, tid: id, kind: 'card', q: `<span class="tag" style="margin:0">${esc(t.cim)}</span><br>${esc(k.kerdes || k.cim)}`,
    ans: rv(k.helyes ?? k.tetelek ?? k.beadott), mag: [k.indoklas, k.javaslat, k.megjegyzes, k.sajat_hiba && 'Saját hiba a Moodle-ban: ' + k.sajat_hiba].filter(Boolean).map(esc).join('<br>'),
  })));
  return (d.gyakorlo_kerdesek || []).map(q => normQ(q, id));
}

// Könyvelési tételek: a minták és a feladatok megoldásai, ahol a T és a K egyértelmű számlaszám.
function tasks(id) {
  const d = D[topic(id).file];
  if (id === 'minta') return d.szerkezet.gyakorlat.minta_megoldas.map((m, i) => ({
    id: `minta${i}`, cim: m.cim, szoveg: m.szoveg, kerdesek: m.kerdesek,
    megoldas: { tetelek: m.tetelek, egyeb: { kalkuláció: m.kalkulacio, eredménykimutatás: m.eredmenykimutatas, pontozás: [m.kalkulacio_pont, m.tetelek_pont, m.eredmenykimutatas_pont, m.pont].filter(Boolean).join(' · ') } },
    elteresek_a_forrasban: d.szerkezet.gyakorlat.elteresek_a_kulcsban,
  }));
  return d.feladatok || [];
}
function drills(id) {
  if (id === 'mind') return TOPICS.flatMap(t => drills(t.id));
  const d = D[topic(id).file];
  const fromTasks = tasks(id).flatMap(f => ((f.megoldas || {}).tetelek || []).map(t => ({ ...t, src: f.cim })));
  return [...(d.konyvelesi_minta || []), ...fromTasks].filter(t => isAcct(t.T) && isAcct(t.K));
}

// ---------- Főoldal ----------
const PLAN = [
  ['0:00–0:25', 'Könyvelés alapjai: Tartozik/Követel, számlaosztályok, áfa, a két feladat váza', 'start', 'Kezdd itt'],
  ['0:25–1:35', '<b>1. feladat (31 pont).</b> A minta-ZH 1. feladatát csináld végig a Feladatok között (kalkuláció, 581/582, STKÁV, eredménykimutatás), utána a Saját termelésű készletek feladatait és a könyvelési gyakorlót.', 'sajat', 'Saját termelésű készletek'],
  ['1:35–2:50', '<b>2. feladat (40,5 pont).</b> A minta-ZH 2. feladata soronként, aztán könyvelési gyakorló: Cégalapítás és Tárgyi eszközök (import, apport, beruházás, aktiválás, ÉCS, eladás a 368-on át).', 'ceg', 'Cégalapítás'],
  ['2:50–3:30', '<b>Mérlegséma (9 pont).</b> Rejtett nevekkel tanuld: A.I. immateriális javak, A.II. tárgyi eszközök, B.I. készletek, és a forrásoldal D–G.', 'merleg', 'Mérlegséma'],
  ['3:30–4:05', '<b>Alapelvek (7 pont).</b> 4 tartalmi, 3 formai elv, általános: a vállalkozás folytatása. Egyet tudj 7 pontosan kifejteni (a minta-ZH-ban a vállalkozás folytatása volt).', 'alapelv', 'Alapelvek'],
  ['4:05–4:35', '<b>Fogalom (7 pont) és teszt (7–8 pont).</b> A „magas” valószínűségű fogalmak kulcselemei: tárgyi eszközök, immateriális javak, készletek. Utána a témák kérdései.', 'targyi', 'Tárgyi eszközök'],
  ['4:35–5:00', 'Vegyes kérdések és a „Hibáim” újra. Utolsó átfutás a minta-ZH tételein.', 'mind', 'Vegyes'],
];

function home() {
  Q = null;
  const row = (t, i) => {
    const nq = questions(t.id).length, nd = drills(t.id).length, nt = tasks(t.id).length;
    return `<li class="topic"><span class="num">${p2(i + 1)}</span><div class="body"><div class="name">${t.name}</div><div class="sub">${t.sub}</div>
      <div class="act">${nq ? `<button class="btn" data-quiz="${t.id}">Kérdések (${nq})</button>` : ''}${t.id === 'moodle' ? '' : `<button class="link" data-theory="${t.id}">Elmélet</button>`}${nd ? `<button class="link" data-drill="${t.id}">Könyvelés (${nd})</button>` : ''}${nt ? `<button class="link" data-tasks="${t.id}">Feladatok (${nt})</button>` : ''}</div></div></li>`;
  };
  const nw = questions('hibak').length, hist = store.hist.slice(-15).reverse();
  app.innerHTML = `
    <nav class="crumbs"><a href="../">Gyakorló</a><span>/</span>Pénzügyi számvitel I.</nav>
    <div class="eyebrow">University of Pannonia · magyar nyelvű tárgy</div>
    <h1>Pénzügyi számvitel I.</h1>
    <p class="lead">ZH: 90 perc, elmélet 30 pont (teszt 7–8, mérlegséma 9, alapelv 7, fogalom 7), gyakorlat 71 pont (késztermék-kalkuláció 31, alapítás és vegyes napló 40,5). A gyakorlat a pontok kétharmada, ezzel kezdj.</p>
    <h2 style="margin-top:30px">Terv 5 órára</h2>
    <table class="l plan">${PLAN.map(([t, x, id, b]) => `<tr><td>${t}</td><td>${x} <button class="link" data-go="${id}">${b} →</button></td></tr>`).join('')}</table>
    <div class="settings">Kérdések száma egy körben
      <span class="seg">${[10, 20, 40].map(n => `<label><input type="radio" name="n" value="${n}"${store.n === n ? ' checked' : ''}><span>${n}</span></label>`).join('')}</span></div>
    <ul class="topics">
      <li class="topic all"><span class="num">00</span><div class="body"><div class="name">Kezdd itt</div><div class="sub">Könyvelés nulláról: T/K, számlaosztályok, a zh számlái, áfa, a két gyakorlati feladat menete</div>
        <div class="act"><button class="btn" data-theory="start">Olvasás</button><button class="link" data-quiz="mind">Vegyes kérdések</button><button class="link" data-drill="mind">Vegyes könyvelés</button>${nw ? `<button class="link" data-quiz="hibak">Hibáim (${nw})</button>` : ''}</div></div></li>
      ${TOPICS.map(row).join('')}</ul>
    <hr><h2>Eredmények</h2>
    ${hist.length ? `<table class="hist"><tr><th>Dátum</th><th>Mi</th><th>Helyes</th><th>%</th></tr>${hist.map(h => `<tr><td>${h.date}</td><td>${esc(h.name)}</td><td>${h.ok} / ${h.n}</td><td>${h.pct}%</td></tr>`).join('')}</table><button class="link" id="clear" style="margin-top:14px">Eredmények törlése</button>` : '<p class="lead">Itt jelennek meg a kitöltött körök eredményei.</p>'}
    <footer>Az eredmények csak ebben a böngészőben tárolódnak. Forrás: tanári diák, feladatsorok, minta-ZH, Moodle-javítások (anyag/).</footer>`;
  app.querySelectorAll('input[name=n]').forEach(r => r.onchange = () => { store.n = +r.value; save(); });
  app.querySelectorAll('[data-quiz]').forEach(b => b.onclick = () => quiz(b.dataset.quiz));
  app.querySelectorAll('[data-theory]').forEach(b => b.onclick = () => theory(b.dataset.theory));
  app.querySelectorAll('[data-drill]').forEach(b => b.onclick = () => drill(b.dataset.drill));
  app.querySelectorAll('[data-tasks]').forEach(b => b.onclick = () => taskList(b.dataset.tasks));
  app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => b.dataset.go === 'mind' ? quiz('mind') : theory(b.dataset.go));
  const c = $('#clear'); if (c) c.onclick = () => { if (confirm('Biztosan törlöd az eredményeket?')) { store.hist = []; store.wrong = {}; save(); home(); } };
  scrollTo(0, 0);
}
const crumbs = last => `<nav class="crumbs"><a href="../">Gyakorló</a><span>/</span><button class="link" id="back">Pénzügyi számvitel I.</button><span>/</span>${last}</nav>`;
const nameOf = id => ({ mind: 'Vegyes', hibak: 'Hibáim', start: 'Kezdd itt' })[id] || topic(id).name;

// ---------- Elmélet ----------
const START = `
<p>Ha eddig semmit nem tanultál: ezt olvasd el egyszer figyelmesen, utána már tudsz könyvelni. A zh gyakorlati része (71 pont) két nagy könyvelési feladat. Ott minden sor ugyanígy néz ki: <b>T számla / K számla – összeg</b>.</p>
<h2>1. Tartozik és Követel</h2>
<p>Minden gazdasági eseményt két számlán rögzítünk ugyanazzal az összeggel: az egyik számla <b>Tartozik</b> (T, bal) oldalára, a másik <b>Követel</b> (K, jobb) oldalára. Ez a kettős könyvvitel.</p>
<table class="l"><tr><th>Számla</th><th>Nő</th><th>Csökken</th></tr>
<tr><td>Eszköz (1., 2., 3. osztály): gép, készlet, vevő, bank</td><td>T</td><td>K</td></tr>
<tr><td>Forrás (4. osztály): saját tőke, hitel, szállító, áfa-tartozás</td><td>K</td><td>T</td></tr>
<tr><td>Költség (5. osztály), ráfordítás (8. osztály)</td><td>T</td><td></td></tr>
<tr><td>Bevétel (9. osztály)</td><td>K</td><td></td></tr></table>
<p>Ökölszabály: ha pénz jön a bankba, <b>T 384</b>; ha fizetsz, <b>K 384</b>. Vásárlás számlára: K szállító (454x, beruházásnál 455x). Eladás számlára: T vevő (311).</p>
<h2>2. Számlaosztályok</h2>
<table class="l">${CLS.map((c, i) => `<tr><td>${i}</td><td>${c}</td></tr>`).join('')}</table>
<p>A tanár tippje szerint a 6-os és 7-es osztály nem lesz a zh-ban: minden költség az 5-ösbe megy (költségnem-elszámolás).</p>
<h2>3. A minta-ZH számlái</h2>
<table class="l sch">
<tr><td>111</td><td>Alapítás-átszervezés aktivált értéke (immateriális jószág)</td></tr>
<tr><td>1231</td><td>Épület: az ingatlanberuházás aktiválása ide</td></tr>
<tr><td>131 / 132</td><td>Termelő gép / termelésben részt vevő jármű (pl. targonca)</td></tr>
<tr><td>139</td><td>Gépek, járművek halmozott terv szerinti ÉCS-e (értékcsökkenés)</td></tr>
<tr><td>143</td><td>Egyéb (pl. irodai) berendezés</td></tr>
<tr><td>161</td><td>Befejezetlen beruházás: üzembe helyezésig minden ide gyűlik</td></tr>
<tr><td>211, 227</td><td>Anyagok; a kulcsban a gyártási hulladék készletre vétele: 227</td></tr>
<tr><td>231 / 251 / 261</td><td>Befejezetlen termelés / Késztermék / Áru</td></tr>
<tr><td>311</td><td>Vevők</td></tr>
<tr><td>32-33</td><td>Jegyzett, de be nem fizetett tőke (követelés a tulajdonossal szemben)</td></tr>
<tr><td>352</td><td>Beruházásra adott előleg</td></tr>
<tr><td>368, 3683</td><td>Különféle egyéb követelések: technikai számla eladásnál, apportnál; 3683 az importáfa elszámolása</td></tr>
<tr><td>381 / 384</td><td>Pénztár / Bankszámla</td></tr>
<tr><td>411, 413, 4142</td><td>Jegyzett tőke, eredménytartalék, lekötött tartalék</td></tr>
<tr><td>4441</td><td>Beruházási hitel</td></tr>
<tr><td>4541 / 4543</td><td>Szállítók: áru, anyag / szolgáltatás</td></tr>
<tr><td>4551 / 4552</td><td>Beruházási szállító: belföldi / külföldi</td></tr>
<tr><td>463, 471</td><td>Járulékfizetési kötelezettség, bérkifizetési kötelezettség</td></tr>
<tr><td>4651 / 4652</td><td>Vámkötelezettség / importáfa-kötelezettség</td></tr>
<tr><td>466 (4661)</td><td>Előzetesen felszámított áfa: vásárláskor, T oldalon</td></tr>
<tr><td>467</td><td>Fizetendő áfa: eladáskor, K oldalon</td></tr>
<tr><td>479</td><td>Egyéb rövid lejáratú kötelezettség: az alapító befizetése a cégbejegyzés előtt</td></tr>
<tr><td>4823</td><td>Passzív időbeli elhatárolás: aktiválásig felmerült, még nem fizetett hitelkamat</td></tr>
<tr><td>491</td><td>Nyitómérleg-számla (a nyitó készletek ellenszámlája)</td></tr>
<tr><td>511, 52, 541, 56, 5711</td><td>Anyagköltség, igénybe vett szolgáltatás, bérköltség, bérjárulék, terv szerinti ÉCS</td></tr>
<tr><td>581 / 582</td><td>Saját termelésű készletek állományváltozása (STKÁV) / Saját előállítású eszközök aktivált értéke (SEEAÉ)</td></tr>
<tr><td>814</td><td>Eladott áruk beszerzési értéke (ELÁBÉ)</td></tr>
<tr><td>8664, 8693</td><td>Egyéb ráfordítás: terven felüli ÉCS, készlethiány</td></tr>
<tr><td>91-92</td><td>Belföldi értékesítés nettó árbevétele</td></tr>
<tr><td>961</td><td>Egyéb bevétel: értékesített tárgyi eszköz ellenértéke (nem 91-92!)</td></tr></table>
<p>A Moodle a 3 jegyű főszámlát elfogadta (454, 571), a 2 jegyűt nem. Legalább 3, inkább 4 jegyet írj.</p>
<h2>4. Áfa (27%)</h2>
<ul><li>Vásárlás: T 466 / K szállító, összeg = nettó × 27%. Levonható áfa <b>soha nem része</b> a bekerülési értéknek.</li>
<li>Eladás: T 311 / K 467, nettó × 27%.</li>
<li>Import: vételár T 161 / K 4552, vám T 161 / K 4651 (a vám része a bekerülési értéknek), importáfa T 3683 / K 4652, átutalás T 4652 / K 384, rendezés T 466 / K 3683.</li>
<li>Adott előleg áfája: T 466 / K 384; a végszámlánál visszavezeted: T 4551 / K 352 (előleg) és T 4551 / K 466 (áfa).</li></ul>
<h2>5. Összköltség eljárás</h2>
<p>A költség az 5-ös osztályba kerül. Amit belőle saját magunk állítunk elő, azt az 58-as számlák „visszaadják”: <b>581</b> a késztermékhez és a befejezetlen termeléshez, <b>582</b> a saját előállítású eszközhöz. Az eredménykimutatásban ez a II. sor (aktivált saját teljesítmények).</p>
<p><b>A. Üzemi eredmény</b> = I. árbevétel ± II. aktivált saját teljesítmények + III. egyéb bevételek − IV. anyagjellegű ráfordítások − V. személyi jellegű ráfordítások − VI. ÉCS − VII. egyéb ráfordítások.</p>
<h2>6. Az 1. feladat váza: késztermék</h2>
<p><b>Kalkuláció:</b> nyitó befejezetlen + közvetlen költségek + felosztott közvetett (általános) költség − hulladék = összesen; − záró befejezetlen = befejezett termelés; ÷ darabszám = önköltség/db.</p>
<ol><li>Nyitás: T 231 / K 491, T 251 / K 491.</li>
<li>Nyitó befejezetlen visszavezetése: T 581 / K 231.</li>
<li>Költségek az 5-ösre, a közvetlen és a közvetett együtt: anyag T 511 / K 211, szolgáltatás T 52 / K 4541 (+ áfa T 466), bér T 541 / K 471, járulék T 56 / K 463, ÉCS T 571 / K 139.</li>
<li>Hulladék: T 227 / K 511.</li>
<li>Késztermék raktárra: T 251 / K 581, a befejezett termelés értékén.</li>
<li>Eladás: T 311 / K 91-92 (db × eladási ár) és T 311 / K 467 (áfa); az eladott késztermék kivezetése FIFO szerint, önköltségen: T 581 / K 251.</li>
<li>A felosztott általános költség csak a kalkulációban szerepel, nem könyveled.</li>
<li>Záró befejezetlen: T 231 / K 581.</li>
<li>Leltárhiány: T 581 / K 251, majd T 8693 / K 582.</li></ol>
<p>FIFO: először a nyitó készlet megy ki (a régi áron), utána az új önköltségen. Minta: 500 db × 4 200 + 1 500 db × 3 320 = 7 080 000.</p>
<h2>7. A 2. feladat váza: alapítás és vegyes napló</h2>
<ol><li>Bejegyzés előtt az alapító befizet: T 381/384 / K 479; apport az apportjegyzék szerinti értéken: T 161 / K 479.</li>
<li>Cégbejegyzés: T 32-33 / K 411 a teljes jegyzett tőkével; ami már bejött, azt átvezeted: T 479 / K 32-33.</li>
<li>A hátralék befizetése: T 384 / K 32-33.</li>
<li>Beszerzés: T 161 / K 4551 (+ áfa T 466); üzembe helyezés: T 131/132/143 / K 161; ingatlan: T 1231 / K 161.</li>
<li>Alapítás-átszervezés aktiválva: T 111 / K 4543, és ugyanennyi lekötött tartalék: T 413 / K 4142.</li>
<li>Áru, ha csak mennyiségi a nyilvántartás: beszerzés T 814 / K 4541, év végén a zárókészlet T 261 / K 814; eladáskor nincs ELÁBÉ-tétel.</li>
<li>Tárgyi eszköz eladása: T 311 / K 368 (ár), T 311 / K 467 (áfa), T 368 / K 131 (nettó érték), T 139 / K 131 (halmozott ÉCS), nyereség T 368 / K 961.</li>
<li>ÉCS (lineáris): bekerülési érték ÷ évek × használt hónapok / 12, az üzembe helyezés hónapjától. Minta: 3 220 000 ÷ 5 × 7/12 = 375 667, T 5711 / K 139.</li>
<li>Aktiválásig felmerült hitelkamat a bekerülési érték része: T 161 / K 4823. Minta: 29 718 000 × 12% × 3/12 = 891 540.</li></ol>`;

function theory(id) {
  if (id === 'start') return page('Kezdd itt', 'Könyvelés nulláról', START, null);
  const t = topic(id), d = D[t.file];
  const order = { magas: 0, kozepes: 1, alacsony: 2 };
  const prob = { magas: 'magas valószínűség', kozepes: 'közepes', alacsony: 'alacsony' };
  let h = d.zh_relevancia ? `<p><b>Mennyire jön a zh-n?</b> ${esc(d.zh_relevancia)}</p>` : '';
  if (id === 'minta') {
    const e = d.szerkezet.elmelet;
    h += `<p>${esc(d.szerkezet.idotartam)}. Elmélet: ${esc(e.pontok)}. Gyakorlat: ${d.szerkezet.gyakorlat.pont} pont.</p>
      <h2>Tanári tippek (2026. 10. 29.)</h2>${rv(d.tanari_tippek_2026_10_29)}
      <h2>Elmélet a minta-ZH-ban</h2><h3>Teszt</h3>${rv(e.teszt)}<p>${esc(e.teszt_megjegyzes)}</p>
      <h3>Mérlegséma</h3><p>${esc(e.merlegsema)}</p><h3>Alapelv</h3><p>${esc(e.alapelv)}</p><h3>Fogalom</h3><p>${esc(e.fogalom)}</p>
      <h2>Gyakorlat</h2><p>${esc(d.szerkezet.gyakorlat.feladat1)}<br>${esc(d.szerkezet.gyakorlat.feladat2)}</p><p>A két feladat a <button class="link" data-tasks="minta">Feladatok</button> között soronként gyakorolható.</p>`;
  }
  if (id === 'merleg') {
    const tb = (rows, title) => `<h2>${title}</h2><table class="l sch hide">${rows.map(r => `<tr><td>${r.sorszam}.</td><td>${esc(r.jel)}</td><td class="m"${r.szint === 'tétel' ? '' : ' style="font-weight:600"'}>${esc(r.megnevezes)}</td><td>${esc((r.szamlak || []).join(', '))}</td></tr>`).join('')}</table>`;
    h += `<p><b>Oszlopok:</b> ${esc(d.oszlopok.join(' | '))}. ${esc(d.oszlop_megjegyzes)}</p>
      <p><b>Fejből tanulás:</b> a sorok neve rejtve van; gondold végig, aztán koppints rá. <button class="link" id="showall">Mind látszik / mind rejtve</button></p>
      ${tb(d.eszkoz_oldal, 'Eszközök (aktívák)')}${tb(d.forras_oldal, 'Források (passzívák)')}
      <h2>Eredménykimutatás (összköltséges)</h2><p>${esc(d.eredmenykimutatas_osszkoltseges.megjegyzes)}</p>${rv(d.eredmenykimutatas_osszkoltseges.sorok)}`;
  }
  if (d.fogalmak?.length) h += `<h2>Fogalmak</h2><p>A zh-n 7 pontos fogalom-kérdés lesz: a kulcselemeket kell leírnod.</p>` + d.fogalmak.slice().sort((a, b) => order[a.zh_valoszinuseg] - order[b.zh_valoszinuseg]).map(f =>
    `<details><summary>${esc(f.nev)}<span class="tag">${prob[f.zh_valoszinuseg] || ''}</span></summary><p>${esc(f.definicio)}</p>${f.kulcselemek?.length ? `<div class="label">Kulcselemek</div>${rv(f.kulcselemek)}` : ''}${f.pelda ? `<p><b>Példa:</b> ${esc(f.pelda)}</p>` : ''}</details>`).join('');
  if (d.szabalyok?.length) h += `<h2>Szabályok</h2>` + d.szabalyok.map(s => `<details><summary>${esc(s.cim)}</summary><p>${esc(s.tartalom)}</p></details>`).join('');
  if (d.osszefuggesek?.length) h += `<h2>Összefüggések, képletek</h2>` + d.osszefuggesek.map(o => `<details><summary>${esc(o.cim)}</summary><p>${esc(o.leiras)}</p>${o.keplet ? `<p><b>${esc(o.keplet)}</b></p>` : ''}</details>`).join('');
  if (d.konyvelesi_minta?.length) h += `<h2>Könyvelési minták</h2><table class="l sch"><tr><th>Esemény</th><th>T</th><th>K</th><th>Összeg</th></tr>${d.konyvelesi_minta.map(k => `<tr><td>${esc(k.esemeny)}${k.megjegyzes ? `<br><small style="color:var(--muted)">${esc(k.megjegyzes)}</small>` : ''}</td><td>${esc(k.T)}</td><td>${esc(k.K)}</td><td>${esc(k.osszeg ?? '')}</td></tr>`).join('')}</table>`;
  if (d.csapdak?.length) h += `<h2>Csapdák</h2>${rv(d.csapdak)}`;
  if (d.elteresek_a_forrasban?.length) h += `<h2>Hibák a forrásban (javítva)</h2>${rv(d.elteresek_a_forrasban)}`;
  page(t.name, 'Elmélet', h, id);
  const sa = $('#showall'); if (sa) sa.onclick = () => app.querySelectorAll('table.sch').forEach(x => x.classList.toggle('hide'));
  app.querySelectorAll('.hide td.m').forEach(td => td.onclick = () => td.classList.remove('m'));
}

function page(title, eyebrow, html, id) {
  Q = null;
  app.innerHTML = `${crumbs(title)}<div class="eyebrow">${eyebrow}</div><h1>${title}</h1><div class="theory">${html}</div>
    <div class="row" style="margin-top:28px">${id && questions(id).length ? `<button class="btn" id="go">Kérdések</button>` : ''}${id && drills(id).length ? `<button class="link" id="dr">Könyvelés gyakorlása</button>` : ''}${id && tasks(id).length ? `<button class="link" id="ts">Feladatok</button>` : ''}<button class="link" id="home">Témák</button></div>`;
  $('#back').onclick = home; $('#home').onclick = home;
  if ($('#go')) $('#go').onclick = () => quiz(id);
  if ($('#dr')) $('#dr').onclick = () => drill(id);
  if ($('#ts')) $('#ts').onclick = () => taskList(id);
  app.querySelectorAll('.theory [data-tasks]').forEach(b => b.onclick = () => taskList(b.dataset.tasks));
  scrollTo(0, 0);
}

// ---------- Kérdések ----------
let Q = null;
function quiz(id) {
  const all = shuffle(questions(id));
  Q = { id, list: all.slice(0, store.n), i: 0, res: [] };
  if (!Q.list.length) return home();
  showQ();
}

function showQ() {
  const q = Q.list[Q.i], okN = Q.res.filter(r => r && r.ok).length, done = Q.res.filter(Boolean).length;
  const opts = q.kind === 'choice' || q.kind === 'multi' ? `<div class="opts">${q.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${q.tf ? '' : 'ABCDEFGH'[i]}</span><span class="v">${esc(o)}</span></button>`).join('')}</div>` : '';
  const pairs = q.kind === 'pair' ? (() => { const vals = shuffle([...new Set(q.pairs.map(p => p[1]))]); return q.pairs.map(([k], i) => `<div class="pair"><span>${esc(k)}</span><select data-p="${i}"><option value="">válassz…</option>${vals.map(v => `<option>${esc(v)}</option>`).join('')}</select></div>`).join(''); })() : '';
  const tipOk = q.kind === 'choice' && !q.tf || q.kind === 'multi' || q.kind === 'pair';
  app.innerHTML = `
    <div class="qhead"><div class="bar"><span>${nameOf(Q.id)}</span><span>${okN} helyes · ${done} / ${Q.list.length}</span><button class="link" id="quit">Kilépés</button></div>
      <div class="strip">${Q.list.map((_, k) => `<button class="${k === Q.i ? 'cur' : ''}${Q.res[k] ? Q.res[k].ok ? ' r' : ' w' : ''}" data-go="${k}">${k + 1}</button>`).join('')}</div></div>
    <div class="qnum">${Q.i + 1}. kérdés · ${nameOf(q.tid)}</div><div class="qtext">${q.q}</div>
    ${opts}${pairs}
    <div class="tipx"></div>
    <div class="row" id="acts">${q.kind === 'multi' || q.kind === 'pair' ? '<button class="btn" id="check">Ellenőrzés</button>' : ''}${q.kind === 'card' ? '<button class="btn" id="reveal">Megoldás mutatása</button>' : ''}${tipOk ? '<button class="link" id="tip">Tipp</button>' : ''}</div>
    <div class="fbx"></div>
    <div class="qnav row">${Q.i > 0 ? '<button class="btn ghost" data-step="-1">Előző</button>' : ''}${Q.i < Q.list.length - 1 ? `<button class="btn${Q.res[Q.i] ? '' : ' ghost'}" id="next" data-step="1">${Q.res[Q.i] ? 'Következő' : 'Kihagyom'}</button>` : ''}${done === Q.list.length ? '<button class="btn" id="res">Eredmény</button>' : ''}</div>`;
  $('#quit').onclick = () => { if (!done || confirm('Kilépsz? Ez a kör nem kerül mentésre.')) home(); };
  app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { Q.i = +b.dataset.go; showQ(); });
  app.querySelectorAll('[data-step]').forEach(b => b.onclick = () => { Q.i += +b.dataset.step; showQ(); });
  if ($('#res')) $('#res').onclick = result;
  const r = Q.res[Q.i];
  if (r) return paintQ(q, r);
  const sel = new Set();
  app.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    if (q.kind === 'choice') return answerQ(q, { pick: [i], ok: q.right[0] === i });
    sel.has(i) ? sel.delete(i) : sel.add(i); b.classList.toggle('sel');
  });
  if ($('#check')) $('#check').onclick = () => {
    if (q.kind === 'multi') return answerQ(q, { pick: [...sel], ok: sel.size === q.right.length && q.right.every(i => sel.has(i)) });
    const picks = [...app.querySelectorAll('select')].map(s => s.value);
    answerQ(q, { picks, ok: q.pairs.every(([, v], i) => picks[i] === v) });
  };
  if ($('#reveal')) $('#reveal').onclick = () => {
    $('#acts').innerHTML = '<span style="color:var(--muted);font-size:.9rem">Tudtad?</span><button class="btn" id="yes">Tudtam</button><button class="btn ghost" id="no">Nem tudtam</button>';
    $('.fbx').innerHTML = `<div class="fb"><div class="label" style="margin-top:0">Megoldás</div><div class="steps">${q.ans}</div>${q.mag ? `<div class="label">Magyarázat</div><p>${q.mag}</p>` : ''}</div>`;
    $('#yes').onclick = () => answerQ(q, { ok: true }); $('#no').onclick = () => answerQ(q, { ok: false });
  };
  if ($('#tip')) $('#tip').onclick = () => {
    let t;
    if (q.kind === 'choice') {
      const w = shuffle(q.opts.map((_, i) => i).filter(i => !q.right.includes(i)))[0], b = app.querySelector(`.opt[data-i="${w}"]`);
      b.disabled = true; b.classList.add('dim'); t = `Ez biztosan nem jó: <b>${esc(q.opts[w])}</b>`;
    } else if (q.kind === 'multi') t = `${q.right.length} helyes válasz van.`;
    else { const [k, v] = q.pairs[0]; t = `Az első párt megmutatom: ${esc(k)} → <b>${esc(v)}</b>`; }
    $('.tipx').innerHTML = `<div class="tip"><div class="label">Tipp</div>${t}</div>`; $('#tip').remove();
  };
}

function answerQ(q, r) {
  Q.res[Q.i] = r;
  if (r.ok) delete store.wrong[q.id]; else store.wrong[q.id] = 1;
  save(); showQ();
  $('.fbx').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function paintQ(q, r) {
  $('#acts').innerHTML = '';
  app.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; b.classList.add(q.right.includes(j) ? 'right' : (r.pick || []).includes(j) ? 'wrong' : 'dim'); });
  app.querySelectorAll('select').forEach((s, i) => { s.value = r.picks[i]; s.disabled = true; s.style.borderColor = r.picks[i] === q.pairs[i][1] ? 'var(--ok)' : 'var(--bad)'; });
  const wrongPick = q.kind === 'choice' && !r.ok ? q.opts[r.pick[0]] : null;
  $('.fbx').innerHTML = `<div class="fb${r.ok ? '' : ' no'}"><h3>${r.ok ? (q.kind === 'card' ? 'Tudtad' : 'Helyes') : (q.kind === 'card' ? 'Ismételd át' : 'Nem jó')}</h3>
    ${wrongPick ? `<p><b>Miért nem „${esc(wrongPick)}”?</b> ${q.mag || 'Lásd a helyes választ és az elméletet.'}</p>` : ''}
    ${r.ok && q.kind !== 'card' ? '' : `<div class="label">Helyes válasz</div><div class="steps">${q.ans}</div>`}
    ${q.mag && !wrongPick ? `<div class="label">Magyarázat</div><p>${q.mag}</p>` : ''}</div>`;
  const n = $('#next'); if (n) n.focus({ preventScroll: true });
}

function result() {
  const okN = Q.res.filter(r => r && r.ok).length, n = Q.list.length, pct = Math.round(okN / n * 100), id = Q.id;
  store.hist.push({ name: nameOf(id) + ' · kérdések', ok: okN, n, pct, date: now() }); store.hist = store.hist.slice(-200); save();
  const missed = Q.list.filter((q, k) => !Q.res[k] || !Q.res[k].ok);
  Q = null;
  app.innerHTML = `<div class="eyebrow">Eredmény · ${nameOf(id)}</div><div class="score">${pct}%</div><p class="lead">${okN} / ${n} helyes.</p>
    <div class="row" style="margin:20px 0"><button class="btn" id="again">Új kör</button><button class="btn ghost" id="home">Témák</button></div>
    ${missed.length ? `<h2 style="margin-top:28px">Átnézendő</h2>${missed.map(q => `<details><summary>${q.q.replace(/<[^>]+>/g, ' ').slice(0, 120)}</summary><div class="steps">${q.ans}</div>${q.mag ? `<p>${q.mag}</p>` : ''}</details>`).join('')}` : ''}`;
  $('#again').onclick = () => quiz(id); $('#home').onclick = home; scrollTo(0, 0);
}

// ---------- Könyvelési gyakorló: T és K beírása ----------
const tkRow = (t, k) => `<div class="tk" data-k="${k}"><label>T</label><input inputmode="numeric" autocomplete="off" data-s="T" aria-label="Tartozik számla"><label>K</label><input inputmode="numeric" autocomplete="off" data-s="K" aria-label="Követel számla"><button class="btn" data-check>Ellenőrzés</button><button class="link" data-tip>Tipp</button></div><div class="res"></div>`;
const solLine = t => `Megoldás: <b>T ${esc(t.T)} / K ${esc(t.K)}</b>${t.osszeg !== undefined && t.osszeg !== '' ? ` · ${fmt(t.osszeg)}` : ''}${t.szamitas ? ` (${esc(t.szamitas)})` : ''}${t.megjegyzes ? `<br>${esc(t.megjegyzes)}` : ''}`;

// Egy tétel ellenőrzése a saját blokkjában; visszaadja, hogy helyes volt-e.
function bindTk(box, t, done) {
  const [iT, iK] = box.querySelectorAll('input'), res = box.nextElementSibling;
  const check = () => {
    if (box.dataset.done) return;
    const a = sameAcct(iT.value, t.T), b = sameAcct(iK.value, t.K);
    iT.className = a ? 'r' : 'w'; iK.className = b ? 'r' : 'w';
    res.className = 'res ' + (a && b ? 'ok' : 'no');
    res.innerHTML = (a && b ? 'Helyes. ' : 'Nem jó. ') + solLine(t);
    box.dataset.done = 1; box.querySelector('[data-check]').remove(); box.querySelector('[data-tip]')?.remove();
    done && done(a && b);
  };
  box.querySelector('[data-check]').onclick = check;
  box.querySelector('[data-tip]').onclick = e => { res.innerHTML = `Tipp: T ${clsHint(t.T)}, K ${clsHint(t.K)}`; e.target.remove(); };
  [iT, iK].forEach((x, j) => x.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); j === 0 && !iK.value ? iK.focus() : check(); } });
  return check;
}

function drill(id) {
  const D2 = { id, list: shuffle(drills(id)).slice(0, store.n), i: 0, ok: 0 };
  const step = () => {
    if (D2.i >= D2.list.length) {
      const pct = Math.round(D2.ok / D2.list.length * 100);
      store.hist.push({ name: nameOf(id) + ' · könyvelés', ok: D2.ok, n: D2.list.length, pct, date: now() }); save();
      app.innerHTML = `<div class="eyebrow">Könyvelés · ${nameOf(id)}</div><div class="score">${pct}%</div><p class="lead">${D2.ok} / ${D2.list.length} tétel helyes.</p>
        <div class="row" style="margin:20px 0"><button class="btn" id="again">Új kör</button><button class="btn ghost" id="home">Témák</button></div>`;
      $('#again').onclick = () => drill(id); $('#home').onclick = home; return;
    }
    const t = D2.list[D2.i];
    app.innerHTML = `<div class="qhead"><div class="bar"><span>Könyvelés · ${nameOf(id)}</span><span>${D2.ok} helyes · ${D2.i} / ${D2.list.length}</span><button class="link" id="quit">Kilépés</button></div></div>
      <div class="qnum">${D2.i + 1}. tétel${t.src ? ` · ${esc(t.src)}` : ''}</div>
      <div class="qtext">${esc(t.esemeny)}</div>
      <p class="hint">Írd be a Tartozik és a Követel számla számát (3–4 jegy). Az összeget számold ki papíron, ellenőrzés után látod.</p>
      ${tkRow(t, 0)}
      <div class="qnav row"><button class="btn ghost" id="next">Következő</button></div>`;
    const box = app.querySelector('.tk');
    bindTk(box, t, ok => { if (ok) D2.ok++; $('#next').className = 'btn'; $('#next').focus(); });
    box.querySelector('input').focus();
    $('#next').onclick = () => { D2.i++; step(); };
    $('#quit').onclick = home;
  };
  Q = null; step();
}

// ---------- Teljes feladatok ----------
function taskList(id) {
  const t = topic(id), ts = tasks(id);
  page(t.name, 'Feladatok', `<p>Olvasd el a feladatot, és tételenként írd be a számlaszámokat. Az összeget papíron számold ki, ellenőrzés után látod a megoldást.</p>
    <ul class="topics">${ts.map((f, i) => `<li class="topic"><span class="num">${p2(i + 1)}</span><div class="body"><div class="name">${esc(f.cim)}</div><div class="sub">${((f.megoldas || {}).tetelek || []).length} könyvelési tétel</div><div class="act"><button class="btn" data-task="${i}">Megnyitás</button></div></div></li>`).join('')}</ul>`, null);
  app.querySelectorAll('[data-task]').forEach(b => b.onclick = () => task(id, +b.dataset.task));
}

function task(id, i) {
  const f = tasks(id)[i], m = f.megoldas || {}, tt = m.tetelek || [];
  let ok = 0, done = 0;
  const rows = tt.map((t, k) => `<div class="tetel"><div class="ev"><span>${esc(t.sorszam ?? k + 1)}.</span>${esc(t.esemeny || '')}</div>${isAcct(t.T) && isAcct(t.K) ? tkRow(t, k) : `<button class="link" data-show="${k}">Megoldás mutatása</button><div class="res" id="s${k}"></div>`}</div>`).join('');
  app.innerHTML = `${crumbs(esc(topic(id).name))}<div class="eyebrow">Teljes feladat</div><h1>${esc(f.cim)}</h1>
    <div class="theory"><p>${esc(f.szoveg || '')}</p>${f.adatok ? `<div class="label">Adatok</div>${rv(f.adatok)}` : ''}${f.kerdesek ? `<div class="label">Kérdések</div>${rv(f.kerdesek)}` : ''}
    ${m.szamitasok?.length ? `<details><summary>Mellékszámítások (megoldás)</summary>${rv(m.szamitasok.map(s => ({ mit: s.mit, képlet: s.keplet, eredmény: s.eredmeny })))}</details>` : ''}
    ${m.egyeb && Object.values(m.egyeb).some(v => v && (v.length ?? Object.keys(v).length)) ? `<details><summary>Kalkuláció, kimutatás (megoldás)</summary>${Object.entries(m.egyeb).filter(([, v]) => v).map(([k, v]) => `<div class="label">${esc(k.replace(/_/g, ' '))}</div>${rv(v)}`).join('')}</details>` : ''}</div>
    ${tt.length ? `<h2 style="margin-top:28px">Könyvelés <span class="tag" id="sum"></span></h2>${rows}` : '<p class="lead">Ennél a feladatnál nincs könyvelési tétel, a megoldás a fenti számításokban van.</p>'}
    ${f.tanulsagok?.length ? `<h2 style="margin-top:28px">Tanulságok</h2><div class="theory">${rv(f.tanulsagok)}</div>` : ''}
    ${f.elteresek_a_forrasban?.length ? `<h2 style="margin-top:28px">Hibák a forrásban (javítva)</h2><div class="theory">${rv(f.elteresek_a_forrasban)}</div>` : ''}
    <div class="qnav row"><button class="btn ghost" id="all">Mindet ellenőrzöm</button><button class="link" id="list">Feladatok</button><button class="link" id="home">Témák</button></div>`;
  const checks = [];
  const n = tt.filter(t => isAcct(t.T) && isAcct(t.K)).length;
  const upd = () => { const s = $('#sum'); if (s) s.textContent = `${ok} helyes · ${done} / ${n}`; if (done === n && n) { store.hist.push({ name: f.cim, ok, n, pct: Math.round(ok / n * 100), date: now() }); save(); } };
  app.querySelectorAll('.tk').forEach(box => checks.push(bindTk(box, tt[+box.dataset.k], r => { done++; if (r) ok++; upd(); })));
  app.querySelectorAll('[data-show]').forEach(b => b.onclick = () => { $('#s' + b.dataset.show).innerHTML = solLine(tt[+b.dataset.show]); b.remove(); });
  $('#all').onclick = () => checks.forEach(c => c());
  $('#back').onclick = home; $('#home').onclick = home; $('#list').onclick = () => taskList(id);
  upd(); scrollTo(0, 0);
}

addEventListener('keydown', e => {
  if (!Q || e.ctrlKey || e.metaKey || e.altKey || /INPUT|SELECT/.test(document.activeElement?.tagName)) return;
  const q = Q.list[Q.i], k = e.key.toLowerCase(), idx = '12345'.indexOf(k);
  if (!Q.res[Q.i] && q.kind === 'choice' && idx >= 0 && idx < q.opts.length) app.querySelector(`.opt[data-i="${idx}"]`)?.click();
  else if (k === 'enter' && Q.res[Q.i] && document.activeElement?.tagName !== 'BUTTON') ($('#res') || $('#next'))?.click();
});

Promise.all(TOPICS.map(t => fetch('anyag/' + t.file).then(r => r.json()).then(j => { D[t.file] = j; })))
  .then(home)
  .catch(e => { app.innerHTML = `<h1>Nem töltődött be az anyag</h1><p>${esc(e.message)}</p><p>Helyi megnyitáshoz webszerver kell (pl. <code>npx serve</code>), a fájl közvetlen megnyitása nem működik.</p>`; });

if (typeof module !== 'undefined') module.exports = { TOPICS, D, questions, drills, tasks, sameAcct, isAcct };
