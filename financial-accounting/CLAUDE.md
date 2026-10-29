# financial-accounting – Pénzügyi számvitel I. gyakorló

A hub (`../CLAUDE.md`) egyik tárgya, magyar nyelvű. ZH: 2026. október 29. (90 perc: elmélet 30 pont, gyakorlat 71 pont).

Élő: https://zsalrick.github.io/gyakorlas/financial-accounting/

## Eltérés a többi tárgytól
Ez **nem generátoros** (nincs `gen.js`): a tartalom egy kész tananyag-adatbázis az `anyag/` mappában (JSON, séma: `anyag/README.md`). Egy másik Claude-munkamenetben készült a tanári diákból, a feladatsorokból, a minta-ZH-ból és a Moodle-javításokból. Az eredeti PDF-ek nincsenek a repóban.
- `index.html` – a közös stílus (`analysis-methodology/index.html` másolata, KaTeX nélkül) + saját CSS: `.tk` (T/K beviteli sor), `.tetel`, `.hide td.m` (rejtett mérlegsor-nevek).
- `app.js` – betölti az `anyag/*.json` fájlokat (`fetch`, ezért helyben webszerver kell: `python -m http.server`), és négy nézetet ad témánként: Elmélet, Kérdések, Könyvelés (véletlen tételek, T és K beírása), Feladatok (teljes feladat tételenként). A „Kezdd itt” elmélet (`START`) és az 5 órás terv (`PLAN`) kézzel írt.
- `localStorage` kulcs: `szamv-gyakorlo-v1`.
- `check.js` – `node check.js`: minden kérdés és tétel megjeleníthető-e, plusz a számlaszám-egyezés esetei.

## Szabályok
- Számlaszámok: ütközéskor az `anyag/szamlaszamok.json` az irányadó. A könyvelési gyakorló a pontosabb vagy a 3 jegyű főszámlát is elfogadja (`sameAcct`: 466 ~ 4661, 91-92 bármelyik tagja).
- Kérdéstípusok (`normQ`): választós és igaz/hamis (kattintás), többválasztós (kijelölés + Ellenőrzés), párosítás (legördülő), minden más kártya (megoldás mutatása, „tudtam / nem tudtam”).
- Bővítés: új JSON a fenti sémával az `anyag/` mappába + egy sor a `TOPICS` tömbbe.
