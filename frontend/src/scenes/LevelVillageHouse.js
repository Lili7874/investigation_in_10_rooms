/* 
Rozstrzygnięcie (ukryta prawda – poziom 3)

Sprawca: Szymon
Przedmiot sprawcy: Sznur do wiązania drewna (ślady naciągnięcia zgodne z duszeniem; sadza jak przy kominku)
Miejsce morderstwa: Salon

Logika:
• Ciąg śladów błota prowadzi od drzwi wprost pod kominek i do miejsca szarpaniny w salonie – wzór podeszwy jak w kaloszach Szymona.
• Sznur znaleziony przy kominku ma na włóknach ślady naciągnięcia i sadzę; łączy miejsce poszukiwań dokumentów z metodą zabójstwa.
• Rękawiczki robocze z sadzą odłożone obok przewróconego krzesła pasują do kogoś, kto „naprawiał kominek”.
• Stare księgi z wydrążonym schowkiem są puste, na krawędziach świeża sadza – ktoś grzebał tuż przed zdarzeniem.
• Wybite okno to fałszywy trop sugerujący włamanie z zewnątrz – ukrywa fakt, że sprawca był już w środku.
*/

import BaseInvestigationScene from '../BaseInvestigationScene';
import scenaDomnawsi from '../assets/scenes/scena_dom_na_wsi.png';

// postacie – mapowanie: Julia, Rafał, Piotr, Szymon, Michał (świadek)
import character1 from '../assets/avatars/julia.png';
import character2 from '../assets/avatars/rafal.png';
import character3 from '../assets/avatars/piotr.png';
import character4 from '../assets/avatars/szymon.png';
import character5 from '../assets/avatars/michal.png';

// avatary (ikonki)
import avatar1 from '../assets/avatar_icons/julia_icon.png';
import avatar2 from '../assets/avatar_icons/rafal_icon.png';
import avatar3 from '../assets/avatar_icons/piotr_icon.png';
import avatar4 from '../assets/avatar_icons/szymon_icon.png';
import avatar5 from '../assets/avatar_icons/michal_icon.png';

export default class LevelVillageHouse extends BaseInvestigationScene {
  constructor() {
    super('LevelVillageHouse', {
      bgKey: 'bg_villagehouse',
      bgSrc: scenaDomnawsi,
      title: 'Dom na wsi',
      intro: `🖼 Sceneria:
Stary, drewniany dom stojący samotnie na skraju wsi. W środku czuć zapach dymu z kominka i wilgoci. Krzesło jest przewrócone, a jedno z okien wybite. Na podłodze widać ślady błota prowadzące od drzwi aż pod sam kominek.

📖 Historia poziomu:
Właściciel domu, starszy gospodarz, został znaleziony martwy w salonie. Policja twierdzi, że doszło do duszenia, a ślady wskazują, że ktoś wdarł się do środka nocą. We wsi od dawna krążyły plotki o cennych dokumentach ukrytych w starych księgach gospodarza. Atmosfera w domu robi się coraz bardziej napięta.

Podejrzani:
• Julia — nauczycielka języka polskiego. Twierdzi, że chciała pożyczyć stare podręczniki, ale nie potrafi wyjaśnić, dlaczego była w domu tak późno.  
• Rafał — student prawa. Powiedział, że „przyjechał po wskazówki do pracy magisterskiej”. Kłócił się z gospodarzem o dostęp do archiwum.
• Piotr — sprzedawca samochodów. Utrzymuje, że chciał kupić stary wóz od gospodarza. Kiedy zapytano go o szczegóły, nie potrafił podać ani marki, ani rocznika.  
• Szymon — starszy emeryt. Bywał tu często, bo znał gospodarza od lat. Twierdzi, że tylko chciał pomóc przy naprawie kominka, ale na jego ubraniu znaleziono ślady błota pasujące do tropów z podwórza.

Świadek:
• Michał — nieśmiały i wycofany. Był w kuchni, gdy usłyszał hałas z salonu. Powiedział, że widział sylwetkę uciekającą przez wybite okno, ale nie rozpoznał, kto to był. Twierdzi, że bał się wyjść, dopóki nie przyjechała policja.

🎯 Cel gracza:
Twoim zadaniem jest odkrycie, który z czterech podejrzanych miał motyw i okazję, by zamordować gospodarza i szukał ukrytych dokumentów. Przeanalizuj sprzeczne zeznania, momenty wejścia i wyjścia z domu oraz to, kto naprawdę miał dostęp do kominka i ksiąg.`,

      // === POZYCJE POSTACI (łuk – 4 podejrzanych + świadek) ===
      positions: [
        { x: 0.34 * window.innerWidth, y: 0.58 * window.innerHeight }, // Julia
        { x: 0.46 * window.innerWidth, y: 0.44 * window.innerHeight }, // Rafał
        { x: 0.50 * window.innerWidth, y: 0.70 * window.innerHeight }, // Piotr
        { x: 0.58 * window.innerWidth, y: 0.58 * window.innerHeight }, // Szymon
        { x: 0.52 * window.innerWidth, y: 0.40 * window.innerHeight }, // Michał (świadek)
      ],

      // === POSTACIE ===
      characters: [
        { key: 'character1', src: character1, text: 'Chciałam tylko pożyczyć podręczniki…', avatar: { key: 'avatar1', src: avatar1 } }, // Julia
        { key: 'character2', src: character2, text: 'Przyjechałem po wskazówki do pracy.',  avatar: { key: 'avatar2', src: avatar2 } }, // Rafał
        { key: 'character3', src: character3, text: 'Interesował mnie stary wóz, serio.',   avatar: { key: 'avatar3', src: avatar3 } }, // Piotr
        { key: 'character4', src: character4, text: 'Tylko pomagałem przy kominku.',        avatar: { key: 'avatar4', src: avatar4 } }, // Szymon
        { key: 'character5', src: character5, text: 'Ktoś wyskoczył przez okno… bałem się.', avatar: { key: 'avatar5', src: avatar5 } }, // Michał
      ],

      // === PRZEDMIOTY (4) ===
      items: [
        {
          key: 'sznur_drewno',
          name: 'Sznur do wiązania drewna',
          text: 'Przy kominku; włókna z śladami naciągnięcia i sadzą — zgodne z duszeniem.',
          src: require('../assets/items/sznur.png'),
          avatar: { key: 'sznur_drewno', src: require('../assets/items/sznur.png') },
          scale: 0.05,
        },
        {
          key: 'ksiegi_schowek',
          name: 'Stare księgi (wydrążony schowek)',
          text: 'Wnętrze puste; na krawędziach świeża sadza — ktoś szukał dokumentów.',
          src: require('../assets/items/ksiegi.png'),
          avatar: { key: 'ksiegi_schowek', src: require('../assets/items/ksiegi.png') },
          scale: 0.05,
        },
        {
          key: 'rekawiczki_sadza',
          name: 'Rękawiczki robocze z sadzą',
          text: 'Odłożone przy przewróconym krześle; rozmiar i zużycie jak u osoby „od kominka”.',
          src: require('../assets/items/rekawiczki.png'),
          avatar: { key: 'rekawiczki_sadza', src: require('../assets/items/rekawiczki.png') },
          scale: 0.05,
        },
        {
          key: 'slady_blota',
          name: 'Ślady błota',
          text: 'Wyraźna linia od drzwi do kominka; wzór podeszwy jak w starych kaloszach.',
          src: require('../assets/items/slady_blota.png'),
          avatar: { key: 'slady_blota', src: require('../assets/items/slady_blota.png') },
          scale: 0.05,
        },
      ],

      // === MIEJSCA (4) ===
      places: [
        {
          key: 'salon',
          name: 'Salon',
          text: 'Miejsce zbrodni; przewrócone krzesło i oznaki szarpaniny.',
          src: require('../assets/places/salon.png'),
          avatar: { key: 'salon', src: require('../assets/places/salon.png') },
          scale: 0.05,
        },
        {
          key: 'kominek',
          name: 'Kominek',
          text: 'Punkt poszukiwań dokumentów; sadza na sznurze i księgach.',
          src: require('../assets/places/kominek.png'),
          avatar: { key: 'kominek', src: require('../assets/places/kominek.png') },
          scale: 0.05,
        },
        {
          key: 'okno_wybite',
          name: 'Wybite okno',
          text: 'Droga ucieczki obserwowana przez świadka; możliwy fałszywy trop.',
          src: require('../assets/places/okno.png'),
          avatar: { key: 'okno_wybite', src: require('../assets/places/okno.png') },
          scale: 0.05,
        },
        {
          key: 'przedsionek',
          name: 'Przedsionek / drzwi wejściowe',
          text: 'Początek ciągu błotnistych śladów prowadzących pod kominek.',
          src: require('../assets/places/przedsionek.png'),
          avatar: { key: 'przedsionek', src: require('../assets/places/przedsionek.png') },
          scale: 0.05,
        },
      ],

      // === POZYCJE PRZEDMIOTÓW (kolejność jak w "items") ===
      itemPositions: [
        { x: 0.55 * window.innerWidth, y: 0.48 * window.innerHeight }, // sznur_drewno
        { x: 0.62 * window.innerWidth, y: 0.38 * window.innerHeight }, // ksiegi_schowek
        { x: 0.40 * window.innerWidth, y: 0.70 * window.innerHeight }, // rekawiczki_sadza
        { x: 0.62 * window.innerWidth, y: 0.68 * window.innerHeight }, // slady_blota
      ],

      // === POZYCJE MIEJSC (kolejność jak w "places") ===
      placePositions: [
        { x: 0.52 * window.innerWidth, y: 0.55 * window.innerHeight }, // salon
        { x: 0.61 * window.innerWidth, y: 0.50 * window.innerHeight }, // kominek
        { x: 0.37 * window.innerWidth, y: 0.32 * window.innerHeight }, // okno_wybite
        { x: 0.36 * window.innerWidth, y: 0.74 * window.innerHeight }, // przedsionek
      ],

      // listy dla tablicy dedukcji i podpowiedzi w inputach
      deduction: {
        suspects: ['Julia', 'Rafał', 'Piotr', 'Szymon'],
        places:   ['Salon', 'Kominek', 'Okno', 'Przedsionek'],
        items:    ['Sznur', 'Księgi', 'Rękawiczki', 'Ślady błota'],
      },

      // callback po kliknięciu „Zakończ poziom”
      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
        // Prawda (poziom 3): Szymon + Sznur do wiązania drewna + Salon
      },
    });
  }
}
