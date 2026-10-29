# Pénzügyi számvitel I. – ZH tananyag-adatbázis

Pannon Egyetem, Pénzügyi számvitel I., ZH: 2026. október 29.
Forrás: tanári diák (elmélet), tanári feladatsorok és megoldásaik, órai jegyzetek, minta-ZH, 6 Moodle-teszt javítása, a kurzus számlatükre.
Ezt a mappát egy kódoló ügynök tananyag (kvíz, kártyák, gyakorló oldal) készítésére használja.

## Fájlok

| Fájl | Tartalom |
|---|---|
| `00_zh_info.json` | ZH szerkezete, pontozás, minta-ZH megoldás, **tanári tippek** (mi lesz és mi nem lesz) |
| `szamlaszamok.json` | A tanár által elfogadott számlaszámok. **Ütközés esetén ez az irányadó.** |
| `tesztkerdesek_moodle.json` | 142 Moodle-tesztkérdés a javítás szerinti helyes válasszal |
| `merlegsema.json` | Teljes mérlegséma (eszközök + források), oszlopnevek |
| `alapelvek_beszamolo.json` | Számviteli törvény, beszámolók, alapelvek (tartalmi/formai csoportosítás) |
| `cegalapitas.json` | Cégalapítás elmélet + feladatok (fogalom NEM lesz belőle a ZH-n) |
| `targyi_eszkozok.json` | Tárgyi eszközök |
| `immaterialis_javak.json` | Immateriális javak |
| `vasarolt_keszletek.json` | Vásárolt készletek |
| `sajat_termelesu_keszletek.json` | Saját termelésű készletek (csak 5-ös számlaosztály!) |
| `ismetlo_feladatsor.json` | Könyvviteli ismeretek ismétlő feladatsor + megoldások |

## Közös séma a témafájlokhoz

```jsonc
{
  "tema": "string",
  "forrasok": ["fájlnév", ...],
  "zh_relevancia": "string – mennyire és hogyan jöhet a ZH-n (a tanári tippek alapján)",
  "fogalmak": [{"id","nev","definicio","kulcselemek":[string],"pelda":string|null,"zh_valoszinuseg":"magas|kozepes|alacsony","forras"}],
  "szabalyok": [{"id","cim","tartalom","forras"}],          // értékelési szabályok, csoportosítások, feltételek
  "osszefuggesek": [{"id","cim","leiras","keplet":string|null,"kapcsolodo":[id]}],
  "konyvelesi_minta": [{"id","esemeny","T","K","osszeg":"hogyan számoljuk","megjegyzes"}],
  "feladatok": [{
     "id","forras","cim","szoveg","adatok":{},
     "megoldas":{"szamitasok":[{"mit","keplet","eredmeny"}],
                 "tetelek":[{"sorszam","esemeny","T","K","osszeg","szamitas"}],
                 "egyeb":{}},              // kalkuláció, eredménykimutatás stb.
     "tanulsagok":[string], "elteresek_a_forrasban":[string]}],
  "gyakorlo_kerdesek": [{"id","tipus":"egyvalasztos|tobbvalasztos|igaz_hamis|parositas|szamitas|kifejtes|merlegsor",
     "kerdes","opciok":[string]|null,"helyes":any,"magyarazat","forras":"tananyag|feladat|teszt|generalt"}],
  "csapdak": [string]
}
```

Szabályok: a számlaszámok a kurzus számlatükre szerint, lehetőleg 4 jegyre; a forrásban lévő hibákat az `elteresek_a_forrasban` mező jelöli.
