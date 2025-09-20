// src/scenes/LevelOffice.js
import BaseInvestigationScene from '../BaseInvestigationScene';
import scenaDomnawsi from '../assets/scenes/scena_dom_na_wsi.png';
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
      positions : [
			{ x: 0.40 * window.innerWidth, y: 0.55 * window.innerHeight },
			{ x: 0.30 * window.innerWidth, y: 0.65 * window.innerHeight },
			{ x: 0.60 * window.innerWidth, y: 0.60 * window.innerHeight },
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
