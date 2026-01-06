/* 
Rozstrzygnięcie (ukryta prawda – poziom 1)

Sprawca: Tomasz
Przedmiot sprawcy: Kadr z monitoringu (K-2, 00:07) – Tomasz przy biurku Pawła po spotkaniu
Miejsce morderstwa: Biurko Pawła (open space)

Logika:
• K-2 (00:07) nagrywa Tomasza przy biurku ofiary, gdy pozostali już wyszli.
• Drzwi serwisowe rejestrują otwarcie ok. 00:10; śrubokręt ma otarcia farby zgodne z tymi drzwiami.
• Z teczki Pawła znika pendrive z danymi sprzedażowymi – motyw rabunkowo-ukrywkowy.
• Kubek z kawą bez śladów trucizny → eskalacja w szarpaninę, nie podtrucie.
*/

import BaseInvestigationScene from './BaseInvestigationScene';
import scenaBiuro from '../assets/scenes/scena_pokoj_w_biurze.png';

// postacie – mapowanie: Marzena, Kacper, Tomasz, Piotr, Anna (świadek)
import character1 from '../assets/avatars/marzena.png';
import character2 from '../assets/avatars/kacper.png';
import character3 from '../assets/avatars/tomasz.png';
import character4 from '../assets/avatars/piotr.png';
import character5 from '../assets/avatars/anna.png';

// avatary (ikonki)
import avatar1 from '../assets/avatar_icons/marzena_icon.png';
import avatar2 from '../assets/avatar_icons/kacper_icon.png';
import avatar3 from '../assets/avatar_icons/tomasz_icon.png';
import avatar4 from '../assets/avatar_icons/piotr_icon.png';
import avatar5 from '../assets/avatar_icons/anna_icon.png';

export default class LevelOffice extends BaseInvestigationScene {
  constructor() {
    super('LevelOffice', {
      bgKey: 'bg_office',
      bgSrc: scenaBiuro,
      title: 'Noc w biurze',
      intro: `🖼 Sceneria:
To samo biuro Anny, właścicielki firmy jubilerskiej. Z pozoru spokojne miejsce pracy, dziś jest pełne napięcia. Policja otoczyła budynek, a wszyscy obecni stali się świadkami lub podejrzanymi.

📖 Historia poziomu:
Wczoraj wieczorem w biurze odbyło się nadzwyczajne spotkanie w sprawie fatalnej sytuacji finansowej firmy. Oprócz właścicielki Anny, na miejscu byli: Marzena z synem Kacprem, Piotr i Tomasz. Spotkanie przeciągnęło się do późnych godzin.
Rano ochroniarz znalazł ciało Pawła – pracownika działu sprzedaży, który według zeznań w ogóle nie powinien być wtedy w biurze. Został znaleziony przy jednym z biurek w głównej sali, a wokół panował chaos: porozrzucane dokumenty, przewrócone krzesła, niedopita kawa.
Policja szybko ustaliła, że Paweł miał dostęp do poufnych danych i niedawno kontaktował się z konkurencyjną firmą. To mogło sprawić, że ktoś chciał go uciszyć. Problem w tym, że każdy z obecnych ma powód, by ukryć, co naprawdę robił wczoraj wieczorem.

Podejrzani:
• Marzena — obawiała się utraty pracy i desperacko szukała sposobu na spłatę długów.  
• Kacper — twierdzi, że tylko czekał na matkę, ale pracownicy widzieli, jak kręcił się w pobliżu biurka Pawła.  
• Tomasz — ma reputację złodziejaszka, a wczoraj przyznał się, że „miał interes” w tym biurze.  
• Piotr — próbował namówić Annę na wspólną inwestycję. Może Paweł wiedział o czymś, co mogło mu zaszkodzić?

Świadek:
• Anna — właścicielka firmy. Organizowała spotkanie i może potwierdzić, kto wychodził jako ostatni. Twierdzi, że po zakończeniu narady nikt nie powinien już wracać do open space.

🎯 Cel gracza:
Jako detektyw musisz przesłuchać świadków, przejrzeć biuro i zebrać dowody. Nikt nie mówi całej prawdy, a Twoim zadaniem jest zrozumieć, co wydarzyło się w nocy, zanim sprawca usunie resztki dowodów.`,

      // === POZYCJE POSTACI ===
      positions: [
        { x: 0.34 * window.innerWidth, y: 0.58 * window.innerHeight }, // Marzena
        { x: 0.46 * window.innerWidth, y: 0.44 * window.innerHeight }, // Kacper
        { x: 0.58 * window.innerWidth, y: 0.58 * window.innerHeight }, // Tomasz
        { x: 0.50 * window.innerWidth, y: 0.72 * window.innerHeight }, // Piotr
        { x: 0.52 * window.innerWidth, y: 0.50 * window.innerHeight }, // Anna (świadek)
      ],

      // === POSTACIE ===
      characters: [
        {
          key: 'character1',
          src: character1,
          npcId: 'marzena',
          text: "Nie chciałam kłopotów, serio… Całą naradę siedziałam jak na szpilkach, bo bałam się, że stracę pracę, ale po spotkaniu od razu zabrałam Kacpra i wyszliśmy. Nie miałam po co wracać do open space, Paweł nawet nie był w naszym dziale. To, że mam długi, nie znaczy, że szarpałabym się z kimś przy biurku.",
          avatar: { key: 'avatar1', src: avatar1 }
        }, // Marzena
        {
          key: 'character2',
          src: character2,
          npcId: 'kacper',
          text: "Kręciłem się tylko chwilę przy biurku Pawła, zanim jeszcze wszyscy byli na miejscu – wciągnął mnie ten cały sprzęt i monitor, a mama kazała mi natychmiast odejść. Po spotkaniu siedziałem już znudzony w korytarzu i czekałem, aż wszyscy skończą gadać. Na nagraniach z 00:07 mnie nie ma, wtedy dawno byliśmy poza biurem. Ja co najwyżej mógłbym coś zbić, a nie… wiecie.",
          avatar: { key: 'avatar2', src: avatar2 }
        }, // Kacper
        {
          key: 'character3',
          src: character3,
          npcId: 'tomasz',
          text: "„Interes” to za dużo powiedziane, chciałem po prostu dogadać się z Pawłem o pendrive’a z danymi, które mogłyby mi pomóc stanąć na nogi. Wróciłem do open space po spotkaniu, sam, i podszedłem do jego biurka – to pewnie właśnie ten kadr z K-2 o 00:07, o którym mówicie. Śrubokręt użyłem tylko, żeby podważyć te cholerne drzwi serwisowe, jak próbowałem wyjść tyłem, nie planowałem, że dojdzie do szarpaniny. Wszystko wymknęło się spod kontroli, kiedy Paweł mnie przyłapał przy jego teczce.",
          avatar: { key: 'avatar3', src: avatar3 }
        }, // Tomasz
        {
          key: 'character4',
          src: character4,
          npcId: 'piotr',
          text: "To były tylko rozmowy o inwestycji, próbowałem przekonać Annę, że jeszcze da się uratować firmę, zanim wszyscy pójdziemy na dno. Po zakończeniu narady wyszedłem razem z resztą, nie miałem powodu wracać do open space, zwłaszcza do biurka Pawła. Z tego, co pamiętam, tylko Tomasz mruknął, że ‘ma jeszcze sprawę do załatwienia’ i został z tyłu. Kamery i logi wyjść powinny to potwierdzić.",
          avatar: { key: 'avatar4', src: avatar4 }
        }, // Piotr
        {
          key: 'character5',
          src: character5,
          npcId: 'anna',
          text: "Organizowałam to spotkanie i pamiętam, kto wychodził jako ostatni – Marzena z Kacprem wyszli pierwsi, potem Piotr, a ja zamknęłam salę konferencyjną około 23:52. Tomasz powiedział, że „tylko skoczy na open space”, bo musi coś dogadać z Pawłem, choć oficjalnie Pawła w ogóle nie miało być w biurze. Nikt poza nim nie miał powodu kręcić się tam jeszcze po północy. Skoro kadr z K-2 o 00:07 pokazuje kogoś przy biurku Pawła, to dobrze wiecie, kto to był.",
          avatar: { key: 'avatar5', src: avatar5 }
        }, // Anna
      ],

      // === PRZEDMIOTY ===
      items: [
        {
          key: 'kadr_k2',
          name: 'Kadr z monitoringu (K-2, 00:07)',
          text: [
            'Monitoring K-2 uchwycił o 00:07 Tomasza stojącego przy biurku Pawła.',
            'W tym czasie piętro jest puste – pozostali wyszli ok. 23:52.',
            'Wskazówka: porównaj ten czas z „Drzwiami serwisowymi” (log 00:10).'
          ].join('\n'),
          src: require('../assets/items/kamera3.png'),
          avatar: { key: 'kadr_k2', src: require('../assets/items/kamera3.png') },
          scale: 0.05,
        },
        {
          key: 'srubokret_plaski',
          name: 'Śrubokręt płaski',
          text: [
            'Znaleziony pod biurkiem Pawła.',
            'Na rączce odciski Tomasza; na grocie świeże zadrapania z lakierem w kolorze drzwi serwisowych.',
            'Wskazówka: połącz z miejscem „Drzwi serwisowe”.'
          ].join('\n'),
          src: require('../assets/items/srubokret.png'),
          avatar: { key: 'srubokret_plaski', src: require('../assets/items/srubokret.png') },
          scale: 0.05,
        },
        {
          key: 'teczka_pawla',
          name: 'Teczka Pawła',
          text: [
            'Teczka działu sprzedaży. Gumka zerwana świeżo – ślad szarpnięcia.',
            'Kieszeń na nośniki pusta: brakuje pendrive’a z danymi.',
            'Wskazówka: to wskazuje na motyw – dostęp do poufnych informacji.'
          ].join('\n'),
          src: require('../assets/items/teczka2.png'),
          avatar: { key: 'teczka_pawla', src: require('../assets/items/teczka2.png') },
          scale: 0.05,
        },
        {
          key: 'kubek_kawy',
          name: 'Kubek z niedopitą kawą',
          text: [
            'Test szybki: brak śladów toksyn.',
            'Na rancie wyszczerbienie i rozlana smuga obok – wygląda na szarpaninę przy biurku.',
            'Wskazówka: wyklucza otrucie, kieruje na przemoc w open space.'
          ].join('\n'),
          src: require('../assets/items/kubek.png'),
          avatar: { key: 'kubek_kawy', src: require('../assets/items/kubek.png') },
          scale: 0.05,
        },
      ],

      // === MIEJSCA ===
      places: [
        {
          key: 'biurko_pawla',
          name: 'Biurko Pawła (open space)',
          text: [
            'Miejsce zgonu. Dokumenty rozsypane, krzesło przewrócone, rysa na krawędzi blatu.',
            'Wskazówka: to tutaj widać Tomasza na nagraniu K-2 (00:07).'
          ].join('\n'),
          src: require('../assets/places/biurko.png'),
          avatar: { key: 'biurko_pawla', src: require('../assets/places/biurko.png') },
          scale: 0.05,
        },
        {
          key: 'drzwi_serwisowe',
          name: 'Drzwi serwisowe',
          text: [
            'Wejście od zaplecza. Log czujnika: otwarcie o 00:10.',
            'Na ościeżnicy świeżo zdarta farba – kolor zgodny ze śladami na śrubokręcie.',
            'Wskazówka: czas 00:10 domyka trasę po kadrze K-2 (00:07).'
          ].join('\n'),
          src: require('../assets/places/drzwi_serwisowe.png'),
          avatar: { key: 'drzwi_serwisowe', src: require('../assets/places/drzwi_serwisowe.png') },
          scale: 0.05,
        },
        {
          key: 'sala_konferencyjna',
          name: 'Sala konferencyjna',
          text: [
            'Tu odbyło się spotkanie poprzedniego wieczoru.',
            'Ostatnie wyjścia uczestników ok. 23:52.',
            'Wskazówka: to nie jest miejsce zbrodni – służy jako punkt odniesienia dla czasu.'
          ].join('\n'),
          src: require('../assets/places/sala_konferencyjna.png'),
          avatar: { key: 'sala_konferencyjna', src: require('../assets/places/sala_konferencyjna.png') },
          scale: 0.05,
        },
        {
          key: 'korytarz_recepcja',
          name: 'Korytarz przy recepcji (K-2)',
          text: [
            'Kamera K-2 obejmuje wejście do open space.',
            '00:06–00:09: brak innych osób; 00:07: Tomasz kieruje się do biurka Pawła.',
            'Wskazówka: potwierdza obecność Tomasza w krytycznym oknie czasowym.'
          ].join('\n'),
          src: require('../assets/places/korytarz_recepcja.png'),
          avatar: { key: 'korytarz_recepcja', src: require('../assets/places/korytarz_recepcja.png') },
          scale: 0.05,
        },
      ],

      // === POZYCJE PRZEDMIOTÓW ===
      itemPositions: [
        { x: 0.40 * window.innerWidth, y: 0.43 * window.innerHeight }, // kadr_k2
        { x: 0.70 * window.innerWidth, y: 0.70 * window.innerHeight }, // srubokret_plaski
        { x: 0.55 * window.innerWidth, y: 0.70 * window.innerHeight }, // teczka_pawla
        { x: 0.63 * window.innerWidth, y: 0.56 * window.innerHeight }, // kubek_kawy
      ],

      // === POZYCJE MIEJSC ===
      placePositions: [
        { x: 0.57 * window.innerWidth, y: 0.45 * window.innerHeight }, // biurko_pawla
        { x: 0.64 * window.innerWidth, y: 0.72 * window.innerHeight }, // drzwi_serwisowe
        { x: 0.52 * window.innerWidth, y: 0.30 * window.innerHeight }, // sala_konferencyjna
        { x: 0.36 * window.innerWidth, y: 0.74 * window.innerHeight }, // korytarz_recepcja
      ],

      // listy dla tablicy dedukcji i podpowiedzi w inputach
      deduction: {
        suspects: ['Marzena', 'Kacper', 'Tomasz', 'Piotr'],
        places:   ['Biurko', 'Serwisowe', 'Konferencja', 'Recepcja'],
        items:    ['Kadr K-2', 'Śrubokręt', 'Teczka', 'Kubek'],
      },

      notes: {
        characters: ['Marzena', 'Kacper', 'Tomasz', 'Piotr', 'Anna'],
        places:   ['Biurko', 'Serwisowe', 'Konferencja', 'Recepcja'],
        items:    ['Kadr K-2', 'Śrubokręt', 'Teczka', 'Kubek'],
      },

      // callback po kliknięciu „Zakończ poziom”
      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
        // Prawda (poziom 1): Tomasz + Kadr z monitoringu (K-2, 00:07) + Biurko Pawła
      },
      solution: {
        suspectKey: 'character3',  
        itemKey:    'kadr_k2',
        placeKey:   'biurko_pawla',
        aliases: {
          suspect: ['Tomasz'],
          item:    ['Kadr z monitoringu', 'Kadr'],
          place:   ['Biurko Pawła', 'Biurko']
        }
      },
    });
  }
}
