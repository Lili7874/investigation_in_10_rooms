// src/scenes/LevelCasino.js
/* 
Rozstrzygnięcie (ukryta prawda – poziom 9)

Sprawca: Piotr
Przedmiot sprawcy: Marynarka w kratę (paragon 01:17, monogram „P.”, mikrowłókna z klamki VIP)
Miejsce morderstwa: Pokój VIP

Logika:
• Logi ruletki obalają alibi Piotra (01:16–01:23 brak zakładów).
• Świadek kojarzy marynarkę w kratę przy wejściu do VIP tuż przed blackoutem.
• Marynarka w VIP (paragon 01:17) łączy się czasowo z zasłonięciem kamery 01:19.
• Włókna z klamki pasują do tkaniny marynarki.
• Rafał (karta-as) i Julia (bar) mylą trop, ale nie spinają okna 01:17–01:22.
*/

import BaseInvestigationScene from './BaseInvestigationScene';
import scenaKasyno from '../assets/scenes/scena_kasyno.png';

// postacie 
import character1 from '../assets/avatars/piotr.png';
import character2 from '../assets/avatars/rafal.png';
import character3 from '../assets/avatars/alicja.png';
import character4 from '../assets/avatars/julia.png';
import character5 from '../assets/avatars/szymon.png';

// avatary (ikonki)
import avatar1 from '../assets/avatar_icons/piotr_icon.png';
import avatar2 from '../assets/avatar_icons/rafal_icon.png';
import avatar3 from '../assets/avatar_icons/alicja_icon.png';
import avatar4 from '../assets/avatar_icons/julia_icon.png';
import avatar5 from '../assets/avatar_icons/szymon_icon.png';

export default class LevelCasino extends BaseInvestigationScene {
  constructor() {
    super('LevelCasino', {
      bgKey: 'bg_casino',
      bgSrc: scenaKasyno,
      title: 'Kasyno nocą',
      intro: `🖼 Sceneria:
Sala kasyna oświetlona neonami w kolorach czerwieni i zieleni. Stoły do gry w karty stoją porzucone, na jednym z nich leżą rozsypane żetony i karty. W kącie migają światła automatów do gier, a przy barze przewrócono krzesło. W powietrzu unosi się zapach dymu i alkoholu.

📖 Historia poziomu:
Podczas nocnych rozgrywek w kasynie doszło do zabójstwa w pokoju VIP. Ofiarą był stały gracz znany z wielkich wygranych i długów hazardowych. Kamery przy wejściu do pokoju zostały zasłonięte kurtką, a strażnik został odciągnięty przez fałszywe wezwanie. Cztery osoby były widziane w pobliżu pokoju VIP tuż przed tragedią. Każda z nich miała swoje powody, by pozbyć się ofiary – długi, zazdrość, interesy. Jednak tylko jedna miała realną okazję, by to zrobić w chwili, gdy wszyscy byli zajęci grą przy stolikach.

Podejrzani:
• Piotr — sprzedawca samochodów. Twierdzi, że był przy ruletce, ale świadkowie mówią, że kilkakrotnie wychodził do korytarza.  
• Rafał — student prawa. Wdał się w spór z ofiarą o oszustwo przy kartach. Inni gracze twierdzą, że groził ofierze „konsekwencjami”.  
• Alicja — pewna siebie i stanowcza. Grała w pokera z wysokimi stawkami, a ofiara wcześniej odrzuciła jej propozycję wspólnej inwestycji. Widziano ją przy drzwiach do pokoju VIP.  
• Julia — nauczycielka języka polskiego. Mówi, że przyszła do kasyna „tylko towarzysko”, ale kasjerka potwierdziła, że wymieniła dużą sumę gotówki na żetony. Widziała ją rozmawiającą z ofiarą przy barze.

Świadek:
• Szymon — starszy emeryt, obserwował grę w kasynie z boku. Twierdzi, że widział jedną z osób wchodzących do VIP roomu chwilę przed wyłączeniem kamer. Nie rozpoznał dokładnie twarzy, ale zapamiętał charakterystyczną marynarkę w kratę.

🎯 Cel gracza:
Ustal, kto z czterech podejrzanych wykorzystał zamieszanie w kasynie, by zabić ofiarę w pokoju VIP. Analizuj sprzeczne wersje i wskaż osobę z najsilniejszym motywem i okazją.`,

      // === POZYCJE POSTACI ===
      positions: [
        { x: 0.50 * window.innerWidth, y: 0.70 * window.innerHeight }, // Piotr
        { x: 0.64 * window.innerWidth, y: 0.53 * window.innerHeight }, // Rafał
        { x: 0.40 * window.innerWidth, y: 0.54 * window.innerHeight }, // Alicja
        { x: 0.50 * window.innerWidth, y: 0.47 * window.innerHeight }, // Julia
        { x: 0.52 * window.innerWidth, y: 0.26 * window.innerHeight }, // Szymon (świadek)
      ],

      // === POSTACIE ===
      characters: [
        {
          key: 'character1',
          src: character1,
          npcId: 'piotr',
          text: "Byłem przy ruletce, przysięgam – jak zawsze, gdy próbuję ratować resztki oszczędności. Może faktycznie wyszedłem na korytarz koło 01:17, ale to tylko po to, żeby ochłonąć. Marynarka w kratę wisiała w VIP, bo wcześniej rozmawiałem tam z klientem o aucie, nic więcej. To, że logi ruletki pokazują lukę 01:16–01:23, nie robi ze mnie mordercy.",
          avatar: { key: 'avatar1', src: avatar1 }
        }, // Piotr
        {
          key: 'character2',
          src: character2,
          npcId: 'rafal',
          text: "Tak, pokłóciłem się z nim o zagiętego asa – to było zwykłe oznaczanie kart, a ja nie lubię oszustów. Groziłem mu konsekwencjami, ale w sensie prawnym, nie fizycznym. Cały kluczowy moment, 01:17–01:22, spędziłem przy stole, próbując udowodnić innym, że talia jest trefna. Do VIP mnie nawet nie wpuszczono, nie mam takich pieniędzy.",
          avatar: { key: 'avatar2', src: avatar2 }
        }, // Rafał
        {
          key: 'character3',
          src: character3,
          npcId: 'alicja',
          text: "Grałam w pokera za wysokie stawki, a on wcześniej wyśmiał moją propozycję wspólnej inwestycji, więc tak – miałam powód, żeby go nie lubić. Wyszłam po żetony, krupier potwierdzi przerwę 01:15–01:18, ale wróciłam do stołu, zanim zgasły kamery. Przy blackoutcie siedziałam nad kartami, bo przy takich kwotach nikt nie ryzykuje odejścia. VIP to nie moja scena – wolę widzieć wszystkich na otwartej sali.",
          avatar: { key: 'avatar3', src: avatar3 }
        }, // Alicja
        {
          key: 'character4',
          src: character4,
          npcId: 'julia',
          text: "Przyszłam tu ‘towarzysko’, a skończyło się na tym, że wymieniłam zbyt dużą sumę na żetony, żeby zapomnieć o pracy i domu. Rozmawiałam z nim przy barze mniej więcej 01:10–01:14, barman ma na to paragon na dwa drinki. Potem poszłam w stronę korytarza, ale kamery jeszcze działały i widać, że nie wchodzę do VIP o 01:19. Mam już dość skandali w swoim życiu, nie potrzebuję jeszcze jednego z trupem w roli głównej.",
          avatar: { key: 'avatar4', src: avatar4 }
        }, // Julia
        {
          key: 'character5',
          src: character5,
          npcId: 'szymon',
          text: "Siedziałem z boku i obserwowałem ludzi, to mi zostało po latach pracy w banku. Chwilę po 01:17 widziałem sylwetkę w marynarce w kratę przy drzwiach do VIP, tuż zanim obraz z kamer zaczął wariować. Ruletka się kręciła, ale nikt nie stawiał zakładów, było nienaturalnie cicho. Ten sprzedawca, Piotr, kręcił się wtedy między stołem a korytarzem, jak ktoś, kto ma więcej do stracenia niż tylko żetony.",
          avatar: { key: 'avatar5', src: avatar5 }
        }, // Szymon (świadek)
      ],

      // === PRZEDMIOTY ===
      items: [
        {
          key: 'marynarka_krata',
          name: 'Marynarka w kratę',
          text: [
            'Znaleziona odłożona na oparciu w VIP; na klapie kurz z obicia fotela.',
            'W kieszeni paragon z 01:17 (whisky single malt); metka z monogramem „P.”.',
            'Na podszewce mikrowłókna zgodne z tymi z klamki drzwi VIP.',
            'Korelacja czasu: 01:17 (paragon) → 01:19 (zasłonięcie kamery) → 01:22 (hałas zgłaszany przez ochronę).',
            'Wskazówka: bezpośrednio łączy Piotra z wejściem do VIP w krytycznym oknie czasu.'
          ].join('\n'),
          src: require('../assets/items/marynarka.png'),
          avatar: { key: 'marynarka_krata', src: require('../assets/items/marynarka.png') },
          scale: 0.05,
        },
        {
          key: 'zetony',
          name: 'Żetony kasynowe',
          text: [
            'Stos żetonów ofiary: brakuje 5 wysokich nominałów; tray krupiera wykazuje niedobór w tym samym oknie.',
            'Log stołu ruletki: 01:16–01:23 brak zakładów Piotra — alibi upada.',
            'Wskazówka: ruch żetonów nie pokrywa się z „ciągłą grą” deklarowaną przez Piotra.'
          ].join('\n'),
          src: require('../assets/items/zetony.png'),
          avatar: { key: 'zetony', src: require('../assets/items/zetony.png') },
          scale: 0.05,
        },
        {
          key: 'karta_as',
          name: 'As pik',
          text: [
            'Zagięty róg (oznaczona karta) z rozdania, o które spierał się Rafał.',
            'Brak świeżych odcisków — możliwe rękawiczki, ale czas rozdania to 01:08–01:12.',
            'Wskazówka: silny motyw Rafała, lecz nie spina się z oknem 01:17–01:22.'
          ].join('\n'),
          src: require('../assets/items/karta_as.png'),
          avatar: { key: 'karta_as', src: require('../assets/items/karta_as.png') },
          scale: 0.05,
        },
        {
          key: 'kieliszek_bar',
          name: 'Kieliszek z baru',
          text: [
            'Odciski Julii i ofiary; barman potwierdza rozmowę 01:10–01:14.',
            'Brak środków odurzających; paragon na dwa drinki o 01:13.',
            'Wskazówka: kontakt z ofiarą wcześniejszy, ale nie pokrywa się z blackoutem kamer.'
          ].join('\n'),
          src: require('../assets/items/kieliszek.png'),
          avatar: { key: 'kieliszek_bar', src: require('../assets/items/kieliszek.png') },
          scale: 0.05,
        },
      ],

      // === MIEJSCA (4) ===
      places: [
        {
          key: 'vip_room',
          name: 'Pokój VIP',
          text: [
            'Miejsce zbrodni; kamera zasłonięta o 01:19 (kurtka/krawędź tkaniny w kadrze).',
            'Na klamce mikrowłókna odpowiadające splocie tkaniny marynarki w kratę.',
            'Wskazówka: okno 01:17–01:22 jest kluczowe i zbieżne z paragonem z marynarki.'
          ].join('\n'),
          src: require('../assets/places/vip_room.png'),
          avatar: { key: 'vip_room', src: require('../assets/places/vip_room.png') },
          scale: 0.05,
        },
        {
          key: 'stol_poker',
          name: 'Stół do pokera',
          text: [
            'Alicja grała tutaj; przerwa w rozdaniu 01:15–01:18 (potwierdza krupier).',
            'Wróciła z nowymi żetonami o 01:18 — zbyt wcześnie, by wejść i wyjść z VIP przed blackoutem.',
            'Wskazówka: obecność przy stole ogranicza jej możliwość bycia w VIP o 01:19.'
          ].join('\n'),
          src: require('../assets/places/stol_poker.png'),
          avatar: { key: 'stol_poker', src: require('../assets/places/stol_poker.png') },
          scale: 0.05,
        },
        {
          key: 'ruletka',
          name: 'Ruletka',
          text: [
            'Piotr twierdzi, że był tu cały czas; dziennik krupiera przeczy: 01:16–01:23 bez zakładów.',
            'Na poręczy korytarza koło ruletki ślad pudru/kurzu podobny jak na klapie marynarki.',
            'Wskazówka: luka czasowa Piotra pokrywa się z ruchem do VIP.'
          ].join('\n'),
          src: require('../assets/places/ruletka.png'),
          avatar: { key: 'ruletka', src: require('../assets/places/ruletka.png') },
          scale: 0.05,
        },
        {
          key: 'bar',
          name: 'Bar',
          text: [
            'Julia i ofiara rozmawiają 01:10–01:14; później Julia widziana w korytarzu.',
            'Przy barze przewrócone krzesło (zamieszanie), ale kamery działają — brak wejścia do VIP o 01:19.',
            'Wskazówka: mylący trop — brak zgodności z kluczowym oknem czasu.'
          ].join('\n'),
          src: require('../assets/places/bar.png'),
          avatar: { key: 'bar', src: require('../assets/places/bar.png') },
          scale: 0.05,
        },
      ],

      // === POZYCJE PRZEDMIOTÓW ===
      itemPositions: [
        { x: 0.59 * window.innerWidth, y: 0.30 * window.innerHeight }, // marynarka_krata
        { x: 0.42 * window.innerWidth, y: 0.32 * window.innerHeight }, // zetony
        { x: 0.52 * window.innerWidth, y: 0.58 * window.innerHeight }, // karta_as
        { x: 0.36 * window.innerWidth, y: 0.66 * window.innerHeight }, // kieliszek_bar
      ],

      // === POZYCJE MIEJSC ===
      placePositions: [
        { x: 0.62 * window.innerWidth, y: 0.30 * window.innerHeight }, // vip_room
        { x: 0.35 * window.innerWidth, y: 0.50 * window.innerHeight }, // stol_poker
        { x: 0.58 * window.innerWidth, y: 0.62 * window.innerHeight }, // ruletka
        { x: 0.38 * window.innerWidth, y: 0.73 * window.innerHeight }, // bar
      ],

      // listy dla tablicy dedukcji i podpowiedzi w inputach
      deduction: {
        suspects: ['Piotr', 'Rafał', 'Alicja', 'Julia'],
        places:   ['VIP', 'Stół', 'Ruletka', 'Bar'],
        items:    ['Marynarka', 'Żetony', 'Karta', 'Kieliszek'],
      },

      notes: {
        characters: ['Piotr', 'Rafał', 'Alicja', 'Julia', 'Szymon'],
        places:   ['VIP', 'Stół', 'Ruletka', 'Bar'],
        items:    ['Marynarka', 'Żetony', 'Karta', 'Kieliszek'],
      },

      // callback po kliknięciu „Zakończ poziom”
      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
        // Prawda (poziom 9): Piotr + Marynarka w kratę + Pokój VIP
      },
      solution: {
        suspectKey: 'character1',  
        itemKey:    'marynarka_krata',
        placeKey:   'vip_room',
        aliases: {
          suspect: ['Piotr'],
          item:    ['Marynarka w kratę', 'Marynarka'],
          place:   ['Pokój VIP', 'VIP']
        }
      },
    });
  }
}
