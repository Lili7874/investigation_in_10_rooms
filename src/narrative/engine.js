// + caseBrief: string
export async function buildCaseAndDialogues({
  suspects, items, places, characters,
  difficulty = 'easy', mode = 'rules',
  caseBrief = ''                      // ⬅️ NOWE
}) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const solution = { murderer: pick(suspects), weapon: pick(items), place: pick(places) };

  let dialogues;
  if (mode === 'ai') {
    try {
      const res = await fetch('/api/dialogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspects, items, places, solution, difficulty, caseBrief }) // ⬅️ TU
      });
      const data = await res.json();
      dialogues = data?.lines || {};
    } catch {
      dialogues = ruleBasedDialogues(solution, characters, suspects, items, places, caseBrief); // ⬅️ TU
    }
  } else {
    dialogues = ruleBasedDialogues(solution, characters, suspects, items, places, caseBrief);   // ⬅️ TU
  }

  return { solution, dialogues };
}

// drobne „podszycie” regułowe, które wplata 1–2 słowa kluczowe z briefu
function ruleBasedDialogues(solution, characters, suspects, items, places, caseBrief = '') {
  const keyTopic = (caseBrief.match(/[\p{L}0-9-]{4,}/gu) || []).slice(0, 2).join(', ');
  const note = keyTopic ? ` (to pewnie przez: ${keyTopic})` : '';

  const lines = {};
  const who = solution.murderer, what = solution.weapon, where = solution.place;

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomNotOf = (arr, exclude) => pick(arr.filter(x => x !== exclude)) || pick(arr);

  const templates = {
    murderer: [
      `Byłem tylko chwilę przy „${where}”… nic podejrzanego${note}.`,
      `Po co miałbym ruszać „${what}”? To bez sensu.`,
      `Nie pamiętam dokładnie, wszyscy byli zdenerwowani${note}.`,
    ],
    witness: [
      `Widziałem kogoś przy „${where}”, ale nie chcę nikogo oskarżać${note}.`,
      `Ktoś grzebał przy „${what}”. Dziwne to było.`,
      `Słyszałem szelest od strony „${where}”.`,
    ],
    filler: [
      `Pracowałem nad raportem, nic nie słyszałem.`,
      `Może sprawdźcie „${randomNotOf(items, what)}”.`,
      `O tej porze zwykle nikogo nie ma przy „${randomNotOf(places, where)}”.`,
    ],
  };

  characters.forEach((c, i) => {
    const isMurderer = i === 0; // najprościej: pierwsza postać robi za sprawcę przy easy
    const bucket = isMurderer ? templates.murderer
                 : (i % 2 === 0 ? templates.witness : templates.filler);
    lines[c.key] = pick(bucket);
  });

  return lines;
}

