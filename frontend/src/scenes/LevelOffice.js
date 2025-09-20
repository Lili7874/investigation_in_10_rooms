// src/scenes/LevelOffice.js
import BaseInvestigationScene from '../BaseInvestigationScene';
import scenaBiuro from '../assets/scenes/scena_pokoj_w_biurze.png';
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

Policja szybko ustaliła, że Paweł miał dostęp do poufnych danych i niedawno kontaktował się z konkurencyjną firmą. To mogło sprawić, że ktoś chciał go uciszyć. Problem w tym, że każdy z obecnych ma powód, by ukryć, co naprawdę robił wczoraj wieczorem:

• Marzena – obawiała się utraty pracy i desperacko szukała sposobu na spłatę długów.
• Kacper – twierdzi, że tylko czekał na matkę, ale pracownicy widzieli, jak kręcił się w pobliżu biurka Pawła.
• Tomasz – ma reputację złodziejaszka, a wczoraj przyznał się, że “miał interes” w tym biurze.
• Piotr – próbował namówić Annę na wspólną inwestycję. Może Paweł wiedział o czymś, co mogło mu zaszkodzić?

🎯 Cel gracza:
Jako detektyw musisz przesłuchać świadków, przejrzeć biuro i zebrać dowody. Nikt nie mówi całej prawdy, a Twoim zadaniem jest zrozumieć, co wydarzyło się w nocy, zanim sprawca usunie resztki dowodów.`,
      positions : [
			{ x: 0.40 * window.innerWidth, y: 0.55 * window.innerHeight },
			{ x: 0.45 * window.innerWidth, y: 0.40 * window.innerHeight },
			{ x: 0.55 * window.innerWidth, y: 0.55 * window.innerHeight },
			{ x: 0.50 * window.innerWidth, y: 0.70 * window.innerHeight },
			{ x: 0.50 * window.innerWidth, y: 0.40 * window.innerHeight },
			{ x: 0.62 * window.innerWidth, y: 0.55 * window.innerHeight },
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
