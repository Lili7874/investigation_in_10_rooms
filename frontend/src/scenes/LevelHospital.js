// src/scenes/LevelHospital.js
/* 
Rozstrzygnięcie (ukryta prawda – poziom 8)

Sprawca: Anna
Przedmiot sprawcy: Paczka papierosów z korytarza (świeże niedopałki; zapach dymu w strefie przy windach – oznaka zdenerwowania i palenia mimo zakazu)
Miejsce morderstwa: Sala pacjenta (aparatura wyłączona manualnie)

Logika:
• Podrobiony identyfikator Weroniki wygląda na oczywisty dowód, ale jego timestamp nie spina się z godziną wejścia na oddział.
• Tomasz kręcił się na OIOM-ie, lecz brak jego śladów przy sali pacjenta – to odciągacz uwagi.
• Kacper ma ślady środka dezynfekującego, ale nie znał nazwiska lekarza – wpadka, nie sprawstwo.
• Anna była widziana przy pokoju pielęgniarek – stamtąd mogła zdobyć strój i wejść nielegalnie.
• Świadek widział osobę w rękawiczkach i masce manipulującą przy kroplówce → sprawca podszył się pod personel.
• Trop z paczką papierosów na korytarzu przy windach łączy się z nerwowym zachowaniem Anny (palenie mimo zakazu) w oknie czasowym zbrodni.
*/

import BaseInvestigationScene from '../BaseInvestigationScene';
import scenaSzpital from '../assets/scenes/scena_szpital.png';

// postacie 
import character1 from '../assets/avatars/anna.png';
import character2 from '../assets/avatars/tomasz.png';
import character3 from '../assets/avatars/weronika.png';
import character4 from '../assets/avatars/kacper.png';
import character5 from '../assets/avatars/marzena.png';

// avatary (ikonki)
import avatar1 from '../assets/avatar_icons/anna_icon.png';
import avatar2 from '../assets/avatar_icons/tomasz_icon.png';
import avatar3 from '../assets/avatar_icons/weronika_icon.png';
import avatar4 from '../assets/avatar_icons/kacper_icon.png';
import avatar5 from '../assets/avatar_icons/marzena_icon.png';

export default class LevelHospital extends BaseInvestigationScene {
  constructor() {
    super('LevelHospital', {
      bgKey: 'bg_hospital',
      bgSrc: scenaSzpital,
      title: 'Szpital w nocy',
      intro: `🖼 Sceneria:
Pusta sala szpitalna oświetlona bladym światłem jarzeniówek. Łóżka stoją w równych rzędach, na jednym z nich leży porzucona kroplówka. Na stoliku medycznym rozsypane są dokumenty pacjenta, a w tle słychać monotonne piknięcia aparatury. Na korytarzu unosi się zapach środków dezynfekujących i świeżo zgaszonych papierosów.

📖 Historia poziomu:
W nocy w szpitalu zginął ważny pacjent objęty policyjną ochroną. Oficjalnie miał przeżyć operację i być kluczowym świadkiem w procesie, ale ktoś wyłączył aparaturę. Cztery osoby miały dostęp do oddziału, każda z innym powodem, ale żadna nie przyznaje się do manipulacji przy sprzęcie.

Podejrzani:
• Anna — właścicielka firmy jubilerskiej. Powiedziała, że odwiedzała „dawnego znajomego”, ale nikt nie widział, by miała upoważnienie. Ktoś zauważył ją przy pokoju pielęgniarek.  
• Tomasz — złodziejaszek. Został przywieziony na izbę przyjęć z lekkim urazem, ale szybko „zniknął” z łóżka. Później widziano go na oddziale intensywnej terapii.  
• Weronika — aktorka. Twierdzi, że przygotowywała się do roli pielęgniarki i uzyskała zgodę na obserwację. Jej identyfikator okazał się podrobiony.  
• Kacper — młody i impulsywny. Powiedział, że szukał matki pracującej w szpitalu, ale nie potrafił podać nazwiska lekarza, którego miał pytać. Na jego ubraniu były ślady środka dezynfekującego.

Świadek:
• Marzena — sekretarka, która w nocy przywiozła do szpitala dokumenty firmowe dla jednego z pacjentów. Twierdzi, że widziała, jak ktoś manipulował przy kroplówce, ale nie zdążyła dostrzec twarzy. Jest przekonana, że sprawca używał rękawiczek i maski, więc mógł udawać pracownika oddziału.

🎯 Cel gracza:
Twoim zadaniem jest przesłuchanie świadków i ustalenie, kto z czwórki podejrzanych miał motyw i okazję, by zabić pacjenta. Analizuj sprzeczne alibi, fałszywe tożsamości i ślady na oddziale.`,

      // === POZYCJE POSTACI (łuk – 5 postaci: 4 podejrzanych + świadek) ===
      positions: [
        { x: 0.34 * window.innerWidth, y: 0.52 * window.innerHeight }, // Anna
        { x: 0.50 * window.innerWidth, y: 0.36 * window.innerHeight }, // Tomasz
        { x: 0.60 * window.innerWidth, y: 0.54 * window.innerHeight }, // Weronika
        { x: 0.40 * window.innerWidth, y: 0.64 * window.innerHeight }, // Kacper
        { x: 0.46 * window.innerWidth, y: 0.56 * window.innerHeight }, // Marzena (świadek)
      ],

      // === POSTACIE ===
      characters: [
        { key: 'character1', src: character1, text: 'Widziałam coś podejrzanego!', avatar: { key: 'avatar1', src: avatar1 } },
        { key: 'character2', src: character2, text: 'Nie wiem, czy mogę pomóc...', avatar: { key: 'avatar2', src: avatar2 } },
        { key: 'character3', src: character3, text: 'To było straszne!', avatar: { key: 'avatar3', src: avatar3 } },
        { key: 'character4', src: character4, text: 'Ktoś tu był przed tobą...', avatar: { key: 'avatar4', src: avatar4 } },
        { key: 'character5', src: character5, text: 'Musisz się pośpieszyć!', avatar: { key: 'avatar5', src: avatar5 } },
      ],

      // === PRZEDMIOTY (4) — ROZSZERZONE PODPOWIEDZI (poziom 8) ===
      items: [
        {
          key: 'kroplowka',
          name: 'Kroplówka',
          text: [
            'Zacisk z mikrorysami od pazura rękawiczki; ślad talcu na wężyku.',
            'Tempo infuzji zmienione krótko przed zgonem — wpis w monitorze jest niespójny z kartą.',
            'Świadek widział osobę w masce i rękawiczkach przy łóżku.',
            'Wskazówka: sprawca podszył się pod personel i działał manualnie w „Sali pacjenta”.'
          ].join('\n'),
          src: require('../assets/items/kroplowka.png'),
          avatar: { key: 'kroplowka', src: require('../assets/items/kroplowka.png') },
          scale: 0.05,
        },
        {
          key: 'identyfikator_podrobiony',
          name: 'Podrobiony identyfikator',
          text: [
            'Id Weroniki: numer oddziału niezgodny z bieżącą obsadą; świeża laminacja, brak śladów zużycia taśmy.',
            'Timestamp na karcie nie pokrywa się z logiem wejść na oddział.',
            'Wskazówka: „zbyt czyste” — atrakcyjny lecz mylący dowód.'
          ].join('\n'),
          src: require('../assets/items/identyfikator.png'),
          avatar: { key: 'identyfikator', src: require('../assets/items/identyfikator.png') },
          scale: 0.05,
        },
        {
          key: 'dokumenty_pacjenta',
          name: 'Dokumenty pacjenta',
          text: [
            'Brakuje fragmentu strony z listą odwiedzin; rogi kart nasączone środkiem dezynfekującym.',
            'Notatka pielęgniarska urywa się przed zmianą prędkości infuzji.',
            'Wskazówka: ktoś manipulował dokumentacją, by rozmyć okno czasu.'
          ].join('\n'),
          src: require('../assets/items/dokumenty.png'),
          avatar: { key: 'dokumenty', src: require('../assets/items/dokumenty.png') },
          scale: 0.05,
        },
        {
          key: 'paczka_papierosow',
          name: 'Paczka papierosów z korytarza',
          text: [
            'Leży przy windach; dwa świeże niedopałki i wyczuwalny zapach dymu mimo zakazu.',
            'Miejsce w martwym punkcie kamer, blisko zejścia na oddział.',
            'Korelacja: świadek widzi „personel” przy kroplówce, a chwilę wcześniej czuć dym na korytarzu.',
            'Wskazówka (klucz): nerwowe palenie łączy się z Anną widzianą przy „Pokoju pielęgniarek”.'
          ].join('\n'),
          src: require('../assets/items/papierosy.png'),
          avatar: { key: 'paczka_papierosow', src: require('../assets/items/papierosy.png') },
          scale: 0.05,
        },
      ],

      // === MIEJSCA (4) — ROZSZERZONE PODPOWIEDZI (poziom 8) ===
      places: [
        {
          key: 'sala_pacjenta',
          name: 'Sala pacjenta',
          text: [
            'Miejsce zbrodni: aparatura wyłączona manualnie; kabel zasilania z odciskiem talku z rękawic.',
            'Przesunięte barierki łóżka i odciśnięty but na wykładzinie przy kroplówce.',
            'Wskazówka: tu doszło do decydującej manipulacji, nie na OIOM-ie.'
          ].join('\n'),
          src: require('../assets/places/sala_pacjenta.png'),
          avatar: { key: 'sala_pacjenta', src: require('../assets/places/sala_pacjenta.png') },
          scale: 0.05,
        },
        {
          key: 'pokoj_pielegniarek',
          name: 'Pokój pielęgniarek',
          text: [
            'W koszu resztki jednorazowych rękawic i masek; brakuje jednego kompletu M.',
            'Świadkowie kojarzą tu Annę chwilę przed zdarzeniem.',
            'Wskazówka: możliwe źródło „przebrania” sprawcy.'
          ].join('\n'),
          src: require('../assets/places/pokoj_pielegniarek.png'),
          avatar: { key: 'pokoj_pielegniarek', src: require('../assets/places/pokoj_pielegniarek.png') },
          scale: 0.05,
        },
        {
          key: 'oiom',
          name: 'Oddział intensywnej terapii',
          text: [
            'Tomasz widziany na korytarzu OIOM-u; brak jego śladów w „Sali pacjenta”.',
            'Wskazówka: silny, ale fałszywy trop — obecność ≠ sprawstwo.'
          ].join('\n'),
          src: require('../assets/places/oiom.png'),
          avatar: { key: 'oiom', src: require('../assets/places/oiom.png') },
          scale: 0.05,
        },
        {
          key: 'korytarz_windy',
          name: 'Korytarz przy windach',
          text: [
            'Zapach świeżo zgaszonych papierosów; znaleziono paczkę i niedopałki.',
            'Rejon z ograniczonym zasięgiem kamer; łączy szlak z „Pokoju pielęgniarek” do „Sali pacjenta”.',
            'Wskazówka: zachowanie pod wpływem stresu (palenie) spina się z oknem czasowym zbrodni.'
          ].join('\n'),
          src: require('../assets/places/korytarz_windy.png'),
          avatar: { key: 'korytarz_windy', src: require('../assets/places/korytarz_windy.png') },
          scale: 0.05,
        },
      ],

      // === POZYCJE PRZEDMIOTÓW (kolejność jak w "items") ===
      itemPositions: [
        { x: 0.58 * window.innerWidth, y: 0.44 * window.innerHeight }, // kroplowka
        { x: 0.40 * window.innerWidth, y: 0.46 * window.innerHeight }, // identyfikator_podrobiony
        { x: 0.68 * window.innerWidth, y: 0.60 * window.innerHeight }, // dokumenty_pacjenta
        { x: 0.62 * window.innerWidth, y: 0.73 * window.innerHeight }, // paczka_papierosow
      ],

      // === POZYCJE MIEJSC (kolejność jak w "places") ===
      placePositions: [
        { x: 0.50 * window.innerWidth, y: 0.58 * window.innerHeight }, // sala_pacjenta
        { x: 0.30 * window.innerWidth, y: 0.63 * window.innerHeight }, // pokoj_pielegniarek
        { x: 0.56 * window.innerWidth, y: 0.46 * window.innerHeight }, // oiom
        { x: 0.68 * window.innerWidth, y: 0.68 * window.innerHeight }, // korytarz_windy
      ],

      // listy dla tablicy dedukcji i podpowiedzi w inputach
      deduction: {
        suspects: ['Anna', 'Tomasz', 'Weronika', 'Kacper'],
        places:   ['Sala', 'Pokój', 'OIOM', 'Korytarz'],
        items:    ['Kroplówka', 'Identyfikator', 'Dokumenty', 'Papierosy'],
      },

      // callback po kliknięciu „Zakończ poziom”
      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
        // Prawda (poziom 8): Anna + Paczka papierosów z korytarza + Sala pacjenta
      },
      solution: {
        suspectKey: 'character1',  
        itemKey:    'paczka_papierosow',
        placeKey:   'sala_pacjenta',
        aliases: {
          suspect: ['Anna'],
          item:    ['Paczka papierosów', 'Papierosy'],
          place:   ['Sala pacjenta', 'Sala']
        }
      },
    });
  }
}

