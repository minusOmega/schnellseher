import reporter from "./reporter";

test("combines rounds", () => {
  enum Spells {
    Buff,
    Dmg,
  }

  const report = reporter(`
    Runde 1
    0:00 Magier zaubert [${Spells[Spells.Buff]}] auf Verbündeter: erfolgreich.
    Runde 2
    0:42 Magier [${Spells[Spells.Dmg]}] greift Gegner an: verursacht 12 Schaden
    Runde 3
    0:54 Magier [${Spells[Spells.Dmg]}] greift Gegner an: verursacht 49 Schaden
    `);
  expect(report[0].rounds).toEqual([1, 2, 3]);
  expect(report[0].children[Spells.Buff].rounds).toEqual([1]);
  expect(report[0].children[Spells.Dmg].rounds).toEqual([2, 3]);
});

test("combines rounds 2", () => {
  enum Spells {
    Buff,
    Debuff,
    Heal,
    Dmg,
  }

  const report = reporter(`
    Runde 1
    0:00 Magier zaubert [${Spells[Spells.Buff]}] auf Fimani: erfolgreich.
    0:08 Magier zaubert [${Spells[Spells.Debuff]}] auf Gegner: erfolgreich.
    0:16 Magier zaubert [${Spells[Spells.Heal]}] auf Verbündeter: heilt 31 LP.
  
    Runde 2
    0:26 Magier zaubert [${Spells[Spells.Buff]}] auf Verbündeter: erfolgreich.
    0:34 Magier zaubert [${Spells[Spells.Debuff]}] auf Gegner: erfolgreich.
    0:42 Magier [${Spells[Spells.Dmg]}] greift Gegner an: verursacht 12 Schaden.
    
    Runde 3
    0:54 Magier [${Spells[Spells.Dmg]}] greift Gegner an: verursacht 21 Schaden.
    1:06 Magier zaubert [${Spells[Spells.Heal]}] auf Verbündeter: misslingt.
    
    Runde 4    
    1:16 Magier [${Spells[Spells.Dmg]}] greift Gegner an: verursacht 29 Schaden.
    1:28 Magier zaubert [${Spells[Spells.Debuff]}] auf Gegner: erfolgreich.
    
    Runde 5
    1:36 Magier zaubert [${Spells[Spells.Heal]}] auf Verbündeter: heilt 32 LP.

    Runde 6
    2:04 Magier zaubert [${Spells[Spells.Buff]}] auf Verbündeter: erfolgreich.
    2:12 Magier [${Spells[Spells.Dmg]}] greift Gegner an: verursacht 84 Schaden.
      `);
  console.log(JSON.stringify(report, undefined, 3));
  expect(report[0].rounds).toEqual([1, 2, 3, 4, 5, 6]);
  expect(report[0].children[Spells.Buff].rounds).toEqual([1, 2, 6]);
  expect(report[0].children[Spells.Debuff].rounds).toEqual([1, 2, 4]);
  expect(report[0].children[Spells.Heal].rounds).toEqual([1, 3, 5]);
  expect(report[0].children[Spells.Dmg].rounds).toEqual([2, 3, 4, 6]);
});
