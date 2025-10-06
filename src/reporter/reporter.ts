import { chain, isEmpty, unzip, zipWith, orderBy, isArray, fromPairs, groupBy } from "lodash";

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

  move: string;
  swap: string;
  defeated: string;
};

type Battle = {
  round: number;
  start: string;
  input: string;
  from?: number;
  to?: number;
  linesFrom?: number;
  linesTo?: number;
};

type Battles = Battle[];

type RawData = RegexGroups & {
  start: string;
};

export const constants = {
  move: "nähert sich",
  moveWeapon: "(In Bewegung)",
  noParticipant: "no participant found",
  backtracked: "backtracked caster",
  defeated: "sinkt kampfunfähig zu Boden",
  defeatedWeapon: "(Kampfunfähig)",
  swapMele: "wechselt in den Nahkampf",
  swapRanged: "wechselt in den Fernkampf",
  swapWeapon: "(Waffenwechsel)",
};

function splitAtLastOccurrence(str: string, word: string): [string, string] {
  const index = str.lastIndexOf(word);
  if (index === -1) {
    return [str, ""];
  }
  const firstPart = str.substring(0, index + word.length);
  const secondPart = str.substring(index);
  return [firstPart, secondPart];
}

function findLastRound(input: string): number {
  const regex = /Runde (\d+)/g;
  let match: RegExpExecArray | null;
  let lastRound = 0;

  while ((match = regex.exec(input)) !== null) {
    const round = parseInt(match[1]);
    if (round > lastRound) lastRound = round;
  }

  return lastRound;
}

export function parseInput(input: string, showBandaging: boolean = false) {
  const battleRegex = /((?<=Kampfinformationen \[Kampfbeginn: ).*(?=]))/g;
  const battles: Battles = [];
  const split = input.split(/(Kampfinformationen \[Kampfbeginn: .*])/g);
  let from = 0;
  let to = input.length;
  let linesFrom = 0;
  let linesTo = input.split(/\r\n|\r|\n/).length;
  let battle = "";
  let start = "Kampfinformationen";
  for (let index = 0; index < split.length; index++) {
    const element = split[index];
    from = from + element.length;
    linesFrom = linesFrom + element.split(/\r\n|\r|\n/).length;
    const match = battleRegex.exec(element);
    if (match) {
      battle = split[index + 1];
      start = match[0];
    } else if (index === 0 && /(^|\r|\n|\r\n|\s)\d+:\d\d\s/gm.test(element)) {
      battle = element;
    } else continue;

    if (!showBandaging) {
      const [before] = splitAtLastOccurrence(battle, "sinkt kampfunfähig zu Boden");
      battle = before;
    }

    to = from + battle.length;
    linesTo = linesFrom + battle.split(/\r\n|\r|\n/).length;
    battles.push({
      start,
      round: findLastRound(battle),
      input: battle,
      from,
      to,
      linesFrom,
      linesTo,
    });
  }

  return battles;
}

export type Loot = Record<string, Record<string, number>>;

const participant =
  /[A-ZÄÖÜß][a-zäöüß]+(?:(?:(?: |-)[a-zäöüß]+){0,2}(?:(?: |-)[A-ZÄÖÜß][a-zäöüß]+){0,2}(?:(?: |-)[A-ZÄÖÜß][a-zäöüß]+))?/
    .source;
const participantOrMonsterPattern = new RegExp(`${participant}(?: #\\d+)?`).source;
const lootPattern = /[^\t\n]*/.source;
const valuePattern = /\t\d* [^\n]*/.source;
const timePattern = /\d+:\d\d/.source;
const weaponPattern = /(?<=\[).+?(?=\])/.source;
const numbersPattern = /\d+/.source;
const hitPattern = /[a-z]+\s?[A-Za-z]+?(?=\.| )/.source;
const typPattern = /(?<=\()exzellenter Treffer|krit. Treffer(?=\))/.source;
const blockPattern = /(?<=\()\d+(?=\sSchaden geblockt\)\.)/.source;
const parryPattern = /(?<=\()\d+(?=\sSchaden pariert\)\.)/.source;

function parseLoot({ input }: Battle): { value: Loot; loot: Loot } {
  let regex = new RegExp(
    `^(?!Sieger\tBeuteverteilung)(?<participant>${participant})\t(?<loot>${lootPattern})(?:\n|(?<value>${valuePattern}))?\n`,
    "gm"
  );
  let match: RegExpExecArray | null;
  let collectedLoot: Loot = {};
  let collectedValue: Loot = {};
  while ((match = regex.exec(input))) {
    if (match?.groups) {
      const { participant, loot, value } = match.groups;
      const collect = (total: Loot, current: string) => {
        const [amount, item] = current.split(/\s(.*)/s);
        let parsedAmount = parseInt(amount);
        const parsedItem = isNaN(parsedAmount) ? current : item;
        if (!parsedItem) return total;
        parsedAmount = isNaN(parsedAmount) ? 1 : parsedAmount;
        if (total[participant]) total[participant][parsedItem] = parsedAmount;
        else total[participant] = { [parsedItem]: parsedAmount };
        return total;
      };

      collectedLoot = loot.split(", ").reduce(collect, collectedLoot);
      collectedValue = (value || "")
        .replace(/^\t+/, "")
        .split(", ")
        .reduce(collect, collectedValue);
    }
  }
  return { loot: collectedLoot, value: collectedValue };
}

export function parseBattles(battles: Battles): {
  groups: RawData[];
  value: Loot;
  loot: Loot;
  categories: string[];
  descriptions: string[];
} {
  const groups: RawData[] = [];
  const allLoot: Loot[] = [];
  const values: Loot[] = [];
  battles.forEach((battle) => {
    const { input, start } = battle;
    const { loot, value } = parseLoot(battle);
    allLoot.push(loot);
    values.push(value);
    let regex = new RegExp(
      `(?<time>${timePattern}) (?<participant>${participantOrMonsterPattern})?(?: (?<move>nähert sich) | (?<defeated>sinkt kampfunfähig zu Boden)| (?<swap>wechselt in den (?:Nahkampf|Fernkampf))|(?:(?:.+)(?<weapon>${weaponPattern})(?:]\\s(?:[a-z]+\\s){1,2})))(?<target>${participantOrMonsterPattern})?(?:.*?: )?(?:(?:verursacht (?<damage>${numbersPattern}))|(?:heilt (?<heal>${numbersPattern})))?(?<hit>${hitPattern})?(?:\\s[a-zA-Z]+\\s\\()?(?<typ>${typPattern})?(?:.+\\()?(?:(?<block>${blockPattern})|(?<parry>${parryPattern}))?`,
      "g"
    );
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input))) {
      if (match?.groups) {
        groups.push({ ...(match.groups as RegexGroups), start });
      }
    }
  });

  const collect = (input: Loot[]): [Loot, string[]] => {
    const names: string[] = [];
    const sum: Record<string, number> = {};
    if (!input) return [{}, names];

    const output = input.reduce((total, current) => {
      for (const [participant, loot] of Object.entries(current)) {
        if (!total[participant]) total[participant] = {};
        for (const [item, amount] of Object.entries(loot)) {
          if (!names.includes(item)) names.push(item);

          if (total[participant][item]) total[participant][item] += amount;
          else total[participant][item] = amount;

          if (sum[item]) sum[item] += amount;
          else sum[item] = amount;
        }
      }
      return total;
    }, {});

    output["# Summe"] = sum;
    return [output, names];
  };

  const [loot, categories] = collect(allLoot);
  const [value, descriptions] = collect(values);

  return { groups, value, loot, categories, descriptions };
}

const getPredecessorIfCaster = (current: RawData, all: RawData[]) => {
  const position = all.indexOf(current);
  const predecessor = all[position - 1];
  const { weapon, target, time } = predecessor;
  if (weapon !== current.weapon) return undefined;
  if (target !== current.target) return undefined;
  if (current.time.localeCompare(time) >= 0) return predecessor;
};

export function backtrackCaster(groups: RawData[]) {
  const dot = groups
    .filter(({ hit }) => hit === "erfolgreich")
    .sort((a, b) => a.time.localeCompare(b.time))
    .reverse();
  return groups.map((element, index) => {
    if (element.participant) return element;
    const predecessor = getPredecessorIfCaster(element, groups);
    if (predecessor && predecessor.participant) {
      return { ...element, participant: predecessor.participant, hit: constants.backtracked };
    } else {
      const match = dot.find(({ time, weapon, target }) => {
        if (weapon !== element.weapon) return false;
        if (target !== element.target) return false;
        return element.time.localeCompare(time) >= 0;
      });      
      if (match) {
        const result = { ...element, participant: match.participant, hit: constants.backtracked };
        return result;
      } else {
        const previous = groups[index - 1];        
        if (previous && previous.participant ) return { ...element, participant: previous.participant, hit: constants.noParticipant };
        console.error(`Cannot find participant for ${JSON.stringify(element)}`);
      }
      return element;
    }
  });
}

export type Numbers = {
  cast: number;
  crit: number;
  dmg: number;
  heal: number;
  hit: number;
  healed: number;
  miss: number;
  dodged: number;
  activate: number;
  attack: number;
  blocked: number;
  block: number;
  parried: number;
  parry: number;
};

export type Data = Numbers & {
  participant: string;
  weapon: string;
  target: string;
  round: number;
  time: string;
  start: string;
};

function parseTime(time: string): number {
  const [minutes, seconds] = time.split(":");
  const round = Math.floor((parseInt(minutes) * 60 + parseInt(seconds)) / 24 + 1);
  return round;
}

export function parseRegexGroups(groups: RawData[]): Data[] {
  return groups.map((group) => {
    let {
      time,
      damage,
      typ,
      participant,
      weapon,
      target,
      hit,
      heal,
      block,
      parry,
      start,
      move,
      defeated,
      swap,
    } = group;
    let round = parseTime(time);
    let healed = heal !== undefined ? 1 : 0;
    let hits = damage !== undefined ? 1 : 0;
    let cast = 0;
    let miss = 0;
    let dodged = 0;
    let blocked = block !== undefined ? 1 : 0;
    let parried = parry !== undefined ? 1 : 0;
    let crit = typ === "krit. Treffer" || typ === "exzellenter Treffer" ? 1 : 0;
    let attack = 0;
    let activate = 0;
    let dmg = parseInt(damage);
    switch (hit) {
      case constants.noParticipant:
        healed = 0;
        hits = 0;
        blocked = 0;
        parried = 0;
        crit = 0;
        activate++;
        break;
      case constants.backtracked:
        activate++;
        break;
      case "kein Schaden":
        hits++;
        attack++;
        dmg = 0;
        break;
      case "erfolgreich":
        cast++;
        attack++;
        break;
      case "misslingt":
      case "verfehlt":
        miss++;
        attack++;
        break;
      case "weicht aus":
        attack++;
        dodged++;
        break;
      default:
        attack++;
        break;
    }

    if (target === undefined && defeated === constants.defeated) target = participant;
    if (weapon === undefined) {
      if (move === constants.move) {
        weapon = constants.moveWeapon;
      }
      if (defeated === constants.defeated) {
        weapon = constants.defeatedWeapon;
      }
      if (swap === constants.swapMele || swap === constants.swapRanged) {
        weapon = constants.swapWeapon;
      }
      if (weapon === undefined) console.warn("undefined weapon in", group);
    }

    return {
      participant,
      weapon,
      target,
      round,
      time,
      start,
      hit: hits,
      miss,
      dodged,
      crit,
      cast,
      attack,
      activate,
      healed,
      blocked,
      parried,
      dmg,
      heal: parseInt(heal) | 0,
      block: parseInt(block) | 0,
      parry: parseInt(parry) | 0,
    };
  });
}
export type Round = { id?: string; start: string; round: number };
export type Aggregation = Numbers & {
  rounds: Round[];
  minDmg: number;
  maxDmg: number;
  minCrit: number;
  maxCrit: number;
  critPercent: number;
  missPercent: number;
  dodgedPercent: number;
  blockPercent: number;
  parryPercent: number;
};

export const groupByBattle = (rounds: Round[]) => Object.entries(groupBy(rounds, "start"));
export const roundsToString = (rounds: Round[]) => rounds.map(({ round }) => round).join(", ");

function ignoreForTotal(current: Data): boolean {
  return current.weapon !== undefined && current.weapon.startsWith("(");
}

function aggregateData(values: Data[]): Aggregation {
  const aggregated = values.reduce(
    (total: Aggregation, current: Data) => {
      total.rounds.push({
        id: `${current.start}-${current.round}`,
        start: current.start,
        round: current.round,
      });

      if (ignoreForTotal(current)) return total;

      if (current.crit === 1 && current.dmg >= 0) {
        total.minCrit = Math.min(total.minCrit, current.dmg);
        total.maxCrit = Math.max(total.maxCrit, current.dmg);
      } else if (current.dmg >= 0) {
        total.minDmg = Math.min(total.minDmg, current.dmg);
        total.maxDmg = Math.max(total.maxDmg, current.dmg);
      }
      total.hit += current.hit;
      total.healed += current.healed;
      total.miss += current.miss;
      total.dodged += current.dodged;
      total.crit += current.crit;
      total.cast += current.cast;
      total.attack += current.attack;
      total.activate += current.activate;
      total.dmg += current.dmg || 0;
      total.heal += current.heal;
      total.block += current.block;
      total.blocked += current.blocked;
      total.parried += current.parried;
      total.parry += current.parry;
      return total;
    },
    {
      rounds: [],
      hit: 0,
      miss: 0,
      dodged: 0,
      crit: 0,
      cast: 0,
      attack: 0,
      activate: 0,
      dmg: 0,
      minDmg: Infinity,
      maxDmg: 0,
      minCrit: Infinity,
      maxCrit: 0,
      heal: 0,
      healed: 0,
      block: 0,
      blocked: 0,
      parried: 0,
      parry: 0,
      critPercent: 0,
      missPercent: 0,
      dodgedPercent: 0,
      blockPercent: 0,
      parryPercent: 0,
    }
  );

  if (aggregated.minCrit === Infinity) aggregated.minCrit = 0;
  if (aggregated.minDmg === Infinity) aggregated.minDmg = 0;

  const { attack, hit, dodged, healed, miss, crit, cast, blocked, parried } = aggregated;
  aggregated.missPercent = (miss / attack) * 100 || 0;
  aggregated.dodgedPercent = (dodged / (attack - miss)) * 100 || 0;
  aggregated.critPercent = (crit / (hit + healed)) * 100 || 0;
  aggregated.blockPercent = (blocked / hit) * 100 || 0;
  aggregated.parryPercent = (parried / hit) * 100 || 0;

  aggregated.rounds = Array.from(
    new Map(aggregated.rounds.map((item) => [item.id, item])).values()
  );

  return aggregated;
}

export type GroupBy = (keyof Data)[];
export type OrderBy = "asc" | "desc";
export type Group = Aggregation & {
  group: keyof Data;
  children: Report | Array<Data>;
};
export type Report = Record<string, Group>;

function aggregate(data: Data[], [group, ...groups]: GroupBy): Report {
  return chain(data)
    .groupBy(group)
    .mapValues((values) => ({
      ...aggregateData(values),
      group,
      children: isEmpty(groups) ? values : aggregate(values, groups),
    }))
    .value();
}

export type OrderKey = keyof Aggregation;
export type OrderFunc = (item: Aggregation) => OrderKey | number;
export type Order = OrderKey | OrderFunc;

export function orderReport(input: Report, order: [Order, OrderBy][] = [["dmg", "desc"]]): Report {
  const [iteratees, orders] = unzip(order) as [Order[], OrderBy[]];
  const unsorted: [string, Group][] = Object.entries(input).map(([key, { children, ...rest }]) => [
    key,
    {
      ...rest,
      children: isArray(children) ? children : orderReport(children, order),
    },
  ]);

  const objectEntriesIterees = zipWith(iteratees, (iteratee) =>
    typeof iteratee === "string"
      ? `1.${iteratee}`
      : ([, values]: [string, Group]) => iteratee(values)
  );
  const pairs = orderBy(unsorted, objectEntriesIterees, orders);
  const summary = fromPairs(pairs);
  return summary;
}

export default function reporter(
  input: string,
  groupBy: GroupBy = ["participant", "weapon"],
  showBandaging = false
): [Report, Loot, string[], Loot, string[]] {
  const { categories, groups, loot, value, descriptions } = parseBattles(
    parseInput(input, showBandaging)
  );
  const data = parseRegexGroups(backtrackCaster(groups));
  const aggregation = aggregate(data, groupBy);
  return [aggregation, loot, categories, value, descriptions];
}
