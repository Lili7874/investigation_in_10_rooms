/* 
Rozstrzygnięcie (ukryta prawda – poziom 4)

Sprawca: Tomasz
Przedmiot sprawcy: Kadr z monitoringu zaplecza (K-3, 23:54) – wejście przez drzwi serwisowe tuż przed zdarzeniem
Miejsce morderstwa: Wejście do tunelu

Logika:
• Monitoring K-3 (23:54) pokazuje sylwetkę wchodzącą od zaplecza – zgadza się z relacją świadka o „wejściu od zaplecza”.
• Przewrócony wózek bagażowy i smugi/rysy prowadzą w stronę tunelu – ślad po pośpiechu i szarpaninie o teczkę.
• Teczka ofiary ma uszkodzony zamek i brak części dokumentów – motyw rabunkowy.
• Porzucona walizka (nie ofiary) była wcześniej przy Tomaszu – dywersja/odciągacz uwagi.
• Inni podejrzani mają słabsze łącza czasowo-przestrzenne z tunelem i zapleczem w chwili zdarzenia.
*/

import BaseInvestigationScene from './BaseInvestigationScene';
import scenaStacjakolejowa from '../assets/scenes/scena_dworzec_kolejowy.png';

// postacie – mapowanie: Anna, Tomasz, Weronika, Kacper, Julia (świadek)
import character1 from '../assets/avatars/anna.png';
import character2 from '../assets/avatars/tomasz.png';
import character3 from '../assets/avatars/weronika.png';
import character4 from '../assets/avatars/kacper.png';
import character5 from '../assets/avatars/julia.png';

// avatary (ikonki)
import avatar1 from '../assets/avatar_icons/anna_icon.png';
import avatar2 from '../assets/avatar_icons/tomasz_icon.png';
import avatar3 from '../assets/avatar_icons/weronika_icon.png';
import avatar4 from '../assets/avatar_icons/kacper_icon.png';
import avatar5 from '../assets/avatar_icons/julia_icon.png';

export default class LevelTrainstation extends BaseInvestigationScene {
  constructor() {
    super('LevelTrainstation', {
      bgKey: 'bg_trainstation',
      bgSrc: scenaStacjakolejowa,
      title: 'Dworzec kolejowy o północy',
      intro: `🖼 Sceneria:
Opustoszały dworzec kolejowy tuż przed północą. Na peronie stoją porzucone walizki, zegar nad halą wskazuje 23:55. Echo kroków odbija się od ścian hali odjazdów, a w oddali słychać gwizd pociągu. W jednym z korytarzy znaleziono przewrócony wózek bagażowy.

📖 Historia poziomu:
Na dworcu doszło do tajemniczej śmierci podróżnego, który miał przy sobie teczkę z poufnymi dokumentami. Ciało znaleziono przy wejściu do tunelu. Świadkowie twierdzą, że kilka osób kręciło się w pobliżu peronu. Nikt jednak nie przyznaje się do bycia w miejscu zbrodni w chwili tragedii.

Podejrzani:
• Anna — właścicielka firmy jubilerskiej. Twierdzi, że czekała na kuriera, ale nie potrafi wskazać szczegółów. Ktoś widział, jak rozmawiała nerwowo przez telefon niedaleko tunelu.  
• Kacper — młody i niecierpliwy, mówi, że „przyszedł po kolegę”. Kilka osób twierdzi jednak, że widziało go przy bagażach, które nie należały do niego.  
• Tomasz — drobny złodziejaszek. Zawsze ma „interes” tam, gdzie nie powinno go być. Tym razem przyłapano go, jak zaglądał do porzuconej walizki, zanim odnaleziono ciało.  
• Weronika — młoda aktorka. Powiedziała, że była na dworcu w ramach „przygotowań do roli”, ale konduktor zapamiętał, że wypytywała o pociąg, którym podróżowała ofiara.

Świadek:
• Julia — nauczycielka języka polskiego. Wracała z wycieczki szkolnej i przypadkiem zatrzymała się na dworcu. Widziała, że ktoś wchodził na peron od strony zaplecza, ale nie rozpoznała dokładnie kto.

🎯 Cel gracza:
Ustal, kto z czterech podejrzanych miał realną możliwość przejęcia teczki i dlaczego znalazł się na dworcu o tak późnej porze. Przeanalizuj sprzeczne zeznania i wskaż osobę odpowiedzialną za śmierć podróżnego.`,

      // === POZYCJE POSTACI ===
      positions: [
        { x: 0.46 * window.innerWidth, y: 0.44 * window.innerHeight }, // Anna
        { x: 0.36 * window.innerWidth, y: 0.58 * window.innerHeight }, // Tomasz
        { x: 0.58 * window.innerWidth, y: 0.56 * window.innerHeight }, // Weronika
        { x: 0.46 * window.innerWidth, y: 0.70 * window.innerHeight }, // Kacper
        { x: 0.52 * window.innerWidth, y: 0.63 * window.innerHeight }, // Julia (świadek)
      ],

      // === POSTACIE ===
      characters: [
        {
          key: 'character1',
          src: character1,
          npcId: 'anna',
          text: 'Czekałam na kuriera… naprawdę.',
          avatar: { key: 'avatar1', src: avatar1 }
        }, // Anna

        {
          key: 'character2',
          src: character2,
          npcId: 'tomasz',
          text: 'Tylko zajrzałem do walizki, nic więcej.',
          avatar: { key: 'avatar2', src: avatar2 }
        }, // Tomasz

        {
          key: 'character3',
          src: character3,
          npcId: 'weronika',
          text: 'Pytałam tylko o rozkład pociągów.',
          avatar: { key: 'avatar3', src: avatar3 }
        }, // Weronika

        {
          key: 'character4',
          src: character4,
          npcId: 'kacper',
          text: 'Przyszedłem po kolegę, serio.',
          avatar: { key: 'avatar4', src: avatar4 }
        }, // Kacper

        {
          key: 'character5',
          src: character5,
          npcId: 'julia',
          text: 'Ktoś wszedł od zaplecza, widziałam.',
          avatar: { key: 'avatar5', src: avatar5 }
        }, // Julia (świadek)
      ],

      // === PRZEDMIOTY ===
      items: [
        {
          key: 'teczka_ofiary',
          name: 'Teczka ofiary',
          text: [
            'Uszkodzony zamek, naderwany pasek przy klapce; wewnątrz brak części dokumentów. Na narożniku świeża rysa (uderzenie o posadzkę lub bok wózka). Na okładce rozmazany odcisk dłoni – brak pełnego wzoru (szarpanina). Wskazówka: powiąż ze „Przewrócony wózek” (pośpiech/transport) i miejscem „Wejście do tunelu” (finał).'
          ].join('\n'),
          src: require('../assets/items/teczka.png'),
          avatar: { key: 'teczka_ofiary', src: require('../assets/items/teczka.png') },
          scale: 0.05,
        },
        {
          key: 'kadr_k3',
          name: 'Kadr z monitoringu (K-3, 23:54)',
          text: [
            'Sylwetka otwierająca drzwi serwisowe od zaplecza; głowa odwrócona, twarz niewidoczna. Wejście następuje na 60–90 s przed 23:55 z hali. Chwyt jednoręczny za klamkę, drugą ręką coś przy piersi (format jak teczka). Wskazówka: skoreluj z miejscem „Drzwi serwisowe / zaplecze” oraz trasą do „Peron główny”.'
          ].join('\n'),
          src: require('../assets/items/kamera2.png'),
          avatar: { key: 'kadr_k3', src: require('../assets/items/kamera2.png') },
          scale: 0.05,
        },
        {
          key: 'wozek_bagazowy',
          name: 'Przewrócony wózek bagażowy',
          text: [
            'Rysy i smugi na posadzce w osi kół ciągną się w stronę tunelu. Jeden uchwyt wygięty – ślad gwałtownego pociągnięcia. Przy kole drobne papierowe strzępki – podobne do skrawków z teczki. Wskazówka: prowadzi ruchem do „Wejście do tunelu”; łącz z „Teczka ofiary”.'
          ].join('\n'),
          src: require('../assets/items/wozek.png'),
          avatar: { key: 'wozek_bagazowy', src: require('../assets/items/wozek.png') },
          scale: 0.05,
        },
        {
          key: 'walizka_porzucona',
          name: 'Porzucona walizka',
          text: [
            'Nie należy do ofiary; w środku tylko gazety jako „wypełniacz”. Zamki sprawne, brak cennych rzeczy – wygląda na dywersję. Świadkowie kojarzą Tomasza przy tej walizce wcześniej. Wskazówka: fałszywy trop odciągający uwagę z peronu; nie łączy się z finałem przy tunelu.'
          ].join('\n'),
          src: require('../assets/items/walizka.png'),
          avatar: { key: 'walizka_porzucona', src: require('../assets/items/walizka.png') },
          scale: 0.05,
        },
      ],

      // === MIEJSCA ===
      places: [
        {
          key: 'peron_glowny',
          name: 'Peron główny',
          text: [
            'Ostatnie miejsce, gdzie widziano ofiarę z teczką.',
            'Rozrzucone drobne papierki przy ławce – możliwy początek szarpaniny.',
            'Wskazówka: punkt pośredni między „Drzwi serwisowe” a „Wejście do tunelu”.'
          ].join('\n'),
          src: require('../assets/places/peron.png'),
          avatar: { key: 'peron_glowny', src: require('../assets/places/peron.png') },
          scale: 0.05,
        },
        {
          key: 'wejscie_tunel',
          name: 'Wejście do tunelu',
          text: [
            'Miejsce znalezienia ciała; na progu rysy zgodne z torem kół wózka.',
            'Na poręczy smuga jak po szybkim oparciu/poślizgu.',
            'Wskazówka: finał trasy „wózek → teczka”; to tu eskalowała szarpanina.'
          ].join('\n'),
          src: require('../assets/places/tunel.png'),
          avatar: { key: 'wejscie_tunel', src: require('../assets/places/tunel.png') },
          scale: 0.05,
        },
        {
          key: 'drzwi_serwisowe',
          name: 'Drzwi serwisowe / zaplecze',
          text: [
            'Skrót na peron poza ruchem pasażerów.',
            'Czujnik otwarcia loguje impuls ~23:54 (zgodny z „Kadr K-3”).',
            'Na framudze świeże, równoległe rysy – ślad po gwałtownym otwarciu.',
            'Wskazówka: punkt wejścia sprawcy na trasę do peronu/tunelu.'
          ].join('\n'),
          src: require('../assets/places/drzwi_serwisowe.png'),
          avatar: { key: 'drzwi_serwisowe', src: require('../assets/places/drzwi_serwisowe.png') },
          scale: 0.05,
        },
        {
          key: 'hala_odjazdow',
          name: 'Hala odjazdów (23:55)',
          text: [
            'Zegar wybija 23:55 – kotwica czasu zdarzeń.',
            'Widoczność z hali nie obejmuje zaplecza; świadek widzi ruch „od zaplecza” na peron.',
            'Wskazówka: skoreluj czas „23:55” z „K-3 23:54”, by domknąć sekwencję wejścia.'
          ].join('\n'),
          src: require('../assets/places/hala_odjazdow.png'),
          avatar: { key: 'hala_odjazdow', src: require('../assets/places/hala_odjazdow.png') },
          scale: 0.05,
        },
      ],

      // === POZYCJE PRZEDMIOTÓW ===
      itemPositions: [
        { x: 0.43 * window.innerWidth, y: 0.52 * window.innerHeight }, // teczka_ofiary
        { x: 0.52 * window.innerWidth, y: 0.52 * window.innerHeight }, // kadr_k3
        { x: 0.60 * window.innerWidth, y: 0.44 * window.innerHeight }, // wozek_bagazowy
        { x: 0.32 * window.innerWidth, y: 0.70 * window.innerHeight }, // walizka_porzucona
      ],

      // === POZYCJE MIEJSC ===
      placePositions: [
        { x: 0.48 * window.innerWidth, y: 0.57 * window.innerHeight }, // peron_glowny
        { x: 0.62 * window.innerWidth, y: 0.34 * window.innerHeight }, // wejscie_tunel
        { x: 0.52 * window.innerWidth, y: 0.40 * window.innerHeight }, // drzwi_serwisowe
        { x: 0.38 * window.innerWidth, y: 0.74 * window.innerHeight }, // hala_odjazdow
      ],

      // listy dla tablicy dedukcji i podpowiedzi w inputach
      deduction: {
        suspects: ['Anna', 'Tomasz', 'Weronika', 'Kacper'],
        places:   ['Peron', 'Tunel', 'Zaplecze', 'Hala'],
        items:    ['Teczka', 'Kadr K-3', 'Wózek', 'Walizka'],
      },

      notes: {
        characters: ['Anna', 'Tomasz', 'Weronika', 'Kacper', 'Julia'],
        places:   ['Peron', 'Tunel', 'Zaplecze', 'Hala'],
        items:    ['Teczka', 'Kadr K-3', 'Wózek', 'Walizka'],
      },

      // callback po kliknięciu „Zakończ poziom”
      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
      },
      solution: {
        suspectKey: 'character2',
        itemKey:    'kadr_k3',
        placeKey:   'wejscie_tunel',
        aliases: {
          suspect: ['Tomasz'],
          item:    ['Kadr z monitoringu', 'Kadr'],
          place:   ['Wejście do tunelu', 'Wejście']
        }
      },
    });
  }
}