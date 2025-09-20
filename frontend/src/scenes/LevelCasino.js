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

import BaseInvestigationScene from '../BaseInvestigationScene';
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
• Alicja — pewna siebie i stanowcza. Grała w pokera z wysokimi stawkami, a ofiara wcześniej odrzuciła jej propozycję wspólnej inwestycji. Widziała ją przy drzwiach do pokoju VIP.  
• Julia — nauczycielka języka polskiego. Mówi, że przyszła do kasyna „tylko towarzysko”, ale kasjerka potwierdziła, że wymieniła dużą sumę gotówki na żetony. Widziała ją rozmawiającą z ofiarą przy barze.

Świadek:
• Szymon — starszy emeryt, obserwował grę w kasynie z boku. Twierdzi, że widział jedną z osób wchodzących do VIP roomu chwilę przed wyłączeniem kamer. Nie rozpoznał dokładnie twarzy, ale zapamiętał charakterystyczną marynarkę w kratę.

🎯 Cel gracza:
Ustal, kto z czterech podejrzanych wykorzystał zamieszanie w kasynie, by zabić ofiarę w pokoju VIP. Analizuj sprzeczne wersje i wskaż osobę z najsilniejszym motywem i okazją.`,

      // === POZYCJE POSTACI (ładny łuk; możesz modyfikować procenty ekranu) ===
      positions: [
        { x: 0.50 * window.innerWidth, y: 0.70 * window.innerHeight }, // piotr
        { x: 0.64 * window.innerWidth, y: 0.53 * window.innerHeight }, // rafał
        { x: 0.40 * window.innerWidth, y: 0.54 * window.innerHeight }, // alicja
        { x: 0.50 * window.innerWidth, y: 0.47 * window.innerHeight }, //julia
        { x: 0.52 * window.innerWidth, y: 0.26 * window.innerHeight }, // szymon
      ],

      // === POSTACIE ===
      characters: [
        { key: 'character1', src: character1, text: 'Widziałem coś podejrzanego!',  avatar: { key: 'avatar1', src: avatar1 } },
        { key: 'character2', src: character2, text: 'Nie wiem, czy mogę pomóc...', avatar: { key: 'avatar2', src: avatar2 } },
        { key: 'character3', src: character3, text: 'To było straszne!',           avatar: { key: 'avatar3', src: avatar3 } },
        { key: 'character4', src: character4, text: 'Ktoś tu był przed tobą...',    avatar: { key: 'avatar4', src: avatar4 } },
        { key: 'character5', src: character5, text: 'Musisz się pośpieszyć!',       avatar: { key: 'avatar5', src: avatar5 } },
      ],

      // === PRZEDMIOTY (opis + grafika; rozmiar przez scale) ===
      items: [
        {
          key: 'marynarka_krata',
          name: 'Marynarka w kratę',
          text: 'Marynarka odłożona na oparcie w VIP. W kieszeni paragon z 01:17 (whisky); na klapie kurz jak z obicia fotela VIP. Metka z monogramem „P.”.',
          src: require('../assets/items/marynarka.png'),
          avatar: { key: 'marynarka', src: require('../assets/items/marynarka.png') },
          scale: 0.05,
        },
        {
          key: 'zetony',
          name: 'Żetony kasynowe',
          text: 'Stos żetonów ofiary. Brakuje 5 wysokich nominałów. Log stołu: brak zakładów Piotra 01:16–01:23.',
          src: require('../assets/items/zetony.png'),
          avatar: { key: 'zetony', src: require('../assets/items/zetony.png') },
          scale: 0.05,
        },
        {
          key: 'karta_as',
          name: 'As pik',
          text: 'Zagięty róg (oznaczona karta) z rozdania, o które spierał się Rafał. Brak świeżych odcisków (rękawiczki?).',
          src: require('../assets/items/karta_as.png'),
          avatar: { key: 'karta_as', src: require('../assets/items/karta_as.png') },
          scale: 0.05,
        },
        {
          key: 'kieliszek_bar',
          name: 'Kieliszek z baru',
          text: 'Odciski Julii i ofiary. Barman potwierdza rozmowę 01:10–01:14. Brak środków odurzających.',
          src: require('../assets/items/kieliszek.png'),
          avatar: { key: 'kieliszek', src: require('../assets/items/kieliszek.png') },
          scale: 0.05,
        },
      ],

      // === MIEJSCA (jak itemy – interaktywne elementy) ===
      places: [
        {
          key: 'vip_room',
          name: 'Pokój VIP',
          text: 'Miejsce zbrodni. Kamera zasłonięta 01:19. Na klamce mikrowłókna pasujące do marynarki w kratę.',
          src: require('../assets/places/vip_room.png'),
          avatar: { key: 'vip_room', src: require('../assets/places/vip_room.png') },
          scale: 0.05,
        },
        {
          key: 'stol_poker',
          name: 'Stół do pokera',
          text: 'Alicja grała tutaj. Przerwa w rozdaniu 01:15–01:18 (krupier). Wróciła z nowymi żetonami o 01:18.',
          src: require('../assets/places/stol_poker.png'),
          avatar: { key: 'stol_poker', src: require('../assets/places/stol_poker.png') },
          scale: 0.05,
        },
        {
          key: 'ruletka',
          name: 'Ruletka',
          text: 'Piotr twierdzi, że był tu cały czas. Log stołu temu przeczy: 01:16–01:23 bez zakładów.',
          src: require('../assets/places/ruletka.png'),
          avatar: { key: 'ruletka', src: require('../assets/places/ruletka.png') },
          scale: 0.05,
        },
        {
          key: 'bar',
          name: 'Bar',
          text: 'Julia rozmawiała z ofiarą 01:10–01:14 (paragon na dwa drinki). Później była widziana w korytarzu.',
          src: require('../assets/places/bar.png'),
          avatar: { key: 'bar', src: require('../assets/places/bar.png') },
          scale: 0.05,
        },
      ],

      // === POZYCJE PRZEDMIOTÓW (kolejność jak w "items") ===
      itemPositions: [
        { x: 0.59 * window.innerWidth, y: 0.30 * window.innerHeight }, // marynarka_krata
        { x: 0.42 * window.innerWidth, y: 0.32 * window.innerHeight }, // zetony
        { x: 0.52 * window.innerWidth, y: 0.58 * window.innerHeight }, // karta_as
        { x: 0.36 * window.innerWidth, y: 0.66 * window.innerHeight }, // kieliszek_bar
      ],

      // === POZYCJE MIEJSC (kolejność jak w "places") ===
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

      // callback po kliknięciu „Zakończ poziom”
      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
        // tu możesz porównać z prawdą i np. wyświetlić modal / zakończyć scenę
        // Prawda (poziom 9): Piotr + Marynarka w kratę + Pokój VIP
      },
    });
  }
}

