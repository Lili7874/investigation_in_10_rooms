/* 
Rozstrzygnięcie (ukryta prawda – poziom 2)

Sprawca: Michał
Przedmiot sprawcy: Karafka wina (odciski Michała; pojawiła się na sali tuż przed północą)
Miejsce morderstwa: Stolik ofiary

Logika:
• Wydruk logów obala alibi Michała („odbierałem telefon”) – brak połączeń w krytycznym oknie.
• Karafka z jego odciskami trafia na stół tuż przed północą; z baru znika porcja bitters w tym samym czasie.
• Kieliszek ofiary ma przetartą krawędź – ślad podmiany/dolania.
• Rafał krzątał się między stolikami (fałszywy trop), ale nie miał kontaktu z barem/karafką; Alicja nie opuszczała sali na dłużej; Weronika nie wchodziła na zaplecze.
*/

import BaseInvestigationScene from '../BaseInvestigationScene';
import scenaRestauracja from '../assets/scenes/scena_restauracja.png';

// postacie – mapowanie: Alicja, Michał, Weronika, Rafał, Jakub (świadek)
import character1 from '../assets/avatars/alicja.png';
import character2 from '../assets/avatars/michal.png';
import character3 from '../assets/avatars/weronika.png';
import character4 from '../assets/avatars/rafal.png';
import character5 from '../assets/avatars/jakub.png';

// avatary (ikonki)
import avatar1 from '../assets/avatar_icons/alicja_icon.png';
import avatar2 from '../assets/avatar_icons/michal_icon.png';
import avatar3 from '../assets/avatar_icons/weronika_icon.png';
import avatar4 from '../assets/avatar_icons/rafal_icon.png';
import avatar5 from '../assets/avatar_icons/jakub_icon.png';

export default class LevelRestaurant extends BaseInvestigationScene {
  constructor() {
    super('LevelRestaurant', {
      bgKey: 'bg_restaurant',
      bgSrc: scenaRestauracja,
      title: 'Restauracja o północy',
      intro: `🖼 Sceneria:
Elegancka sala restauracyjna, w której na stołach stoją niedokończone potrawy i niedopite kieliszki. Krzesła są porozstawiane w nieładzie, a przez drzwi do kuchni dochodzi stłumione kapanie wody. Zegar wskazuje północ.

📖 Historia poziomu:
Podczas uroczystej kolacji w restauracji doszło do tragedii. Jeden z gości został znaleziony martwy, pochylony nad talerzem. Lekarz orzekł, że przyczyną była trucizna, najprawdopodobniej podana w napoju. Każdy z obecnych miał powód, by coś ukrywać.

Podejrzani:
• Alicja – pewna siebie i dominująca. Tego wieczoru prowadziła trudną rozmowę przy stole i widziano, jak odsuwała kieliszek, gdy wstawała od stolika.  
• Michał – jej partner, nieśmiały i wycofany. Większość kolacji spędził w milczeniu, ale na krótko zniknął z sali, tłumacząc się odbieraniem telefonu.  
• Weronika – młoda aktorka, która przyszła sama, choć twierdziła, że miała spotkać się z reżyserem. Uważnie obserwowała salę, lecz nie chce zdradzić wszystkiego, co widziała.  
• Rafał – ambitny student prawa. Spóźnił się i usiadł tam, gdzie było wolne. Twierdzi, że nie dotykał cudzych kieliszków, ale inni goście wskazują, że krzątał się między stolikami.  

Świadek:
• Jakub – dyrektor szkoły, stały bywalec restauracji. Twierdzi, że starał się jedynie uspokajać sytuację, a jego zeznania mogą pomóc w zrekonstruowaniu wydarzeń, choć sam nie jest podejrzany.

🎯 Cel gracza:
Twoim zadaniem jest przesłuchanie świadków i ustalenie, kto wykorzystał zamieszanie, by podać truciznę. Tylko cztery osoby są podejrzane – musisz odkryć, która z nich kłamie i jakie były prawdziwe wydarzenia tego wieczoru.`,

      // === POZYCJE POSTACI (łuk – 4 podejrzanych + świadek) ===
      positions: [
        { x: 0.43 * window.innerWidth, y: 0.56 * window.innerHeight }, // Alicja
        { x: 0.68 * window.innerWidth, y: 0.58 * window.innerHeight }, // Michał
        { x: 0.56 * window.innerWidth, y: 0.44 * window.innerHeight }, // Weronika
        { x: 0.50 * window.innerWidth, y: 0.72 * window.innerHeight }, // Rafał
        { x: 0.48 * window.innerWidth, y: 0.32 * window.innerHeight }, // Jakub (świadek)
      ],

      // === POSTACIE ===
      characters: [
        { key: 'character1', src: character1, text: 'Nie przestawiałam niczyjego kieliszka.', avatar: { key: 'avatar1', src: avatar1 } }, // Alicja
        { key: 'character2', src: character2, text: 'Na chwilę wyszedłem odebrać telefon.',  avatar: { key: 'avatar2', src: avatar2 } }, // Michał
        { key: 'character3', src: character3, text: 'Widziałam dużo, ale nie wszystko powiem…', avatar: { key: 'avatar3', src: avatar3 } }, // Weronika
        { key: 'character4', src: character4, text: 'Nie dotykałem cudzych kieliszków.',     avatar: { key: 'avatar4', src: avatar4 } }, // Rafał
        { key: 'character5', src: character5, text: 'Spokojnie, spróbujmy odtworzyć kolejność.', avatar: { key: 'avatar5', src: avatar5 } }, // Jakub
      ],

      // === PRZEDMIOTY (4) ===
      items: [
        {
          key: 'kieliszek_ofiary',
          name: 'Kieliszek ofiary',
          text: 'Resztka napoju o gorzkim posmaku; przetarta krawędź – ślad manipulacji.',
          src: require('../assets/items/kieliszek.png'),
          avatar: { key: 'kieliszek_ofiary', src: require('../assets/items/kieliszek.png') },
          scale: 0.05,
        },
        {
          key: 'karafka_wina',
          name: 'Karafka wina',
          text: 'Odciski Michała; karafka pojawiła się na sali tuż przed północą.',
          src: require('../assets/items/karafka.png'),
          avatar: { key: 'karafka_wina', src: require('../assets/items/karafka.png') },
          scale: 0.05,
        },
        {
          key: 'butelka_bitters',
          name: 'Butelka bitters (bar)',
          text: 'Nienaturalny ubytek; barman mówi, że „ktoś wziął na chwilę”.',
          src: require('../assets/items/bitters.png'),
          avatar: { key: 'butelka_bitters', src: require('../assets/items/bitters.png') },
          scale: 0.05,
        },
        {
          key: 'logi_michal',
          name: 'Wydruk logów połączeń Michała',
          text: 'W czasie rzekomego „telefonu” brak połączeń przychodzących/wychodzących.',
          src: require('../assets/items/telefon_wydruk.png'),
          avatar: { key: 'logi_michal', src: require('../assets/items/telefon_wydruk.png') },
          scale: 0.05,
        },
      ],

      // === MIEJSCA (4) ===
      places: [
        {
          key: 'stolik_ofiary',
          name: 'Stolik ofiary',
          text: 'Miejsce zgonu; kieliszek przestawiany kilkukrotnie.',
          src: require('../assets/places/stolik.png'),
          avatar: { key: 'stolik_ofiary', src: require('../assets/places/stolik.png') },
          scale: 0.05,
        },
        {
          key: 'bar',
          name: 'Bar',
          text: 'Tu stoją bitters i zapasowe karafki; barman bywa odwrócony plecami.',
          src: require('../assets/places/bar.png'),
          avatar: { key: 'bar', src: require('../assets/places/bar.png') },
          scale: 0.05,
        },
        {
          key: 'korytarz_kuchnia',
          name: 'Korytarz do kuchni',
          text: 'Martwy punkt kamer; tędy Michał znika na kilka minut.',
          src: require('../assets/places/korytarz_kuchnia.png'),
          avatar: { key: 'korytarz_kuchnia', src: require('../assets/places/korytarz_kuchnia.png') },
          scale: 0.05,
        },
        {
          key: 'sala_glowna',
          name: 'Sala główna',
          text: 'Porozstawiane krzesła; łatwo wmieszać się między stoliki (trop na Rafała).',
          src: require('../assets/places/sala_restauracyjna.png'),
          avatar: { key: 'sala_glowna', src: require('../assets/places/sala_restauracyjna.png') },
          scale: 0.05,
        },
      ],

      // === POZYCJE PRZEDMIOTÓW (kolejność jak w "items") ===
      itemPositions: [
        { x: 0.59 * window.innerWidth, y: 0.35 * window.innerHeight }, // kieliszek_ofiary
        { x: 0.48 * window.innerWidth, y: 0.44 * window.innerHeight }, // karafka_wina
        { x: 0.36 * window.innerWidth, y: 0.72 * window.innerHeight }, // butelka_bitters
        { x: 0.62 * window.innerWidth, y: 0.70 * window.innerHeight }, // logi_michal
      ],

      // === POZYCJE MIEJSC (kolejność jak w "places") ===
      placePositions: [
        { x: 0.59 * window.innerWidth, y: 0.58 * window.innerHeight }, // stolik_ofiary
        { x: 0.43 * window.innerWidth, y: 0.45 * window.innerHeight }, // bar
        { x: 0.42 * window.innerWidth, y: 0.34 * window.innerHeight }, // korytarz_kuchnia
        { x: 0.36 * window.innerWidth, y: 0.74 * window.innerHeight }, // sala_glowna
      ],

      // listy dla tablicy dedukcji i podpowiedzi w inputach
      deduction: {
        suspects: ['Alicja', 'Michał', 'Weronika', 'Rafał'],
        places:   ['Stolik', 'Bar', 'Korytarz', 'Sala'],
        items:    ['Kieliszek', 'Karafka', 'Bitters', 'Logi'],
      },

      // callback po kliknięciu „Zakończ poziom”
      onDeductionSubmit: ({ suspect, item, place }) => {
        console.log('Gracz wskazał:', suspect, item, place);
        // Prawda (poziom 2): Michał + Karafka wina + Stolik ofiary
      },
    });
  }
}
