/* 
Rozstrzygnięcie (ukryta prawda – poziom 10)

Sprawca: Alicja
Przedmiot sprawcy: Lina cumownicza – użyta do unieruchomienia i zrzucenia ofiary za burtę
Miejsce morderstwa: Rufa jachtu

Logika:
• Telefon ofiary zawiera ostatnią wiadomość: „Spotkajmy się na rufie. Teraz.” – wysłaną z urządzenia Alicji.
• Weronika widziała Alicję stojącą nocą na rufie; jej relacja jest emocjonalna, ale spójna czasowo z momentem śmierci.
• Michał słyszał w nocy szarpnięcie liny, lecz nie wyszedł z kajuty — Alicja powstrzymała go, wiedząc, co się wydarzyło.
• Lina cumownicza nosi ślady celowego skrętu i nacisku, niemożliwe do powstania w wyniku przypadku lub ruchu fal.
• Szymon, doświadczony bosman, potwierdza, że taka lina nie plącze się samoistnie — została użyta świadomie.
• Brak nagrań i zmyte przez morze ślady wskazują na zaplanowane działanie w miejscu odciętym od świadków.

*/

import BaseInvestigationScene from './BaseInvestigationScene';
import scenaJacht from '../assets/scenes/scena_jacht.png';

// POSTACIE
import character1 from '../assets/avatars/alicja.png';
import character2 from '../assets/avatars/michal.png';
import character3 from '../assets/avatars/piotr.png';
import character4 from '../assets/avatars/weronika.png';
import character5 from '../assets/avatars/szymon.png';

// AVATARY
import avatar1 from '../assets/avatar_icons/alicja_icon.png';
import avatar2 from '../assets/avatar_icons/michal_icon.png';
import avatar3 from '../assets/avatar_icons/piotr_icon.png';
import avatar4 from '../assets/avatar_icons/weronika_icon.png';
import avatar5 from '../assets/avatar_icons/szymon_icon.png';

export default class LevelYacht extends BaseInvestigationScene {
  constructor() {
    super('LevelYacht', {
      bgKey: 'bg_yacht',
      bgSrc: scenaJacht,
      title: 'Cisza na pokładzie',
      intro: `🖼 Sceneria:
Luksusowy jacht Alicji dryfujący nocą kilka mil od brzegu. Cisza, spokojna tafla morza i wyłączony silnik sprawiają, że miejsce wydaje się niemal odcięte od świata. Na pokładzie panuje nienaturalny spokój, który po świcie zostaje brutalnie przerwany.

📖 Historia poziomu:
Rejs miał być kameralnym spotkaniem biznesowym, z dala od kamer i ciekawskich spojrzeń. Na pokładzie jachtu znaleźli się tylko najbliżsi współpracownicy i zaproszeni goście Alicji: jej partner Michał, Piotr oraz Weronika. Załogę uzupełniał jedynie Szymon, doświadczony bosman.
W nocy jeden z gości — partner finansowy Alicji — zginął w niewyjaśnionych okolicznościach. Jego ciało odnaleziono o świcie na rufie, zaplątane w linę cumowniczą. Morze zmyło część śladów, a kamery na jachcie były wyłączone.
Śledczy szybko ustalili, że ofiara groziła ujawnieniem kompromitujących informacji dotyczących nielegalnych transferów finansowych. Każdy obecny miał powód, by obawiać się tych rewelacji — i każdy ma coś do ukrycia.

Podejrzani:
• Alicja — właścicielka jachtu, dominująca i bezwzględna w biznesie. To ona zaprosiła ofiarę na rejs.  
• Michał — jej partner, wycofany i nerwowy. Twierdzi, że całą noc spędził w kajucie.  
• Piotr — sprytny „biznesmen”, który znał ofiarę z wcześniejszych interesów. Może wiedział więcej, niż przyznaje.  
• Weronika — aktorka, przyzwyczajona do grania ról. Jej zeznania są pełne emocji, ale niejasne.

Świadek:
• Szymon — doświadczony bosman. Zna jacht jak własną kieszeń i od razu zauważył, że lina na rufie nie została użyta przypadkowo.

🎯 Cel gracza:
Jako detektyw musisz przesłuchać uczestników rejsu, dokładnie obejrzeć pokład i zebrać pozostałe dowody. Na otwartym morzu nie ma przypadkowych zdarzeń — Twoim zadaniem jest odkryć, co naprawdę wydarzyło się tej nocy, zanim prawda zatonie razem z ostatnimi śladami.`,

      // === POZYCJE POSTACI ===
      positions: [
        { x: 0.30 * window.innerWidth, y: 0.58 * window.innerHeight }, // Alicja
        { x: 0.42 * window.innerWidth, y: 0.64 * window.innerHeight }, // Michał
        { x: 0.58 * window.innerWidth, y: 0.55 * window.innerHeight }, // Piotr
        { x: 0.48 * window.innerWidth, y: 0.33 * window.innerHeight }, // Weronika
        { x: 0.70 * window.innerWidth, y: 0.60 * window.innerHeight }, // Szymon
      ],

      // === POSTACIE ===
      characters: [
        {
          key: 'alicja',
          src: character1,
          npcId: 'alicja',
          text: "Ten jacht jest mój. To ja decyduję, kto gdzie chodzi. Jeśli ktoś w nocy był na rufie, musiał mieć powód. Ja spałam. I nie mam zwyczaju brudzić sobie rąk.",
          avatar: { key: 'avatar1', src: avatar1 }
        },
        {
          key: 'michal',
          src: character2,
          npcId: 'michal',
          text: "Obudziłem się… słyszałem coś, jakby szarpnięcie liny. Chciałem wyjść, ale Alicja powiedziała, żebym został. Ona… wiedziała, że coś się stało.",
          avatar: { key: 'avatar2', src: avatar2 }
        },
        {
          key: 'piotr',
          src: character3,
          npcId: 'piotr',
          text: "Biznes to biznes. Ofiara miała haka na wszystkich. Ale akurat ja byłem pod pokładem — sprawdźcie kieliszki, byłem zajęty piciem.",
          avatar: { key: 'avatar3', src: avatar3 }
        },
        {
          key: 'weronika',
          src: character4,
          npcId: 'weronika',
          text: "Widziałam Alicję na rufie. Stała spokojnie. Jakby czekała. A potem… cisza. Morze wszystko zagłusza.",
          avatar: { key: 'avatar4', src: avatar4 }
        },
        {
          key: 'szymon',
          src: character5,
          npcId: 'szymon',
          text: "Lina była nowa. Zbyt czysta. Ktoś ją zaciągnął celowo. Tak się nie plącze przypadkiem.",
          avatar: { key: 'avatar5', src: avatar5 }
        },
      ],

        // === PRZEDMIOTY ===
        items: [
        {
            key: 'lina_cumownicza',
            name: 'Lina cumownicza',
            text: [
            'Nowa lina, zdjęta z zapasu awaryjnego – nie była stale używana.',
            'Na włóknach nierównomierne ślady skrętu i punktowego nacisku.',
            'Wskazówka: sposób użycia wskazuje na działanie celowe, nie przypadkowe splątanie.'
            ].join('\n'),
            src: require('../assets/items/lina.png'),
            avatar: { key: 'lina_cumownicza', src: require('../assets/items/lina.png') },
            scale: 0.05,
        },
        {
            key: 'telefon_ofiary',
            name: 'Telefon ofiary',
            text: [
            'Ostatnia wysłana wiadomość: „Spotkajmy się na rufie. Teraz.”',
            'Wiadomość wysłana krótko po północy, gdy większość pasażerów była w kajutach.',
            'Wskazówka: odbiorca znał układ jachtu i wiedział, gdzie nie ma świadków.'
            ].join('\n'),
            src: require('../assets/items/telefon_2.png'),
            avatar: { key: 'telefon_ofiary', src: require('../assets/items/telefon_2.png') },
            scale: 0.05,
        },
        {
            key: 'kieliszek_whisky',
            name: 'Kieliszek z whisky',
            text: [
            'Znaleziony w salonie pod pokładem.',
            'Odciski tylko jednej osoby; brak śladów walki lub pośpiechu.',
            'Wskazówka: potwierdza alibi jednej z osób, ale nie wskazuje sprawcy.'
            ].join('\n'),
            src: require('../assets/items/kieliszek_2.png'),
            avatar: { key: 'kieliszek_whisky', src: require('../assets/items/kieliszek_2.png') },
            scale: 0.05,
        },
        {
            key: 'notatnik_bosmana',
            name: 'Notatnik bosmana',
            text: [
            'Zapis stanu technicznego jachtu sprzed rejsu.',
            'Adnotacja: „nowa lina – nie używać bez potrzeby”.',
            'Wskazówka: ktoś świadomie sięgnął po element, który nie był w regularnym użyciu.'
            ].join('\n'),
            src: require('../assets/items/notatnik.png'),
            avatar: { key: 'notatnik_bosmana', src: require('../assets/items/notatnik.png') },
            scale: 0.05,
        },
        ],

        // === MIEJSCA ===
        places: [
        {
            key: 'rufa_jachtu',
            name: 'Rufa jachtu',
            text: [
            'Miejsce odnalezienia ciała. Lina przeciągnięta w kierunku burty.',
            'Na relingu ślady tarcia; brak innych czytelnych tropów.',
            'Wskazówka: jedyne miejsce na jachcie całkowicie niewidoczne z kajut i salonu.'
            ].join('\n'),
            src: require('../assets/places/rufa.png'),
            avatar: { key: 'rufa_jachtu', src: require('../assets/places/rufa.png') },
            scale: 0.05,
        },
        {
            key: 'poklad_boczny',
            name: 'Pokład boczny',
            text: [
            'Wąskie przejście prowadzące z części mieszkalnej na rufę.',
            'Wilgotna powierzchnia; fale zatarły ewentualne ślady stóp.',
            'Wskazówka: brak tropów nie wyklucza nocnego przejścia tą trasą.'
            ].join('\n'),
            src: require('../assets/places/poklad.png'),
            avatar: { key: 'poklad_boczny', src: require('../assets/places/poklad.png') },
            scale: 0.05,
        },
        {
            key: 'salon_podpoklad',
            name: 'Salon pod pokładem',
            text: [
            'Wspólna przestrzeń gości przed zejściem do kajut.',
            'Znaleziono kieliszek z whisky; brak oznak pośpiechu lub szarpaniny.',
            'Wskazówka: miejsce buduje alibi, ale nie jest związane bezpośrednio ze zbrodnią.'
            ].join('\n'),
            src: require('../assets/places/salon.png'),
            avatar: { key: 'salon_podpoklad', src: require('../assets/places/salon_2.png') },
            scale: 0.05,
        },
        {
            key: 'kajuta_glowna',
            name: 'Kajuta główna',
            text: [
            'Kajuta właścicielki jachtu, zamknięta od środka na noc.',
            'Brak śladów walki; wnętrze uporządkowane.',
            'Wskazówka: spokojna kajuta nie wyklucza krótkiego wyjścia na pokład.'
            ].join('\n'),
            src: require('../assets/places/kajuta.png'),
            avatar: { key: 'kajuta_glowna', src: require('../assets/places/kajuta.png') },
            scale: 0.05,
        },
        ],

      // === POZYCJE PRZEDMIOTÓW ===
      itemPositions: [
        { x: 0.40 * window.innerWidth, y: 0.74 * window.innerHeight }, // lina_cumownicza
        { x: 0.45 * window.innerWidth, y: 0.67 * window.innerHeight }, // telefon_ofiary
        { x: 0.55 * window.innerWidth, y: 0.44 * window.innerHeight }, // kieliszek_whisky
        { x: 0.66 * window.innerWidth, y: 0.45 * window.innerHeight }, // notatnik_bosmana
      ],

      // === POZYCJE MIEJSC ===
      placePositions: [
        { x: 0.36 * window.innerWidth, y: 0.74 * window.innerHeight }, // rufa_jachtu
        { x: 0.64 * window.innerWidth, y: 0.72 * window.innerHeight }, // poklad_boczny
        { x: 0.52 * window.innerWidth, y: 0.30 * window.innerHeight }, // salon_podpoklad
        { x: 0.36 * window.innerWidth, y: 0.50 * window.innerHeight }, // kajuta_glowna
      ],

      // listy dla tablicy dedukcji i podpowiedzi w inputach
      deduction: {
        suspects: ['Alicja', 'Michał', 'Piotr', 'Weronika'],
        places:   ['Rufa', 'Pokład', 'Salon', 'Kajuta'],
        items:    ['Lina', 'Telefon', 'Kieliszek', 'Notatnik'],
      },

      notes: {
        characters: ['Alicja', 'Michał', 'Piotr', 'Weronika', 'Szymon'],
        places:   ['Rufa', 'Pokład', 'Salon', 'Kajuta'],
        items:    ['Lina', 'Telefon', 'Kieliszek', 'Notatnik'],
      },

      // callback po kliknięciu „Zakończ poziom”
      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
        // Prawda (poziom 10): Alicja + Lina cumownicza + Rufa jachtu
      },

      solution: {
        suspectKey: 'character1',
        itemKey: 'lina_cumownicza',
        placeKey: 'rufa_jachtu',
        aliases: {
          suspect: ['Alicja'],
          item: ['Lina', 'Lina cumownicza'],
          place: ['Rufa', 'Rufa jachtu']
        }
      },
    });
  }
}
