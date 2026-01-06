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

import BaseInvestigationScene from './BaseInvestigationScene';
import scenaDomnawsi from '../assets/scenes/scena_dom_na_wsi.png';

import character1 from '../assets/avatars/julia.png';
import character2 from '../assets/avatars/rafal.png';
import character3 from '../assets/avatars/piotr.png';
import character4 from '../assets/avatars/szymon.png';
import character5 from '../assets/avatars/michal.png';

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

      positions: [
        { x: 0.34 * window.innerWidth, y: 0.58 * window.innerHeight }, // Julia
        { x: 0.46 * window.innerWidth, y: 0.44 * window.innerHeight }, // Rafał
        { x: 0.50 * window.innerWidth, y: 0.70 * window.innerHeight }, // Piotr
        { x: 0.58 * window.innerWidth, y: 0.58 * window.innerHeight }, // Szymon
        { x: 0.52 * window.innerWidth, y: 0.40 * window.innerHeight }, // Michał
      ],

      characters: [
        {
          key: 'character1',
          src: character1,
          npcId: 'julia',
          text: 'Chciałam tylko pożyczyć podręczniki…',
          avatar: { key: 'avatar1', src: avatar1 }
        }, // Julia

        {
          key: 'character2',
          src: character2,
          npcId: 'rafal',
          text: 'Przyjechałem po wskazówki do pracy.',
          avatar: { key: 'avatar2', src: avatar2 }
        }, // Rafał

        {
          key: 'character3',
          src: character3,
          npcId: 'piotr',
          text: 'Interesował mnie stary wóz, serio.',
          avatar: { key: 'avatar3', src: avatar3 }
        }, // Piotr

        {
          key: 'character4',
          src: character4,
          npcId: 'szymon',
          text: 'Tylko pomagałem przy kominku.',
          avatar: { key: 'avatar4', src: avatar4 }
        }, // Szymon

        {
          key: 'character5',
          src: character5,
          npcId: 'michal',
          text: 'Ktoś wyskoczył przez okno… bałem się.',
          avatar: { key: 'avatar5', src: avatar5 }
        }, // Michał (świadek)
      ],

      items: [
        {
          key: 'sznur_drewno',
          name: 'Sznur do wiązania drewna',
          text: [
            'Leży przy stojaku na polana. Włókna spłaszczone co ~6–7 mm – jak po mocnym zacisku. Mikroziarna sadzy i żywicy wkręcone w skręt; jeden koniec z luźnym węzłem prostym. Ślad naciągu silniejszy po prawej stronie. Wskazówka: zestaw z „Kominek” (sadza) oraz „Rękawiczki robocze” (ułatwiają pewny chwyt).'
          ].join('\n'),
          src: require('../assets/items/sznur.png'),
          avatar: { key: 'sznur_drewno', src: require('../assets/items/sznur.png') },
          scale: 0.05,
        },
        {
          key: 'ksiegi_schowek',
          name: 'Stare księgi (wydrążony schowek)',
          text: [
            'Wnętrze puste; na krawędziach świeża sadza i przerwany „kożuch” kurzu – ktoś grzebał niedawno.',
            'Odciśnięty prostokąt po pakiecie dokumentów; strony przy brzegu lekko zakopcone.',
            'Wskazówka: łącz z „Kominek” (źródło sadzy) i trasą „Ślady błota”.'
          ].join('\n'),
          src: require('../assets/items/ksiegi.png'),
          avatar: { key: 'ksiegi_schowek', src: require('../assets/items/ksiegi.png') },
          scale: 0.05,
        },
        {
          key: 'rekawiczki_sadza',
          name: 'Rękawiczki robocze z sadzą',
          text: [
            'Zostawione obok przewróconego krzesła; rozmiar duży, wytarte kostki palców.',
            'Wnętrze zabrudzone sadzą – ręce były już czarne przed ich zdjęciem.',
            'Na palcach mikrowłókna podobne do przędzy sznurka.',
            'Wskazówka: skojarz z „Sznur do wiązania drewna” oraz czynnościami przy kominku.'
          ].join('\n'),
          src: require('../assets/items/rekawiczki.png'),
          avatar: { key: 'rekawiczki_sadza', src: require('../assets/items/rekawiczki.png') },
          scale: 0.05,
        },
        {
          key: 'slady_blota',
          name: 'Ślady błota',
          text: [
            'Ciąg od przedsionka, przez salon, pod sam kominek. Zawrotka z powrotem w stronę drzwi. Wzór podeszwy „rybia łuska” typowy dla kaloszy; długość kroku i rozmiar ~44–45. Wskazówka: zestaw z „Przedsionek / drzwi” (początek) i aktywnością przy kominku (cel trasy).'
          ].join('\n'),
          src: require('../assets/items/slady_blota.png'),
          avatar: { key: 'slady_blota', src: require('../assets/items/slady_blota.png') },
          scale: 0.05,
        },
      ],

      places: [
        {
          key: 'salon',
          name: 'Salon',
          text: [
            'Miejsce zbrodni. Dywan z przesuniętym runem (ciągnięcie), krzesło przewrócone w stronę kominka.',
            'Na podłodze dwa ślizgowe ślady obuwia – krótkie szarpnięcie.',
            'Wskazówka: połącz z „Sznur do wiązania drewna” (użyty w szarpaninie).'
          ].join('\n'),
          src: require('../assets/places/salon.png'),
          avatar: { key: 'salon', src: require('../assets/places/salon.png') },
          scale: 0.05,
        },
        {
          key: 'kominek',
          name: 'Kominek',
          text: [
            'Popiół świeżo naruszony; kosz z polanami przestawiony.',
            'Na obrzeżu czarne smugi zgodne z zabrudzeniami na sznurze i rękawiczkach.',
            'Wskazówka: to „stacja pośrednia” między schowkiem w księgach a miejscem szarpaniny.'
          ].join('\n'),
          src: require('../assets/places/kominek.png'),
          avatar: { key: 'kominek', src: require('../assets/places/kominek.png') },
          scale: 0.05,
        },
        {
          key: 'okno_wybite',
          name: 'Wybite okno',
          text: [
            'Większość odłamków szkła na zewnątrz, rysa na parapecie od strony wnętrza.',
            'Zasłona zahaczona do środka – wybicie mogło nastąpić od wewnątrz.',
            'Wskazówka: fałszywy trop włamania; skonfrontuj ze „Ślady błota” (kierunek ruchu po domu).'
          ].join('\n'),
          src: require('../assets/places/okno.png'),
          avatar: { key: 'okno_wybite', src: require('../assets/places/okno.png') },
          scale: 0.05,
        },
        {
          key: 'przedsionek',
          name: 'Przedsionek / drzwi wejściowe',
          text: [
            'Błoto zaczyna się już na wycieraczce; woda skapuje z krawędzi – wejście niedługo przed zdarzeniem.',
            'Ślady zgodne z kierunkiem do salonu i kominka.',
            'Wskazówka: punkt startowy trasy „Ślady błota”.'
          ].join('\n'),
          src: require('../assets/places/przedsionek.png'),
          avatar: { key: 'przedsionek', src: require('../assets/places/przedsionek.png') },
          scale: 0.05,
        },
      ],

      itemPositions: [
        { x: 0.55 * window.innerWidth, y: 0.48 * window.innerHeight },
        { x: 0.62 * window.innerWidth, y: 0.38 * window.innerHeight },
        { x: 0.40 * window.innerWidth, y: 0.70 * window.innerHeight },
        { x: 0.62 * window.innerWidth, y: 0.68 * window.innerHeight },
      ],

      placePositions: [
        { x: 0.52 * window.innerWidth, y: 0.55 * window.innerHeight },
        { x: 0.61 * window.innerWidth, y: 0.50 * window.innerHeight },
        { x: 0.37 * window.innerWidth, y: 0.32 * window.innerHeight },
        { x: 0.36 * window.innerWidth, y: 0.74 * window.innerHeight },
      ],

      deduction: {
        suspects: ['Julia', 'Rafał', 'Piotr', 'Szymon'],
        places:   ['Salon', 'Kominek', 'Okno', 'Przedsionek'],
        items:    ['Sznur', 'Księgi', 'Rękawiczki', 'Ślady błota'],
      },

      notes: {
        characters: ['Julia', 'Rafał', 'Piotr', 'Szymon', 'Michał'],
        places:   ['Salon', 'Kominek', 'Okno', 'Przedsionek'],
        items:    ['Sznur', 'Księgi', 'Rękawiczki', 'Ślady błota'],
      },

      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
      },

      solution: {
        suspectKey: 'character4',
        itemKey:    'sznur_drewno',
        placeKey:   'salon',
        aliases: {
          suspect: ['Szymon'],
          item:    ['Sznur do wiązania drewna', 'Sznur'],
          place:   ['Salon']
        }
      },
    });
  }
}