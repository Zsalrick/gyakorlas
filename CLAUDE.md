# gyakorlas – zh-gyakorló hub

Statikus weboldal (nincs build, nincs szerveroldal): a felhasználó egyetemi tárgyaihoz (University of Pannonia) generált gyakorlófeladatok, tárgyanként külön mappában. A főoldal (`index.html`) a tárgyak listája.

Élő: https://zsalrick.github.io/gyakorlas/ (repó: Zsalrick/gyakorlas, GitHub Pages a `main` ág gyökeréből, push után 1-2 perc).

## Szerkezet
```
index.html          hub: a tárgyak listája (kézzel szerkesztett <ul>)
CLAUDE.md           ez a fájl: a hub szabályai
<tárgy>/            minden tárgy önálló, saját index.html-lel
  CLAUDE.md         a tárgy saját leírása: fájlok, bővítés, tananyag-sajátosságok
statistics/         Statistics (angol nyelvű)
analysis-methodology/  Elemzés módszertan (magyar nyelvű)
financial-accounting/  Pénzügyi számvitel I. (magyar; nem generátoros, a tartalom az anyag/ JSON-adatbázis)
```
Egy tárgyon dolgozva **először a tárgy `CLAUDE.md`-jét olvasd el**.

## Új tárgy felvétele
1. Új mappa angol, kisbetűs, kötőjeles névvel (pl. `accounting/`). Kiindulásnak másold a `statistics/` mappát: a felület (`index.html`) általános, a tartalom (`gen.js`) cserélendő. Ugyanaz a felépítés: `TOPICS` (gens, cases, theory), `HINTS`, `make`/`makeCase`.
2. A `localStorage` kulcsát az `index.html`-ben **írd át** a tárgyra egyedire (pl. `acc-gyakorlo-v1`): minden tárgy ugyanazon az originen (zsalrick.github.io) fut, különben összekeverednek az eredmények.
3. A tárgy `index.html` fejlécében legyen link vissza a hubra (`../`).
4. Írj a mappába `CLAUDE.md`-t a tárgyról (a `statistics/CLAUDE.md` a minta).
5. Vedd fel a hub `index.html` listájába (sorszám, név, egysoros leírás).
6. Futtasd a tárgy ellenőrzőit (`node check.js`), nézd meg böngészőben, majd commit és push.

## Közös szabályok
- **Nyelv:** a kérdések a zh nyelvén (Statistics: angol), a magyarázatok magyarul: angol szakszó, utána zárójelben a magyar jelentés. A felhasználó magyarul tanulta az anyagot, a magyar megfelelőkre mindig szüksége van.
- **Minden kérdéshez:** tipp (válasz előtt elkérhető), minden rossz válaszhoz „miért nem” magyarázat, és részletes, lépésenkénti levezetés táblázattal és képletekkel (KaTeX, soronként egy számolási lépés). A felhasználó ezt kifejezetten kérte.
- **Stílus: nyomtatott jegyzet, nem „AI-sablon”.** A felhasználó ezt kifejezetten kérte. Tilos: emoji, Inter/Roboto/Space Grotesk vagy rendszerbetű, lila vagy bármilyen gradiens, ragyogás, üveghatás, árnyék, kártya a kártyában, egyforma nagy lekerekítés, színes oldalcsíkok mindenhol, státuszpöttyök, harmadik font (mono).
  Helyette: papír háttér, tinta, **egy** kiemelőszín (`--accent`), a zöld és a piros csak helyes/hibás válaszra. Source Serif 4 a címekhez, IBM Plex Sans a szöveghez (`tabular-nums`). Szögletes formák, vékony vízszintes vonalak, a táblázatokban csak vízszintes vonal. Soronként egy kitöltött gomb (fő művelet), a többi szöveges link. 17 px szöveg, 1.6 sortáv, ~66 karakteres sorhossz (Butterick: Practical Typography).
  Mobilbarát (ragadós navigáció fent és lent, a tárgyoldalak `<nav class="crumbs">` morzsamenüvel), sötét mód. A tokenek (`:root`) és a stílus a `statistics/index.html`-ben van; új tárgynál ezt másold, ne találj ki újat.
- **Tananyag:** a felhasználó PDF-ben adja (diák). Ezek az oktatók anyagai, **nem kerülnek a repóba** (nyilvános). A diákon lévő hibákat javítsd, és jelöld az elméletben.
- **Külső függőség** csak CDN-ről, rögzített verzióval és SRI-hash-sel (pl. KaTeX 0.16.11 jsdelivr). Nincs npm build; a `node_modules` csak helyi ellenőrzéshez kell, és gitignore-olva van.
- Commit üzenet magyarul.
