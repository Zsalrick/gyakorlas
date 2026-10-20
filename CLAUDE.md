# statistics – Statisztika zh gyakorló

Statikus weboldal (nincs build, nincs függőség): véletlenszerűen generált statisztika gyakorlófeladatok a University of Pannonia Statistics tárgyához.

## Fájlok
- `index.html` – teljes UI (CSS + app logika inline): témaválasztás, kvíz lapozással (számozott sáv, Előző/Következő, tipp), teljes feladat nézet, eredmények (localStorage), elmélet nézet.
- `gen.js` – 46 feladatgenerátor 8 témában (`TOPICS[].gens`), `make(g)` újragenerál, amíg mind a 4 válasz tipikus hibából jön, és rárakja a tippet (`HINTS[g.name]`). Témánként egy teljes feladat (`TOPICS[].cases`): közös adatsor + részkérdések, `makeCase(c)`. Minden rossz opcióhoz `why` magyarázat, minden kérdéshez `sol` levezetés.
- `check.js` – önellenőrzés: `node check.js` (minden generátor 2000×, minden teljes feladat 1000×; 4 különböző opció, pontosan 1 helyes, van tipp, nincs NaN). Változtatás után futtasd.

## Közzététel
GitHub Pages a `main` ág gyökeréből: https://zsalrick.github.io/statistics/ (repó: Zsalrick/statistics). Push után 1-2 perc.

## Tananyag
A diák (Hasan Askarli, University of Pannonia) a viszonyszámoknál magyar rövidítéseket használnak (Vm, Vk, Vdb, Vdl, Vf, Vt, Vi, Vö); a diákon több jelölési hiba van, ezek az elméletben jelölve.

## Stílusszabályok
- Nincs emoji, nincs sablonos „AI” szöveg vagy dizájn (lila gradiens, kártyasorok, árnyékok).
- Papír háttér, egy kiemelőszín, Source Serif 4 + IBM Plex Sans/Mono, vékony vonalak. Mobilbarát, sötét mód.
- Kérdések angolul (a zh is angol), magyarázatok magyarul: angol szakszó, utána zárójelben a magyar jelentés.
