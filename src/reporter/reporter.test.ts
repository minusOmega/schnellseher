import reporter, { Report } from "./reporter";

let error = console.error;
console.error = function (message, ...args) {
  error.apply(console, args); // keep default behaviour
  throw message instanceof Error ? message : new Error(message);
};

describe("test parsing", () => {
  const firstChild = (report: Report) => report[0].children[0];
  it("can parse a failed buff", () => {
    const weapon = "Buff";
    const report = reporter(
      `0:00 Magier zaubert [${weapon}] auf Verbündeter: verfehlt.`
    );
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).hit).toBe(0);
  });

  it("can parse a successful buff", () => {
    const weapon = "Buff";
    const report = reporter(
      `0:00 Magier zaubert [${weapon}] auf Verbündeter: erfolgreich.`
    );
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).hit).toBe(1);
  });

  it("can parse a failed DoT", () => {
    const weapon = "DoT";
    const report = reporter(
      `0:00 Magier zaubert [${weapon}] auf Gegner #1: verfehlt.`
    );

    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).dmg).toBe(0);
    expect(firstChild(report).hit).toBe(0);
  });

  it("can parse a successful DoT", () => {
    const weapon = "DoT";
    const dmg = 12;
    const report = reporter(`
0:00 Magier zaubert [${weapon}] auf Gegner #1: erfolgreich.
0:00 [${weapon}] wirkt auf Gegner #1: verursacht ${dmg} Schaden.
`);

    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).dmg).toBe(dmg);
    expect(firstChild(report).hit).toBe(2);
  });

  it("can parse a successful DoT with no dmg", () => {
    const weapon = "DoT";
    const report = reporter(`
0:00 Magier zaubert [${weapon}] auf Gegner #1: erfolgreich.
0:00 [${weapon}] wirkt auf Gegner #1: kein Schaden.
`);
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).dmg).toBe(0);
    expect(firstChild(report).hit).toBe(2);
  });

  it("can parse a missed attack", () => {
    const weapon = "Attack";
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: verfehlt.`
    );
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).dmg).toBe(0);
    expect(firstChild(report).hit).toBe(0);
    expect(firstChild(report).miss).toBe(1);
  });

  it("can parse a failed attack", () => {
    const weapon = "Attack";
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: weicht aus.`
    );
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).hit).toBe(0);
    expect(firstChild(report).dmg).toBe(0);
    expect(firstChild(report).miss).toBe(0);
  });

  it("can parse a successful critical attack", () => {
    const weapon = "Attack";
    const dmg = 12;
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: verursacht ${dmg} Schaden (krit. Treffer).`
    );
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).dmg).toBe(dmg);
    expect(firstChild(report).hit).toBe(1);
    expect(firstChild(report).crit).toBe(1);
  });

  it("can parse a successful attack", () => {
    const weapon = "Attack";
    const dmg = 12;
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: verursacht ${dmg} Schaden.`
    );
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).dmg).toBe(dmg);
    expect(firstChild(report).hit).toBe(1);
    expect(firstChild(report).crit).toBe(0);
  });

  it("can parse a successful attack with dmg blocked", () => {
    const weapon = "Attack";
    const dmg = 33;
    const block = 12;
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: verursacht ${dmg} Schaden (${block} Schaden geblockt).`
    );
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).dmg).toBe(dmg);
    expect(firstChild(report).block).toBe(block);
    expect(firstChild(report).hit).toBe(1);
  });

  it("can parse a successful attack with all dmg blocked", () => {
    const weapon = "Attack";
    const block = 12;
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: kein Schaden (${block} Schaden geblockt).`
    );
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).dmg).toBe(0);
    expect(firstChild(report).block).toBe(block);
    expect(firstChild(report).hit).toBe(1);
  });

  it("can parse a successful attack with dmg parried", () => {
    const weapon = "Attack";
    const dmg = 33;
    const parry = 12;
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: verursacht ${dmg} Schaden (${parry} Schaden pariert).`
    );
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).dmg).toBe(dmg);
    expect(firstChild(report).parry).toBe(parry);
    expect(firstChild(report).hit).toBe(1);
  });

  it("can parse a successful attack with all dmg parried", () => {
    const weapon = "Attack";
    const parry = 12;
    const report = reporter(
      `0:42 Magier [${weapon}] greift Gegner #1 an: kein Schaden (${parry} Schaden pariert).`
    );
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).dmg).toBe(0);
    expect(firstChild(report).parry).toBe(parry);
    expect(firstChild(report).hit).toBe(1);
  });

  it("can parse a successful regeneration", () => {
    const weapon = "Regeneration";
    const heal = 12;
    const report = reporter(`
0:00 Magier zaubert [${weapon}] auf Verbündeter: erfolgreich.
0:00 [${weapon}] wirkt auf Verbündeter: heilt ${heal} LP.`);
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).heal).toBe(heal);
    expect(firstChild(report).hit).toBe(1);
    expect(firstChild(report).crit).toBe(0);
  });

  it("can parse a successful critical regeneration", () => {
    const weapon = "Regeneration";
    const heal = 12;
    const report = reporter(`
0:00 Magier zaubert [${weapon}] auf Verbündeter: erfolgreich.
0:00 [${weapon}] wirkt auf Verbündeter: heilt ${heal} LP (exzellenter Treffer).`);
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).heal).toBe(heal);
    expect(firstChild(report).hit).toBe(1);
    expect(firstChild(report).crit).toBe(1);
  });

  it("can parse a failed regeneration", () => {
    const weapon = "Regeneration";
    const report = reporter(
      `0:00 Magier zaubert [${weapon}] auf Verbündeter: verfehlt.`
    );
    expect(firstChild(report).weapon).toBe(weapon);
    expect(firstChild(report).heal).toBe(0);
    expect(firstChild(report).hit).toBe(0);
  });
});

describe("test reporter", () => {
  it("combines rounds", () => {
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
    console.log(report);
    expect(report[0].rounds).toEqual([1, 2, 3]);
    expect(report[0].children[Spells.Buff].rounds).toEqual([1]);
    expect(report[0].children[Spells.Dmg].rounds).toEqual([2, 3]);
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
    Runde 4    
Runde 4    
1:16 Magier [${Spells[Spells.Dmg]}] greift Gegner an: verursacht 29 Schaden.
1:28 Magier zaubert [${Spells[Spells.Debuff]}] auf Gegner: erfolgreich.

Runde 5
1:36 Magier zaubert [${Spells[Spells.Heal]}] auf Verbündeter: heilt 32 LP.
Runde 6
2:04 Magier zaubert [${Spells[Spells.Buff]}] auf Verbündeter: erfolgreich.
2:12 Magier [${Spells[Spells.Dmg]}] greift Gegner an: verursacht 84 Schaden.
      `);
    expect(report[0].rounds).toEqual([1, 2, 3, 4, 5, 6]);
    expect(report[0].children[Spells.Buff].rounds).toEqual([1, 2, 6]);
    expect(report[0].children[Spells.Debuff].rounds).toEqual([1, 2, 4]);
    expect(report[0].children[Spells.Heal].rounds).toEqual([1, 3, 5]);
    expect(report[0].children[Spells.Dmg].rounds).toEqual([2, 3, 4, 6]);
  });

  it("combines rounds 1...150", () => {
    enum Spells {
      Dmg,
    }

    const report = reporter(`
Runde 1
0:00 Magier [${Spells[Spells.Dmg]}] greift Gegner an: verursacht 12 Schaden
Runde 150
59:36 Magier [${Spells[Spells.Dmg]}] greift Gegner an: verursacht 12 Schaden
      `);
    expect(report[0].rounds).toEqual([1, 150]);
    expect(report[0].children[Spells.Dmg].rounds).toEqual([1, 150]);
  });

  it("calculates DoT dmg", () => {
    enum Caster {
      Wizard,
      Warlock,
    }

    const report = reporter(`
0:00 ${Caster[Caster.Wizard]} zaubert [Orkan II] auf Gegner #1: verfehlt.
0:00 ${Caster[Caster.Wizard]} zaubert [Orkan II] auf Gegner #2: erfolgreich.
0:00 [Orkan II] wirkt auf Gegner #2: verursacht 5 Schaden.
0:00 ${Caster[Caster.Warlock]} zaubert [Orkan II] auf Gegner #1: erfolgreich.
0:00 [Orkan II] wirkt auf Gegner #1: verursacht 7 Schaden.
0:00 ${Caster[Caster.Warlock]} zaubert [Orkan II] auf Gegner #2: erfolgreich.
0:00 [Orkan II] wirkt auf Gegner #2: verursacht 3 Schaden.
    `);

    expect(report[Caster.Wizard].dmg).toEqual(5);
    expect(report[Caster.Warlock].dmg).toEqual(10);
  });
});
