# statistics – Statisztika zh gyakorló

Statikus weboldal (nincs build, nincs függőség): véletlenszerűen generált statisztika gyakorlófeladatok a University of Pannonia Statistics tárgyához.

## Fájlok
- `index.html` – teljes UI (CSS + app logika inline): témaválasztás, kvíz, eredmények (localStorage), elmélet nézet.
- `gen.js` – 45 feladatgenerátor 8 témában (`TOPICS`), `make(g)` újragenerál, amíg mind a 4 válasz tipikus hibából jön. Minden rossz opcióhoz `why` magyarázat, minden kérdéshez `sol` levezetés.
- `check.js` – önellenőrzés: `node check.js` (minden generátor 2000×; 4 különböző opció, pontosan 1 helyes, nincs NaN). Változtatás után futtasd.

## Teendő (első lépés Claude Code-ban)
1. `git init -b main`, commit.
2. GitHub repó létrehozása a Zsalrick fiókban: `gh repo create Zsalrick/statistics --public --source=. --push --description "Statisztika zh gyakorló"`
3. GitHub Pages bekapcsolása a main ág gyökeréből:
   `gh api -X POST repos/Zsalrick/statistics/pages -f "source[branch]=main" -f "source[path]=/"`
4. Ellenőrzés pár perc múlva: https://zsalrick.github.io/statistics/

## Stílusszabályok
- Nincs emoji, nincs sablonos „AI” szöveg vagy dizájn (lila gradiens, kártyasorok, árnyékok).
- Papír háttér, egy kiemelőszín, Source Serif 4 + IBM Plex Sans/Mono, vékony vonalak. Mobilbarát, sötét mód.
- Kérdések angolul (a zh is angol), magyarázatok magyarul: angol szakszó, utána zárójelben a magyar jelentés.
