// src/scenes/LevelTheater.js
/* 
Rozstrzygnięcie (ukryta prawda – poziom 5)

Sprawca: Michał
Przedmiot sprawcy: Nożyce do lin (na ostrzu włókna tej samej liny co kurtyna)
Miejsce morderstwa: Kulisy (mechanizm linowy)

Logika:
• Michał był widziany przy mechanizmie linowym i miał naturalny dostęp do narzędzi.
• Nożyce noszą włókna przeciętej liny; cięcie wykonane jednym, pewnym ruchem.
• Świadek widział sylwetkę z nożycami wychodzącą zza kulis w chwili opadania kurtyny.
• Marynarka Piotra z kurzem sceny i papier tego samego bloku co notatki Julii to mylące tropy — nie łączą się z cięciem liny ani czasem zdarzenia.
*/

// src/scenes/LevelTheater.js
import BaseInvestigationScene from './BaseInvestigationScene';
import scenaTeatr from '../assets/scenes/scena_teatr.png';

// postacie – mapowanie: Alicja, Michał, Piotr, Julia, Szymon (świadek)
import character1 from '../assets/avatars/alicja.png';
import character2 from '../assets/avatars/michal.png';
import character3 from '../assets/avatars/piotr.png';
import character4 from '../assets/avatars/julia.png';
import character5 from '../assets/avatars/szymon.png';

// avatary (ikonki)
import avatar1 from '../assets/avatar_icons/alicja_icon.png';
import avatar2 from '../assets/avatar_icons/michal_icon.png';
import avatar3 from '../assets/avatar_icons/piotr_icon.png';
import avatar4 from '../assets/avatar_icons/julia_icon.png';
import avatar5 from '../assets/avatar_icons/szymon_icon.png';

export default class LevelTheater extends BaseInvestigationScene {
  constructor() {
    super('LevelTheater', {
      bgKey: 'bg_theater',
      bgSrc: scenaTeatr,
      title: 'Teatr za kulisami',
      intro: `🖼 Sceneria:
Korytarz za sceną w starym teatrze. Wieszaki z kostiumami stoją w nieładzie, na podłodze porozrzucane rekwizyty. Jedna z lin sterujących kurtyną jest przecięta, a na stoliku reżyserskim rozsypane są notatki z prób. W powietrzu czuć kurz i zapach farby scenicznej.

📖 Historia poziomu:
Podczas premiery doszło do dramatycznego zdarzenia. Główna kurtyna runęła w środku spektaklu, a w zamieszaniu znaleziono martwego reżysera. Drzwi od kulis były otwarte — każdy z obecnych mógł wejść i wyjść niezauważony. W garderobie odnaleziono list z pogróżkami. Każdy z podejrzanych miał powód, by przerwać premierę, a nawet pozbyć się reżysera.

Podejrzani:
• Alicja — stanowcza i pewna siebie. Twierdzi, że spierała się z reżyserem o rolę, która miała przypaść jej rywalce. Widziano, jak opuszczała kulisy chwilę przed wypadkiem.  
• Michał — nieśmiały partner Alicji. Siedział z boku sceny, pomagając przy rekwizytach. Ktoś widział go przy mechanizmie linowym.  
• Piotr — sprzedawca samochodów, sponsor spektaklu. Kłócił się o zwrot pieniędzy, gdy recenzenci zaczęli krytykować sztukę. Twierdzi, że był tylko na widowni, ale na jego marynarce znaleziono ślady kurzu ze sceny.  
• Julia — nauczycielka polskiego. Była konsultantką tekstu i często spierała się z reżyserem o interpretację. Jej notatki z poprawkami znaleziono na biurku obok pogróżek.

Świadek:
• Szymon — starszy miłośnik teatru, wolontariusz pomagający w garderobie. Twierdzi, że widział sylwetkę wychodzącą zza kulis w momencie, gdy kurtyna zaczęła opadać. Nie rozpoznał twarzy, ale jest pewien, że osoba miała w dłoni nożyce do lin.

🎯 Cel gracza:
Przesłuchaj podejrzanych i świadka, ustal motyw oraz okazję do sabotażu, a następnie wskaż odpowiedzialnego za śmierć reżysera.`,

      // === POZYCJE POSTACI ===
      positions: [
        { x: 0.34 * window.innerWidth, y: 0.65 * window.innerHeight }, // Alicja
        { x: 0.46 * window.innerWidth, y: 0.46 * window.innerHeight }, // Michał
        { x: 0.58 * window.innerWidth, y: 0.58 * window.innerHeight }, // Piotr
        { x: 0.50 * window.innerWidth, y: 0.65 * window.innerHeight }, // Julia
        { x: 0.52 * window.innerWidth, y: 0.44 * window.innerHeight }, // Szymon (świadek)
      ],

      // === POSTACIE ===
      characters: [
        {
          key: 'character1',
          src: character1,
          npcId: 'alicja',
          text: 'Nie zamierzałam oddawać roli.',
          avatar: { key: 'avatar1', src: avatar1 }
        }, // Alicja

        {
          key: 'character2',
          src: character2,
          npcId: 'michal',
          text: 'Tylko pilnowałem rekwizytów, serio.',
          avatar: { key: 'avatar2', src: avatar2 }
        }, // Michał

        {
          key: 'character3',
          src: character3,
          npcId: 'piotr',
          text: 'Byłem na widowni, to wszystko.',
          avatar: { key: 'avatar3', src: avatar3 }
        }, // Piotr

        {
          key: 'character4',
          src: character4,
          npcId: 'julia',
          text: 'To były zwykłe poprawki do tekstu.',
          avatar: { key: 'avatar4', src: avatar4 }
        }, // Julia

        {
          key: 'character5',
          src: character5,
          npcId: 'szymon',
          text: 'Ktoś z nożycami wyszedł zza kulis…',
          avatar: { key: 'avatar5', src: avatar5 }
        }, // Szymon (świadek)
      ],

      // === PRZEDMIOTY ===
      items: [
        {
          key: 'nozyce_do_lin',
          name: 'Nożyce do lin',
          text: [
            'Znalezione pod stołem z rekwizytami, tuż obok wejścia do strefy mechanizmu. Na ostrzu włókna tej samej liny co kurtyna; mikronacięcia wskazują na jedno, pewne cięcie. Na rękojeści delikatny film smaru — zgodny ze smarem z bloczków linowych. Wskazówka: połącz z miejscem „Kulisy (mechanizm linowy)” oraz relacją świadka o sylwetce z nożycami.'
          ].join('\n'),
          src: require('../assets/items/nozyce.png'),
          avatar: { key: 'nozyce_do_lin', src: require('../assets/items/nozyce.png') },
          scale: 0.05,
        },
        {
          key: 'lina_przecieta',
          name: 'Przecięta lina kurtyny',
          text: [
            'Cięcie równe, bez „poszarpania” — typowe dla ostrych nożyc, nie dla noża. Świeże strzępy i brak kurzu na krawędziach włókien — działanie w trakcie spektaklu. Na oplocie ślad kredy scenicznej (znakowanie długości) — wskazuje punkt planowanego sabotażu. Wskazówka: koreluj z „Nożyce do lin” oraz czasem opadania kurtyny.'
          ].join('\n'),
          src: require('../assets/items/lina_przecieta.png'),
          avatar: { key: 'lina_przecieta', src: require('../assets/items/lina_przecieta.png') },
          scale: 0.05,
        },
        {
          key: 'notatki_i_list',
          name: 'Notatki reżyserskie + list z pogróżkami',
          text: [
            'Leżały razem na stoliku reżyserskim; papier zgodny z blokiem Julii.',
            'Treść listu bez szczegółów mechaniki sceny — ma charakter presji, nie planu technicznego. Wskazówka: mylący trop na Julię; nie łączy się z obsługą lin ani dostępem do narzędzi.'
          ].join('\n'),
          src: require('../assets/items/notatki_list.png'),
          avatar: { key: 'notatki_i_list', src: require('../assets/items/notatki_list.png') },
          scale: 0.05,
        },
        {
          key: 'marynarka_piotra',
          name: 'Marynarka Piotra',
          text: [
            'Kurz sceniczny na mankietach i łokciach — potwierdza wejście za kulisy.',
            'Brak śladów smaru ani włókien z liny na tkaninie.',
            'Wskazówka: potwierdza obecność w strefie, ale nie łączy z mechanizmem cięcia.'
          ].join('\n'),
          src: require('../assets/items/marynarka.png'),
          avatar: { key: 'marynarka_piotra', src: require('../assets/items/marynarka.png') },
          scale: 0.05,
        },
      ],

      // === MIEJSCA ===
      places: [
        {
          key: 'kulisy_mechanizm',
          name: 'Kulisy (mechanizm linowy)',
          text: [
            'Punkt sabotażu: bloczki, prowadnice, hamulec liny. Na obudowie ślady świeżego smaru i odciśnięta dłoń w pyłku kredy znakującej linki. Wskazówka: jedyne miejsce, gdzie w praktyce można było przeciąć „właściwą” linę bez natychmiastowej reakcji inspicjenta.'
          ].join('\n'),
          src: require('../assets/places/kulisy_mechanizm.png'),
          avatar: { key: 'kulisy_mechanizm', src: require('../assets/places/kulisy_mechanizm.png') },
          scale: 0.05,
        },
        {
          key: 'stolik_rezyserski',
          name: 'Stolik reżyserski',
          text: [
            'Rozsypane notatki i list z pogróżkami; chaos po zamieszaniu.',
            'Wskazówka: buduje motyw konfliktu, ale nie daje bezpośredniego dostępu do mechanizmu linowego.'
          ].join('\n'),
          src: require('../assets/places/stolik_rezyserski.png'),
          avatar: { key: 'stolik_rezyserski', src: require('../assets/places/stolik_rezyserski.png') },
          scale: 0.05,
        },
        {
          key: 'garderoba',
          name: 'Garderoba',
          text: [
            'Miejsce pracy świadka; z tej perspektywy obserwował ruch przy kulisach.',
            'Wskazówka: źródło relacji o sylwetce z nożycami wychodzącej tuż przy opadaniu kurtyny.'
          ].join('\n'),
          src: require('../assets/places/garderoba.png'),
          avatar: { key: 'garderoba', src: require('../assets/places/garderoba.png') },
          scale: 0.05,
        },
        {
          key: 'wejscie_kulis',
          name: 'Wejście od kulis',
          text: [
            'Drzwi pozostawały otwarte — każdy mógł wejść/wyjść niezauważony.',
            'Wskazówka: tłumaczy obecność Piotra za sceną (trop poboczny), ale nie daje dostępu do narzędzi jak Michał miał.'
          ].join('\n'),
          src: require('../assets/places/wejscie_kulis.png'),
          avatar: { key: 'wejscie_kulis', src: require('../assets/places/wejscie_kulis.png') },
          scale: 0.05,
        },
      ],

      // === POZYCJE PRZEDMIOTÓW ===
      itemPositions: [
        { x: 0.40 * window.innerWidth, y: 0.60 * window.innerHeight }, // nozyce_do_lin
        { x: 0.57 * window.innerWidth, y: 0.70 * window.innerHeight }, // lina_przecieta
        { x: 0.43 * window.innerWidth, y: 0.70 * window.innerHeight }, // notatki_i_list
        { x: 0.67 * window.innerWidth, y: 0.68 * window.innerHeight }, // marynarka_piotra
      ],

      // === POZYCJE MIEJSC ===
      placePositions: [
        { x: 0.40 * window.innerWidth, y: 0.50 * window.innerHeight }, // kulisy_mechanizm
        { x: 0.45 * window.innerWidth, y: 0.60 * window.innerHeight }, // stolik_rezyserski
        { x: 0.62 * window.innerWidth, y: 0.68 * window.innerHeight }, // garderoba
        { x: 0.57 * window.innerWidth, y: 0.45 * window.innerHeight }, // wejscie_kulis
      ],

      // listy dla tablicy dedukcji i podpowiedzi w inputach
      deduction: {
        suspects: ['Alicja', 'Michał', 'Piotr', 'Julia'],
        places:   ['Kulisy', 'Stolik', 'Garderoba', 'Wejście'],
        items:    ['Nożyce', 'Lina', 'Notatki/List', 'Marynarka'],
      },

      notes: {
        characters: ['Alicja', 'Michał', 'Piotr', 'Julia', 'Szymon'],
        places:   ['Kulisy', 'Stolik', 'Garderoba', 'Wejście'],
        items:    ['Nożyce', 'Lina', 'Notatki/List', 'Marynarka'],
      },

      // callback po kliknięciu „Zakończ poziom”
      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
      },
      solution: {
        suspectKey: 'character2',
        itemKey:    'nozyce_do_lin',
        placeKey:   'kulisy_mechanizm',
        aliases: {
          suspect: ['Michał'],
          item:    ['Nożyce do lin', 'Nożyce'],
          place:   ['Kulisy']
        }
      },
    });
  }
}