// Feladatgenerátorok és elmélet. Minden generátor egy {q, opts, sol} objektumot ad vissza.
// opts: 4 db {t, ok?, why?}; pontosan egy helyes. Az összegek ezer Ft-ban, egész számok.
// A képletek KaTeX-szel jelennek meg: szövegben $…$, külön blokkban fx(...) (soronként egy számolási lépés).

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[R(0, a.length - 1)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = R(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, k) => shuffle(a.slice()).slice(0, k);
const sum = a => a.reduce((s, x) => s + x, 0);
const cap = s => s[0].toUpperCase() + s.slice(1);
// Magyar számírás: ezres tagolás nem törő szóközzel (12 350), negatív előjel: −.
const f = x => Number.isFinite(x) ? (x < 0 ? '−' : '') + String(Math.round(Math.abs(x))).replace(/\B(?=(\d{3})+$)/g, '\u00a0') : '–';
const sg = x => (x > 0 ? '+' : '') + f(x);
const F = x => f(x) + ' ezer Ft';
const tbl = (head, rows) => `<table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
// Táblázat balra zárt első oszloppal (tételnevek).
const ltbl = (head, rows) => tbl(head, rows).replace('<table>', '<table class="l">');

// ---------- Képletek ----------
// TeX`…` = String.raw: a backslash-ek maradnak, a ${…} behelyettesítés működik.
const TeX = String.raw;
const tex = s => String(s).replace(/\u00a0/g, '\\,').replace(/−/g, '-').replace(/(^|[^\\])%/g, '$1\\%');
const im = s => `$${tex(s)}$`;
const REL = /(=|\\approx|\\to|\\le|\\ge|\\ne|\\lt|\\gt)/;
const al = l => l.includes('&') ? l : REL.test(l) ? l.replace(REL, '&$1') : '&' + l;
const fx = (...lines) => `<div class="fx">$$\\begin{aligned}${lines.map(l => tex(al(l))).join(' \\\\ ')}\\end{aligned}$$</div>`;
const ng = v => /^[-−]/.test(String(v)) ? `(${v})` : v;
const tx = s => `\\text{${s}}`;

const steps = (...xs) => `<ol class="sol">${xs.filter(Boolean).map(([t, b]) => `<li><span class="sh">${t}</span>${b}</li>`).join('')}</ol>`;
const para = s => `<p>${s}</p>`;
const hl = x => `<b>${x}</b>`;

const FALLBACK = 'Ez az érték egyik tipikus számolásból sem jön ki, valószínűleg számolási hiba. Nézd meg a levezetést.';

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

// ---------- 1. Kiadás és költség ----------
const KK = ['Kiadás és költség is', 'Kiadás, de nem költség', 'Költség, de nem kiadás', 'Se nem kiadás, se nem költség'];
const KKL = KK.map(s => s[0].toLowerCase() + s.slice(1));
// Esemény: [szöveg(összeg), kiadás?, költség?, magyarázat]. Kiadás = ebben az időszakban kifizetett pénz
// (hitelre vásárlás nincs a feladatokban, így a tágabb értelmezés is ugyanezt adja).
const EVENTS = [
  [a => `Anyagot vásároltak készpénzért ${a} értékben, raktárra. Az időszakban még nem használták fel.`, 1, 0, 'A pénz kiment, de az anyag még a raktárban van. Költség akkor lesz belőle, amikor felhasználják.'],
  [a => `Anyagot vásároltak készpénzért ${a} értékben, és még ebben az időszakban fel is használták.`, 1, 1, 'A pénz kiment (kiadás), és az anyagot ugyanebben az időszakban fel is használták (költség).'],
  [a => `Az előző évben vásárolt anyagból ${a} értékűt felhasználtak a termeléshez.`, 0, 1, 'Az anyag felhasználása költség. A pénz viszont tavaly ment ki, idén nincs kiadás.'],
  [a => `Termelőgépet vásároltak ${a} értékben, átutalással.`, 1, 0, 'A gép árát kifizették (kiadás), de a gép több évig szolgál: nem egyszerre lesz költség, hanem évente, az értékcsökkenésen keresztül.'],
  [a => `Elszámolták a gépek tárgyévi értékcsökkenését: ${a}.`, 0, 1, 'Az értékcsökkenés a gép elhasználódásának értéke, ez költség. Pénz nem megy ki: a gép árát a vásárláskor fizették ki.'],
  [a => `Kifizették a dolgozók tárgyhavi bérét: ${a}.`, 1, 1, 'A dolgozók munkáját ebben a hónapban használták fel (bérköltség), és ebben a hónapban ki is fizették (kiadás).'],
  [a => `Kifizették a tárgyhavi áramszámlát (a tárgyhavi fogyasztásra): ${a}.`, 1, 1, 'Az energia ebben a hónapban fogyott el (költség), és ebben a hónapban ki is fizették (kiadás).'],
  [a => `Kifizették a tárgyhavi irodatakarítás díját: ${a}.`, 1, 1, 'A szolgáltatást ebben a hónapban vették igénybe (költség), és ki is fizették (kiadás).'],
  [a => `Visszafizettek ${a} bankhitelt (tőketörlesztés).`, 1, 0, 'A törlesztés pénzkifizetés (kiadás), de a kölcsönkapott pénz visszaadása nem erőforrás-felhasználás, ezért nem költség.'],
  [a => `Osztalékot fizettek ki a tulajdonosoknak: ${a}.`, 1, 0, 'A pénz kiment (kiadás), de az osztalék a nyereség felosztása, nem a tevékenységhez felhasznált erőforrás.'],
  [a => `Előre kifizették a következő év bérleti díját: ${a}.`, 1, 0, 'A pénz most megy ki (kiadás), de a helyiséget csak jövőre használják, ezért a költség a jövő évé.'],
  [a => `Az előző évben előre kifizetett bérleti díjból ${a} az idei évre jut.`, 0, 1, 'A helyiséget idén használják, ez idei költség. A pénz viszont tavaly ment ki.'],
  [a => `Forgatási célú értékpapírt vásároltak ${a} értékben, átutalással.`, 1, 0, 'A pénz kiment (kiadás), de ez befektetés: a pénz helyett értékpapír van, erőforrást nem használtak fel.'],
  [a => `Termékeket adtak el, a vevő ${a}-t átutalt.`, 0, 0, 'Pénz jön be, nem megy ki: ez bevétel. Erőforrás-felhasználás sincs benne.'],
  [a => `Bankhitelt vettek fel, a bankszámlára ${a} érkezett.`, 0, 0, 'Pénz jön be, nem megy ki, és erőforrást sem használtak fel.'],
  [a => `A tulajdonosok ${a} tőkét fizettek be.`, 0, 0, 'Pénz jön be (a saját tőke nő), nem megy ki, és erőforrást sem használtak fel.'],
  [a => `Egy vevő ${a} előleget fizetett.`, 0, 0, 'Pénz jön be, nem megy ki, és erőforrást sem használtak fel.'],
];
const kkCat = e => e[1] && e[2] ? 0 : e[1] ? 1 : e[2] ? 2 : 3;
// Miért nem a j-edik kategória: ami a két kérdésből nem stimmel, plusz az esemény magyarázata.
function kkWhy(e, j) {
  const out = [];
  if ((j < 2) !== !!e[1]) out.push(e[1] ? 'Ez kiadás: ebben az időszakban pénz megy ki.' : 'Ez nem kiadás: ebben az időszakban nem megy ki pénz.');
  if ((j % 2 === 0) !== !!e[2]) out.push(e[2] ? 'Ez költség: ebben az időszakban erőforrást használtak fel a tevékenységhez.' : 'Ez nem költség: ebben az időszakban nem használtak fel erőforrást a tevékenységhez.');
  return out.join(' ') + ' ' + e[3];
}
const kkSol = e => steps(
  ['Megy ki pénz ebben az időszakban?', para(e[1] ? 'Igen, tehát <b>kiadás</b>.' : 'Nem, tehát <b>nem kiadás</b>.')],
  ['Felhasználtak erőforrást a tevékenységhez ebben az időszakban?', para(e[2] ? 'Igen, tehát <b>költség</b>.' : 'Nem, tehát <b>nem költség</b>.')],
  ['Eredmény', para(`${hl(KK[kkCat(e)])}. ${e[3]}`)]);
// Egy hónap eseményei: mind a négy kategóriából legalább egy, plusz kettő.
function kkData() {
  const es = [0, 1, 2, 3].map(c => pick(EVENTS.filter(e => kkCat(e) === c)));
  es.push(...sample(EVENTS.filter(e => !es.includes(e)), 2));
  return shuffle(es).map(e => ({ e, a: R(2, 40) * 50 }));
}
const kkList = xs => `<ol>${xs.map(x => `<li>${x.e[0](F(x.a))}</li>`).join('')}</ol>`;

const TERMS = ['Kiadás', 'Költség', 'Ráfordítás', 'Bevétel'];
const TDEF = [
  ['A vállalkozástól pénz áramlik ki (kifizetés), függetlenül attól, hogy a megvett dolgot mikor használják fel.', 'Pénzmozgáshoz kötött fogalom: akkor keletkezik, amikor a vállalkozás fizet.'],
  ['A tevékenység érdekében egy adott időszakban felhasznált erőforrások (anyag, munka, eszközök használata) pénzben kifejezett értéke.', 'Erőforrás-felhasználáshoz kötött fogalom: akkor keletkezik, amikor az anyagot, a munkát, a gépet ténylegesen felhasználják.'],
  ['Az időszak bevételeivel szemben elszámolt, az eredményt csökkentő tételek: az eladott teljesítmények költsége és az egyéb tételek (pl. bírság).', 'Eredményhez kötött fogalom: a bevételekből ezt levonva kapjuk az eredményt.'],
  ['A vállalkozáshoz befolyó ellenérték, például az eladott termékek ára; az eredményt növeli.', 'Az értékesítésből vagy más ügyletből származó, az eredményt növelő tétel.'],
];
const TWHY = [
  'A kiadás pénzkifizetés: a pénz kiáramlásáról szól, nem a felhasználásról vagy az eredményről.',
  'A költség erőforrás-felhasználás az adott időszakban (anyag, munka, gép elhasználódása), nem a pénz mozgása vagy az eredmény.',
  'A ráfordítás az eredményhez kötött: a bevételekkel szemben elszámolt, eredményt csökkentő tétel.',
  'A bevétel befolyó ellenérték, az eredményt növeli; itt nem befolyásról van szó.',
];

const kkGens = [
  function kkClassify(x, i) {
    const e = x ? x.e : pick(EVENTS), a = x ? x.a : R(2, 40) * 50, c = kkCat(e);
    return Q(`${x ? `Az események közül ${AZ(i + 1)} ${i + 1}. sorszámú:<br>` : ''}${e[0](F(a))}<br>Hogyan minősül ez az esemény az adott időszakban?`, KK[c],
      KK.map((k, j) => [k, kkWhy(e, j)]).filter((_, j) => j !== c), kkSol(e));
  },
  function kkExample() {
    const c = R(0, 3), by = k => EVENTS.filter(e => kkCat(e) === k), A = () => F(R(2, 40) * 50);
    const right = pick(by(c)), wr = [0, 1, 2, 3].filter(k => k !== c).map(k => pick(by(k)));
    return Q(`Melyik esemény <b>${KKL[c]}</b>?`, right[0](A()), wr.map(e => [e[0](A()), `Ez ${KKL[kkCat(e)]}. ${e[3]}`]), kkSol(right));
  },
  function kkSum(xs, w) {
    const st = xs ? '' : `Egy vállalkozás egy hónapjának eseményei:${kkList(xs = kkData())}`;
    w = w || pick(['k', 'c']);
    const S = p => xs.filter(x => p(x.e)), V = p => sum(S(p).map(x => x.a));
    const K = V(e => e[1]), C = V(e => e[2]), KC = V(e => e[1] && e[2]), KN = V(e => e[1] && !e[2]), CN = V(e => e[2] && !e[1]), ALL = V(() => 1);
    const [ask, name, p, res, wrongs] = {
      k: ['a hónap <b>kiadása</b>', 'Kiadás', e => e[1], K, [
        [C, 'Ez a költségek összege. A kiadás a kifizetett pénz, akkor is, ha nem lett belőle (még) költség.'],
        [KC, 'Csak azokat számoltad, amelyek kiadások és költségek is. A gépvásárlás, a hiteltörlesztés, az osztalék és az előre fizetett díj is kiadás.'],
        [K + CN, 'A költség, de nem kiadás tételeket (pl. értékcsökkenés, korábban vett anyag felhasználása) is beszámoltad: ezeknél most nem megy ki pénz.'],
        [ALL, 'Mindent összeadtál, a befolyó pénzeket (eladás, hitelfelvétel, előleg) is.']]],
      c: ['a hónap <b>költsége</b>', 'Költség', e => e[2], C, [
        [K, 'Ez a kiadások összege. A költség az erőforrás-felhasználás, akkor is, ha most nem megy ki érte pénz.'],
        [KC, 'Csak azokat számoltad, amelyek kiadások is. Az értékcsökkenés és a korábban vett anyag felhasználása is költség, pedig most nem megy ki pénz.'],
        [C + KN, 'A kiadás, de nem költség tételeket (pl. gépvásárlás, hiteltörlesztés, raktárra vett anyag) is beszámoltad: ezek nem erőforrás-felhasználások.'],
        [ALL, 'Mindent összeadtál, a befolyó pénzeket (eladás, hitelfelvétel, előleg) is.']]],
      kn: ['azoknak a tételeknek az összege, amelyek <b>kiadások, de nem költségek</b>', 'Kiadás, de nem költség', e => e[1] && !e[2], KN, [
        [K, 'Ez az összes kiadás. Ebből azokat is ki kell hagyni, amelyek költségek is.'],
        [CN, 'Fordítva: ezek költségek, de nem kiadások.'],
        [KC, 'Ezek kiadások és költségek is, tehát nem tartoznak ide.']]],
    }[w];
    return Q(`${st}Mennyi ${ask} (ezer Ft)?`, res, wrongs, steps(
      ['Minden esemény két kérdéssel', para('Megy ki pénz ebben az időszakban (kiadás)? Felhasználtak erőforrást a tevékenységhez (költség)?') +
        ltbl(['Esemény', 'Összeg', 'Kiadás?', 'Költség?'], xs.map((x, i) => { const r = [`${i + 1}.`, f(x.a), x.e[1] ? 'igen' : 'nem', x.e[2] ? 'igen' : 'nem']; return p(x.e) ? r.map(hl) : r; }))],
      ['Összeadás', fx(`${tx(name)} = ${S(p).map(x => f(x.a)).join(' + ')}`, `= ${f(res)}`)],
      ['Miért így?', `<ul>${xs.map((x, i) => `<li>${i + 1}. ${KKL[kkCat(x.e)]}: ${x.e[3]}</li>`).join('')}</ul>`]), f);
  },
  function kkDef() {
    const k = R(0, 3), def = pick(TDEF[k]);
    return Q(`Melyik fogalomra illik ez a meghatározás?<br>„${def}”`, TERMS[k], TERMS.map((t, j) => [t, TWHY[j]]).filter((_, j) => j !== k), steps(
      ['Mihez kötődik a meghatározás?', para(`${hl(TERMS[k])}: ${TDEF[k][1]}`)],
      ['A négy fogalom egymás mellett', ltbl(['Fogalom', 'Mihez kötődik?', 'Példa'], [['Kiadás', 'pénz kiáramlása', 'gépvásárlás átutalással'], ['Költség', 'erőforrás-felhasználás', 'anyagfelhasználás, bér, értékcsökkenés'], ['Ráfordítás', 'eredménycsökkentő tétel', 'eladott termékek költsége, bírság'], ['Bevétel', 'eredménynövelő ellenérték', 'árbevétel']].map((r, j) => j === k ? r.map(hl) : r))]));
  },
];

// ---------- 2. Mérleg ----------
const GR = ['Befektetett eszközök', 'Forgóeszközök', 'Saját tőke', 'Kötelezettségek'];
const GL = ['A.', 'B.', 'D.', 'F.'];
const GDEF = [
  'A befektetett eszközök tartósan, egy évnél tovább szolgálják a vállalkozást.',
  'A forgóeszközök egy éven belül elhasználódnak vagy pénzzé válnak (készlet, követelés, értékpapír, pénz).',
  'A saját tőke a tulajdonosoktól származó és a vállalkozásban felhalmozott forrás.',
  'A kötelezettség idegen forrás: tartozás, amit egyszer ki kell fizetni.',
];
// Mérlegtétel: név, csoport (GR index), alcsoport, miért oda tartozik.
const BS = [
  ['Épületek', 0, 'tárgyi eszköz', 'tartósan, több évig szolgálja a vállalkozást (tárgyi eszköz).'],
  ['Telek', 0, 'tárgyi eszköz', 'tartósan a vállalkozásé, nem használódik el egy éven belül (tárgyi eszköz).'],
  ['Termelőgépek', 0, 'tárgyi eszköz', 'több évig használják a termelésben (tárgyi eszköz).'],
  ['Tehergépkocsik', 0, 'tárgyi eszköz', 'több évig használják (tárgyi eszköz).'],
  ['Több évre vásárolt szoftverlicenc', 0, 'immateriális jószág', 'nem fizikai, de több évig szolgál (immateriális jószág).'],
  ['Szabadalom', 0, 'immateriális jószág', 'több évig hasznosítható jog (immateriális jószág).'],
  ['Tartós részesedés más vállalkozásban', 0, 'befektetett pénzügyi eszköz', 'hosszú távra szóló befektetés (befektetett pénzügyi eszköz).'],
  ['Anyagok', 1, 'készlet', 'egy éven belül felhasználják a termelésben (készlet).'],
  ['Késztermékek', 1, 'készlet', 'eladásra várnak, egy éven belül pénzzé válnak (készlet).'],
  ['Áruk', 1, 'készlet', 'továbbeladásra vett javak, egy éven belül eladják (készlet).'],
  ['Vevőkkel szembeni követelések', 1, 'követelés', 'a vevők tartoznak a vállalkozásnak, hamarosan pénzzé válik (követelés). A vevő tartozik nekünk, ezért ez eszköz.'],
  ['Forgatási célú értékpapírok', 1, 'értékpapír', 'rövid távra, továbbeladásra vették (forgóeszköz). Csak a tartós befektetés lenne befektetett eszköz.'],
  ['Pénztár (készpénz)', 1, 'pénzeszköz', 'a vállalkozás pénze (pénzeszköz).'],
  ['Bankszámla egyenlege', 1, 'pénzeszköz', 'a vállalkozás pénze a bankban (pénzeszköz).'],
  ['Jegyzett tőke', 2, 'saját tőke', 'a tulajdonosok által befizetett, cégjegyzékbe bejegyzett tőke (saját tőke).'],
  ['Tőketartalék', 2, 'saját tőke', 'a tulajdonosok jegyzett tőkén felüli befizetése (saját tőke).'],
  ['Eredménytartalék', 2, 'saját tőke', 'a korábbi évek fel nem osztott, benntartott nyeresége (saját tőke).'],
  ['Tárgyévi adózott eredmény', 2, 'saját tőke', 'az idei év nyeresége adózás után, a tulajdonosoké (saját tőke).'],
  ['Szállítókkal szembeni kötelezettségek', 3, 'rövid lejáratú', 'a vállalkozás tartozik a szállítóinak (rövid lejáratú kötelezettség). Mi tartozunk a szállítónak, ezért ez forrás.'],
  ['Hosszú lejáratú beruházási hitel', 3, 'hosszú lejáratú', 'a banktól kapott, egy éven túl visszafizetendő hitel (hosszú lejáratú kötelezettség).'],
  ['Rövid lejáratú bankhitel', 3, 'rövid lejáratú', 'egy éven belül visszafizetendő hitel (rövid lejáratú kötelezettség).'],
  ['Fizetendő társasági adó', 3, 'rövid lejáratú', 'az állam felé fennálló adótartozás (rövid lejáratú kötelezettség).'],
  ['Dolgozóknak fizetendő bér', 3, 'rövid lejáratú', 'a dolgozók felé fennálló tartozás (rövid lejáratú kötelezettség).'],
  ['Vevőktől kapott előleg', 3, 'rövid lejáratú', 'a vevő előre fizetett, a vállalkozás még tartozik a teljesítéssel (rövid lejáratú kötelezettség). A „vevő” szó ellenére nem követelés.'],
].map(([n, g, s, w]) => ({ n, g, s, w }));
const bsItem = n => BS.find(x => x.n === n);
const val = (n, v) => ({ ...bsItem(n), v });
const BS_STRUCT = ltbl(['Eszközök (mi van?)', 'Források (kié?)'], [['A. Befektetett eszközök', 'D. Saját tőke'], ['B. Forgóeszközök', 'E. Céltartalékok'], ['C. Aktív időbeli elhatárolások', 'F. Kötelezettségek'], ['', 'G. Passzív időbeli elhatárolások']]);

// Egyszerű mérleg; az eredménytartalék a kiegyenlítő tétel (a feladatokban ez hiányzik).
function bsData() {
  for (;;) {
    const fe = sample(BS.filter(x => x.g === 0), R(2, 3)).map(x => ({ ...x, v: R(10, 90) * 100 }));
    const fo = ['Anyagok', pick(['Késztermékek', 'Áruk']), 'Vevőkkel szembeni követelések', 'Forgatási célú értékpapírok', 'Bankszámla egyenlege', 'Pénztár (készpénz)'].map(n => val(n, R(2, 30) * 100));
    const st = ['Jegyzett tőke', ...(R(0, 1) ? ['Tőketartalék'] : []), 'Tárgyévi adózott eredmény'].map(n => val(n, n === 'Jegyzett tőke' ? R(10, 50) * 100 : R(2, 15) * 100));
    const ko = ['Szállítókkal szembeni kötelezettségek', 'Vevőktől kapott előleg', ...sample(['Hosszú lejáratú beruházási hitel', 'Rövid lejáratú bankhitel', 'Fizetendő társasági adó', 'Dolgozóknak fizetendő bér'], R(1, 2))].map(n => val(n, R(3, 30) * 100));
    const E = sum([...fe, ...fo].map(x => x.v)), ret = E - sum([...st, ...ko].map(x => x.v));
    if (ret < 500) continue;
    st.splice(st.length - 1, 0, val('Eredménytartalék', ret));
    const all = [...fe, ...fo, ...st, ...ko], G = [0, 1, 2, 3].map(g => sum(all.filter(x => x.g === g).map(x => x.v)));
    return { all, G, E, ret, v: n => all.find(x => x.n === n).v };
  }
}
const bsStem = d => ltbl(['Mérlegtétel', 'ezer Ft'], shuffle(d.all.filter(x => x.n !== 'Eredménytartalék')).map(x => [x.n, f(x.v)]));
// A teljes mérleg két táblában; hi: kiemelendő csoportok (index), tételek (név) vagy 'E' (főösszeg).
function bsSheet(d, hi = []) {
  const m = (on, r) => on ? r.map(hl) : r;
  const side = (gs, title) => ltbl([title, 'ezer Ft'], [
    ...gs.flatMap(g => [m(hi.includes(g), [`${GL[g]} ${GR[g]}`, f(d.G[g])]), ...d.all.filter(x => x.g === g).map(x => m(hi.includes(x.n), [`<span class="in">${x.n}</span>`, f(x.v)]))]),
    m(hi.includes('E'), [`${title} összesen`, f(d.E)])]);
  return side([0, 1], 'Eszközök') + side([2, 3], 'Források');
}

const ET = ['Eszköz nő, forrás nő (a mérlegfőösszeg nő)', 'Eszköz csökken, forrás csökken (a mérlegfőösszeg csökken)', 'Eszközök között átrendeződés (a főösszeg nem változik)', 'Források között átrendeződés (a főösszeg nem változik)'];
const ETW = [
  'Ilyenkor mindkét oldalon nő valami: új eszköz jön, és új forrás (tartozás vagy tőke) fedezi.',
  'Ilyenkor mindkét oldalon csökken valami: eszközzel (pl. pénzzel) fizetünk ki egy forrást (pl. tartozást).',
  'Ilyenkor csak az eszközoldal változik: az egyik eszköz nő, egy másik ugyanannyival csökken.',
  'Ilyenkor csak a forrásoldal változik: az egyik forrás nő, egy másik ugyanannyival csökken.',
];
// Gazdasági esemény: [szöveg(összeg), típus (ET index), mi változik].
const BEV = [
  [a => `Bankhitelt vettek fel, a bankszámlán ${a} jóváírás érkezett.`, 0, 'Bankszámla (eszköz) +, bankhitel (kötelezettség) +.'],
  [a => `Anyagot vásároltak ${a} értékben, a számlát később fizetik.`, 0, 'Anyagok (eszköz) +, szállítói tartozás (kötelezettség) +.'],
  [a => `A tulajdonosok tőkeemelésként ${a}-t fizettek be a bankszámlára.`, 0, 'Bankszámla (eszköz) +, jegyzett tőke (saját tőke) +.'],
  [a => `A bankszámláról kiegyenlítettek ${a} szállítói tartozást.`, 1, 'Bankszámla (eszköz) −, szállítói tartozás (kötelezettség) −.'],
  [a => `A bankszámláról visszafizettek ${a} bankhitelt.`, 1, 'Bankszámla (eszköz) −, bankhitel (kötelezettség) −.'],
  [a => `A bankszámláról ${a} adótartozást fizettek be.`, 1, 'Bankszámla (eszköz) −, adótartozás (kötelezettség) −.'],
  [a => `A bankszámláról ${a} készpénzt vettek fel a pénztárba.`, 2, 'Pénztár (eszköz) +, bankszámla (eszköz) −.'],
  [a => `Egy vevő átutalta ${a} tartozását.`, 2, 'Bankszámla (eszköz) +, vevőkövetelés (eszköz) −.'],
  [a => `Gépet vásároltak ${a} értékben, a bankszámláról fizetve.`, 2, 'Gépek (eszköz) +, bankszámla (eszköz) −.'],
  [a => `Anyagot vásároltak készpénzért ${a} értékben.`, 2, 'Anyagok (eszköz) +, pénztár (eszköz) −.'],
  [a => `A bank rövid lejáratú hitelből közvetlenül kifizetett ${a} szállítói tartozást.`, 3, 'Bankhitel (kötelezettség) +, szállítói tartozás (kötelezettség) −.'],
  [a => `A tőketartalékból ${a}-t átvezettek a jegyzett tőkébe.`, 3, 'Jegyzett tőke +, tőketartalék − (mindkettő saját tőke).'],
  [a => `Az eredménytartalékból ${a} osztalékot hagytak jóvá, a kifizetés később lesz.`, 3, 'Fizetendő osztalék (kötelezettség) +, eredménytartalék (saját tőke) −.'],
];
const EFF = [a => `+${f(a)}`, a => `−${f(a)}`, () => '0', () => '0'];

const bsGens = [
  function bsClassify() {
    const it = pick(BS);
    return Q(`Hová kerül a mérlegben: <b>${it.n}</b>?`, GR[it.g], GR.map((g, j) => [g, `${GDEF[j]} „${it.n}”: ${it.w}`]).filter((_, j) => j !== it.g), steps(
      ['Eszköz vagy forrás?', para(it.g < 2 ? 'Eszköz: a vállalkozás rendelkezik vele, és hasznot hoz (mi van?).' : 'Forrás: azt mutatja, honnan van a vállalkozás vagyona (kié?).')],
      ['Melyik csoport?', para(`${hl(GR[it.g])} (${it.s}). „${it.n}”: ${it.w}`)],
      ['A mérleg szerkezete', BS_STRUCT]));
  },
  function bsEvent() {
    const e = pick(BEV), a = R(2, 40) * 50;
    return Q(`${e[0](F(a))}<br>Hogyan változik a mérleg?`, ET[e[1]], ET.map((t, j) => [t, `${ETW[j]} Itt: ${e[2]}`]).filter((_, j) => j !== e[1]), steps(
      ['Melyik két tétel változik?', para(e[2])],
      ['Melyik oldalon vannak?', para(e[1] < 2 ? 'Az egyik eszköz, a másik forrás: a mérleg két oldala együtt változik, ezért a főösszeg is.' : `Mindkettő ${e[1] === 2 ? 'eszköz' : 'forrás'}: ugyanazon az oldalon nő az egyik és csökken a másik, a főösszeg nem változik.`)],
      ['Eredmény', para(hl(ET[e[1]]))]));
  },
  function bsTotal(d, t) {
    const st = d ? '' : `Egy vállalkozás mérlegtételei (ezer Ft):${bsStem(d = bsData())}`;
    t = t === undefined ? pick([0, 1, 3, 'E']) : t;
    const pap = d.v('Forgatási célú értékpapírok'), adv = d.v('Vevőktől kapott előleg'), vev = d.v('Vevőkkel szembeni követelések');
    const items = t === 'E' ? d.all.filter(x => x.g < 2) : d.all.filter(x => x.g === t), res = t === 'E' ? d.E : d.G[t];
    const [ask, name, wrongs] = {
      0: ['a <b>befektetett eszközök</b> összege', 'Befektetett eszközök', [
        [d.G[0] + pap, 'A forgatási célú értékpapírt is beszámoltad. Ezt rövid távra, továbbeladásra vették: forgóeszköz. Csak a tartós befektetés lenne befektetett eszköz.'],
        [d.G[1], 'Ez a forgóeszközök összege.'], [d.E, 'Ez az összes eszköz (mérlegfőösszeg).']]],
      1: ['a <b>forgóeszközök</b> összege', 'Forgóeszközök', [
        [d.G[1] + adv, 'A vevőktől kapott előleget is beszámoltad. Ez kötelezettség: a vevő előre fizetett, a vállalkozás még tartozik a teljesítéssel.'],
        [d.G[1] - pap, 'Kihagytad a forgatási célú értékpapírt. Rövid távra, továbbeladásra vették, tehát forgóeszköz.'],
        [d.G[0], 'Ez a befektetett eszközök összege.'], [d.E, 'Ez az összes eszköz (mérlegfőösszeg).']]],
      3: ['a <b>kötelezettségek</b> összege', 'Kötelezettségek', [
        [d.G[3] - adv, 'Kihagytad a vevőktől kapott előleget. Ez kötelezettség: a vevő előre fizetett, a vállalkozás még tartozik a teljesítéssel.'],
        [d.G[3] + vev, 'A vevőkkel szembeni követelést is beszámoltad. Ez eszköz: a vevő tartozik a vállalkozásnak, nem fordítva.'],
        [d.E - d.G[3], 'Ez a saját tőke (eszközök − kötelezettségek).']]],
      E: ['a <b>mérlegfőösszeg</b>', 'Mérlegfőösszeg', [
        [2 * d.E, 'Az eszközöket és a forrásokat is összeadtad. A mérlegfőösszeg csak az egyik oldal összege; a két oldal egyenlő.'],
        [d.E + adv, 'A vevőktől kapott előleget eszköznek vetted. Ez kötelezettség (forrás).'],
        [d.G[1], 'Ez csak a forgóeszközök összege; a befektetett eszközök is az eszközoldalhoz tartoznak.'], [d.G[0], 'Ez csak a befektetett eszközök összege.']]],
    }[t];
    return Q(`${st}Mennyi ${ask} (ezer Ft)?`, res, wrongs, steps(
      ['Melyik tételek tartoznak ide?', para(t === 'E' ? 'A mérlegfőösszeg az eszközoldal összege (= a forrásoldal összege). Az eszközoldal minden tétele ismert, ezt adjuk össze.' : GDEF[t]) + para(items.map(x => x.n).join(', ') + '.')],
      ['Összeadás', fx(`${tx(name)} = ${items.map(x => f(x.v)).join(' + ')}`, `= ${f(res)}`)],
      ['A teljes mérleg', bsSheet(d, [t])]), f);
  },
  function bsMissing(d) {
    const st = d ? '' : `Egy vállalkozás mérlegtételei (ezer Ft):${bsStem(d = bsData())}`;
    const ST = d.G[2], K = d.G[3], others = d.all.filter(x => x.g === 2 && x.n !== 'Eredménytartalék'), adv = d.v('Vevőktől kapott előleg');
    return Q(`${st}Mennyi az <b>eredménytartalék</b> (ezer Ft)?`, d.ret, [
      [ST, 'Ez a teljes saját tőke (eszközök − kötelezettségek). Ebből még le kell vonni a többi saját tőke tételt.'],
      [d.E - sum(others.map(x => x.v)), 'A kötelezettségeket nem vontad le. A forrásoldalon a saját tőke mellett a kötelezettségek is ott vannak.'],
      [d.ret + 2 * adv, 'A vevőktől kapott előleget eszköznek vetted. Ez kötelezettség (forrás): a vevő előre fizetett, a vállalkozás még tartozik a teljesítéssel.'],
    ], steps(
      ['Eszközök összesen', fx(`${tx('Eszközök')} = ${f(d.G[0])} + ${f(d.G[1])}`, `= ${f(d.E)}`) + para('(befektetett eszközök + forgóeszközök)')],
      ['Mérlegegyezőség', para(`Eszközök = források, tehát a források összesen is ${F(d.E)}.`)],
      ['Kötelezettségek', fx(`${tx('Kötelezettségek')} = ${d.all.filter(x => x.g === 3).map(x => f(x.v)).join(' + ')}`, `= ${f(K)}`)],
      ['Saját tőke', fx(`${tx('Saját tőke')} = ${tx('Források')} - ${tx('Kötelezettségek')}`, `= ${f(d.E)} - ${f(K)}`, `= ${f(ST)}`)],
      ['Eredménytartalék', para(`A saját tőkéből levonjuk a többi saját tőke tételt (${others.map(x => x.n.toLowerCase()).join(', ')}):`) +
        fx(`${tx('Eredménytartalék')} = ${f(ST)} - ${others.map(x => f(x.v)).join(' - ')}`, `= ${f(d.ret)}`)],
      ['A teljes mérleg', bsSheet(d, ['Eredménytartalék'])]), f);
  },
  function bsAfter() {
    const M = R(100, 400) * 100;
    let es; do { es = sample(BEV, 4); } while (!es.some(e => e[1] === 0) || !es.some(e => e[1] === 1) || !es.some(e => e[1] >= 2));
    const xs = es.map(e => ({ e, a: R(2, 40) * 50 })), S = t => sum(xs.filter(x => x.e[1] === t).map(x => x.a)), res = M + S(0) - S(1);
    return Q(`Egy vállalkozás mérlegfőösszege ${F(M)}. Ezután a következő események történnek:<ol>${xs.map(x => `<li>${x.e[0](F(x.a))}</li>`).join('')}</ol>Mennyi lesz a mérlegfőösszeg (ezer Ft)?`, res, [
      [M + S(0) + S(1), 'A csökkenéseket is hozzáadtad. Ha egy tartozást pénzzel fizetünk ki, mindkét oldal csökken.'],
      [res + S(2) + S(3), 'Az átrendeződéseket is hozzáadtad. Ezek nem változtatják a főösszeget, mert ugyanazon az oldalon nő és csökken valami.'],
      [M + S(0), 'Kihagytad a csökkenéseket (pl. tartozás kifizetése a bankszámláról).'],
      [M + sum(xs.map(x => x.a)), 'Minden összeget hozzáadtál. Csak a két oldalt egyszerre változtató események számítanak, és a kifizetések csökkentik a főösszeget.'],
    ], steps(
      ['Minden eseménynél: melyik két tétel változik?', ltbl(['Esemény', 'Mi változik?', 'Főösszeg'], xs.map((x, i) => [`${i + 1}.`, x.e[2], EFF[x.e[1]](x.a)]))],
      ['Új főösszeg', fx(`${tx('Új főösszeg')} = ${f(M)}${xs.filter(x => x.e[1] < 2).map(x => ` ${x.e[1] ? '-' : '+'} ${f(x.a)}`).join('')}`, `= ${f(res)}`) +
        para('Az átrendeződések (eszközcsere, forráscsere) kimaradnak: az egyik tétel ugyanannyival nő, mint amennyivel a másik csökken.')]), f);
  },
];

// ---------- 3. Eredménykimutatás ----------
// Egy év adatai. Költségek költségnemek szerint (ÖKE) és ugyanezek funkció szerint (FKE).
// A saját termelésű készletek és az aktivált eszközök közvetlen önköltségen, így a két eljárás üzemi eredménye megegyezik.
function plData() {
  const d = {
    anyag: R(20, 60) * 100, szolg: R(3, 12) * 100, eszolg: R(1, 6) * 50, ber: R(15, 40) * 100, szemE: R(1, 6) * 50, ecs: R(4, 15) * 100,
    elabe: R(4, 20) * 100, eb: R(1, 8) * 50, er: R(1, 8) * 50, pb: R(1, 8) * 50, pr: R(1, 10) * 50,
    ny: R(7, 30) * 100, dk: pick([-1, 1]) * R(2, 12) * 50, akt: R(0, 2) ? 0 : R(2, 8) * 100, A: R(5, 40) * 100,
  };
  d.z = d.ny + d.dk;
  d.jar = Math.round(d.ber * 0.13 / 10) * 10;
  d.K = d.anyag + d.szolg + d.eszolg + d.ber + d.szemE + d.jar + d.ecs;
  const part = (a, b) => Math.round(d.K * R(a, b) / 1000) * 10;
  d.ert = part(6, 10); d.igazg = part(5, 9); d.ealt = part(2, 4); d.kozv = d.ert + d.igazg + d.ealt; d.D = d.K - d.kozv;
  d.N = d.A - d.dk - d.akt - d.eb + d.K + d.elabe + d.er;
  d.II = d.dk + d.akt; d.IV = d.anyag + d.szolg + d.eszolg + d.elabe; d.V = d.ber + d.szemE + d.jar;
  d.onk = d.D - d.dk - d.akt; d.kk = d.onk + d.elabe; d.br = d.N - d.kk;
  d.B = d.pb - d.pr; d.C = d.A + d.B; d.tax = Math.round(d.C * 0.09); d.Dz = d.C - d.tax;
  return d;
}
function plStem(d, parts) {
  const T = (title, rows) => ltbl([title, 'ezer Ft'], rows.map(([n, v]) => [n, f(v)]));
  const out = [];
  if (parts.includes('alap')) out.push(T('Alapadatok', [['Értékesítés nettó árbevétele', d.N], ['Eladott áruk beszerzési értéke (ELÁBÉ)', d.elabe], ['Saját termelésű készletek nyitó állománya', d.ny], ['Saját termelésű készletek záró állománya', d.z], ...(d.akt ? [['Saját előállítású eszközök aktivált értéke', d.akt]] : []), ['Egyéb bevételek', d.eb], ['Egyéb ráfordítások', d.er]]) + para('A saját termelésű készleteket közvetlen önköltségen tartják nyilván.'));
  if (parts.includes('nem')) out.push(T('Költségek költségnemek szerint', [['Anyagköltség', d.anyag], ['Igénybe vett szolgáltatások értéke', d.szolg], ['Egyéb szolgáltatások értéke', d.eszolg], ['Bérköltség', d.ber], ['Személyi jellegű egyéb kifizetések', d.szemE], ['Bérjárulékok', d.jar], ['Értékcsökkenési leírás', d.ecs]]));
  if (parts.includes('fun')) out.push(T('Ugyanezek a költségek funkció szerint', [['Közvetlen költségek', d.D], ['Értékesítési, forgalmazási költségek', d.ert], ['Igazgatási költségek', d.igazg], ['Egyéb általános költségek', d.ealt]]));
  if (parts.includes('fin')) out.push(T('Pénzügyi műveletek és adó', [['Pénzügyi műveletek bevételei', d.pb], ['Pénzügyi műveletek ráfordításai', d.pr], ['Adófizetési kötelezettség', d.tax]]));
  return out.join('');
}
// Sor: k = sorjel (0 = alsor, behúzva); a hi sorjelű sor kiemelve.
const plRow = hi => (k, name, v) => { const r = [k ? `${k}. ${name}` : `<span class="in">${name}</span>`, f(v)]; return k && k === hi ? r.map(hl) : r; };
function okeTbl(d, hi) {
  const r = plRow(hi);
  return ltbl(['Összköltség eljárás (ÖKE)', 'ezer Ft'], [
    r('I', 'Értékesítés nettó árbevétele', d.N),
    r('II', 'Aktivált saját teljesítmények értéke', d.II), r(0, 'Saját termelésű készletek állományváltozása', d.dk), r(0, 'Saját előállítású eszközök aktivált értéke', d.akt),
    r('III', 'Egyéb bevételek', d.eb),
    r('IV', 'Anyagjellegű ráfordítások', d.IV), r(0, 'Anyagköltség', d.anyag), r(0, 'Igénybe vett szolgáltatások értéke', d.szolg), r(0, 'Egyéb szolgáltatások értéke', d.eszolg), r(0, 'Eladott áruk beszerzési értéke', d.elabe),
    r('V', 'Személyi jellegű ráfordítások', d.V), r(0, 'Bérköltség', d.ber), r(0, 'Személyi jellegű egyéb kifizetések', d.szemE), r(0, 'Bérjárulékok', d.jar),
    r('VI', 'Értékcsökkenési leírás', d.ecs), r('VII', 'Egyéb ráfordítások', d.er),
    r('A', 'Üzemi (üzleti) tevékenység eredménye', d.A),
    r('VIII', 'Pénzügyi műveletek bevételei', d.pb), r('IX', 'Pénzügyi műveletek ráfordításai', d.pr), r('B', 'Pénzügyi műveletek eredménye', d.B),
    r('C', 'Adózás előtti eredmény', d.C), r('X', 'Adófizetési kötelezettség', d.tax), r('D', 'Adózott eredmény', d.Dz)]);
}
function fkeTbl(d, hi) {
  const r = plRow(hi);
  return ltbl(['Forgalmi költség eljárás (FKE)', 'ezer Ft'], [
    r('I', 'Értékesítés nettó árbevétele', d.N),
    r('II', 'Értékesítés közvetlen költségei', d.kk), r(0, 'Értékesítés elszámolt közvetlen önköltsége', d.onk), r(0, 'Eladott áruk beszerzési értéke', d.elabe),
    r('III', 'Értékesítés bruttó eredménye', d.br),
    r('IV', 'Értékesítés közvetett költségei', d.kozv), r(0, 'Értékesítési, forgalmazási költségek', d.ert), r(0, 'Igazgatási költségek', d.igazg), r(0, 'Egyéb általános költségek', d.ealt),
    r('V', 'Egyéb bevételek', d.eb), r('VI', 'Egyéb ráfordítások', d.er),
    r('A', 'Üzemi (üzleti) tevékenység eredménye', d.A),
    r('VII', 'Pénzügyi műveletek bevételei', d.pb), r('VIII', 'Pénzügyi műveletek ráfordításai', d.pr), r('B', 'Pénzügyi műveletek eredménye', d.B),
    r('C', 'Adózás előtti eredmény', d.C), r('IX', 'Adófizetési kötelezettség', d.tax), r('D', 'Adózott eredmény', d.Dz)]);
}
// Az eladott termékek közvetlen önköltségének levezetése (FKE).
const onkSteps = d => [
  ['Állományváltozás', fx(TeX`\Delta = \text{záró} - \text{nyitó}`, `= ${f(d.z)} - ${f(d.ny)}`, `= ${sg(d.dk)}`) +
    para(d.dk > 0 ? 'Készletnövekedés: az idei közvetlen költségek egy része raktárra került, azt még nem adták el.' : 'Készletcsökkenés: a tavaly gyártott, raktáron lévő termékekből is eladtak, ezek önköltsége is az idei eladásé.')],
  ['Eladott termékek közvetlen önköltsége', para(`Az FKE csak az <b>eladott</b> termékek költségét vonja le. Az idei közvetlen költségekből levonjuk a készletnövekedést${d.akt ? ' és a saját eszközként aktivált részt' : ''} (készletcsökkenést hozzáadunk).`) +
    fx(TeX`\text{önköltség} = \text{közvetlen költség} - \Delta${d.akt ? TeX` - \text{aktivált}` : ''}`, `= ${f(d.D)} - ${ng(f(d.dk))}${d.akt ? ` - ${f(d.akt)}` : ''}`, `= ${f(d.onk)}`)],
];
const dkWrong = d => d.dk > 0 ? 'Nem vontad le a készletnövekedést. Az idei közvetlen költségek egy része raktárra került, azt még nem adták el.' : 'Nem adtad hozzá a készletcsökkenést. Az idén eladott termékek egy részét tavaly gyártották, azok önköltsége is az idei eladásé.';
const DK_SIGN = 'Fordított előjellel vetted az állományváltozást. Közvetlen önköltség = közvetlen költségek − (záró − nyitó) − aktivált érték.';

const LW_CAT = ['Csak az összköltség eljárásban', 'Csak a forgalmi költség eljárásban', 'Mindkettőben', 'Egyikben sem (mérlegtétel)'];
const LW = [
  ['Aktivált saját teljesítmények értéke', 0, 'Az ÖKE minden idei költséget levon, ezért a raktárra termelt és az aktivált saját teljesítményt bevételként visszaadja (II. sor).'],
  ['Saját termelésű készletek állományváltozása', 0, 'Az ÖKE II. sorának része. Az FKE-ben nincs külön sor: ott a közvetlen önköltség kiszámításában szerepel.'],
  ['Anyagjellegű ráfordítások', 0, 'Költségnem, az ÖKE IV. sora. Az FKE nem költségnemek szerint csoportosít.'],
  ['Személyi jellegű ráfordítások', 0, 'Költségnem, az ÖKE V. sora. Az FKE nem költségnemek szerint csoportosít.'],
  ['Értékcsökkenési leírás', 0, 'Költségnem, az ÖKE VI. sora. Az FKE-ben a funkció szerinti költségek tartalmazzák, külön sorként nem jelenik meg.'],
  ['Értékesítés bruttó eredménye', 1, 'Az FKE III. sora (árbevétel − közvetlen költségek). Az ÖKE-ben nincs ilyen köztes eredmény.'],
  ['Értékesítés közvetlen költségei', 1, 'Funkció szerinti csoport, az FKE II. sora.'],
  ['Értékesítés közvetett költségei', 1, 'Funkció szerinti csoport, az FKE IV. sora.'],
  ['Igazgatási költségek', 1, 'A közvetett költségek része az FKE-ben (funkció szerinti csoport).'],
  ['Értékesítési, forgalmazási költségek', 1, 'A közvetett költségek része az FKE-ben (funkció szerinti csoport).'],
  ['Értékesítés nettó árbevétele', 2, 'Mindkét kimutatás ezzel kezdődik (I. sor).'],
  ['Egyéb bevételek', 2, 'Mindkettőben szerepel (ÖKE III., FKE V. sor).'],
  ['Egyéb ráfordítások', 2, 'Mindkettőben szerepel (ÖKE VII., FKE VI. sor).'],
  ['Eladott áruk beszerzési értéke (ELÁBÉ)', 2, 'Mindkettőben szerepel: az ÖKE-ben az anyagjellegű ráfordítások, az FKE-ben a közvetlen költségek része.'],
  ['Üzemi (üzleti) tevékenység eredménye', 2, 'Mindkettőben az A. sor, és ugyanannyi.'],
  ['Pénzügyi műveletek eredménye', 2, 'Az A. sortól lefelé a két kimutatás azonos.'],
  ['Adózás előtti eredmény', 2, 'Az A. sortól lefelé a két kimutatás azonos.'],
  ['Jegyzett tőke', 3, 'Saját tőke tétel: a mérleg forrásoldalán szerepel, nem az eredménykimutatásban.'],
  ['Szállítókkal szembeni kötelezettségek', 3, 'Kötelezettség: a mérleg forrásoldalán szerepel.'],
  ['Vevőkkel szembeni követelések', 3, 'Követelés: a mérleg eszközoldalán szerepel.'],
  ['Eredménytartalék', 3, 'Saját tőke tétel: a mérlegben szerepel.'],
];
const LINES = ['Anyagjellegű ráfordítások (IV.)', 'Személyi jellegű ráfordítások (V.)', 'Értékcsökkenési leírás (VI.)', 'Egyéb ráfordítások (VII.)'];
const CL = [
  ['Felhasznált nyersanyag', 0, 'anyagköltség'], ['Felhasznált irodaszer', 0, 'anyagköltség'], ['Villamosenergia-fogyasztás', 0, 'anyagköltség (az energia is anyagköltség)'],
  ['Raktár bérleti díja', 0, 'igénybe vett szolgáltatás'], ['Fuvarozási díj', 0, 'igénybe vett szolgáltatás'], ['Hirdetés, reklám díja', 0, 'igénybe vett szolgáltatás'],
  ['Bankszámla-vezetési díj', 0, 'egyéb szolgáltatás'], ['Vagyonbiztosítási díj', 0, 'egyéb szolgáltatás'], ['Eladott áruk beszerzési értéke', 0, 'ELÁBÉ'],
  ['Dolgozók havi bére', 1, 'bérköltség'], ['Szociális hozzájárulási adó', 1, 'bérjárulék'], ['Étkezési hozzájárulás a dolgozóknak', 1, 'személyi jellegű egyéb kifizetés'], ['Kiküldetési napidíj', 1, 'személyi jellegű egyéb kifizetés'],
  ['Termelőgépek éves terv szerinti értékcsökkenése', 2, 'értékcsökkenési leírás'], ['Az irodaépület éves értékcsökkenése', 2, 'értékcsökkenési leírás'],
  ['Fizetett bírság', 3, 'egyéb ráfordítás, nem a tevékenységhez felhasznált erőforrás'], ['Fizetett kötbér', 3, 'egyéb ráfordítás, nem a tevékenységhez felhasznált erőforrás'],
  ['Helyi iparűzési adó', 3, 'egyéb ráfordítás (a társasági adóval ellentétben nem az adófizetési kötelezettség sorba kerül)'],
  ['Behajthatatlan vevőkövetelés leírása', 3, 'egyéb ráfordítás'], ['Adott támogatás (adomány)', 3, 'egyéb ráfordítás'],
];
const LINE_DEF = 'Az ÖKE ráfordítás-sorai: IV. anyagjellegű (anyagköltség, igénybe vett és egyéb szolgáltatások, ELÁBÉ), V. személyi jellegű (bér, személyi jellegű egyéb kifizetések, bérjárulékok), VI. értékcsökkenési leírás, VII. egyéb ráfordítások (bírság, kötbér, iparűzési adó, behajthatatlan követelés, adott támogatás).';

const plGens = [
  function lineWhere() {
    const [n, c, note] = pick(LW);
    return Q(`Melyik eredménykimutatásban szerepel ez a sor: <b>${n}</b>?`, LW_CAT[c], LW_CAT.filter((_, j) => j !== c).map(k => [k, note]), steps(
      ['Mi ez a tétel?', para(note)],
      ['A két kimutatás különbsége', para('Az ÖKE költségnemek szerint csoportosít (anyagjellegű, személyi jellegű, értékcsökkenés), és az aktivált saját teljesítményekkel korrigál. Az FKE funkció szerint (közvetlen és közvetett költségek), és van bruttó eredménye. Az árbevétel, az egyéb bevételek és ráfordítások, az ELÁBÉ, és az A. sortól lefelé minden közös.')],
      ['Eredmény', para(hl(LW_CAT[c]))]));
  },
  function costLine() {
    const [n, g, note] = pick(CL);
    return Q(`Az összköltség eljárású eredménykimutatás melyik sorába kerül: <b>${n}</b>?`, LINES[g], LINES.filter((_, j) => j !== g).map(k => [k, `${n}: ${note}, tehát ide tartozik: ${LINES[g]}.`]), steps(
      ['Milyen tétel?', para(`${n}: ${note}.`)],
      ['A ráfordítás-sorok', para(LINE_DEF)],
      ['Eredmény', para(hl(LINES[g]))]));
  },
  function allomany() {
    const ny = R(7, 30) * 100; let dk; do { dk = R(-12, 12) * 50; } while (!dk);
    const z = ny + dk, eff = x => `${sg(x)} ezer Ft (${x > 0 ? 'növeli' : 'csökkenti'} az eredményt)`;
    return Q(`Saját termelésű készletek (késztermék, befejezetlen termelés): nyitó állomány ${F(ny)}, záró állomány ${F(z)}. Hogyan és mennyivel módosítja ez az <b>összköltség eljárású</b> eredménykimutatás üzemi eredményét?`, eff(dk), [
      [eff(-dk), 'Fordított előjel. Az állományváltozás záró − nyitó, és ezzel az előjellel kerül a II. sorba.'],
      [eff(z), 'A záró állományt vetted. Nem a készlet nagysága számít, hanem a változása (záró − nyitó).'],
      ['0 (nem módosítja, mert nincs értékesítés)', 'Az ÖKE az év összes költségét levonja, a raktárra termelt termékekét is. Ezért a készletváltozással korrigálni kell.'],
    ], steps(
      ['Állományváltozás', fx(TeX`\Delta = \text{záró} - \text{nyitó}`, `= ${f(z)} - ${f(ny)}`, `= ${sg(dk)}`)],
      ['Miért kell?', para('Az ÖKE az év <b>összes</b> költségét levonja (költségnemek szerint), akkor is, ha a termékeket nem adták el, hanem raktárra kerültek. ' +
        (dk > 0 ? 'Készletnövekedésnél a raktárra termelt rész költségét feleslegesen vontuk le, ezért a II. sorban visszaadjuk: növeli az eredményt.' : 'Készletcsökkenésnél tavalyi gyártású termékeket is eladtunk, ezek költsége az idei költségek között nincs benne, ezért a II. sorban levonjuk: csökkenti az eredményt.'))],
      ['Eredmény', para(`${hl(sg(dk))} ezer Ft a II. sorban (aktivált saját teljesítmények értéke).`)]));
  },
  function okeAnyag(d) {
    const st = d ? '' : plStem(d = plData(), ['alap', 'nem']);
    return Q(`${st}Mennyi az összköltség eljárásban az <b>anyagjellegű ráfordítások</b> (IV.) összege (ezer Ft)?`, d.IV, [
      [d.IV - d.elabe, 'Kihagytad az eladott áruk beszerzési értékét (ELÁBÉ). Ez is anyagjellegű ráfordítás.'],
      [d.IV + d.ecs, 'Az értékcsökkenési leírás nem anyagjellegű, hanem külön sor (VI.).'],
      [d.IV - d.eszolg, 'Kihagytad az egyéb szolgáltatások értékét (pl. bankköltség, biztosítás). Ez is anyagjellegű ráfordítás.'],
      [d.anyag, 'Ez csak az anyagköltség. Az anyagjellegű ráfordításokba a szolgáltatások és az ELÁBÉ is beletartoznak.'],
    ], steps(
      ['Mi tartozik ide?', para('Az ÖKE IV. sora: anyagköltség, igénybe vett szolgáltatások értéke, egyéb szolgáltatások értéke, eladott áruk beszerzési értéke (ELÁBÉ). A bér az V., az értékcsökkenés a VI. sorba kerül.')],
      ['Összeadás', fx(`${tx('IV.')} = ${f(d.anyag)} + ${f(d.szolg)} + ${f(d.eszolg)} + ${f(d.elabe)}`, `= ${f(d.IV)}`)],
      ['Helye a kimutatásban', okeTbl(d, 'IV')]), f);
  },
  function okeSzem(d) {
    const st = d ? '' : plStem(d = plData(), ['nem']);
    return Q(`${st}Mennyi az összköltség eljárásban a <b>személyi jellegű ráfordítások</b> (V.) összege (ezer Ft)?`, d.V, [
      [d.ber, 'Ez csak a bérköltség. A személyi jellegű egyéb kifizetések és a bérjárulékok is ide tartoznak.'],
      [d.ber + d.szemE, 'Kihagytad a bérjárulékokat (szociális hozzájárulási adó). Ez is személyi jellegű ráfordítás.'],
      [d.ber + d.jar, 'Kihagytad a személyi jellegű egyéb kifizetéseket (pl. étkezési hozzájárulás, napidíj).'],
      [d.V + d.ecs, 'Az értékcsökkenési leírás külön sor (VI.).'],
    ], steps(
      ['Mi tartozik ide?', para('Az ÖKE V. sora: bérköltség, személyi jellegű egyéb kifizetések, bérjárulékok.')],
      ['Összeadás', fx(`${tx('V.')} = ${f(d.ber)} + ${f(d.szemE)} + ${f(d.jar)}`, `= ${f(d.V)}`)],
      ['Helye a kimutatásban', okeTbl(d, 'V')]), f);
  },
  function okeAktivalt(d) {
    const st = d ? '' : plStem(d = plData(), ['alap']);
    return Q(`${st}Mennyi az összköltség eljárásban az <b>aktivált saját teljesítmények értéke</b> (II.) (ezer Ft)?`, d.II, [
      [d.akt - d.dk, 'Fordított előjel: az állományváltozás záró − nyitó, nem nyitó − záró.'],
      [d.z + d.akt, 'A záró készletet vetted. A változás kell (záró − nyitó).'],
      [d.akt ? d.dk : undefined, 'Kihagytad a saját előállítású eszközök aktivált értékét. Ez is a II. sorba tartozik.'],
      [d.ny + d.akt, 'A nyitó készletet vetted. A változás kell (záró − nyitó).'],
    ], steps(
      ['Állományváltozás', fx(TeX`\Delta = \text{záró} - \text{nyitó}`, `= ${f(d.z)} - ${f(d.ny)}`, `= ${sg(d.dk)}`)],
      ['II. sor', para('Két részből áll: saját termelésű készletek állományváltozása és saját előállítású eszközök aktivált értéke.') +
        fx(TeX`\text{II.} = \Delta + \text{aktivált}`, `= ${ng(f(d.dk))} + ${f(d.akt)}`, `= ${f(d.II)}`)],
      ['Miért kell?', para('Az ÖKE az év összes költségét levonja, akkor is, ha a termékből készlet lett vagy saját eszköz (pl. saját gyártású gép). Ezt a II. sorban bevételként visszaadja; készletcsökkenésnél fordítva, levonja.')]), f);
  },
  function okeUzemi(d) {
    const st = d ? '' : plStem(d = plData(), ['alap', 'nem', 'fun', 'fin']);
    return Q(`${st}Mennyi az <b>üzemi (üzleti) tevékenység eredménye</b> az összköltség eljárás szerint (ezer Ft)?`, d.A, [
      [d.A - 2 * d.dk, 'Fordított előjellel vetted az állományváltozást. Helyesen: záró − nyitó, és ez kerül a II. sorba.'],
      [d.A - d.kozv, 'A funkció szerinti költségeket (értékesítési, igazgatási, egyéb általános) is levontad. Ezek ugyanazok a költségek, csak másképp csoportosítva: az ÖKE csak a költségnemeket használja, különben kétszer vonnád le őket.'],
      [d.A + d.B, 'A pénzügyi műveleteket is beszámoltad. Ezek az üzemi eredmény után jönnek (B.).'],
      [d.A - d.II, 'Kihagytad az aktivált saját teljesítmények értékét (II.).'],
      [d.A - d.eb + d.er, 'Kihagytad az egyéb bevételeket és ráfordításokat.'],
    ], steps(
      ['Bevétel jellegű sorok', fx(`${tx('I.')} = ${f(d.N)}`, TeX`\text{II.} = (${f(d.z)} - ${f(d.ny)}) + ${f(d.akt)} = ${f(d.II)}`, `${tx('III.')} = ${f(d.eb)}`)],
      ['Ráfordítások költségnemek szerint', fx(`${tx('IV.')} = ${f(d.anyag)} + ${f(d.szolg)} + ${f(d.eszolg)} + ${f(d.elabe)} = ${f(d.IV)}`, `${tx('V.')} = ${f(d.ber)} + ${f(d.szemE)} + ${f(d.jar)} = ${f(d.V)}`, `${tx('VI.')} = ${f(d.ecs)}`, `${tx('VII.')} = ${f(d.er)}`)],
      ['Üzemi eredmény', fx(TeX`\text{A} = \text{I} + \text{II} + \text{III} - \text{IV} - \text{V} - \text{VI} - \text{VII}`, `= ${f(d.N)} + ${ng(f(d.II))} + ${f(d.eb)} - ${f(d.IV)} - ${f(d.V)} - ${f(d.ecs)} - ${f(d.er)}`, `= ${f(d.A)}`)],
      ['Miért nem kell a funkció szerinti adat?', para('A közvetlen, értékesítési, igazgatási és egyéb általános költség ugyanazoknak a költségeknek a másik csoportosítása (összegük ugyanannyi). Az ÖKE a költségnemeket vonja le; ha a funkció szerintieket is levonnád, kétszer vonnád le a költségeket. A pénzügyi tételek és az adó csak az A. sor után jönnek.')],
      ['A teljes kimutatás', okeTbl(d, 'A')]), f);
  },
  function fkeKozv(d) {
    const st = d ? '' : plStem(d = plData(), ['alap', 'fun']);
    return Q(`${st}Mennyi a forgalmi költség eljárásban az <b>értékesítés közvetlen költségei</b> (II.) (ezer Ft)?`, d.kk, [
      [d.D + d.elabe, dkWrong(d)],
      [d.D + d.dk - d.akt + d.elabe, DK_SIGN],
      [d.onk, 'Kihagytad az ELÁBÉ-t. Az eladott áruk beszerzési értéke is az értékesítés közvetlen költsége.'],
      [d.akt ? d.kk + d.akt : undefined, 'Nem vontad le a saját előállítású eszközök aktivált értékét. Azt nem adták el, a vállalkozás saját eszköze lett.'],
      [d.kk + d.kozv, 'A közvetett költségeket (értékesítési, igazgatási, egyéb általános) is beszámoltad. Ezek a IV. sorba kerülnek.'],
    ], steps(...onkSteps(d),
      ['II. Értékesítés közvetlen költségei', fx(`${tx('II.')} = ${tx('önköltség')} + ${tx('ELÁBÉ')}`, `= ${f(d.onk)} + ${f(d.elabe)}`, `= ${f(d.kk)}`)],
      ['Helye a kimutatásban', fkeTbl(d, 'II')]), f);
  },
  function fkeBrutto(d) {
    const st = d ? '' : plStem(d = plData(), ['alap', 'fun']);
    return Q(`${st}Mennyi a forgalmi költség eljárásban az <b>értékesítés bruttó eredménye</b> (III.) (ezer Ft)?`, d.br, [
      [d.N - d.D - d.elabe, dkWrong(d)],
      [d.N - (d.D + d.dk - d.akt) - d.elabe, DK_SIGN],
      [d.N - d.onk, 'Kihagytad az ELÁBÉ-t. Az eladott áruk beszerzési értéke is az értékesítés közvetlen költsége.'],
      [d.br - d.kozv, 'A közvetett költségeket is levontad. A bruttó eredményből csak a közvetlen költségek vonódnak le; a közvetett költségek a IV. sorban jönnek.'],
    ], steps(...onkSteps(d),
      ['II. Értékesítés közvetlen költségei', fx(`${tx('II.')} = ${f(d.onk)} + ${f(d.elabe)}`, `= ${f(d.kk)}`) + para('(eladott termékek közvetlen önköltsége + ELÁBÉ)')],
      ['III. Bruttó eredmény', fx(`${tx('III.')} = ${tx('I.')} - ${tx('II.')}`, `= ${f(d.N)} - ${f(d.kk)}`, `= ${f(d.br)}`)],
      ['Helye a kimutatásban', fkeTbl(d, 'III')]), f);
  },
  function fkeUzemi(d) {
    const st = d ? '' : plStem(d = plData(), ['alap', 'nem', 'fun', 'fin']);
    return Q(`${st}Mennyi az <b>üzemi (üzleti) tevékenység eredménye</b> a forgalmi költség eljárás szerint (ezer Ft)?`, d.A, [
      [d.A - d.II, 'Nem korrigáltad a közvetlen költségeket az állományváltozással: az FKE csak az eladott termékek önköltségét vonja le.'],
      [d.A - d.ecs, 'Az értékcsökkenést külön is levontad. Az FKE-ben az értékcsökkenés már benne van a funkció szerinti költségekben (pl. a gépeké a közvetlen költségben).'],
      [d.br - d.kozv, 'Kihagytad az egyéb bevételeket és ráfordításokat (V., VI.).'],
      [d.br, 'Ez csak a bruttó eredmény (III.). A közvetett költségeket és az egyéb tételeket még figyelembe kell venni.'],
      [d.A + d.B, 'A pénzügyi műveleteket is beszámoltad. Ezek az üzemi eredmény után jönnek (B.).'],
    ], steps(...onkSteps(d),
      ['III. Bruttó eredmény', fx(`${tx('III.')} = ${tx('I.')} - (${tx('önköltség')} + ${tx('ELÁBÉ')})`, `= ${f(d.N)} - (${f(d.onk)} + ${f(d.elabe)})`, `= ${f(d.br)}`)],
      ['IV. Közvetett költségek', fx(`${tx('IV.')} = ${f(d.ert)} + ${f(d.igazg)} + ${f(d.ealt)}`, `= ${f(d.kozv)}`) + para('(értékesítési + igazgatási + egyéb általános)')],
      ['Üzemi eredmény', fx(TeX`\text{A} = \text{III} - \text{IV} + \text{V} - \text{VI}`, `= ${f(d.br)} - ${f(d.kozv)} + ${f(d.eb)} - ${f(d.er)}`, `= ${f(d.A)}`)],
      ['Ellenőrzés: ugyanannyi, mint az ÖKE-ben', para('A két eljárás ugyanazokat a költségeket vonja le, csak másképp csoportosítva, ezért az üzemi eredmény ugyanaz:') +
        fx(TeX`\text{A}_{\text{ÖKE}} = ${f(d.N)} + ${ng(f(d.II))} + ${f(d.eb)} - ${f(d.IV)} - ${f(d.V)} - ${f(d.ecs)} - ${f(d.er)}`, `= ${f(d.A)}`)],
      ['A teljes kimutatás', fkeTbl(d, 'A')]), f);
  },
  function adozott(d, w) {
    const st = d ? '' : (d = plData(), ltbl(['Adat', 'ezer Ft'], [['Üzemi (üzleti) tevékenység eredménye', d.A], ['Pénzügyi műveletek bevételei', d.pb], ['Pénzügyi műveletek ráfordításai', d.pr], ['Adófizetési kötelezettség', d.tax]].map(([n, v]) => [n, f(v)])));
    w = w || pick(['C', 'D']);
    const [ask, res, wrongs] = w === 'C' ? ['az <b>adózás előtti eredmény</b> (C.)', d.C, [
      [d.A, 'Kihagytad a pénzügyi műveletek eredményét (B.).'],
      [d.A + d.pb + d.pr, 'A pénzügyi ráfordításokat hozzáadtad, pedig le kell vonni őket.'],
      [d.Dz, 'Ez már az adózott eredmény; az adózás előtti eredményből még nem vonjuk le az adót.']]]
      : ['az <b>adózott eredmény</b> (D.)', d.Dz, [
      [d.C, 'Ez az adózás előtti eredmény (C.). Az adófizetési kötelezettséget még le kell vonni.'],
      [d.A - d.tax, 'Kihagytad a pénzügyi műveletek eredményét (B.).'],
      [d.A + d.pb + d.pr - d.tax, 'A pénzügyi ráfordításokat hozzáadtad, pedig le kell vonni őket.']]];
    return Q(`${st}Mennyi ${ask} (ezer Ft)?`, res, wrongs, steps(
      ['Pénzügyi műveletek eredménye', fx(`${tx('B.')} = ${tx('VIII.')} - ${tx('IX.')}`, `= ${f(d.pb)} - ${f(d.pr)}`, `= ${f(d.B)}`)],
      ['Adózás előtti eredmény', fx(`${tx('C.')} = ${tx('A.')} + ${tx('B.')}`, `= ${f(d.A)} + ${ng(f(d.B))}`, `= ${f(d.C)}`)],
      w === 'D' && ['Adózott eredmény', fx(`${tx('D.')} = ${tx('C.')} - ${tx('adó')}`, `= ${f(d.C)} - ${f(d.tax)}`, `= ${f(d.Dz)}`)],
      ['Megjegyzés', para('Az A. sortól lefelé az összköltség és a forgalmi költség eljárás azonos (az FKE-ben a sorok számozása VII., VIII., IX.).')]), f);
  },
];

// ---------- 4. Szerkezet: mérleg, ÖKE, FKE (fejből leírni) ----------
const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const AZ = c => ['I', 'V', 'A', 'E', 'F', '1', '5'].includes(String(c)) ? 'az' : 'a';
// Sor: [jel, név, alsorok, képlet]. numbered: az alsorok is számozott tételek (mérleg), különben csak a sor tartalma.
function schema(o, rows) {
  const S = { ...o };
  S.main = rows.map(([c, n, kids = [], fx]) => ({ c, n, kids, fx, S }));
  S.seq = o.numbered ? S.main.flatMap(m => [m, ...m.kids.map((n, i) => ({ c: ROM[i], n, kids: [], parent: m, S }))]) : S.main;
  return S;
}
const MERLEG = schema({ title: 'Mérleg', short: 'mérleg', numbered: true, unit: 'csoport', unitBa: 'csoportba', inT: 'a mérlegben', ask: c => `Mi a mérleg <b>${c}.</b> csoportja?` }, [
  ['A', 'Befektetett eszközök', ['Immateriális javak', 'Tárgyi eszközök', 'Befektetett pénzügyi eszközök']],
  ['B', 'Forgóeszközök', ['Készletek', 'Követelések', 'Értékpapírok', 'Pénzeszközök']],
  ['C', 'Aktív időbeli elhatárolások'],
  ['D', 'Saját tőke', ['Jegyzett tőke', 'Jegyzett, de még be nem fizetett tőke (−)', 'Tőketartalék', 'Eredménytartalék', 'Lekötött tartalék', 'Értékelési tartalék', 'Adózott eredmény']],
  ['E', 'Céltartalékok'],
  ['F', 'Kötelezettségek', ['Hátrasorolt kötelezettségek', 'Hosszú lejáratú kötelezettségek', 'Rövid lejáratú kötelezettségek']],
  ['G', 'Passzív időbeli elhatárolások'],
]);
const OKE = schema({ title: 'Összköltség eljárás (ÖKE)', short: 'ÖKE', unit: 'sor', unitBa: 'sorba', inT: 'az összköltség eljárású eredménykimutatásban', ask: c => `Mi az összköltség eljárású eredménykimutatás <b>${c}.</b> sora?` }, [
  ['I', 'Értékesítés nettó árbevétele', ['Belföldi értékesítés nettó árbevétele', 'Exportértékesítés nettó árbevétele']],
  ['II', 'Aktivált saját teljesítmények értéke', ['Saját termelésű készletek állományváltozása', 'Saját előállítású eszközök aktivált értéke']],
  ['III', 'Egyéb bevételek'],
  ['IV', 'Anyagjellegű ráfordítások', ['Anyagköltség', 'Igénybe vett szolgáltatások értéke', 'Egyéb szolgáltatások értéke', 'Eladott áruk beszerzési értéke', 'Eladott (közvetített) szolgáltatások értéke']],
  ['V', 'Személyi jellegű ráfordítások', ['Bérköltség', 'Személyi jellegű egyéb kifizetések', 'Bérjárulékok']],
  ['VI', 'Értékcsökkenési leírás'],
  ['VII', 'Egyéb ráfordítások'],
  ['A', 'Üzemi (üzleti) tevékenység eredménye', [], 'I ± II + III − IV − V − VI − VII'],
  ['VIII', 'Pénzügyi műveletek bevételei'],
  ['IX', 'Pénzügyi műveletek ráfordításai'],
  ['B', 'Pénzügyi műveletek eredménye', [], 'VIII − IX'],
  ['C', 'Adózás előtti eredmény', [], 'A ± B'],
  ['X', 'Adófizetési kötelezettség'],
  ['D', 'Adózott eredmény', [], 'C − X'],
]);
const FKE = schema({ title: 'Forgalmi költség eljárás (FKE)', short: 'FKE', unit: 'sor', unitBa: 'sorba', inT: 'a forgalmi költség eljárású eredménykimutatásban', ask: c => `Mi a forgalmi költség eljárású eredménykimutatás <b>${c}.</b> sora?` }, [
  ['I', 'Értékesítés nettó árbevétele', ['Belföldi értékesítés nettó árbevétele', 'Exportértékesítés nettó árbevétele']],
  ['II', 'Értékesítés közvetlen költségei', ['Értékesítés elszámolt közvetlen önköltsége', 'Eladott áruk beszerzési értéke', 'Eladott (közvetített) szolgáltatások értéke']],
  ['III', 'Értékesítés bruttó eredménye', [], 'I − II'],
  ['IV', 'Értékesítés közvetett költségei', ['Értékesítési, forgalmazási költségek', 'Igazgatási költségek', 'Egyéb általános költségek']],
  ['V', 'Egyéb bevételek'],
  ['VI', 'Egyéb ráfordítások'],
  ['A', 'Üzemi (üzleti) tevékenység eredménye', [], 'III − IV + V − VI'],
  ['VII', 'Pénzügyi műveletek bevételei'],
  ['VIII', 'Pénzügyi műveletek ráfordításai'],
  ['B', 'Pénzügyi műveletek eredménye', [], 'VII − VIII'],
  ['C', 'Adózás előtti eredmény', [], 'A ± B'],
  ['IX', 'Adófizetési kötelezettség'],
  ['D', 'Adózott eredmény', [], 'C − IX'],
]);
const lab = x => `${x.c}. ${x.n}`;
const where = x => x.parent ? `a ${x.parent.n.toLowerCase()} (${x.parent.c}.) ${x.c}. tétele` : `${AZ(x.c)} ${x.c}. ${x.S.unit}${x.S.numbered ? '' : ` (${x.S.short})`}`;
const askOf = x => x.parent ? `Mi a mérlegben a ${x.parent.n.toLowerCase()} (${x.parent.c}.) <b>${x.c}.</b> tétele?` : x.S.ask(x.c);
// A lista k darab x-hez közeli eleme (a sorrendben szomszédosakat a legkönnyebb összekeverni).
const near = (list, x, k = 3) => { const i = list.indexOf(x); return sample(list.filter(y => y !== x).sort((a, b) => Math.abs(list.indexOf(a) - i) - Math.abs(list.indexOf(b) - i)).slice(0, k + 2), k); };
const fxAll = () => [OKE, FKE].flatMap(S => S.main.filter(m => m.fx));
function schemaTbl(S, hi, seq = S.seq) {
  const rows = seq.map(x => {
    const r = [x.parent ? `<span class="in">${lab(x)}</span>` : lab(x)];
    if (!S.numbered) r.push(x.fx ? `= ${x.fx}` : x.kids.join(', '));
    return x === hi ? r.map(hl) : r;
  });
  return tbl(S.numbered ? [S.title] : [S.title, 'Tartalom, számítás'], rows).replace('<table>', '<table class="l sch">');
}
const structSol = (x, ...more) => steps(['A helyes válasz', para(`${hl(lab(x))}${x.fx ? ` = ${x.fx}` : ''}`)], ...more, ['A teljes szerkezet', schemaTbl(x.S, x)]);

function structGens(list) {
  return [
    function stName() {
      const S = pick(list), x = pick(S.seq), pool = x.parent ? S.seq.filter(y => y.parent) : S.main;
      return Q(askOf(x), x.n, near(pool, x).map(y => [y.n, `Ez ${where(y)}.`]), structSol(x));
    },
    function stCode() {
      const S = pick(list), x = pick(S.seq), sib = x.parent ? S.seq.filter(y => y.parent === x.parent) : S.main;
      const codes = x.parent ? ROM.slice(0, Math.max(4, sib.length)) : sib.map(y => y.c), i = codes.indexOf(x.c);
      const wr = sample(codes.filter(c => c !== x.c).sort((a, b) => Math.abs(codes.indexOf(a) - i) - Math.abs(codes.indexOf(b) - i)).slice(0, 5), 3);
      return Q(x.parent ? `Hányadik tétel a mérlegben a ${x.parent.n.toLowerCase()} (${x.parent.c}.) csoporton belül: <b>${x.n}</b>?` : `Mi a jele ${S.inT}: <b>${x.n}</b>?`, x.c + '.',
        wr.map(c => { const y = sib.find(s => s.c === c); return [c + '.', y ? `${cap(AZ(c))} ${c}. ${x.parent ? 'tétel' : S.unit}: ${y.n}.` : `Ebben a csoportban csak ${sib.length} tétel van.`]; }), structSol(x));
    },
    function stNext() {
      const S = pick(list), i = R(0, S.seq.length - 2), x = S.seq[i], nx = S.seq[i + 1];
      return Q(`${cap(S.inT)} mi következik közvetlenül ${AZ(x.c)} <b>${lab(x)}</b> után?`, nx.n,
        [S.seq[i + 2], S.seq[i - 1], S.seq[i + 3], S.seq[i - 2]].filter(Boolean).map(y => [y.n, `Ez ${where(y)}; ${S.seq.indexOf(y) < i ? 'előrébb van' : 'később jön'}.`]), structSol(nx));
    },
    function stParent() {
      const S = pick(list), ps = S.main.filter(m => m.kids.length), p = pick(ps), k = pick(p.kids);
      const cand = [...shuffle(ps.filter(m => m !== p)), ...near(S.main, p, 4)].filter((y, j, a) => a.indexOf(y) === j);
      return Q(`Melyik ${S.unitBa} tartozik ${S.inT}: <b>${k}</b>?`, lab(p), cand.map(y => [lab(y), y.kids.length ? `${cap(where(y))} tételei: ${y.kids.join(', ')}.` : `${cap(where(y))} nem bomlik tovább tételekre.`]),
        structSol(p, ['Mi tartozik bele?', para(p.kids.join(', ') + '.')]));
    },
    ...(list.some(S => S.main.some(m => m.fx)) ? [function stFormula() {
      const all = fxAll(), x = pick(all.filter(m => list.includes(m.S)));
      const cand = [...all.filter(y => y.c === x.c && y !== x), ...shuffle(all.filter(y => y.c !== x.c))].filter(y => y.fx !== x.fx);
      return Q(`Hogyan számoljuk ${x.S.inT} ${AZ(x.c)} <b>${lab(x)}</b> sort?`, x.fx, cand.map(y => [y.fx, `Ez ${where(y)} képlete (${y.n}).`]), structSol(x));
    }] : []),
  ];
}
// Teljes feladat: a kimutatás leírása sorról sorra; minden rész a következő sort kérdezi.
function fillPart(S, seq, k) {
  const x = seq[k], prev = seq[k - 1], pool = x.parent ? S.seq.filter(y => y.parent) : S.main;
  const ans = y => y.fx ? `${y.n} = ${y.fx}` : y.n;
  const cand = x.fx ? [...fxAll().filter(y => y.n === x.n && y !== x), ...near(fxAll().filter(y => y.S === S), x)] : near(pool, x);
  return H(prev ? `Előtte: ${lab(prev)}.` : `Ez az első ${x.parent ? 'tétel' : S.unit}.`, Q(x.fx ? `${askOf(x)} Hogyan számoljuk?` : askOf(x), ans(x),
    cand.map(y => [ans(y), y.fx ? `Ez ${where(y)} képlete.` : `Ez ${where(y)}.`]), steps(
      ['Eddig így néz ki', schemaTbl(S, x, seq.slice(0, k + 1))],
      !S.numbered && x.kids.length && ['Mi tartozik bele?', para(x.kids.join(', ') + '.')])));
}
const fillCase = (S, title, seq = S.seq) => function fill() {
  return { title, stem: `Írd le fejből, sorról sorra: ${title.toLowerCase()}. Minden rész a következő ${seq[0].parent || S.numbered ? 'tételt' : 'sort'} kérdezi, a levezetés megmutatja, hogyan néz ki eddig.`, parts: seq.map((_, k) => fillPart(S, seq, k)) };
};
const STRUCT_HINT = 'Mérleg: A–C eszközök, D–G források. ÖKE: I–VII, A, VIII–IX, B, C, X, D. FKE: I–VI, A, VII–VIII, B, C, IX, D.';

const HINTS = {
  stName: 'Mondd fel fejben a szerkezetet felülről a kérdezett jelig. ' + STRUCT_HINT,
  stCode: 'Mondd fel fejben a szerkezetet felülről, és figyeld, hányadik helyen áll a tétel. ' + STRUCT_HINT,
  stNext: 'Mondd fel fejben a szerkezetet a megadott sorig, és nézd meg, mi jön utána. ' + STRUCT_HINT,
  stParent: 'Mérleg: A. immateriális, tárgyi, pénzügyi; B. készletek, követelések, értékpapírok, pénzeszközök; F. hátrasorolt, hosszú, rövid. ÖKE: IV. anyag, szolgáltatások, ELÁBÉ; V. bér, egyéb kifizetés, járulék. FKE: II. közvetlen önköltség, ELÁBÉ; IV. értékesítési, igazgatási, egyéb általános.',
  stFormula: 'Az eredménysorok a fölöttük lévő sorokból jönnek. ÖKE A.: I-től VII-ig. FKE III.: I − II, FKE A.: III-tól VI-ig. B.: pénzügyi bevétel − ráfordítás. C. = A ± B. D. = C − adó.',
  kkClassify: 'Két külön kérdés: (1) megy ki pénz ebben az időszakban? Ha igen, kiadás. (2) Felhasználtak erőforrást a tevékenységhez ebben az időszakban? Ha igen, költség.',
  kkExample: 'Mind a négy eseményre tedd fel a két kérdést: megy ki pénz (kiadás)? Felhasználtak erőforrást (költség)?',
  kkSum: 'Minden eseménynél döntsd el külön, hogy kiadás-e (megy ki pénz?) és költség-e (felhasználtak erőforrást?). Csak a kérdezett fajtát add össze; a befolyó pénzek egyikbe sem kellenek.',
  kkDef: 'Kiadás: pénz megy ki. Költség: erőforrást használnak fel. Ráfordítás: az eredményt csökkenti (a bevételekkel szemben). Bevétel: ellenérték, az eredményt növeli.',
  bsClassify: 'Előbb: eszköz (mi van?) vagy forrás (kié, honnan van?). Eszköznél: egy évnél tovább szolgál (befektetett) vagy egy éven belül elfogy, pénzzé válik (forgó)? Forrásnál: a tulajdonosoké (saját tőke) vagy tartozás (kötelezettség)?',
  bsEvent: 'Írd fel, melyik két mérlegtétel változik, és mindegyik eszköz vagy forrás. Ha két különböző oldalon vannak, a főösszeg változik; ha ugyanazon az oldalon, nem.',
  bsTotal: 'Válogasd ki a csoport tételeit. Csapdák: a vevőkkel szembeni követelés eszköz, a vevőktől kapott előleg kötelezettség, a forgatási célú értékpapír forgóeszköz.',
  bsMissing: TeX`Mérlegegyezőség: eszközök = források. $\text{Saját tőke} = \text{Eszközök} - \text{Kötelezettségek}$, ebből vond le a többi saját tőke tételt.`,
  bsAfter: 'Csak a két oldalt egyszerre változtató események módosítják a főösszeget: eszköz és forrás is nő, akkor nő; mindkettő csökken, akkor csökken. Az átrendeződések nem.',
  lineWhere: 'ÖKE: költségnemek (anyagjellegű, személyi jellegű, értékcsökkenés) és aktivált saját teljesítmények. FKE: funkció (közvetlen, közvetett költségek) és bruttó eredmény. Közös: árbevétel, egyéb tételek, ELÁBÉ, és az A. sortól lefelé minden.',
  costLine: 'Anyagjellegű: anyag, energia, szolgáltatások, ELÁBÉ. Személyi jellegű: bér, bérjárulék, egyéb juttatás a dolgozóknak. Értékcsökkenés: eszközök elhasználódása. Egyéb ráfordítás: bírság, kötbér, iparűzési adó, behajthatatlan követelés.',
  allomany: TeX`Állományváltozás $=$ záró $-$ nyitó. Az ÖKE minden költséget levon, a raktárra termelt részét is, ezért a készletnövekedést visszaadja (növeli az eredményt).`,
  okeAnyag: 'IV. Anyagjellegű ráfordítások = anyagköltség + igénybe vett szolgáltatások + egyéb szolgáltatások + ELÁBÉ. Az értékcsökkenés külön sor.',
  okeSzem: 'V. Személyi jellegű ráfordítások = bérköltség + személyi jellegű egyéb kifizetések + bérjárulékok.',
  okeAktivalt: TeX`II. Aktivált saját teljesítmények $=$ állományváltozás (záró $-$ nyitó) $+$ saját előállítású eszközök aktivált értéke.`,
  okeUzemi: TeX`$\text{A} = \text{I} \pm \text{II} + \text{III} - \text{IV} - \text{V} - \text{VI} - \text{VII}$. Csak a költségnemek kellenek; a funkció szerinti bontás ugyanazoknak a költségeknek a másik csoportosítása.`,
  fkeKozv: TeX`Eladott termékek közvetlen önköltsége $=$ közvetlen költségek $-$ állományváltozás $-$ aktivált érték. Ehhez jön hozzá az ELÁBÉ.`,
  fkeBrutto: 'III. Bruttó eredmény = nettó árbevétel − értékesítés közvetlen költségei (eladott termékek közvetlen önköltsége + ELÁBÉ).',
  fkeUzemi: TeX`$\text{A} = \text{III} - \text{IV} + \text{V} - \text{VI}$: bruttó eredmény $-$ közvetett költségek $+$ egyéb bevételek $-$ egyéb ráfordítások. Az értékcsökkenés már benne van a funkció szerinti költségekben.`,
  adozott: TeX`$\text{B} =$ pénzügyi bevételek $-$ pénzügyi ráfordítások; $\text{C} = \text{A} + \text{B}$; $\text{D} = \text{C} -$ adó.`,
};

// ---------- Teljes feladatok ----------
const H = (hint, x) => (x.hint = hint, x);
const byName = (gens, name) => (...a) => H(HINTS[name], gens.find(g => g.name === name)(...a));
const kk = n => byName(kkGens, n), bs = n => byName(bsGens, n), pl = n => byName(plGens, n);

function kkSortCase() {
  const xs = kkData();
  return { title: 'Sorold be az eseményeket', stem: `Egy vállalkozás egy hónapjának eseményei:${kkList(xs)}Minden eseményről döntsd el, hogy kiadás, költség, mindkettő vagy egyik sem.`, parts: xs.map((x, i) => kk('kkClassify')(x, i)) };
}
function kkCase() {
  const xs = kkData(), i = R(0, 5);
  return { title: 'Kiadás vagy költség?', stem: `Egy vállalkozás egy hónapjának eseményei:${kkList(xs)}`, parts: [
    kk('kkSum')(xs, 'k'), kk('kkSum')(xs, 'c'), kk('kkSum')(xs, 'kn'), kk('kkClassify')(xs[i], i)] };
}
function bsCase() {
  const d = bsData(), vev = d.v('Vevőkkel szembeni követelések'), sz = d.v('Szállítókkal szembeni kötelezettségek'), L = R(5, 30) * 100;
  const evs = [
    [`A bankszámláról kiegyenlítik a teljes szállítói tartozást (${F(sz)}).`, 1, sz, 'Bankszámla (eszköz) −, szállítók (forrás) −: mindkét oldal csökken.'],
    [`A vevők átutalják a teljes tartozásukat (${F(vev)}).`, 2, vev, 'Bankszámla (eszköz) +, vevőkövetelés (eszköz) −: csak az eszközoldalon belül változik.'],
    [`${F(L)} hosszú lejáratú hitelt vesznek fel, a bankszámlára érkezik.`, 0, L, 'Bankszámla (eszköz) +, hitel (forrás) +: mindkét oldal nő.'],
  ].filter(e => e[1] !== 1 || d.v('Bankszámla egyenlege') >= sz);
  const [txt, t, a, what] = pick(evs), ch = t === 0 ? a : t === 1 ? -a : 0, res = d.E + ch;
  const last = H(HINTS.bsEvent, Q(`${txt} Mennyi lesz az új mérlegfőösszeg (ezer Ft)?`, res, t === 2 ? [
    [d.E + a, 'Csak a bankszámla növekedését vetted figyelembe. A vevőkövetelés ugyanennyivel csökken.'],
    [d.E - a, 'Csak a vevőkövetelés csökkenését vetted figyelembe. A bankszámla ugyanennyivel nő.'],
    [d.E + 2 * a, 'Mindkét változást növekedésnek vetted.']] : [
    [d.E - ch, 'Fordított irányba változtattad a főösszeget.'],
    [d.E, 'Nem változtattad a főösszeget. Ez az esemény a mérleg mindkét oldalát érinti, ezért a főösszeg is változik.'],
    [d.E + 2 * ch, 'Mindkét oldal változását beszámoltad. A főösszeg csak az egyik oldal összege.']],
    steps(['Melyik két tétel változik?', para(what)], ['Új főösszeg', fx(`${tx('Új főösszeg')} = ${f(d.E)} ${ch < 0 ? '-' : '+'} ${f(Math.abs(ch))}`, `= ${f(res)}`)]), f));
  return { title: 'Egyszerű mérleg', stem: `Egy vállalkozás mérlegtételei december 31-én (ezer Ft). Az eredménytartalék hiányzik.${bsStem(d)}`, parts: [
    bs('bsTotal')(d, 0), bs('bsTotal')(d, 1), bs('bsTotal')(d, 'E'), bs('bsTotal')(d, 3), bs('bsMissing')(d), last] };
}
function plCase() {
  const d = plData();
  return { title: 'Eredménykimutatás két eljárással', stem: `Egy termelő vállalkozás éves adatai (ezer Ft):${plStem(d, ['alap', 'nem', 'fun', 'fin'])}`, parts: [
    pl('okeAnyag')(d), pl('okeSzem')(d), pl('okeAktivalt')(d), pl('okeUzemi')(d), pl('fkeKozv')(d), pl('fkeBrutto')(d), pl('fkeUzemi')(d), pl('adozott')(d, 'D')] };
}

// ---------- Témák és elmélet ----------
const TH_KK = TeX`
<p>Négy fogalom, amelyeket a köznyelv keverten használ, de a vállalkozásnál mást jelentenek. Mindig az a kérdés, hogy <b>mihez</b> kötődik a tétel.</p>
<table><tr><th>Fogalom</th><th>Mihez kötődik?</th><th>Példa</th></tr>
<tr><td><b>Kiadás</b></td><td>pénz kiáramlása (kifizetés)</td><td>gépvásárlás átutalással</td></tr>
<tr><td><b>Költség</b></td><td>erőforrás-felhasználás az adott időszakban (anyag, munka, eszközök elhasználódása)</td><td>anyagfelhasználás, bér, értékcsökkenés</td></tr>
<tr><td><b>Ráfordítás</b></td><td>az eredmény: a bevételekkel szemben elszámolt, eredményt csökkentő tétel</td><td>az eladott termékek költsége, bírság</td></tr>
<tr><td><b>Bevétel</b></td><td>befolyó ellenérték, az eredményt növeli</td><td>árbevétel</td></tr></table>
<h3>Kiadás vagy költség? Két külön kérdés</h3>
<ol><li>Megy ki pénz <b>ebben</b> az időszakban? Ha igen: kiadás.</li><li>Felhasználtak erőforrást a tevékenységhez <b>ebben</b> az időszakban? Ha igen: költség.</li></ol>
<table><tr><th></th><th>Költség</th><th>Nem költség</th></tr>
<tr><th>Kiadás</th><td>a tárgyhavi bér kifizetése; készpénzért vett és rögtön felhasznált anyag; a tárgyhavi áramszámla</td><td>gépvásárlás; raktárra vett anyag; hiteltörlesztés; osztalék; jövő évi bérleti díj előre</td></tr>
<tr><th>Nem kiadás</th><td>értékcsökkenés; tavaly vett anyag felhasználása; tavaly előre fizetett díj idei része</td><td>eladás, hitelfelvétel, tőkebefizetés, kapott előleg (ezeknél pénz jön be)</td></tr></table>
<ul><li>A kettő <b>időben</b> válik el: a gép ára most kiadás, költség évente, az értékcsökkenéssel lesz belőle. Az előre fizetett bérleti díj most kiadás, költség akkor, amikor a helyiséget használják.</li>
<li>Vannak kiadások, amelyekből <b>soha</b> nem lesz költség: hiteltörlesztés, osztalékfizetés, értékpapír-vásárlás.</li>
<li>Vannak költségek, amelyekhez az adott időszakban nincs kiadás: értékcsökkenés, korábban vett anyag felhasználása.</li>
<li><b>Tágabb értelmezés:</b> sok tankönyv a kiadásba a kötelezettségvállalást is beleszámolja (pl. hitelre vásárolt anyag: még nem fizettek, de tartozás keletkezett). A gyakorló feladatai csak azonnal fizetett tételeket használnak, így a két értelmezés ugyanazt adja.</li>
<li><b>Költség vagy ráfordítás:</b> a költség a felhasználáskor keletkezik, ráfordítás akkor lesz belőle, amikor az eredménnyel szemben elszámolják (pl. a termék eladásakor). A raktárra termelt késztermék költsége még nem ráfordítás; ezért kell az eredménykimutatásban az állományváltozás. Ráfordítás, de nem költség például a bírság vagy a behajthatatlan követelés leírása.</li></ul>`;
const TH_BS = TeX`
<p>A <b>mérleg</b> egy adott napra (pl. december 31.) mutatja a vállalkozás vagyonát kétféle csoportosításban:</p>
<ul><li><b>Eszközök</b> (aktívák): mi van? Miben ölt testet a vagyon.</li><li><b>Források</b> (passzívák): kié? Honnan származik a vagyon.</li></ul>
<p>A kettő ugyanaz a vagyon, ezért mindig $\text{Eszközök} = \text{Források}$ (mérlegegyezőség). Ez az összeg a <b>mérlegfőösszeg</b>.</p>
<h3>A mérleg szerkezete (ezt kell tudni fejből leírni)</h3>
${schemaTbl(MERLEG)}
<p><b>Hogyan jegyezd meg?</b></p>
<ul><li>Eszközök: A–C, források: D–G. Mindkét oldal egy időbeli elhatárolással zárul (C. aktív, G. passzív).</li>
<li>Az eszközök a tartóstól a pénz felé haladnak: befektetett (A.), forgó (B.); a forgóeszközökön belül is: készlet → követelés → értékpapír → pénz (egyre „likvidebb”).</li>
<li>A források a sajáttól az idegen felé: saját tőke (D.), céltartalék (E.), kötelezettségek (F.); a kötelezettségeken belül a hosszútól a rövid felé: hátrasorolt → hosszú → rövid lejáratú.</li>
<li>Saját tőke (7 tétel): jegyzett tőke, a még be nem fizetett része (mínusz), tőketartalék, eredménytartalék, lekötött tartalék, értékelési tartalék, végül az idei adózott eredmény.</li></ul>
<h3>A csoportok</h3>
<ul><li><b>A. Befektetett eszközök:</b> tartósan, egy évnél tovább szolgálnak. Immateriális javak (szoftver, szabadalom), tárgyi eszközök (telek, épület, gép, jármű, beruházás), befektetett pénzügyi eszközök (tartós részesedés, tartósan adott kölcsön).</li>
<li><b>B. Forgóeszközök:</b> egy éven belül elhasználódnak vagy pénzzé válnak. Készletek (anyag, áru, késztermék, befejezetlen termelés), követelések (vevők), értékpapírok (forgatási célú), pénzeszközök (pénztár, bankszámla).</li>
<li><b>D. Saját tőke:</b> jegyzett tőke, tőketartalék, eredménytartalék, lekötött tartalék, értékelési tartalék, adózott eredmény.</li>
<li><b>F. Kötelezettségek:</b> hosszú lejáratú (egy éven túl, pl. beruházási hitel) és rövid lejáratú (szállítók, rövid lejáratú hitel, adótartozás, bértartozás, vevőktől kapott előleg).</li>
<li>C. Aktív és G. passzív időbeli elhatárolások, E. céltartalékok: az egyszerű mérlegben nem szerepelnek.</li></ul>
<h3>Hiányzó tétel</h3>
<p>Ha egy saját tőke tétel hiányzik: $\text{Saját tőke} = \text{Eszközök} - \text{Kötelezettségek}$, ebből vond le a többi saját tőke tételt.</p>
<h3>Csapdák</h3>
<ul><li><b>Vevők</b> (követelés): a vevő tartozik nekünk, ez eszköz. <b>Szállítók</b>: mi tartozunk, ez kötelezettség.</li>
<li><b>Vevőktől kapott előleg:</b> a vevő előre fizetett, mi tartozunk a teljesítéssel, ez kötelezettség.</li>
<li><b>Értékpapír:</b> forgatási célú (rövid távra) forgóeszköz, tartós befektetés befektetett eszköz.</li></ul>
<h3>Gazdasági események hatása</h3>
<p>Minden esemény (legalább) két mérlegtételt változtat meg, és a mérleg egyensúlyban marad. Négy típus:</p>
<table><tr><th>Típus</th><th>Példa</th><th>Főösszeg</th></tr>
<tr><td>Eszköz nő, forrás nő</td><td>hitelfelvétel; anyagvásárlás hitelre; tőkeemelés</td><td>nő</td></tr>
<tr><td>Eszköz csökken, forrás csökken</td><td>szállítói tartozás vagy hitel kifizetése a bankszámláról</td><td>csökken</td></tr>
<tr><td>Eszközcsere</td><td>készpénzfelvétel; a vevő fizet; gépvásárlás készpénzért</td><td>nem változik</td></tr>
<tr><td>Forráscsere</td><td>szállítói tartozás kifizetése hitelből; osztalék jóváhagyása az eredménytartalékból</td><td>nem változik</td></tr></table>`;
const TH_PL = TeX`
<p>Az <b>eredménykimutatás</b> egy időszakra (pl. egy évre) mutatja, hogyan jött ki az eredmény: bevételek mínusz ráfordítások. Két formája van (a vállalkozás választ), és <b>mindkettő ugyanazt az eredményt adja</b>: csak a költségeket csoportosítják másképp.</p>
<table><tr><th></th><th>Összköltség eljárás (ÖKE)</th><th>Forgalmi költség eljárás (FKE)</th></tr>
<tr><td>Csoportosítás</td><td>költségnemek szerint: mire költöttünk? (anyag, bér, értékcsökkenés)</td><td>funkció szerint: mire használtuk? (termelés, értékesítés, igazgatás)</td></tr>
<tr><td>Milyen költséget von le?</td><td>az időszak összes költségét</td><td>csak az eladott termékek közvetlen költségét, plusz az időszak közvetett költségeit</td></tr>
<tr><td>Készletváltozás</td><td>külön sorban korrigál (II.)</td><td>a közvetlen önköltségben</td></tr>
<tr><td>Köztes eredmény</td><td>nincs</td><td>értékesítés bruttó eredménye (III.)</td></tr></table>
<h3>Összköltség eljárás (ÖKE)</h3>
${schemaTbl(OKE)}
<p><b>Hogyan jegyezd meg?</b> Három bevétel jellegű sor (I–III: árbevétel, aktivált saját teljesítmény, egyéb bevétel), aztán négy ráfordítás (IV–VII): a költségnemek sorrendje anyag → ember → gép (értékcsökkenés) → egyéb. Ezekből jön az A. Utána a pénzügyi pár (VIII–IX) adja a B.-t, A + B = C, végül az adó (X) levonásával a D.</p>
<p><b>Miért kell a II. sor?</b> Az ÖKE az év összes költségét levonja, akkor is, ha a termék nem kelt el, hanem raktárra került. Készletnövekedésnél ezt a részt bevételként visszaadja (növeli az eredményt), készletcsökkenésnél levonja (a tavalyi gyártású, idén eladott termékek költsége nincs benne az idei költségekben).</p>
<h3>Forgalmi költség eljárás (FKE)</h3>
${schemaTbl(FKE)}
<p><b>Hogyan jegyezd meg?</b> Árbevétel (I.) mínusz közvetlen költség (II.) = bruttó eredmény (III.), mínusz közvetett költség (IV.), plusz-mínusz az egyéb bevétel és ráfordítás (V–VI) = A. Az A. alatt ugyanaz jön, mint az ÖKE-ben, csak a római számok eggyel kisebbek (VII–VIII pénzügyi, IX adó), mert az A. fölött itt hat római sor van, az ÖKE-ben hét.</p>
<p>Az eladott termékek közvetlen önköltsége: az idei közvetlen költségekből levonjuk a raktárra került részt (készletnövekedés) és a saját eszközként aktivált részt; készletcsökkenésnél hozzáadjuk.</p>
<p>$\text{közvetlen önköltség} = \text{közvetlen költségek} - (\text{záró} - \text{nyitó}) - \text{aktivált érték}$</p>
<h3>A kettő kapcsolata</h3>
<ul><li>A költségnemek összege = közvetlen költségek + közvetett költségek. Ugyanaz a pénz, két csoportosításban; egy feladatban mindkettő meg van adva, de egy kimutatásba csak az egyik kell.</li>
<li>Az értékcsökkenés az FKE-ben nem külön sor: benne van a funkció szerinti költségekben (a gépeké a közvetlenben, az irodáé az igazgatásiban).</li>
<li>Ha a készleteket közvetlen önköltségen tartják nyilván, a két eljárás üzemi eredménye (A.) pontosan megegyezik. Jó ellenőrzés: számold ki mindkettővel.</li></ul>
<h3>Közös rész (az A. sortól lefelé)</h3>
<table><tr><th>Sor</th><th>Számítás</th></tr>
<tr><td>B. Pénzügyi műveletek eredménye</td><td>pénzügyi műveletek bevételei − ráfordításai</td></tr>
<tr><td>C. Adózás előtti eredmény</td><td>$\text{A} + \text{B}$</td></tr>
<tr><td>D. Adózott eredmény</td><td>$\text{C} -$ adófizetési kötelezettség</td></tr></table>
<p>2016 óta nincs rendkívüli eredmény (a rendkívüli tételek az egyéb bevételek és ráfordítások vagy a pénzügyi tételek közé kerültek). Ha régi jegyzetben rendkívüli sort látsz, az a régi forma.</p>`;

// Röpdolgozat: szerkezet fejből és fogalmak, számolás nélkül. Számolás: külön fül, a röpdolgozathoz nem kell.
const EXAMS = [{ id: 1, name: 'Röpdolgozat' }, { id: 2, name: 'Számolás' }];
const only = (gens, ...names) => gens.filter(g => names.includes(g.name));
const SIDE = MERLEG.seq.findIndex(x => x.c === 'D' && !x.parent);
const TOPICS = [
  { exam: 1, id: 'kk', name: 'Kiadás és költség', en: 'kiadás, költség, ráfordítás, bevétel fogalma', gens: only(kkGens, 'kkClassify', 'kkExample', 'kkDef'), cases: [kkSortCase], theory: TH_KK },
  { exam: 1, id: 'merleg', name: 'A mérleg szerkezete', en: 'A–G csoportok és tételeik, besorolás', gens: [...structGens([MERLEG]), ...only(bsGens, 'bsClassify')],
    cases: [fillCase(MERLEG, 'A mérleg eszközoldala', MERLEG.seq.slice(0, SIDE)), fillCase(MERLEG, 'A mérleg forrásoldala', MERLEG.seq.slice(SIDE))], theory: TH_BS },
  { exam: 1, id: 'eredmeny', name: 'Az eredménykimutatás szerkezete', en: 'összköltség és forgalmi költség eljárás sorai', gens: [...structGens([OKE, FKE]), ...only(plGens, 'lineWhere', 'costLine')],
    cases: [fillCase(OKE, 'Összköltség eljárás'), fillCase(FKE, 'Forgalmi költség eljárás')], theory: TH_PL },
  { exam: 2, id: 'kk-szam', name: 'Kiadás és költség összege', en: 'a röpdolgozathoz nem kell', gens: only(kkGens, 'kkSum'), cases: [kkCase], theory: TH_KK },
  { exam: 2, id: 'merleg-szam', name: 'Mérleg számolás', en: 'a röpdolgozathoz nem kell', gens: only(bsGens, 'bsEvent', 'bsTotal', 'bsMissing', 'bsAfter'), cases: [bsCase], theory: TH_BS },
  { exam: 2, id: 'eredmeny-szam', name: 'Eredménykimutatás számolás', en: 'a röpdolgozathoz nem kell', gens: only(plGens, 'allomany', 'okeAnyag', 'okeSzem', 'okeAktivalt', 'okeUzemi', 'fkeKozv', 'fkeBrutto', 'fkeUzemi', 'adozott'), cases: [plCase], theory: TH_PL },
];

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

if (typeof module !== 'undefined') module.exports = { EXAMS, TOPICS, make, makeCase, goodCase, HINTS };
