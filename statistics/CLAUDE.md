# statistics – Statisztika zh gyakorló

A hub (`../CLAUDE.md`) egyik tárgya. Statikus oldal (nincs build): véletlenszerűen generált gyakorlófeladatok a University of Pannonia **Statistics** tárgyához (oktató: Hasan Askarli). A zh angol nyelvű.

Élő: https://zsalrick.github.io/gyakorlas/statistics/

## Fájlok
- `index.html` – teljes UI (CSS + app logika inline): témalista, kvíz lapozással (ragadós fejléc: számozott sáv + nyilak, ragadós lábléc: Előző/Következő; tipp), teljes feladat nézet, eredmények két táblában (`localStorage`, kulcs: `stat-gyakorlo-v1`, ezt ne nevezd át, különben elvesznek az eredmények), elmélet nézet. Fejlécben link vissza a hubra (`../`).
- `gen.js` – minden tartalom: 54 kérdésgenerátor 8 témában (`TOPICS[].gens`), 10 teljes feladat (`TOPICS[].cases`), tippek (`HINTS`), elmélet (`TOPICS[].theory`).
- `check.js` – önellenőrzés: `node check.js` (minden generátor 2000×, minden teljes feladat 1000×: 4 különböző opció, pontosan 1 helyes, van tipp, nincs NaN/undefined, páros számú `$`). **Minden változtatás után futtasd.**
- `texcheck.js` – képlet-ellenőrzés KaTeX-szel (minden generált képletet lefordít, backslash nélküli TeX-parancsot is keres). Egyszer: `npm i --no-save katex@0.16.11`, utána `node texcheck.js`. Képletek módosítása után futtasd.

## Hogyan épül fel egy kérdés (`gen.js`)
- Generátor = elnevezett függvény egy téma `gens` tömbjében, és `Q(q, correct, wrongs, sol, fm)`-et ad vissza.
  - `q`: a kérdés angolul (HTML, képlet `$…$`).
  - `wrongs`: `[[érték, why], …]`, és minden rossz válasz egy **tipikus hiba** (fordított osztás, n vs n − 1, elmaradt √, rossz farok…). A `why` magyarul mondja meg, mi a hiba. Ha nincs elég különböző rossz válasz, a `make()` újragenerál.
  - `sol`: részletes levezetés: `steps([cím, tartalom], …)` számozott lépések, `fx(sor1, sor2, …)` képletblokk (soronként egy számolási lépés, az első `=`-nél igazítva), `tbl`/`legend` táblázat, `para` bekezdés, `hl` kiemelés.
  - `fm`: az opciók formázása (`f(x, d)` szám, `pc(x)` százalék).
- Tipp: `HINTS[generátor neve]`, kötelező (a `check.js` ellenőrzi).
- Teljes feladat: függvény a téma `cases` tömbjében, `{ title, stem, parts: [H(tipp, Q(...)), …] }`; a részek ugyanarra az adatsorra épülnek. Meglévő generátor újrahasznosítható: `byName(central, 'groupedMean')(t)`.
- Képletek: KaTeX. Szövegben `$…$`, blokkban `fx()`. TeX-et `` TeX`…` `` (String.raw) taggel írj, így a backslash megmarad; sima `'…'` stringben `\\frac` kell (különben a `\f` vezérlőkarakter lesz). `<`/`>` helyett `\lt`/`\gt` (HTML-be kerül). A `%`-ot és az ezres vesszőt a `tex()` kezeli.
- Közös segédek: `posSol` (csoportos medián/kvartilis levezetés), `TT1`/`TT2` (t-táblázat), `Phi` (standard normális eloszlásfüggvény), `tData`/`zData` (egymintás t- és z-próba adatai), `DIR` (two / right / left-tailed szavak és jelek), `anovaTbl`, `groupTbl`.

## Bővítés új tananyaggal
A felhasználó PDF-ben (diák) adja a tananyagot; ezek **nem kerülnek a repóba** (nyilvános repó, az oktató anyaga). Szöveg kinyerése: `python -c "import fitz; ..."` (PyMuPDF) vagy `pdftotext`. A képletek sokszor csak képként vannak a diákon, ilyenkor a dia képét is nézd meg.
1. **Új téma** (új előadás): új generátor-tömb, `HINTS` bejegyzések, legalább egy teljes feladat a diák példája alapján, és egy új elem a `TOPICS` tömbben (`id`, `name` magyarul, `en` = az előadás angol címe, `gens`, `cases`, `theory`). A témalista és az eredmények automatikusan frissülnek.
2. **Új kérdéstípus meglévő témába**: generátor a téma `gens` tömbjébe + `HINTS` bejegyzés. Ha új képlet, az elméletbe (`theory`) is írd be.
3. **Diahibák**: ha a diákon hibás eredmény vagy jelölés van, a helyeset tanítsd, és az elméletben jelezd (lásd a viszonyszámoknál és a szórásnál).
4. Futtasd: `node check.js` és `node texcheck.js`. Utána ellenőrizd böngészőben is (helyi szerver: `python -m http.server` a hub gyökeréből, majd `/statistics/`).

## Tananyag-sajátosságok
- A viszonyszámoknál a diák magyar rövidítéseket használnak (Vm, Vk, Vdb, Vdl, Vf, Vt, Vi, Vö; V = viszonyszám + a magyar név kezdőbetűje). A diákon több jelölési hiba van, ezek az elméletben jelölve.
- Hipotézisvizsgálat: páros t-próba, egymintás t-próba (t-táblázat), z-próba p-értékkel (Φ-táblázat). Az iránnyal (two / right / left-tailed) a felhasználó sokat bizonytalankodott, a magyarázatokban mindig legyen benne, melyik szóból derül ki.
- Two-way ANOVA a diákon csak elméletben szerepel, számolós feladat nincs hozzá.
