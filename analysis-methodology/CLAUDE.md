# analysis-methodology – Elemzés módszertan gyakorló

A hub (`../CLAUDE.md`) egyik tárgya. Statikus oldal (nincs build): véletlenszerűen generált gyakorlófeladatok a University of Pannonia **Elemzés módszertan** tárgyához. A tárgy magyar nyelvű, a kérdések is magyarul vannak.

Élő: https://zsalrick.github.io/gyakorlas/analysis-methodology/

## Fájlok
- `index.html` – a `statistics/index.html` másolata (UI, stílus). Eltérések: cím és morzsamenü, `localStorage` kulcs `elem-gyakorlo-v1` (ne nevezd át), plusz két CSS-szabály: `.l` (táblázat balra zárt első oszloppal, tételnevekhez) és `.in` (behúzott alsor). Ha a statisztika felülete változik, a változást ide is vezesd át.
- `gen.js` – minden tartalom: generátorok, teljes feladatok, tippek (`HINTS`), elmélet (`TH_KK`, `TH_BS`, `TH_PL`, két fül közös).
- `index.html` a statisztikához képest még: `L` 16 betűs (a sorról sorra feladatnak 14 része is lehet), `.sch` (szerkezet-táblázat, törhető sorokkal).
- `check.js`, `texcheck.js` – ugyanaz, mint a statisztikánál (`node check.js`, `node texcheck.js`). **Minden változtatás után futtasd.**

## Mi kell a röpdolgozatra
A felhasználó szerint: **fejből leírni a mérleget és a kétféle eredménykimutatást (ÖKE, FKE), számolás nélkül**, és tudni a kiadás és a költség fogalmát. Ezért két fül van (`EXAMS`):
- **Röpdolgozat** (`exam: 1`): `kk` (fogalmak, esemény besorolása), `merleg` (szerkezet A–G a tételekkel + tétel besorolása), `eredmeny` (ÖKE és FKE sorai, képletek, melyik sor melyik kimutatásban). A szerkezet adatai: `MERLEG`, `OKE`, `FKE` (`schema()`); kérdések: `structGens()` (sor neve, jele, mi jön utána, melyik sorba tartozik, képlet); teljes feladat: `fillCase()`, sorról sorra leírás, a levezetés az „eddig így néz ki” táblázat.
- **Számolás** (`exam: 2`, a röpdolgozathoz nem kell): az alábbi számolós generátorok és teljes feladatok.

## Számolós témák
1. **Kiadás és költség** (`kk-szam`): kiadás / költség / ráfordítás / bevétel. Esemény besorolása a négy kategóriába (kiadás és költség is; kiadás, de nem költség; költség, de nem kiadás; egyik sem), egy hónap kiadásának / költségének összege. Események: `EVENTS`.
2. **Mérleg** (`merleg-szam`): tétel besorolása (befektetett eszköz, forgóeszköz, saját tőke, kötelezettség), csoportösszegek, mérlegfőösszeg, hiányzó eredménytartalék, gazdasági események négy típusa és hatásuk a főösszegre. Tételek: `BS`, események: `BEV`.
3. **Eredménykimutatás** (`eredmeny-szam`): összköltség eljárás (ÖKE) és forgalmi költség eljárás (FKE) levezetése ugyanabból az adatsorból (`plData`). A költségek költségnemek szerint és funkció szerint is meg vannak adva; a saját termelésű készletek közvetlen önköltségen, ezért a két üzemi eredmény mindig egyenlő.

## Tananyag
- **Diák nélkül készült** (a felhasználó csak a témákat adta meg): a 2000. évi C. törvény (számviteli törvény) mérleg- és eredménykimutatás-sémái alapján, 2016 utáni forma (nincs rendkívüli eredmény). A kiadás itt pénzkifizetés; a feladatokban nincs hitelre vásárlás, így a tágabb értelmezés (kötelezettségvállalás is kiadás) ugyanazt adja.
- Ha megjönnek a diák (PDF, nem kerülnek a repóba): a fogalmak meghatározását, a jelöléseket és a sorok nevét igazítsd az óra anyagához, és az eltéréseket jelöld az elméletben.
- Bővítés ugyanúgy, mint a statisztikánál (`../statistics/CLAUDE.md`): generátor a téma `gens` tömbjébe + `HINTS` bejegyzés; teljes feladat a `cases`-be. A generátorok opcionálisan megkapják a közös adatsort (`okeUzemi(d)`), a teljes feladat így építi fel a részeit (`pl('okeUzemi')(d)`).
- Számformátum magyar: `f()` ezres tagolás nem törő szóközzel, negatív előjel „−”; a `tex()` ezt `\,`-re és `-`-ra cseréli a képletekben.
