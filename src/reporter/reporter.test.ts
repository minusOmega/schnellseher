import reporter, {
  Report,
  parseBattles,
  parseInput,
  roundsToString,
} from "./reporter";

describe("test process cases", () => {
  it("can parse a failed buff", () => {
    const participant = "Magier";
    const weapon = "Buff";
    const report = reporter(
      `0:00 ${participant} zaubert [${weapon}] auf Verbündeter: verfehlt.`
    );
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].hit).toBe(0);
  });

  it("can parse a successful buff", () => {
    const participant = "Magier";
    const weapon = "Buff";
    const report = reporter(
      `0:00 Magier zaubert [${weapon}] auf Verbündeter: erfolgreich.`
    );
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].cast).toBe(1);
  });

  it("can parse a failed DoT", () => {
    const participant = "Magier";
    const weapon = "DoT";
    const report = reporter(
      `0:00 Magier zaubert [${weapon}] auf Gegner #1: verfehlt.`
    );

    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].dmg).toBe(0);
    expect((report[participant].children as Report)[weapon].cast).toBe(0);
  });

  it("can parse a successful DoT", () => {
    const participant = "Magier";
    const weapon = "DoT";
    const dmg = 12;
    const report = reporter(`
  0:00 Magier zaubert [${weapon}] auf Gegner #1: erfolgreich.
  0:00 [${weapon}] wirkt auf Gegner #1: verursacht ${dmg} Schaden.
  `);

    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].dmg).toBe(dmg);
    expect((report[participant].children as Report)[weapon].cast).toBe(1);
    expect((report[participant].children as Report)[weapon].hit).toBe(1);
  });

  it("can parse a successful DoT with no dmg", () => {
    const participant = "Magier";
    const weapon = "DoT";
    const report = reporter(`
  0:00 Magier zaubert [${weapon}] auf Gegner #1: erfolgreich.
  0:00 [${weapon}] wirkt auf Gegner #1: kein Schaden.
  `);
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].dmg).toBe(0);
    expect((report[participant].children as Report)[weapon].cast).toBe(1);
    expect((report[participant].children as Report)[weapon].hit).toBe(1);
  });

  it("can parse a missed attack", () => {
    const participant = "Magier";
    const weapon = "Attack";
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: verfehlt.`
    );
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].dmg).toBe(0);
    expect((report[participant].children as Report)[weapon].hit).toBe(0);
    expect((report[participant].children as Report)[weapon].miss).toBe(1);
  });

  it("can parse a failed attack", () => {
    const participant = "Magier";
    const weapon = "Attack";
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: weicht aus.`
    );
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].hit).toBe(0);
    expect((report[participant].children as Report)[weapon].dmg).toBe(0);
    expect((report[participant].children as Report)[weapon].miss).toBe(0);
    expect((report[participant].children as Report)[weapon].dodged).toBe(1);
  });

  it("can parse a successful critical attack", () => {
    const participant = "Magier";
    const weapon = "Attack";
    const dmg = 12;
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: verursacht ${dmg} Schaden (krit. Treffer).`
    );
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].dmg).toBe(dmg);
    expect((report[participant].children as Report)[weapon].hit).toBe(1);
    expect((report[participant].children as Report)[weapon].crit).toBe(1);
  });

  it("can parse a successful attack", () => {
    const participant = "Magier";
    const weapon = "Attack";
    const dmg = 12;
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: verursacht ${dmg} Schaden.`
    );
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].dmg).toBe(dmg);
    expect((report[participant].children as Report)[weapon].hit).toBe(1);
    expect((report[participant].children as Report)[weapon].crit).toBe(0);
  });

  it("can parse a successful attack with dmg blocked", () => {
    const participant = "Magier";
    const weapon = "Attack";
    const dmgOnce = 22;
    const dmg = dmgOnce * 2;
    const blockOnce = 6;
    const block = blockOnce * 2;
    const report = reporter(`
0:42 Magier [${weapon}] greift Gegner #1 an: verursacht ${dmgOnce} Schaden (${blockOnce} Schaden geblockt).
0:42 Magier [${weapon}] greift Gegner #1 an: verursacht ${dmgOnce} Schaden (${blockOnce} Schaden geblockt).
      `);
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].dmg).toBe(dmg);
    expect((report[participant].children as Report)[weapon].block).toBe(block);
    expect((report[participant].children as Report)[weapon].hit).toBe(2);
  });

  it("can parse a successful attack with all dmg blocked", () => {
    const participant = "Magier";
    const weapon = "Attack";
    const block = 12;
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: kein Schaden (${block} Schaden geblockt).`
    );
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].dmg).toBe(0);
    expect((report[participant].children as Report)[weapon].block).toBe(block);
    expect((report[participant].children as Report)[weapon].hit).toBe(1);
  });

  it("can parse a successful attack with dmg parried", () => {
    const participant = "Magier";
    const weapon = "Attack";
    const dmgOnce = 22;
    const dmg = dmgOnce * 2;
    const parryOnce = 12;
    const parry = parryOnce * 2;
    const report = reporter(`
0:42 Magier [${weapon}] greift Gegner #1 an: verursacht ${dmgOnce} Schaden (${parryOnce} Schaden pariert).
0:42 Magier [${weapon}] greift Gegner #1 an: verursacht ${dmgOnce} Schaden (${parryOnce} Schaden pariert).
`);
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].dmg).toBe(dmg);
    expect((report[participant].children as Report)[weapon].parry).toBe(parry);
    expect((report[participant].children as Report)[weapon].hit).toBe(2);
  });

  it("can parse a successful attack with all dmg parried", () => {
    const participant = "Magier";
    const weapon = "Attack";
    const parry = 12;
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: kein Schaden (${parry} Schaden pariert).`
    );
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].dmg).toBe(0);
    expect((report[participant].children as Report)[weapon].parry).toBe(parry);
    expect((report[participant].children as Report)[weapon].hit).toBe(1);
  });

  it("can parse a successful regeneration", () => {
    const participant = "Magier";
    const weapon = "Regeneration";
    const heal = 12;
    const report = reporter(`
  0:00 Magier zaubert [${weapon}] auf Verbündeter: erfolgreich.
  0:00 [${weapon}] wirkt auf Verbündeter: heilt ${heal} LP.`);
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].heal).toBe(heal);
    expect((report[participant].children as Report)[weapon].cast).toBe(1);
    expect((report[participant].children as Report)[weapon].crit).toBe(0);
  });

  it("can parse a successful critical regeneration", () => {
    const participant = "Magier";
    const weapon = "Regeneration";
    const heal = 12;
    const report = reporter(`
  0:00 Magier zaubert [${weapon}] auf Verbündeter: erfolgreich.
  0:00 [${weapon}] wirkt auf Verbündeter: heilt ${heal} LP (exzellenter Treffer).`);
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].heal).toBe(heal);
    expect((report[participant].children as Report)[weapon].cast).toBe(1);
    expect((report[participant].children as Report)[weapon].crit).toBe(1);
  });

  it("can parse a failed regeneration", () => {
    const participant = "Magier";
    const weapon = "Regeneration";
    const report = reporter(
      `0:00 Magier zaubert [${weapon}] auf Verbündeter: verfehlt.`
    );
    expect(report[participant].children.hasOwnProperty(weapon)).toBe(true);
    expect((report[participant].children as Report)[weapon].heal).toBe(0);
    expect((report[participant].children as Report)[weapon].hit).toBe(0);
  });
});

describe("test round aggregation", () => {
  it("combines rounds", () => {
    const report = reporter(`
  Runde 1
  0:00 Magier zaubert [Buff] auf Verbündeter: erfolgreich.
  Runde 2
  0:42 Magier [Dmg] greift Gegner an: verursacht 12 Schaden
  Runde 3
  0:54 Magier [Dmg] greift Gegner an: verursacht 49 Schaden
      `);
    expect(roundsToString(report["Magier"].rounds)).toEqual("1, 2, 3");
    expect(
      roundsToString((report["Magier"].children as Report)["Buff"].rounds)
    ).toEqual("1");
    expect(
      roundsToString((report["Magier"].children as Report)["Dmg"].rounds)
    ).toEqual("2, 3");
  });

  it("combines rounds with multiple attacks", () => {
    const report = reporter(`
  Runde 1
  0:00 Magier [Dmg] greift Gegner an: verursacht 12 Schaden
  0:08 Magier [Dmg] greift Gegner an: verursacht 25 Schaden
  
  Runde 2
  0:42 Magier [Dmg] greift Gegner an: verursacht 49 Schaden
      `);
    expect(roundsToString(report["Magier"].rounds)).toEqual("1, 2");
  });

  it("combines rounds with gaps", () => {
    enum Spells {
      Buff,
      Debuff,
      Heal,
      Dmg,
    }

    const report = reporter(`
  Runde 1
  0:00 Magier zaubert [${Spells[Spells.Buff]}] auf Verbündeter: erfolgreich.
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
    expect(roundsToString(report["Magier"].rounds)).toEqual("1, 2, 3, 4, 5, 6");
    expect(
      roundsToString((report["Magier"].children as Report)["Buff"].rounds)
    ).toEqual("1, 2, 6");
    expect(
      roundsToString((report["Magier"].children as Report)["Debuff"].rounds)
    ).toEqual("1, 2, 4");
    expect(
      roundsToString((report["Magier"].children as Report)["Heal"].rounds)
    ).toEqual("1, 3, 5");
    expect(
      roundsToString((report["Magier"].children as Report)["Dmg"].rounds)
    ).toEqual("2, 3, 4, 6");
  });

  it("combines rounds 1...150", () => {
    const spell: string = "Dmg";

    const report = reporter(`
  Runde 1
  0:00 Magier [${spell}] greift Gegner an: verursacht 12 Schaden
  Runde 150
  59:36 Magier [${spell}] greift Gegner an: verursacht 12 Schaden
        `);
    expect(roundsToString(report["Magier"].rounds)).toEqual("1, 150");
    expect(
      roundsToString((report["Magier"].children as Report)[spell].rounds)
    ).toEqual("1, 150");
  });
});

describe("test damage over time calculation", () => {
  it("backtracks caster", () => {
    const caster1 = "Magier";
    const report = reporter(`
    Runde 1
    0:00 ${caster1} zaubert [Flächen-Regeneration I] auf Magier: erfolgreich.
    0:00 [Flächen-Regeneration I] wirkt auf Magier: heilt 19 LP.

    Runde 2
    0:24 [Flächen-Regeneration I] wirkt auf Magier: heilt 23 LP.
          `);

    expect(report[caster1].heal).toBe(42);
    expect(Object.keys(report)).toEqual([caster1]);
  });

  it("backtracks second caster", () => {
    const caster1 = "Magier";
    const caster2 = "Heiler";

    const report = reporter(`
    Runde 1
    0:00 ${caster1} zaubert [Flächen-Regeneration I] auf ${caster2}: erfolgreich.
    0:00 [Flächen-Regeneration I] wirkt auf ${caster2}: heilt 19 LP.

    0:00 ${caster2} zaubert [Flächen-Regeneration I] auf ${caster1}: erfolgreich.
    0:00 [Flächen-Regeneration I] wirkt auf ${caster1}: heilt 25 LP (exzellenter Treffer).
          `);

    expect(report[caster1].heal).toBe(19);
    expect(report[caster2].heal).toBe(25);
    expect(Object.keys(report)).toEqual([caster1, caster2]);
  });

  it("backtracks caster with multiple DoT's", () => {
    const caster1 = "Magier";
    const caster2 = "Heiler";
    const caster3 = "Verbündeter";

    const report = reporter(`
    Runde 1
    0:00 ${caster1} zaubert [Flächen-Regeneration I] auf ${caster2}: erfolgreich.
    0:00 [Flächen-Regeneration I] wirkt auf ${caster2}: heilt 19 LP.

    0:00 ${caster2} zaubert [Flächen-Regeneration I] auf ${caster1}: erfolgreich.
    0:00 [Flächen-Regeneration I] wirkt auf ${caster1}: heilt 25 LP (exzellenter Treffer).

    Runde 2
    0:24 [Flächen-Regeneration I] wirkt auf ${caster2}: heilt 23 LP.
    0:44 ${caster3} zaubert [Trugbild II] auf Nekromant #3: erfolgreich.
          `);

    expect(report[caster1].heal).toBe(42);
    expect(report[caster2].heal).toBe(25);
    expect(Object.keys(report)).toEqual([caster1, caster2, caster3]);
  });

  it("calculates DoT dmg", () => {
    const wizard = "Wizard";
    const warlock = "Warlock";

    const report = reporter(`
  0:00 ${wizard} zaubert [Orkan II] auf Gegner #1: verfehlt.
  0:00 ${wizard} zaubert [Orkan II] auf Gegner #2: erfolgreich.
  0:00 [Orkan II] wirkt auf Gegner #2: verursacht 5 Schaden.
  0:00 ${warlock} zaubert [Orkan II] auf Gegner #1: erfolgreich.
  0:00 [Orkan II] wirkt auf Gegner #1: verursacht 7 Schaden.
  0:00 ${warlock} zaubert [Orkan II] auf Gegner #2: erfolgreich.
  0:00 [Orkan II] wirkt auf Gegner #2: verursacht 3 Schaden.
      `);

    expect(report[wizard].dmg).toEqual(5);
    expect(report[warlock].dmg).toEqual(10);
  });
});

describe("test multiple reports", () => {
  it("can parse a single report with header", () => {
    const input = `
    Keloras, Noch 1 Jahr, 240 Tage und 06:32:22 bis zur Abschaltung, (11:27:37)
    Kampfbericht
    Ihr arbeitet zurzeit. (Ruinen von Allanar: Werkstatt I)
    
    Kampfinformationen [Kampfbeginn: 2022-10-15 02:12:53]   	
    
    Runde 1
    0:00 Magier zaubert [Orkan III] auf Gegner #1: erfolgreich.
    `;

    const battles = parseBattles(parseInput(input));
    expect(battles.length).toBe(1);
    expect(battles[0].start).toBe("2022-10-15 02:12:53");
  });

  it("can parse a single report without header", () => {
    const input = `
    Runde 1
    0:00 Magier zaubert [Orkan III] auf Gegner #1: erfolgreich.
    `;

    const battles = parseBattles(parseInput(input));
    expect(battles.length).toBe(1);
    expect(battles[0].start).toBe("Kampfinformationen");
  });

  it("can parse a multiple reports with header", () => {
    const input = `
    Kampfinformationen [Kampfbeginn: 2022-10-15 02:12:53]   	
    
    Runde 1
    0:00 Magier zaubert [Orkan III] auf Gegner #1: erfolgreich.

    Kampfinformationen [Kampfbeginn: 2022-10-15 03:12:53]   	
    
    Runde 1
    0:00 Magier zaubert [Orkan III] auf Gegner #1: erfolgreich.
    `;

    const battles = parseBattles(parseInput(input));
    expect(battles.length).toBe(2);
    expect(battles[0].start).toBe("2022-10-15 02:12:53");
    expect(battles[1].start).toBe("2022-10-15 03:12:53");
  });

  it("can parse a multiple reports without first header", () => {
    const input = `
    Runde 1
    0:00 Magier zaubert [Orkan III] auf Gegner #1: erfolgreich.

    Kampfinformationen [Kampfbeginn: 2022-10-15 03:12:53]   	
    
    Runde 1
    0:00 Magier zaubert [Orkan III] auf Gegner #1: erfolgreich.
    `;

    const battles = parseBattles(parseInput(input));
    expect(battles.length).toBe(2);
    expect(battles[0].start).toBe("Kampfinformationen");
    expect(battles[1].start).toBe("2022-10-15 03:12:53");
  });
});
