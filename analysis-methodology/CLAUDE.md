# analysis-methodology – Elemzés módszertan gyakorló

A hub (`../CLAUDE.md`) egyik tárgya. Statikus oldal (nincs build): véletlenszerűen generált gyakorlófeladatok a University of Pannonia **Elemzés módszertan** tárgyához. A tárgy magyar nyelvű, a kérdések is magyarul vannak.

Élő: https://zsalrick.github.io/gyakorlas/analysis-methodology/

## Fájlok
- `index.html` – a `statistics/index.html` másolata (UI, stílus). Eltérések: cím és morzsamenü, `localStorage` kulcs `elem-gyakorlo-v1` (ne nevezd át), plusz két CSS-szabály: `.l` (táblázat balra zárt első oszloppal, tételnevekhez) és `.in` (behúzott alsor). Ha a statisztika felülete változik, a változást ide is vezesd át.
- `gen.js` – minden tartalom: 20 kérdésgenerátor 3 témában, 3 teljes feladat, tippek (`HINTS`), elmélet. `EXAMS`: egyetlen „Röpdolgozat”.
- `check.js`, `texcheck.js` – ugyanaz, mint a statisztikánál (`node check.js`, `node texcheck.js`). **Minden változtatás után futtasd.**

## Témák (Röpdolgozat)
1. **Kiadás és költség** (`kk`): kiadás / költség / ráfordítás / bevétel. Esemény besorolása a négy kategóriába (kiadás és költség is; kiadás, de nem költség; költség, de nem kiadás; egyik sem), egy hónap kiadásának / költségének összege. Események: `EVENTS`.
2. **Mérleg** (`merleg`): tétel besorolása (befektetett eszköz, forgóeszköz, saját tőke, kötelezettség), csoportösszegek, mérlegfőösszeg, hiányzó eredménytartalék, gazdasági események négy típusa és hatásuk a főösszegre. Tételek: `BS`, események: `BEV`.
3. **Eredménykimutatás** (`eredmeny`): összköltség eljárás (ÖKE) és forgalmi költség eljárás (FKE) levezetése ugyanabból az adatsorból (`plData`). A költségek költségnemek szerint és funkció szerint is meg vannak adva; a saját termelésű készletek közvetlen önköltségen, ezért a két üzemi eredmény mindig egyenlő.

## Tananyag
- **Diák nélkül készült** (a felhasználó csak a témákat adta meg): a 2000. évi C. törvény (számviteli törvény) mérleg- és eredménykimutatás-sémái alapján, 2016 utáni forma (nincs rendkívüli eredmény). A kiadás itt pénzkifizetés; a feladatokban nincs hitelre vásárlás, így a tágabb értelmezés (kötelezettségvállalás is kiadás) ugyanazt adja.
- Ha megjönnek a diák (PDF, nem kerülnek a repóba): a fogalmak meghatározását, a jelöléseket és a sorok nevét igazítsd az óra anyagához, és az eltéréseket jelöld az elméletben.
- Bővítés ugyanúgy, mint a statisztikánál (`../statistics/CLAUDE.md`): generátor a téma `gens` tömbjébe + `HINTS` bejegyzés; teljes feladat a `cases`-be. A generátorok opcionálisan megkapják a közös adatsort (`okeUzemi(d)`), a teljes feladat így építi fel a részeit (`pl('okeUzemi')(d)`).
- Számformátum magyar: `f()` ezres tagolás nem törő szóközzel, negatív előjel „−”; a `tex()` ezt `\,`-re és `-`-ra cseréli a képletekben.
