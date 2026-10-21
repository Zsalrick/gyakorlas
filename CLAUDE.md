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
- **Stílus:** nincs emoji, nincs sablonos „AI” szöveg vagy dizájn (lila gradiens, kártyasorok, árnyékok). Papír háttér, egy kiemelőszín, Source Serif 4 + IBM Plex Sans/Mono, vékony vonalak. Mobilbarát (ragadós navigáció fent és lent), sötét mód.
- **Tananyag:** a felhasználó PDF-ben adja (diák). Ezek az oktatók anyagai, **nem kerülnek a repóba** (nyilvános). A diákon lévő hibákat javítsd, és jelöld az elméletben.
- **Külső függőség** csak CDN-ről, rögzített verzióval és SRI-hash-sel (pl. KaTeX 0.16.11 jsdelivr). Nincs npm build; a `node_modules` csak helyi ellenőrzéshez kell, és gitignore-olva van.
- Commit üzenet magyarul.
