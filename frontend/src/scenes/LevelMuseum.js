// src/scenes/LevelMuseum.js
/* 
Rozstrzygnięcie (ukryta prawda – poziom 6)

Sprawca: Anna
Przedmiot sprawcy: Dziennik alarmów (wejście techniczne) – krótka dezaktywacja strefy tuż przed alarmem
Miejsce morderstwa: Drzwi awaryjne (ciało strażnika znalezione przy wyjściu)

Logika:
• Dziennik panelu pokazuje krótkie rozbrojenie strefy przy wejściu technicznym tuż przed alarmem – działanie osoby znającej procedurę/kod.
• Świadek słyszy brzęk szkła kilka minut przed alarmem → zgrywa się z rozbitym czujnikiem w sali ekspozycji.
• Nagranie K-4 uchwyca sylwetkę zasłaniającą twarz telefonem przy panelu dokładnie w oknie czasowym.
• Lista zaproszeń VIP tłumaczy obecność Anny przy wejściu technicznym i daje jej pretekst do poruszania się po zapleczu.
• Tomasz widziany przy magazynie to mylący trop; brak śladów ingerencji w sejfy tej nocy.
*/

import BaseInvestigationScene from '../BaseInvestigationScene';
import scenaMuzeum from '../assets/scenes/scena_muzeum.png';

// postacie – mapowanie: Anna, Marzena, Kacper, Tomasz, Weronika (świadek)
import character1 from '../assets/avatars/anna.png';
import character2 from '../assets/avatars/marzena.png';
import character3 from '../assets/avatars/kacper.png';
import character4 from '../assets/avatars/tomasz.png';
import character5 from '../assets/avatars/weronika.png';

// avatary (ikonki)
import avatar1 from '../assets/avatar_icons/anna_icon.png';
import avatar2 from '../assets/avatar_icons/marzena_icon.png';
import avatar3 from '../assets/avatar_icons/kacper_icon.png';
import avatar4 from '../assets/avatar_icons/tomasz_icon.png';
import avatar5 from '../assets/avatar_icons/weronika_icon.png';

export default class LevelMuseum extends BaseInvestigationScene {
  constructor() {
    super('LevelMuseum', {
      bgKey: 'bg_museum',
      bgSrc: scenaMuzeum,
      title: 'Muzeum sztuki w nocy',
      intro: `🖼 Sceneria:
Wielka sala muzeum sztuki współczesnej. Na marmurowej podłodze leżą rozbite odłamki szkła z czujnika ruchu, a czerwone światła alarmu pulsują przy suficie. W kącie błyska monitor z nagraniem z kamer, na którym widać jedynie poruszoną sylwetkę.

📖 Historia poziomu:
Podczas nocnej ekspozycji doszło do kradzieży jednego z najcenniejszych obrazów w muzeum. Strażnik znalazł ciało swojego kolegi obok drzwi awaryjnych — wygląda na to, że ktoś próbował wynieść dzieło w pośpiechu. Dowody wskazują, że sprawca znał układ zabezpieczeń.

Podejrzani:
• Anna — właścicielka firmy jubilerskiej. Twierdzi, że przyszła na zaproszenie dyrektora muzeum, ale zaprzecza, by miała dostęp do strefy alarmowej. Świadkowie widzieli, jak rozmawiała przez telefon przy wejściu technicznym.  
• Marzena — sekretarka, a w jej torebce znaleziono bilet z datą wcześniejszej nocy, co budzi pytania, dlaczego wróciła ponownie.  
• Kacper — młody i impulsywny. Powiedział, że „tylko robił zdjęcia” do projektu szkolnego, ale jego aparat zniknął. Kilka zdjęć pojawiło się jednak w sieci tuż po kradzieży.  
• Tomasz — drobny złodziej. Był widziany w pobliżu sali magazynowej, gdzie przechowywano inne eksponaty. Zaprzecza, że miał cokolwiek wspólnego ze zniknięciem obrazu, ale strażnicy znają go z wcześniejszych incydentów.

Świadek:
• Weronika — młoda aktorka. Oglądała wystawę i ćwiczyła do nowej roli kustoszki. Twierdzi, że widziała cień przemykający korytarzem, ale nie rozpoznała osoby. Dodaje, że słyszała brzęk szkła kilka minut przed alarmem.

🎯 Cel gracza:
Twoim zadaniem jest ustalenie, kto znał zabezpieczenia i miał okazję, by ukraść obraz. Przesłuchaj świadków, zwróć uwagę na sprzeczności w alibi i zdecyduj, który z czterech podejrzanych stoi za kradzieżą i śmiercią strażnika.`,

      // === POZYCJE POSTACI (łuk – 5 postaci: 4 podejrzanych + świadek) ===
      positions: [
        { x: 0.40 * window.innerWidth, y: 0.58 * window.innerHeight }, // Anna
        { x: 0.46 * window.innerWidth, y: 0.44 * window.innerHeight }, // Marzena
        { x: 0.58 * window.innerWidth, y: 0.70 * window.innerHeight }, // Kacper
        { x: 0.50 * window.innerWidth, y: 0.70 * window.innerHeight }, // Tomasz
        { x: 0.50 * window.innerWidth, y: 0.38 * window.innerHeight }, // Weronika (świadek)
      ],

      // === POSTACIE ===
      characters: [
        { key: 'character1', src: character1, text: 'Byłam zaproszona — tylko rozmawiałam przez telefon.', avatar: { key: 'avatar1', src: avatar1 } }, // Anna
        { key: 'character2', src: character2, text: 'Przyszłam drugi raz, bo… chciałam jeszcze raz zobaczyć ekspozycję.', avatar: { key: 'avatar2', src: avatar2 } }, // Marzena
        { key: 'character3', src: character3, text: 'Robiłem zdjęcia do projektu! Mój aparat zniknął!', avatar: { key: 'avatar3', src: avatar3 } }, // Kacper
        { key: 'character4', src: character4, text: 'Nie mam z tym nic wspólnego, serio.', avatar: { key: 'avatar4', src: avatar4 } }, // Tomasz
        { key: 'character5', src: character5, text: 'Słyszałam brzęk szkła, zanim zawył alarm…', avatar: { key: 'avatar5', src: avatar5 } }, // Weronika
      ],

      // === PRZEDMIOTY (4) ===
      items: [
        {
          key: 'dziennik_alarmow',
          name: 'Dziennik alarmów (wejście techniczne)',
          text: 'Krótka dezaktywacja strefy tuż przed alarmem; log wskazuje na panel przy wejściu technicznym.',
          src: require('../assets/items/dziennik_alarmow.png'),
          avatar: { key: 'dziennik_alarmow', src: require('../assets/items/dziennik_alarmow.png') },
          scale: 0.05,
        },
        {
          key: 'odlamki_czujnika',
          name: 'Odłamki czujnika ruchu',
          text: 'Szkło z osłony czujnika w sali ekspozycji; świadek słyszał brzęk kilka minut przed alarmem.',
          src: require('../assets/items/odlamki.png'),
          avatar: { key: 'odlamki_czujnika', src: require('../assets/items/odlamki.png') },
          scale: 0.05,
        },
        {
          key: 'nagranie_k4',
          name: 'Nagranie K-4 (korytarz techniczny)',
          text: 'Poruszona sylwetka przy panelu; twarz zasłonięta telefonem.',
          src: require('../assets/items/kamera.png'),
          avatar: { key: 'nagranie_k4', src: require('../assets/items/kamera.png') },
          scale: 0.05,
        },
        {
          key: 'lista_vip',
          name: 'Lista zaproszeń VIP',
          text: 'Nazwisko Anny figuruje jako gość dyrektora — pretekst do obecności przy wejściu technicznym.',
          src: require('../assets/items/lista_vip.png'),
          avatar: { key: 'lista_vip', src: require('../assets/items/lista_vip.png') },
          scale: 0.05,
        },
      ],

      // === MIEJSCA (4) ===
      places: [
        {
          key: 'sala_ekspozycji',
          name: 'Sala główna ekspozycji',
          text: 'Rozbity czujnik; punkt startowy kradzieży obrazu.',
          src: require('../assets/places/sala_ekspozycji.png'),
          avatar: { key: 'sala_ekspozycji', src: require('../assets/places/sala_ekspozycji.png') },
          scale: 0.05,
        },
        {
          key: 'drzwi_awaryjne',
          name: 'Drzwi awaryjne',
          text: 'Miejsce znalezienia ciała strażnika; pośpieszna próba wyniesienia łupu.',
          src: require('../assets/places/drzwi_awaryjne.png'),
          avatar: { key: 'drzwi_awaryjne', src: require('../assets/places/drzwi_awaryjne.png') },
          scale: 0.05,
        },
        {
          key: 'wejscie_techniczne',
          name: 'Wejście techniczne (panel)',
          text: 'Panel alarmu; log rozbrojenia odpowiada temu punktowi.',
          src: require('../assets/places/wejscie_techniczne.png'),
          avatar: { key: 'wejscie_techniczne', src: require('../assets/places/wejscie_techniczne.png') },
          scale: 0.05,
        },
        {
          key: 'magazyn_zaplecze',
          name: 'Magazyn / zaplecze',
          text: 'Widziano tu Tomasza; brak śladów przy sejfach tej nocy.',
          src: require('../assets/places/magazyn_zaplecze.png'),
          avatar: { key: 'magazyn_zaplecze', src: require('../assets/places/magazyn_zaplecze.png') },
          scale: 0.05,
        },
      ],

      // === POZYCJE PRZEDMIOTÓW (kolejność jak w "items") ===
      itemPositions: [
        { x: 0.40 * window.innerWidth, y: 0.44 * window.innerHeight }, // dziennik_alarmow
        { x: 0.59 * window.innerWidth, y: 0.55 * window.innerHeight }, // odlamki_czujnika
        { x: 0.45 * window.innerWidth, y: 0.65 * window.innerHeight }, // nagranie_k4
        { x: 0.62 * window.innerWidth, y: 0.68 * window.innerHeight }, // lista_vip
      ],

      // === POZYCJE MIEJSC (kolejność jak w "places") ===
      placePositions: [
        { x: 0.64 * window.innerWidth, y: 0.50 * window.innerHeight }, // sala_ekspozycji
        { x: 0.55 * window.innerWidth, y: 0.40 * window.innerHeight }, // drzwi_awaryjne
        { x: 0.40 * window.innerWidth, y: 0.38 * window.innerHeight }, // wejscie_techniczne
        { x: 0.36 * window.innerWidth, y: 0.74 * window.innerHeight }, // magazyn_zaplecze
      ],

      // listy dla tablicy dedukcji i podpowiedzi w inputach
      deduction: {
        suspects: ['Anna', 'Marzena', 'Kacper', 'Tomasz'],
        places:   ['Sala', 'Awaryjne', 'Techniczne', 'Magazyn'],
        items:    ['Dziennik', 'Odłamki', 'Nagranie', 'VIP lista'],
      },

      // callback po kliknięciu „Zakończ poziom”
      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
        // Prawda (poziom 6): Anna + Dziennik alarmów (wejście techniczne) + Drzwi awaryjne
      },
    });
  }
}
