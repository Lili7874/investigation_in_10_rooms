// src/scenes/LevelOffice.js
import BaseInvestigationScene from '../BaseInvestigationScene';
import scenaRestauracja from '../assets/scenes/scena_restauracja.png';
import { buildCaseAndDialogues } from '../narrative/engine';

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
	positions: [
        { x: 0.40 * window.innerWidth, y: 0.58 * window.innerHeight },
        { x: 0.65 * window.innerWidth, y: 0.58 * window.innerHeight },
        { x: 0.56 * window.innerWidth, y: 0.50 * window.innerHeight },
        { x: 0.50 * window.innerWidth, y: 0.72 * window.innerHeight },
        { x: 0.48 * window.innerWidth, y: 0.35 * window.innerHeight },
      ],
	  characters: [
        { key: 'character1', src: character1, text: 'Widziałem coś podejrzanego!', avatar: { key: 'avatar1', src: avatar1 } },
        { key: 'character2', src: character2, text: 'Nie wiem, czy mogę pomóc...', avatar: { key: 'avatar2', src: avatar2 } },
        { key: 'character3', src: character3, text: 'To było straszne!',          avatar: { key: 'avatar3', src: avatar3 } },
        { key: 'character4', src: character4, text: 'Ktoś tu był przed tobą...',   avatar: { key: 'avatar4', src: avatar4 } },
        { key: 'character5', src: character5, text: 'Musisz się pośpieszyć!',      avatar: { key: 'avatar5', src: avatar5 } },
      ]
    });
  }
}