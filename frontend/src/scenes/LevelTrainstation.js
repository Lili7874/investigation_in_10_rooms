// src/scenes/LevelOffice.js
import BaseInvestigationScene from '../BaseInvestigationScene';
import scenaStacjakolejowa from '../assets/scenes/scena_dworzec_kolejowy.png';
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


export default class LevelTrainstation extends BaseInvestigationScene {
  constructor() {
    super('LevelTrainstation', {
      bgKey: 'bg_trainstation',
      bgSrc: scenaStacjakolejowa,
title: 'Dworzec kolejowy o północy',
intro: `🖼 Sceneria:
Opustoszały dworzec kolejowy tuż przed północą. Na peronie stoją porzucone walizki, zegar nad halą wskazuje 23:55. Echo kroków odbija się od ścian hali odjazdów, a w oddali słychać gwizd pociągu. W jednym z korytarzy znaleziono przewrócony wózek bagażowy.

📖 Historia poziomu:
Na dworcu doszło do tajemniczej śmierci podróżnego, który miał przy sobie teczkę z poufnymi dokumentami. Ciało znaleziono przy wejściu do tunelu. Świadkowie twierdzą, że kilka osób kręciło się w pobliżu peronu. Nikt jednak nie przyznaje się do bycia w miejscu zbrodni w chwili tragedii.

Podejrzani:
• Anna — właścicielka firmy jubilerskiej. Twierdzi, że czekała na kuriera, ale nie potrafi wskazać szczegółów. Ktoś widział, jak rozmawiała nerwowo przez telefon niedaleko tunelu.  
• Kacper — młody i niecierpliwy, mówi, że „przyszedł po kolegę”. Kilka osób twierdzi jednak, że widziało go przy bagażach, które nie należały do niego.  
• Tomasz — drobny złodziejaszek. Zawsze ma „interes” tam, gdzie nie powinno go być. Tym razem przyłapano go, jak zaglądał do porzuconej walizki, zanim odnaleziono ciało.  
• Weronika — młoda aktorka. Powiedziała, że była na dworcu w ramach „przygotowań do roli”, ale konduktor zapamiętał, że wypytywała o pociąg, którym podróżowała ofiara.

Świadek:
• Julia — nauczycielka języka polskiego. Wracała z wycieczki szkolnej i przypadkiem zatrzymała się na dworcu. Widziała, że ktoś wchodził na peron od strony zaplecza, ale nie rozpoznała dokładnie kto.

🎯 Cel gracza:
Ustal, kto z czterech podejrzanych miał realną możliwość przejęcia teczki i dlaczego znalazł się na dworcu o tak późnej porze. Przeanalizuj sprzeczne zeznania i wskaż osobę odpowiedzialną za śmierć podróżnego.`,
      positions : [
			{ x: 0.40 * window.innerWidth, y: 0.55 * window.innerHeight },
			{ x: 0.45 * window.innerWidth, y: 0.50 * window.innerHeight },
			{ x: 0.55 * window.innerWidth, y: 0.55 * window.innerHeight },
			{ x: 0.30 * window.innerWidth, y: 0.70 * window.innerHeight },
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
