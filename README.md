# Soccer Manager – szakdolgozat projekt

Ez a projekt egy webes, single-player futballmenedzser játék, amelyben a játékos egy kiválasztott csapat menedzsereként vesz részt egy bajnokságban. A játék célja a bajnokság megnyerése, miközben a menedzser taktikát állít, keretet kezel, játékosokat igazol vagy ad el, stadiont fejleszt, pénzügyeket figyel, valamint reagál a mérkőzések során bekövetkező eseményekre, sérülésekre és eltiltásokra.

A projekt fullstack alkalmazásként készült:

- **Frontend:** React + Vite
- **Backend:** NestJS
- **Adatbázis:** PostgreSQL
- **ORM:** Prisma
- **Állapotkezelés:** Zustand
- **Autentikáció:** JWT alapú login/register rendszer

---

## Fő funkciók

### Felhasználókezelés

- Regisztráció
- Bejelentkezés
- JWT alapú autentikáció
- Saját mentések kezelése

### Mentésrendszer

A felhasználó több külön karriert / mentést is létrehozhat. Egy mentés tartalmazza:

- kiválasztott csapatot
- aktuális bajnoki szezont
- aktuális fordulót
- csapatokat
- játékosokat
- tabellát
- meccseket
- átigazolási előzményeket
- korábbi bajnokokat

### Bajnokság és fordulók

A játék egy bajnoki rendszerre épül, ahol több csapat vesz részt. A játékos csapata mellett a többi klub botként működik.

A bajnokságban:

- fordulók vannak
- minden fordulóban több mérkőzés zajlik
- a saját meccs és a többi meccs is szimulációval dől el
- a tabella automatikusan frissül
- a szezon végén bajnokot hirdet a rendszer

### Meccsszimuláció

A mérkőzések nem előre megadott eredmények alapján működnek, hanem a csapatok és játékosok állapotából számított szimulációval.

A szimuláció figyelembe veszi:

- játékosok overall értékét
- pozíciókat
- kezdőcsapatot
- taktikai beállítást
- sérüléseket
- eltiltásokat
- piros lapok hatását
- várható gólokat
- csapat támadó/védekező erejét

A Match Summary tartalmazza:

- végeredményt
- gólszerzőket
- cseréket
- sárga lapokat
- piros lapokat
- második sárgás kiállításokat
- sérülés eventeket
- taktikai hatást
- meccsnapi pénzügyi adatokat
- kezdőcsapatokat és cserepadot

### Taktikai rendszer

A menedzser beállíthatja a csapat játékstílusát:

- **Kiegyensúlyozott**
- **Támadó**
- **Védekező**

A taktika hatással van a szimulációra:

- a támadó taktika növeli a saját xG-t, de nagyobb teret ad az ellenfélnek
- a védekező taktika csökkenti az ellenfél xG-jét, de a saját támadójáték is visszafogottabb
- a kiegyensúlyozott taktika alapértelmezett, stabil működésű

A taktikai hatás a Match Summaryban is megjelenik.

### Keretkezelés

A Squad oldalon a felhasználó kezelheti a csapatát:

- kezdőcsapat összeállítása
- cserepad kezelése
- formáció választása
- játékosok pozícióba helyezése
- auto-pick funkció
- játékos tooltip statisztikákkal
- szerződéshosszabbítás

A játék ellenőrzi, hogy a kezdőcsapat szabályos-e. Nem lehet mérkőzést indítani, ha:

- nincs 11 bevethető kezdőjátékos
- sérült játékos van a kezdőben
- eltiltott játékos van a kezdőben
- lejárt szerződésű játékos van a kezdőben
- hibás vagy hiányos lineup slot van beállítva

### Fitness és sérülések

A játékosok fitness értékkel rendelkeznek. Meccsek után:

- a kezdők jobban fáradnak
- a cserepadon lévők kisebb mértékben fáradnak
- bizonyos eséllyel sérülés történhet

A sérülések fordulókban vannak mérve. A sérült játékos:

- nem választható kezdőbe
- nem szerepelhet meccsen
- fordulónként gyógyul
- gyógyulás után újra bevethető

### Lapok és eltiltások

A meccseken előfordulhat:

- sárga lap
- piros lap
- második sárga lapból piros

A piros lap hatással van a mérkőzésre:

- a kiállított játékos a piros lap után már nem lehet gólszerző
- nem lehet lecserélni a kiállítása után
- a csapata xG-büntetést kap
- az ellenfél kisebb xG-bónuszt kap
- a játékos a következő fordulóra eltiltást kap

Az eltiltott játékos a következő fordulóban nem játszhat.

### Átigazolási rendszer

A Transfer oldalon:

- megjelennek a piacon lévő játékosok
- a menedzser vásárolhat játékost
- saját játékost átadólistára tehet
- saját játékost levehet az átadólistáról
- a vásárlások és eladások hatással vannak a balance-ra
- az átigazolási előzmények mentésre kerülnek

Az átadólistás játékos továbbra is játszhat, de a Dashboard figyelmeztetést adhat róla.

### Pénzügyi rendszer

A csapat rendelkezik balance értékkel. A pénzügyi rendszerre hatással van:

- játékosvásárlás
- játékoseladás
- stadionfejlesztés
- meccsnapi jegybevétel
- fordulónkénti fizetéslevonás
- szerződéshosszabbítás

A fizetések nem csak kijelzett adatok: fordulónként szezonarányos bérköltségként levonódnak a csapat balance-ából.

### Stadionrendszer

A Stadion oldalon a menedzser fejlesztheti a stadiont.

A stadion rendelkezik:

- szinttel
- férőhellyel
- fejlesztési költséggel
- becsült jegybevétellel

A stadion szintje és férőhelye befolyásolja a hazai meccsek jegybevételét.

### Szerződésrendszer

A játékosok szerződéshosszal rendelkeznek.

Új szezon indításakor:

- a saját csapat játékosainak szerződése 1 évvel csökken
- ha egy játékos szerződése 0 évre csökken, lejárt szerződésű lesz
- lejárt szerződésű játékos nem játszhat
- a Squad oldalon szerződést lehet hosszabbítani

Szerződéshosszabbítás:

- +1 év
- maximum 5 év
- költsége: `salary * 1.5`
- a költség a csapat balance-ából vonódik le

A botcsapatok szerződéseit a rendszer automatikusan karbantartja, hogy a bajnokság szimulációja ne akadjon el.

### Új szezon indítása

A szezon végén új szezon indítható.

Új szezon indításakor:

- a bajnok mentésre kerül a bajnok-historikába
- a tabella nullázódik
- a fixture-ek újragenerálódnak
- a régi meccseredmények törlődnek
- a játékosok gólstatisztikái nullázódnak
- a sérülések törlődnek
- a fitness értékek visszaállnak 100-ra
- az eltiltások törlődnek
- a saját csapat szerződései csökkennek
- a játékosok, csapatok, stadion, balance és taktika megmaradnak

A Dashboardon megjelenik a korábbi bajnokok listája, valamint hogy melyik csapat hányszor nyerte meg a bajnokságot az adott mentésben.

---

## Projektstruktúra

A projekt két fő részből áll:

```txt
soccer-manager-backend/
  prisma/
  src/
  package.json

frontend/
  src/
  public/
  package.json