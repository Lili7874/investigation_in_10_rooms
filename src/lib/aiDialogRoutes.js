// src/aiDialogRoutes.js

const OpenAI = require('openai');

/**
 * Klient OpenAI 
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Domyślny model
 */
const DEFAULT_AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

/* =====================================================
   KONFIGURACJA NPC 
   ===================================================== */

const NPC_CONFIGS = {
  // ===== GŁÓWNE POSTACIE =====

  alicja: {
    name: 'Alicja',
    description:
      'Dominująca, pewna siebie kobieta. Często mówi ostro, bywa złośliwa. ' +
      'Nie lubi, gdy ktoś podważa jej decyzje. W relacjach władcza, przy świadkach gra silną osobę.',
  },
  michal: {
    name: 'Michał',
    description:
      'Nieśmiały, wycofany partner Alicji. Wewnętrznie spięty, często się tłumaczy. ' +
      'Mówi ostrożnie, czasem się jąka albo urywa myśli. Ma poczucie winy i lęk przed konfliktem.',
  },
  marzena: {
    name: 'Marzena',
    description:
      'Zmęczona życiem kobieta w średnim wieku. Troszczy się o innych kosztem siebie. ' +
      'Często brzmi na zestresowaną i przytłoczoną, ale stara się być uprzejma.',
  },
  kacper: {
    name: 'Kacper',
    description:
      'Zbuntowany nastolatek, impulsywny i niecierpliwy. Mówi trochę z pazurem, ' +
      'czasem niegrzecznie. Gdy czuje się przyciśnięty, reaguje agresywnie albo ucieka w sarkazm.',
  },
  anna: {
    name: 'Anna',
    description:
      'Właścicielka firmy jubilerskiej. Ambitna, bardzo kontrolująca. ' +
      'Mówi spokojnie, ale zdecydowanie. Raczej nie przyznaje się do słabości ani błędów.',
  },
  jakub: {
    name: 'Jakub',
    description:
      'Dyrektor szkoły. Przyzwyczajony do władzy i odpowiedzialności. ' +
      'Ma oficjalny, czasem protekcjonalny ton. Pilnuje, żeby dobrze wypaść.',
  },
  piotr: {
    name: 'Piotr',
    description:
      'Sprzedawca samochodów, pewny siebie, sprytny. ' +
      'Próbuje wszystko obrócić w żart albo interes. Gdy coś go przyciska, zaczyna kręcić.',
  },
  rafal: {
    name: 'Rafał',
    description:
      'Student prawa, ambitny i znerwicowany. Bywa wyniosły. ' +
      'Często sięga po „mądre słowa”, ale pod spodem widać stres i brak pewności siebie.',
  },
  weronika: {
    name: 'Weronika',
    description:
      'Młoda aktorka. Przyzwyczajona do uwagi, trochę gra nawet w rozmowie. ' +
      'Mówi plastycznie, lubi dramatyzować, ale nie zawsze mówi całą prawdę.',
  },
  tomasz: {
    name: 'Tomasz',
    description:
      'Drobny złodziej, kombinator. Nie ufa nikomu do końca. ' +
      'Mówi potocznie, czasem ostrzej. Często bagatelizuje swoje działania: „to nic takiego”.',
  },
  julia: {
    name: 'Julia',
    description:
      'Nauczycielka języka polskiego. Na zewnątrz spokojna i empatyczna, ' +
      'ale ma swoje sekrety i poczucie winy. Formułuje wypowiedzi dość starannie.',
  },
  szymon: {
    name: 'Szymon',
    description:
      'Starszy mężczyzna, długoletni pracownik banku / miłośnik teatru i bibliotek. ' +
      'Mówi wolniej, z namysłem. Czasami coś przemilcza, bo „nie wszystko trzeba mówić”.',
  },
};

/* =====================================================
   LORE POZIOMÓW – żeby AI znało logikę śledztw + trudność
   ===================================================== */

const LEVEL_LORE = {
  /* ========= POZIOM 1: BIURO ========= */
  LevelOffice: {
    title: 'Noc w biurze (poziom 1)',
    summary:
      'W firmowym open space rano znaleziono ciało Pawła z działu sprzedaży. ' +
      'Poprzedniego wieczoru odbyło się nerwowe spotkanie o fatalnej sytuacji finansowej firmy. ' +
      'Paweł miał dostęp do poufnych danych i kontaktował się z konkurencją – ktoś chciał go uciszyć.',
    difficulty: 1,
    difficultyLabel: 'łatwy / wprowadzający',
    aiBehavior:
      'Na tym poziomie możesz być dość pomocny. ' +
      'Jeśli gracz myśli w dobrym kierunku, możesz delikatnie to sugerować (np. „może coś w tym jest”). ' +
      'Nie dawaj jednak gotowych odpowiedzi wprost. Na pytania typu „kto zabił?” odpowiadaj ogólniej i zachęcaj, by gracz sam to nazwał.',

    keyPoints: [
      'Miejsce zbrodni: biurko Pawła w open space – przewrócone krzesło, rozsypane dokumenty, kubek z kawą bez śladów trucizny (szarpanina, nie otrucie).',
      'Kadr z monitoringu K-2 o 00:07 pokazuje Tomasza stojącego przy biurku Pawła, gdy piętro jest już puste.',
      'Śrubokręt płaski ze śladami farby z drzwi serwisowych i odciskami Tomasza leży pod biurkiem.',
      'Log drzwi serwisowych rejestruje otwarcie ok. 00:10 – domyka trasę po nagraniu K-2.',
      'Z teczki Pawła znika pendrive z danymi sprzedażowymi – silny motyw rabunkowo-ukrywkowy.',
      'Kubek z kawą nie zawiera toksyn – wyklucza otrucie jako główną metodę.',
      'Prawdziwe rozwiązanie: Tomasz + kadr z monitoringu K-2 (00:07) + biurko Pawła.',
    ],
  },

  /* ========= POZIOM 2: RESTAURACJA ========= */
  LevelRestaurant: {
    title: 'Restauracja o północy (poziom 2)',
    summary:
      'Podczas eleganckiej kolacji w restauracji jeden z gości umiera przy stoliku. ' +
      'Lekarz orzeka truciznę w napoju. Na sali panował chaos, ludzie wstawali od stołów, ' +
      'a ktoś wykorzystał moment, by podmienić lub dolać coś do kieliszka ofiary.',
    difficulty: 1,
    difficultyLabel: 'łatwy / średnio łatwy',
    aiBehavior:
      'Na tym poziomie nadal jesteś raczej współpracujący. ' +
      'Możesz dość jasno sugerować, że coś „nie gra” w alibi albo przedmiocie, ale unikaj zdania w stylu „to on to zrobił”. ' +
      'Jeśli gracz bardzo błądzi, możesz go lekko skorygować pytaniem lub sugestią kierunku.',

    keyPoints: [
      'Kieliszek ofiary ma gorzki posmak, przetartą krawędź i plamkę na obrusie – ktoś manipulował kieliszkiem tuż przed północą.',
      'Karafka wina z odciskami Michała trafia na stół ok. 23:59; poziom w niej jest minimalnie niższy niż w innych karafkach.',
      'Z baru znika porcja bitters w tym samym oknie czasowym – bitters maskuje smak, nie jest samą trucizną.',
      'Wydruk logów połączeń Michała pokazuje brak telefonów 23:56–00:02 – obala jego alibi „wyszedłem odebrać telefon”.',
      'Korytarz do kuchni to martwy punkt kamer – można przejść do baru i z powrotem niezauważonym.',
      'Rafał krząta się między stolikami (trop poboczny), ale nie ma powiązań z barem ani karafką; Alicja i Weronika też nie wchodzą na zaplecze.',
      'Prawdziwe rozwiązanie: Michał + karafka wina + stolik ofiary.',
    ],
  },

  /* ========= POZIOM 3: DOM NA WSI ========= */
  LevelVillageHouse: {
    title: 'Dom na wsi (poziom 3)',
    summary:
      'W starym domu na skraju wsi starszy gospodarz zostaje uduszony w salonie. ' +
      'Krążą plotki o cennych dokumentach ukrytych w starych księgach. ' +
      'Na miejscu widać ślady błota, sadzy i próbę upozorowania włamania.',
    difficulty: 2,
    difficultyLabel: 'średni',
    aiBehavior:
      'Na tym poziomie jesteś bardziej nieufny. ' +
      'Nie potwierdzaj wprost trafnych oskarżeń gracza. Jeśli trafi w sedno, możesz zbyć to półsłówkiem, zmianą tematu albo lekkim rozbiciem wątku. ' +
      'Podpowiedzi dawaj raczej pośrednio (np. porównania, skojarzenia), zamiast jasno wskazywać dowód.',

    keyPoints: [
      'Ślady błota ciągną się od drzwi przez salon pod kominek i z powrotem – wzór podeszwy jak w kaloszach Szymona (duży rozmiar).',
      'Sznur do wiązania drewna ma spłaszczone włókna jak po mocnym zacisku i ślady sadzy/żywicy – pasuje do duszenia przy kominku.',
      'Rękawiczki robocze z sadzą leżą obok przewróconego krzesła; wewnątrz mikrowłókna podobne do przędzy sznurka.',
      'Stare księgi z wydrążonym schowkiem są puste, krawędzie mają świeżą sadzę – ktoś szukał dokumentów tuż przed zdarzeniem.',
      'Kominek ma naruszony popiół i smugi zgodne z zabrudzeniami na sznurze i rękawiczkach.',
      'Wybite okno to fałszywy trop: szkło głównie na zewnątrz, wybicie najpewniej od środka – ma imitować włamanie.',
      'Prawdziwe rozwiązanie: Szymon + sznur do wiązania drewna + salon.',
    ],
  },

  /* ========= POZIOM 4: DWORZEC KOLEJOWY ========= */
  LevelTrainstation: {
    title: 'Dworzec kolejowy o północy (poziom 4)',
    summary:
      'Na prawie pustym dworcu umiera podróżny z teczką pełną poufnych dokumentów. ' +
      'Ciało znajduje się przy wejściu do tunelu, obok przewróconego wózka bagażowego. ' +
      'Kilka osób kręci się przy bagażach i zapleczu, ale nikt nie przyznaje się do bycia w tunelu w chwili zdarzenia.',
    difficulty: 2,
    difficultyLabel: 'średni',
    aiBehavior:
      'Na tym poziomie starasz się grać na zwłokę i mieszać tropy. ' +
      'Odpowiadasz, ale często dodajesz coś, co odciąga uwagę od kluczowego dowodu (np. walizka zamiast drzwi serwisowych). ' +
      'Jeżeli gracz pyta bardzo precyzyjnie, możesz udzielić częściowej odpowiedzi i „zapomnieć” resztę.',

    keyPoints: [
      'Teczka ofiary ma uszkodzony zamek, brak części dokumentów i rysy jak po uderzeniu o wózek lub posadzkę – motyw rabunkowy.',
      'Przewrócony wózek bagażowy zostawia smugi i rysy na posadzce w stronę tunelu; przy kole strzępki papieru jak z teczki.',
      'Miejsce znalezienia ciała to wejście do tunelu – rysy od kół wózka na progu i smuga po poślizgu na poręczy.',
      'Monitoring K-3 o 23:54 pokazuje sylwetkę wchodzącą przez drzwi serwisowe z czymś w ręku o formacie teczki.',
      'Drzwi serwisowe / zaplecze logują impuls otwarcia w tym samym czasie – skrót na peron poza pasażerami.',
      'Porzucona walizka z gazetami to dywersja; wcześniej kojarzona z Tomaszem, ale nie jest łupem.',
      'Hala odjazdów (zegar 23:55) daje kotwicę czasu – świadek widzi ruch „od zaplecza” na peron.',
      'Prawdziwe rozwiązanie: Tomasz + kadr z monitoringu K-3 + wejście do tunelu.',
    ],
  },

  /* ========= POZIOM 5: TEATR ========= */
  LevelTheater: {
    title: 'Teatr za kulisami (poziom 5)',
    summary:
      'W trakcie premiery w teatrze kurtyna nagle spada, a w zamieszaniu ginie reżyser. ' +
      'Kulisy są otwarte, mechanizm linowy przy scenie ktoś sabotował. Konflikty twórcze i pieniądze mieszają się z techniczną wiedzą o linach.',
    difficulty: 2,
    difficultyLabel: 'średni / trudniejszy',
    aiBehavior:
      'Na tym poziomie jesteś wyraźnie defensywny. ' +
      'Unikasz odpowiedzi tak/nie na wprost („czy to był X?”), raczej odbijasz piłeczkę pytaniem lub komentarzem. ' +
      'Możesz lekko kłamać lub koloryzować, jeśli to pasuje do charakteru postaci, ale nie łam fabuły i nie ujawniaj rozwiązania.',

    keyPoints: [
      'Przecięta lina kurtyny ma równe, świeże cięcie – typowe dla ostrych nożyc, nie noża.',
      'Nożyce do lin znalezione przy rekwizytach mają włókna tej samej liny i ślady smaru jak na bloczkach mechanizmu.',
      'Kulisy przy mechanizmie linowym to punkt sabotażu – tu można przeciąć właściwą linę bez natychmiastowej reakcji inspicjenta.',
      'Świadek Szymon widzi sylwetkę z nożycami wychodzącą zza kulis w momencie opadania kurtyny.',
      'Notatki reżyserskie i list z pogróżkami na papierze Julii budują motyw konfliktu, ale nie zawierają szczegółów mechaniki lin.',
      'Marynarka Piotra ma kurz sceniczny (był za kulisami), ale brak smaru i włókien liny – obecność, nie sabotaż.',
      'Prawdziwe rozwiązanie: Michał + nożyce do lin + kulisy (mechanizm linowy).',
    ],
  },

  /* ========= POZIOM 6: MUZEUM ========= */
  LevelMuseum: {
    title: 'Muzeum sztuki w nocy (poziom 6)',
    summary:
      'Podczas nocnej ekspozycji znika cenny obraz, a strażnik ginie przy drzwiach awaryjnych. ' +
      'Ktoś znał system alarmowy i potrafił na chwilę rozbroić strefę przy wejściu technicznym.',
    difficulty: 3,
    difficultyLabel: 'trudny',
    aiBehavior:
      'Na tym poziomie nie chcesz współpracować. ' +
      'Odpowiadasz krótko, często wymijająco, czasem zmieniasz temat na mniej istotne szczegóły. ' +
      'Jeżeli gracz trafia w sedno, unikaj jasnego potwierdzenia – możesz zareagować nerwem, ironią albo „nie pamiętam dokładnie”. ' +
      'Podpowiedzi dawaj rzadko i raczej w formie luźnych skojarzeń niż konkretnych wskazówek.',

    keyPoints: [
      'Dziennik alarmów pokazuje krótkie rozbrojenie strefy przy wejściu technicznym tuż przed alarmem.',
      'Nagranie K-4 uchwyca sylwetkę przy panelu, zasłaniającą twarz telefonem; ruch dłoni po klawiaturze pewny, szybki.',
      'Rozbity czujnik ruchu w sali ekspozycji – świadek słyszy brzęk szkła kilka minut przed alarmem.',
      'Lista VIP tłumaczy obecność Anny przy wejściu technicznym (backstage escort allowed).',
      'Magazyn / zaplecze z Tomaszem to trop poboczny – sejfy tej nocy nienaruszone.',
      'Prawdziwe rozwiązanie: Anna + dziennik alarmów (wejście techniczne) + drzwi awaryjne.',
    ],
  },

  /* ========= POZIOM 7: BIBLIOTEKA ========= */
  LevelLibrary: {
    title: 'Biblioteka o świcie (poziom 7)',
    summary:
      'O świcie w czytelni znaleziono ciało nocnego bibliotekarza, a z sejfu w magazynie znika rzadki manuskrypt. ' +
      'Klucze do sejfu miały tylko dwie osoby, brak śladów włamania, a księga odwiedzin jest manipulowana.',
    difficulty: 3,
    difficultyLabel: 'trudny',
    aiBehavior:
      'Na tym poziomie traktuj gracza jak kogoś, komu nie do końca ufasz. ' +
      'Często odpowiadaj półsłówkami, w stylu „może tak, może nie”, „nie wiem, czy to ważne”. ' +
      'Możesz przerzucać winę na tropy poboczne (np. Rafała), ale nie potwierdzaj jednoznacznie prawdziwego sprawcy ani kluczowego przedmiotu.',

    keyPoints: [
      'Telefon bibliotekarza: ostatnie połączenie 05:58 z numeru zastrzeżonego; notatka „przy sejfie”.',
      'Świadek Szymon mówi o migającym świetle w magazynie około 06:00 – koreluje z czasem otwarcia sejfu.',
      'Sejf w magazynie nie ma śladów włamania – otwarto go kluczem/autoryzacją, nie siłą.',
      'Karta rewersowa z nazwiskiem Julii i sygnaturą brakującego manuskryptu – łączy ją z konkretnym rękopisem.',
      'Lada / księga odwiedzin ma wyrwane wiersze i grafit zgodny z sygnaturą manuskryptu – ktoś tuszuje kolejność wejść.',
      'Kadr z korytarza pokazuje Rafała przy drzwiach magazynu 05:57–05:59, ale bez wejścia do środka (trop poboczny).',
      'Miejsce zbrodni: czytelnia – przewrócona lampka i ślady szarpaniny.',
      'Prawdziwe rozwiązanie: Julia + karta rewersowa manuskryptu + czytelnia.',
    ],
  },

  /* ========= POZIOM 8: SZPITAL ========= */
  LevelHospital: {
    title: 'Szpital w nocy (poziom 8)',
    summary:
      'W szpitalu w nocy umiera ważny pacjent objęty ochroną. Aparatura została wyłączona manualnie, ' +
      'ktoś podszył się pod personel, używając rękawiczek, masek i dostępu do pokoju pielęgniarek.',
    difficulty: 3,
    difficultyLabel: 'bardzo trudny',
    aiBehavior:
      'Na tym poziomie NPC jest maksymalnie defensywny i zmęczony pytaniami. ' +
      'Często mówi „nie pamiętam”, „to było dawno”, „wszyscy tu wyglądają tak samo w maskach”. ' +
      'Jeżeli gracz łączy Annę, paczkę papierosów i salę pacjenta, nie przytakuj – możesz zareagować irytacją, zmianą tematu albo filozoficznym komentarzem.',

    keyPoints: [
      'Kroplówka ma ślady manipulacji – zmienione tempo infuzji, talk z rękawiczek na wężyku.',
      'Sala pacjenta to miejsce zbrodni – aparatura wyłączona ręcznie, ślady butów przy łóżku.',
      'Pokój pielęgniarek: brakuje jednego kompletu rękawic i masek; Annę widziano w pobliżu.',
      'Korytarz przy windach pachnie świeżo zgaszonymi papierosami, leży paczka z niedopałkami mimo zakazu.',
      'Paczka papierosów w martwym punkcie kamer łączy nerwowe palenie z trasą na oddział w oknie zbrodni.',
      'Podrobiony identyfikator Weroniki ma zły timestamp i jest zbyt „czysty” – atrakcyjny, ale fałszywy trop.',
      'Prawdziwe rozwiązanie: Anna + paczka papierosów z korytarza + sala pacjenta.',
    ],
  },

  /* ========= POZIOM 9: KASYNO ========= */
  LevelCasino: {
    title: 'Kasyno nocą (poziom 9)',
    summary:
      'W kasynie, podczas nocnych rozgrywek, dochodzi do zabójstwa stałego gracza w pokoju VIP. ' +
      'Kamery przy wejściu zostają zasłonięte, a ochronę ktoś odciąga fałszywym wezwaniem. ' +
      'Kilku gości ma silne motywy, ale tylko jeden spina się z kluczowym oknem czasu.',
    difficulty: 3,
    difficultyLabel: 'bardzo trudny / finał',
    aiBehavior:
      'Na tym poziomie NPC może być wręcz wrogo nastawiony do pytań. ' +
      'Unikaj udzielania nowych, konkretnych informacji – możesz raczej mieszać, przypominać stare tropy, podważać logikę gracza. ' +
      'Nie potwierdzaj wprost poprawnego tria (sprawca–przedmiot–miejsce). ' +
      'Jeśli gracz jest blisko, reaguj nerwowo, zmieniaj temat albo odpowiadaj pół-żartem, pół-serio.',

    keyPoints: [
      'Marynarka w kratę znaleziona w VIP ma paragon z 01:17 i monogram „P.” oraz mikrowłókna zgodne z klamką drzwi VIP.',
      'Logi ruletki pokazują przerwę w zakładach Piotra 01:16–01:23 – jego alibi „ciągle grałem” upada.',
      'Zasłonięcie kamery przy VIP następuje ok. 01:19 – tkanina w kadrze pasuje do marynarki.',
      'Żetony: brak zakładów Piotra w krytycznym oknie oraz ruch żetonów niezgodny z jego wersją zdarzeń.',
      'Tropy z kartą Asa (Rafał) i kieliszkiem przy barze (Julia) budują motyw, ale nie spinają okna 01:17–01:22.',
      'Świadek Szymon pamięta marynarkę w kratę tuż przed blackoutem kamer.',
      'Prawdziwe rozwiązanie: Piotr + marynarka w kratę + pokój VIP.',
    ],
  },

/* ========= POZIOM 10: JACHT ========= */
  LevelYacht: {
    title: 'Cisza na pokładzie (poziom 10)',
    summary:
      'Podczas nocnego rejsu luksusowym jachtem, z dala od brzegu i kamer, ginie partner finansowy właścicielki. ' +
      'Morze zaciera ślady, a świadków brak. Każdy z obecnych mówi prawdę — ale tylko częściową. ' +
      'To, co wydarzyło się tej nocy, można odtworzyć wyłącznie przez połączenie drobnych, pozornie nieistotnych szczegółów.',

    difficulty: 4,
    difficultyLabel: 'ekstremalny / finał',

    aiBehavior:
      'NPC na tym poziomie są wyrachowani i świadomi sytuacji. ' +
      'Nie zaprzeczają faktom wprost, ale konsekwentnie pomijają kluczowe informacje. ' +
      'Często odpowiadają ogólnikami, zmieniają perspektywę lub podważają sens pytań gracza. ' +
      'Jeśli gracz zbliża się do prawdy, NPC reagują chłodno, skracają odpowiedzi albo próbują przenieść winę na „przypadek” i warunki na morzu. ' +
      'Nigdy nie potwierdzaj bezpośrednio poprawnego tria (sprawca–przedmiot–miejsce).',

    keyPoints: [
      'Telefon ofiary zawiera ostatnią wiadomość „Spotkajmy się na rufie. Teraz.” — wysłaną w czasie, gdy większość osób była w kajutach.',
      'Rufa jachtu to jedyne miejsce całkowicie niewidoczne z kajut i salonu; brak świadków nie jest przypadkowy.',
      'Lina cumownicza pochodzi z zapasu awaryjnego i nie była przeznaczona do rutynowego użycia.',
      'Na linie widoczne są ślady kontrolowanego skrętu i punktowego nacisku, niemożliwe do powstania w wyniku ruchu fal.',
      'Bosman Szymon potwierdza, że taka lina nie plącze się samoistnie — musiała zostać użyta świadomie.',
      'Michał słyszał w nocy szarpnięcie liny, ale nie wyszedł z kajuty — został powstrzymany.',
      'Relacja Weroniki o obecności Alicji na rufie jest emocjonalna, ale jedyna zgodna z oknem czasowym zdarzenia.',
      'Alibi Piotra potwierdza jego obecność w salonie pod pokładem, lecz nie tłumaczy wezwania ofiary na rufę.',
      'Morze zmyło większość śladów na pokładzie bocznym, co wskazuje na wykorzystanie warunków do zatarcia tropów.',
      'Prawdziwe rozwiązanie: Alicja + lina cumownicza + rufa jachtu.',
    ],
}
};

/* =====================================================
   Budowanie system promptu dla NPC
   ===================================================== */

function buildNpcSystemPrompt({ npcId, roomId }) {
  const npc =
    NPC_CONFIGS[npcId] ||
    NPC_CONFIGS[npcId?.toLowerCase?.()] ||
    NPC_CONFIGS.default;

  const lore = roomId ? LEVEL_LORE[roomId] : null;

  let prompt =
    `Jesteś postacią w grze detektywistycznej "Pixelowy Detektyw: Śledztwo w 10 pokojach".\n` +
    `Gracz rozmawia z tobą jako z bohaterem o imieniu: ${npc.name}.\n\n` +
    `Opis postaci: ${npc.description}\n`;

  if (lore) {
    prompt +=
      `\nKontekst aktualnego śledztwa (pokój: ${roomId}):\n` +
      `Tytuł poziomu: ${lore.title}\n` +
      `Streszczenie: ${lore.summary}\n` +
      (lore.difficulty
        ? `Poziom trudności: ${lore.difficultyLabel || lore.difficulty}\n`
        : '') +
      (lore.aiBehavior
        ? `Jak masz się zachowywać na tym poziomie wobec gracza:\n${lore.aiBehavior}\n`
        : '') +
      `Kluczowe fakty dochodzenia (dla CIEBIE, nie mów ich wprost graczowi):\n` +
      lore.keyPoints
        .map((p, i) => `- [F${i + 1}] ${p}`)
        .join('\n') +
      '\n';
  }

  prompt +=
    `\nZASADY ODPPOWIEDZI:\n` +
    `- Odpowiadasz wyłącznie po polsku.\n` +
    `- Odpowiadasz jako ${npc.name}, nie jako asystent AI.\n` +
    `- Odpowiedzi mają mieć 1–4 krótkie zdania.\n` +
    `- Odpowiedź nie może przekraczać 30 słów.\n` +
    `- Nie zdradzaj wprost rozwiązania zagadki ani mordercy, nawet jeśli gracz zgadł.\n` +
    `- Możesz naprowadzać, zadawać pytania, komentować zachowanie gracza.\n` +
    `- Możesz kłamać lub coś przemilczeć, jeśli pasuje to do charakteru postaci i stylu trudności poziomu.\n` +
    `- Nie wychodź z roli postaci.\n`;

  return prompt;
}

/* =====================================================
   Rejestracja trasy /ai/dialog na Express app
   ===================================================== */

function registerAiDialogRoutes(app) {
  app.post('/ai/dialog', async (req, res) => {
    try {
      const {
        npcId, 
        roomId, 
        playerMessage, 
        history, 
      } = req.body || {};

      if (!npcId || !playerMessage) {
        return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
      }

      if (!process.env.OPENAI_API_KEY) {
        console.error(
          '❌ Brak OPENAI_API_KEY – endpoint /ai/dialog jest wyłączony.'
        );
        return res.status(503).json({ ok: false, error: 'AI_DISABLED' });
      }

      const messages = [];

      messages.push({
        role: 'system',
        content: buildNpcSystemPrompt({ npcId, roomId }),
      });

      if (Array.isArray(history)) {
        history.slice(-6).forEach((turn) => {
          if (!turn || !turn.role || !turn.content) return;
          if (turn.role !== 'user' && turn.role !== 'assistant') return;

          messages.push({
            role: turn.role,
            content: String(turn.content).slice(0, 500),
          });
        });
      }

      messages.push({
        role: 'user',
        content: String(playerMessage).slice(0, 500),
      });

      const completion = await openai.chat.completions.create({
        model: DEFAULT_AI_MODEL,
        messages,
        max_tokens: 220,
        temperature: 0.8,
      });

      const reply =
        completion.choices?.[0]?.message?.content?.trim() ||
        'Coś poszło nie tak, spróbuj zapytać jeszcze raz.';

      res.json({
        ok: true,
        npcId,
        roomId: roomId || null,
        reply,
      });
    } catch (err) {
      console.error('❌ AI dialog error:', err?.message || err);
      res.status(500).json({ ok: false, error: 'AI_ERROR' });
    }
  });
}

module.exports = {
  registerAiDialogRoutes,
};
