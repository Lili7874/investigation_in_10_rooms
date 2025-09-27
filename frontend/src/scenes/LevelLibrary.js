// src/scenes/LevelLibrary.js
/* 
Rozstrzygnięcie (ukryta prawda – poziom 7)

Sprawca: Julia
Przedmiot sprawcy: Karta rewersowa manuskryptu (wpis na jej nazwisko; „tylko pytała”, ale karta łączy ją z konkretnym rękopisem)
Miejsce morderstwa: Czytelnia (ciało znalezione przy przewróconej lampce)

Logika:
• Ostatnie połączenie na telefonie bibliotekarza 05:58 (zastrzeżony) → chwilę przed 06:00, gdy świadek widzi światło w magazynie.
• Światło w magazynie włączane/wyłączane ok. 06:00 + brak śladów włamania do sejfu → otwarcie kluczem po namowie/przymusie.
• Karta rewersowa Julii łączy ją bezpośrednio z brakującym manuskryptem (motyw i pretekst).
• Kadr z korytarza pokazuje Rafała 05:57–05:59 przy drzwiach magazynu, ale bez wejścia — mocny, lecz mylący trop.
• Finał w czytelni: przewrócona lampka świadczy o szarpaninie, gdzie bibliotekarz próbował odzyskać manuskrypt.
*/

import BaseInvestigationScene from '../BaseInvestigationScene';
import scenaBiblioteka from '../assets/scenes/scena_biblioteka_miejska.png';

// postacie – mapowanie: Rafał, Julia, Jakub, Weronika, Szymon (świadek)
import character1 from '../assets/avatars/rafal.png';
import character2 from '../assets/avatars/julia.png';
import character3 from '../assets/avatars/jakub.png';
import character4 from '../assets/avatars/weronika.png';
import character5 from '../assets/avatars/szymon.png';

// avatary (ikonki)
import avatar1 from '../assets/avatar_icons/rafal_icon.png';
import avatar2 from '../assets/avatar_icons/julia_icon.png';
import avatar3 from '../assets/avatar_icons/jakub_icon.png';
import avatar4 from '../assets/avatar_icons/weronika_icon.png';
import avatar5 from '../assets/avatar_icons/szymon_icon.png';

export default class LevelLibrary extends BaseInvestigationScene {
  constructor() {
    super('LevelLibrary', {
      bgKey: 'bg_library',
      bgSrc: scenaBiblioteka,
      title: 'Biblioteka o świcie',
      intro: `🖼 Sceneria:
Wysokie regały, skrzypiąca podłoga i zapach kurzu. Na jednym ze stołów leżą rozsypane kartki z katalogu, obok przewrócona lampka. W czytelni wciąż pali się zimne, zielone światło biurkowe. Drzwi do magazynu książek są niedomknięte.

📖 Historia poziomu:
O świcie znaleziono ciało nocnego bibliotekarza w czytelni, a z sejfu w magazynie zniknął rzadki manuskrypt. Klucze do sejfu miały tylko dwie osoby, ale śladów włamania brak. Ostatnie zapisy w księdze odwiedzin są niekompletne, jakby ktoś je wyrwał. Wersje zdarzeń znów wzajemnie się wykluczają.

Podejrzani:
• Rafał — ambitny student prawa. Pracował nad pracą semestralną o prawie własności intelektualnej. Twierdzi, że przyszedł oddać książki karą, ale kamera z korytarza rejestruje go także przy drzwiach do magazynu. Mówi, że „szukał toalety”.
• Julia — nauczycielka języka polskiego. Na jej karcie rewersowej widnieje brakujący manuskrypt, choć utrzymuje, że „tylko o niego pytała”.
• Jakub — dyrektor szkoły. Przyszedł wcześniej „sprawdzić stanowiska konkursowe” na szkolną olimpiadę. Kłócił się z bibliotekarzem o „niepotrzebne formalności”.
• Weronika — młoda aktorka. Zaliczono ją na liście czytelni jako „badania do roli”, ale ktoś widział, jak z notesem śledzi układ kluczy w gablocie. Twierdzi, że to tylko improwizacja do roli kustoszki.

Świadek:
• Szymon — starszy stały bywalec, czyta codziennie prasę. Słabo słyszy, ale zauważył, że „ktoś gasił i zapalał światło w magazynie” mniej więcej o tej samej porze, kiedy zegar w hallu wybił 6:00. Utrzymuje, że bibliotekarz „z kimś szeptał przez telefon”.

🎯 Cel gracza:
Ustal, kto miał realną możliwość wejścia do magazynu i dostęp do sejfu, oraz w jakiej kolejności przebywano między czytelnią, ladą i magazynem. Połącz zebrane informacje, by wskazać osobę odpowiedzialną za kradzież manuskryptu i śmierć bibliotekarza.`,

      // === POZYCJE POSTACI (łuk – 5 postaci: 4 podejrzanych + świadek) ===
      positions: [
        { x: 0.34 * window.innerWidth, y: 0.58 * window.innerHeight }, // Rafał
        { x: 0.46 * window.innerWidth, y: 0.44 * window.innerHeight }, // Julia
        { x: 0.58 * window.innerWidth, y: 0.58 * window.innerHeight }, // Jakub
        { x: 0.40 * window.innerWidth, y: 0.60 * window.innerHeight }, // Weronika
        { x: 0.70 * window.innerWidth, y: 0.58 * window.innerHeight }, // Szymon (świadek)
      ],

      // === POSTACIE ===
      characters: [
        { key: 'character1', src: character1, text: 'To na pewno pomyłka, tylko oddawałem książki.', avatar: { key: 'avatar1', src: avatar1 } },
        { key: 'character2', src: character2, text: 'Miałam tylko zapytać o rękopis...', avatar: { key: 'avatar2', src: avatar2 } },
        { key: 'character3', src: character3, text: 'Nie życzę sobie insynuacji.', avatar: { key: 'avatar3', src: avatar3 } },
        { key: 'character4', src: character4, text: 'Notowałam układ kluczy do roli!', avatar: { key: 'avatar4', src: avatar4 } },
        { key: 'character5', src: character5, text: 'Światło migało… tak koło szóstej.', avatar: { key: 'avatar5', src: avatar5 } },
      ],

      // === PRZEDMIOTY (4) — ROZSZERZONE PODPOWIEDZI (poziom 7) ===
      items: [
        {
          key: 'telefon',
          name: 'Telefon bibliotekarza',
          text: [
            'Rejestr: ostatnie połączenie o 05:58 (numer zastrzeżony).',
            'Na kartce pod telefonem: ołówek „przy sejfie” — skrótowa notatka z rozmowy.',
            'Korelacja czasu: świadek wskazuje migające światło w magazynie ok. 06:00.',
            'Wskazówka: połącz z miejscem „Magazyn (z sejfem)” — otwarcie bez śladów włamania.'
          ].join('\n'),
          src: require('../assets/items/telefon.png'),
          avatar: { key: 'telefon', src: require('../assets/items/telefon.png') },
          scale: 0.05,
        },
        {
          key: 'karta_rewersowa',
          name: 'Karta rewersowa manuskryptu',
          text: [
            'Sygnatura brakującego rękopisu wpisana przy nazwisku: „Julia …”.',
            'Stempel „wgląd na miejscu” — legalny pretekst do rozmowy o sejfie.',
            'Zagięty róg i świeży grafit przy sygnaturze — karta była w użyciu tej nocy.',
            'Wskazówka: jedyny jawny łącznik osoby z konkretnym manuskryptem.'
          ].join('\n'),
          src: require('../assets/items/karta_rewersowa.png'),
          avatar: { key: 'karta_rewersowa', src: require('../assets/items/karta_rewersowa.png') },
          scale: 0.05,
        },
        {
          key: 'lampka',
          name: 'Przewrócona lampka',
          text: [
            'Rozprysk szkła po lewej stronie blatu — przewrócona podczas szarpaniny.',
            'Metalowy klosz zarysowany, wtyczka wyrwana częściowo z gniazda.',
            'Wskazówka: finał starcia miał miejsce w czytelni, nie w magazynie.'
          ].join('\n'),
          src: require('../assets/items/lampka.png'),
          avatar: { key: 'lampka', src: require('../assets/items/lampka.png') },
          scale: 0.05,
        },
        {
          key: 'kadr',
          name: 'Kadr z korytarza (kamera K-2)',
          text: [
            'Rafał przy drzwiach magazynu 05:57–05:59; na ujęciu nie wchodzi do środka.',
            'Kierunek spojrzenia na tabliczki, nie na klamkę — wygląda na zagubienie.',
            'Wskazówka: silny, lecz mylący trop — nie łączy się z otwarciem sejfu o 06:00.'
          ].join('\n'),
          src: require('../assets/items/kadr.png'),
          avatar: { key: 'kadr_korytarz', src: require('../assets/items/kadr.png') },
          scale: 0.05,
        },
      ],

      // === MIEJSCA (4) — ROZSZERZONE PODPOWIEDZI (poziom 7) ===
      places: [
        {
          key: 'czytelnia',
          name: 'Czytelnia',
          text: [
            'Miejsce zbrodni: zielona lampka wciąż świeci, biurkowa — przewrócona.',
            'Ślady przesunięcia krzesła i rozrzucone karty katalogowe.',
            'Wskazówka: tu dochodzi do próby odebrania manuskryptu i eskalacji.'
          ].join('\n'),
          src: require('../assets/places/czytelnia.png'),
          avatar: { key: 'czytelnia', src: require('../assets/places/czytelnia.png') },
          scale: 0.05,
        },
        {
          key: 'magazyn_sejf',
          name: 'Magazyn (z sejfem)',
          text: [
            'Światło włączane/wyłączane około 06:00 (obserwacja świadka).',
            'Sejf bez śladów włamania — otwierany kluczem/autoryzacją.',
            'Wskazówka: koreluj z „Telefon bibliotekarza” (05:58) i „Kartą rewersową”.'
          ].join('\n'),
          src: require('../assets/places/magazyn.png'),
          avatar: { key: 'magazyn_sejf', src: require('../assets/places/magazyn.png') },
          scale: 0.05,
        },
        {
          key: 'lada_ksiega',
          name: 'Lada / księga odwiedzin',
          text: [
            'Brakuje kilku wierszy — świeżo wyrwane kartki tuszują faktyczną kolejność wejść.',
            'Na marginesie ślad grafitu zgodny z sygnaturą brakującego rękopisu.',
            'Wskazówka: miejsce manipulacji wątkami „kto i kiedy był pierwszy”.'
          ].join('\n'),
          src: require('../assets/places/lada.png'),
          avatar: { key: 'lada_ksiega', src: require('../assets/places/lada.png') },
          scale: 0.05,
        },
        {
          key: 'korytarz_kamera',
          name: 'Korytarz z kamerą',
          text: [
            'Ujęcie Rafała koło magazynu 05:57–05:59; zegar w hallu wybija 06:00.',
            'Brak nagrania wejścia do magazynu — kadr pokazuje tylko obecność w pobliżu.',
            'Wskazówka: zestaw z „Magazyn (z sejfem)” — kto realnie mógł otworzyć sejf?'
          ].join('\n'),
          src: require('../assets/places/korytarz.png'),
          avatar: { key: 'korytarz_kamera', src: require('../assets/places/korytarz.png') },
          scale: 0.05,
        },
      ],

      // === POZYCJE PRZEDMIOTÓW (kolejność jak w "items") ===
      itemPositions: [
        { x: 0.40 * window.innerWidth, y: 0.40 * window.innerHeight }, // telefon_bibliotekarza
        { x: 0.55 * window.innerWidth, y: 0.38 * window.innerHeight }, // karta_rewersowa
        { x: 0.50 * window.innerWidth, y: 0.66 * window.innerHeight }, // lampka_przewrocona
        { x: 0.40 * window.innerWidth, y: 0.75 * window.innerHeight }, // kadr_korytarz
      ],

      // === POZYCJE MIEJSC (kolejność jak w "places") ===
      placePositions: [
        { x: 0.65 * window.innerWidth, y: 0.52 * window.innerHeight }, // czytelnia
        { x: 0.50 * window.innerWidth, y: 0.46 * window.innerHeight }, // magazyn_sejf
        { x: 0.35 * window.innerWidth, y: 0.44 * window.innerHeight }, // lada_ksiega
        { x: 0.30 * window.innerWidth, y: 0.72 * window.innerHeight }, // korytarz_kamera
      ],

      // listy dla tablicy dedukcji i podpowiedzi w inputach
      deduction: {
        suspects: ['Rafał', 'Julia', 'Jakub', 'Weronika'],
        places:   ['Czytelnia', 'Magazyn', 'Lada', 'Korytarz'],
        items:    ['Telefon', 'Karta', 'Lampka', 'Kadr'],
      },

      // callback po kliknięciu „Zakończ poziom”
      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
        // Prawda (poziom 7): Julia + Karta rewersowa manuskryptu + Czytelnia
      },
      solution: {
        suspectKey: 'character2',  
        itemKey:    'karta_rewersowa',
        placeKey:   'czytelnia',
        aliases: {
          suspect: ['Julia'],
          item:    ['Karta rewersowa', 'Karta'],
          place:   ['Czytelnia']
        }
      },
    });
  }
}

