type Attacker = { participant: string };
type Attack = { weapon: string };
type AuswertungKampf = Attacker & Attack;

export type Offensive = {
  rounds: number[];
  crit: number;
  dmg: number;
  heal: number;
  hit: number;
  miss: number;
  attack: number;
  block: number;
  parry: number;
};

export type Defensive = {
  dmged: number;
  struck: number;
  healed: number;
  blocked: number;
  parried: number;
  dodged: number;
};

type WithChildren<A, B> = A & {
  children: B[];
};

export type Weapon = Attacker & Attack & Offensive;
export type Participant = WithChildren<
  Attacker & Offensive & Defensive,
  Weapon
>;

export type Report = Participant[];

export default function reporter(input: string): Report {
  const text = input.split("\n");
  type RegexGroups = {
    time: string;
    participant: string;
    weapon: string;
    target: string;
    damage: string;
    heal: string;
    hit: string;
    typ: string;
    block: string;
    parry: string;
  };

  const groups: RegexGroups[] = [];

  for (let index = 0; index < text.length; index++) {
    let regex =
      /(?<time>\d:\d\d) (?<participant>[A-ZÄÖÜß][a-zäöü]+(?=\W)(?:\s#\d|(?:\s|-)[A-ZÄÖÜß][a-zäöü]+|){1,2})?(?:.+)(?<weapon>(?<=\[).+?(?=\]))(?:]\s(?:(?!versorgt)[a-z]+\s){1,2})(?<target>[A-ZÄÖÜß][a-zäöü]+(?=\W)(?:\s#\d|(?:\s|-)[A-ZÄÖÜß][a-zäöü]+|){1,2})(?:.*?: )(?:(?:verursacht (?<damage>\d+))|(?:heilt (?<heal>\d+)))?(?<hit>[a-z]+\s?[A-Za-z]+?(?=\.| ))?(?:\s[a-zA-Z]+\s\()?(?<typ>(?<=\()exzellenter Treffer|krit. Treffer(?=\)))?(?:.+\()?(?:(?<block>(?<=\().+(?=\sSchaden geblockt\)))|(?<parry>(?<=\)\s\().+(?=\sSchaden pariert\))))?/g;

    let match = regex.exec(text[index]);
    if (match?.groups) {
      groups.push(match.groups as RegexGroups);
    }
  }

  const rundenzauber = groups
    .filter(({ hit }) => hit === "erfolgreich")
    .sort((a, b) => a.time.localeCompare(b.time))
    .reverse();

  groups
    .filter(({ participant }) => participant === undefined)
    .forEach((element) => {
      const match = rundenzauber.find(({ time, weapon, target }) => {
        if (weapon !== element.weapon) return false;
        if (target !== element.target) return false;
        return element.time.localeCompare(time) >= 0;
      });
      if (match) element.participant = match.participant;
      else console.log(element);
    });

  const auszuwertender = groups.reduce<AuswertungKampf[]>(
    (list, { participant, weapon }) => {
      const hasItem = list.find(
        (listItem) =>
          listItem.participant === participant && listItem.weapon === weapon
      );
      if (!hasItem) list.push({ participant: participant, weapon });
      return list;
    },
    []
  );

  type Auswertung = AuswertungKampf & Offensive & Partial<Defensive>;

  const auswertungen: Auswertung[] = [];
  auszuwertender.forEach(({ participant, weapon }) => {
    const data = groups.filter(
      (entry) => entry.participant === participant && entry.weapon === weapon
    );
    const auswertung = data.reduce<Offensive>(
      (total, { time, damage, hit, typ, heal, block, parry }) => {
        const [minutes, seconds] = time.split(":");
        const round = Math.floor(
          (parseInt(minutes) * 60 + parseInt(seconds)) / 24 + 1
        );
        let hits = damage !== undefined ? 1 : 0;
        let miss = 0;
        let crit = typ === "krit. Treffer" ? 1 : 0;
        let attack = 0;
        switch (hit) {
          case "kein Schaden":
          case "erfolgreich":
            hits++;
            attack++;
            break;
          case "verfehlt":
            miss++;
            attack++;
            break;
          case "weicht aus":
          case "misslingt":
          default:
            attack++;
            break;
        }
        if (!total.rounds.includes(round)) total.rounds.push(round);
        total.crit += crit;
        total.dmg += parseInt(damage) | 0;
        total.heal += parseInt(heal) | 0;
        total.hit += hits;
        total.miss += miss;
        total.attack += attack;
        total.block += parseInt(block) | 0;
        total.parry += parseInt(parry) | 0;

        return total;
      },
      {
        rounds: [],
        crit: 0,
        dmg: 0,
        heal: 0,
        hit: 0,
        miss: 0,
        attack: 0,
        block: 0,
        parry: 0,
      }
    );

    auswertungen.push({ participant, weapon, ...auswertung });
  });

  const report = auswertungen.reduce<Report>((total, current) => {
    const {
      weapon,
      participant,
      attack,
      block,
      crit,
      dmg,
      heal,
      hit,
      miss,
      parry,
      rounds,
    } = current;
    const entry = total.find((item) => item.participant === participant);
    if (entry) {
      entry.rounds.push(
        ...current.rounds.filter((round) => !entry.rounds.includes(round))
      );
      entry.crit += current.crit;
      entry.dmg += current.dmg;
      entry.heal += current.heal;
      entry.hit += current.hit;
      entry.miss += current.miss;
      entry.attack += current.attack;
      entry.block += current.block;
      entry.parry += current.parry;
      entry.children.push(current);
    } else {
      total.push({
        rounds,
        participant,
        attack,
        block,
        crit,
        dmg,
        heal,
        hit,
        miss,
        parry,
        dmged: 0,
        struck: 0,
        healed: 0,
        blocked: 0,
        parried: 0,
        dodged: 0,
        children: [
          {
            rounds,
            participant,
            weapon,
            attack,
            block,
            crit,
            dmg,
            heal,
            hit,
            miss,
            parry,
          },
        ],
      });
    }

    return total;
  }, []);

  groups
    .filter(({ target }) => Boolean(target))
    .forEach(({ target, heal, block, parry, damage, hit }) => {
      const auswertung = report.find(
        ({ participant }) => participant === target
      );
      if (!auswertung) return;

      auswertung.healed += parseInt(heal) | 0;
      auswertung.blocked += parseInt(block) | 0;
      auswertung.parried += parseInt(parry) | 0;
      auswertung.dmged += parseInt(damage) | 0;
      let struck = damage !== undefined ? 1 : 0;
      switch (hit) {
        case "kein Schaden":
          struck++;
      }

      auswertung.struck += struck;
      auswertung.dodged += hit === "weicht aus" ? 1 : 0;
    });

  return report;
}
