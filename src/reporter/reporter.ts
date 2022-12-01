import {
  chain,
  isEmpty,
  unzip,
  zipWith,
  orderBy,
  isArray,
  fromPairs,
  groupBy,
} from "lodash";

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

type Battles = {
  start: string;
  input: string;
}[];

type RawData = RegexGroups & {
  start: string;
};

export function parseInput(input: string) {
  const regex = /((?<=Kampfinformationen \[Kampfbeginn: ).*(?=]))/g;
  const battles: Battles = [];
  const split = input.split(/(Kampfinformationen \[Kampfbeginn: .*])/g);
  battles.push({ start: "Kampfinformationen", input: split[0] });
  for (let index = 0; index < split.length; index++) {
    const element = split[index];
    const match = regex.exec(element);
    if (match) {
      battles.push({ start: match[0], input: split[index + 1] });
    }
  }

  return battles;
}

export function parseBattles(battles: Battles): RawData[] {
  const groups: RawData[] = [];

  battles.forEach(({ input, start }) => {
    let regex =
      /(?<time>\d+:\d\d) (?<participant>[A-ZÄÖÜß][a-zäöü]+(?=\W)(?:\s#\d|(?:\s|-)[A-ZÄÖÜß][a-zäöü]+|){1,2})?(?:.+)(?<weapon>(?<=\[).+?(?=\]))(?:]\s(?:(?!versorgt)[a-z]+\s){1,2})(?<target>[A-ZÄÖÜß][a-zäöü]+(?=\W)(?:\s#\d|(?:\s|-)[A-ZÄÖÜß][a-zäöü]+|){1,2})(?:.*?: )(?:(?:verursacht (?<damage>\d+))|(?:heilt (?<heal>\d+)))?(?<hit>[a-z]+\s?[A-Za-z]+?(?=\.| ))?(?:\s[a-zA-Z]+\s\()?(?<typ>(?<=\()exzellenter Treffer|krit. Treffer(?=\)))?(?:.+\()?(?:(?<block>(?<=\()\d+(?=\sSchaden geblockt\)\.))|(?<parry>(?<=\()\d+(?=\sSchaden pariert\)\.)))?/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input))) {
      if (match?.groups) {
        groups.push({ ...(match.groups as RegexGroups), start });
      }
    }
  });
  return groups;
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
  return groups.map((element) => {
    if (element.participant) return element;
    const predecessor = getPredecessorIfCaster(element, groups);
    if (predecessor && predecessor.participant) {
      return { ...element, participant: predecessor.participant };
    } else {
      const match = dot.find(({ time, weapon, target }) => {
        if (weapon !== element.weapon) return false;
        if (target !== element.target) return false;
        return element.time.localeCompare(time) >= 0;
      });
      if (match) {
        const result = { ...element, participant: match.participant };
        return result;
      } else
        console.error(`Cannot find participant for ${JSON.stringify(element)}`);
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
  miss: number;
  dodged: number;
  attack: number;
  block: number;
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
  const round = Math.floor(
    (parseInt(minutes) * 60 + parseInt(seconds)) / 24 + 1
  );
  return round;
}

export function parseRegexGroups(groups: RawData[]): Data[] {
  return groups.map(
    ({
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
    }) => {
      let round = parseTime(time);
      let hits = damage !== undefined ? 1 : heal !== undefined ? 1 : 0;
      let cast = 0;
      let miss = 0;
      let dodged = 0;
      let crit =
        typ === "krit. Treffer" || typ === "exzellenter Treffer" ? 1 : 0;
      let attack = 0;
      switch (hit) {
        case "kein Schaden":
          hits++;
          attack++;
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
        dmg: parseInt(damage) | 0,
        heal: parseInt(heal) | 0,
        block: parseInt(block) | 0,
        parry: parseInt(parry) | 0,
      };
    }
  );
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
};

export const groupByBattle = (rounds: Round[]) =>
  Object.entries(groupBy(rounds, "start"));
export const roundsToString = (rounds: Round[]) =>
  rounds.map(({ round }) => round).join(", ");

function aggregateData(values: Data[]): Aggregation {
  const aggregated = values.reduce(
    (total: Aggregation, current: Data) => {
      total.rounds.push({
        id: `${current.start}-${current.round}`,
        start: current.start,
        round: current.round,
      });
      if (current.crit === 1) {
        total.minCrit = Math.min(total.minCrit, current.dmg);
        total.maxCrit = Math.max(total.maxCrit, current.dmg);
      } else if (current.dmg > 0) {
        total.minDmg = Math.min(total.minDmg, current.dmg);
        total.maxDmg = Math.max(total.maxDmg, current.dmg);
      }
      total.hit += current.hit;
      total.miss += current.miss;
      total.dodged += current.dodged;
      total.crit += current.crit;
      total.cast += current.cast;
      total.attack += current.attack;
      total.dmg += current.dmg;
      total.heal += current.heal;
      total.block += current.block;
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
      dmg: 0,
      minDmg: Infinity,
      maxDmg: 0,
      minCrit: Infinity,
      maxCrit: 0,
      heal: 0,
      block: 0,
      parry: 0,
      critPercent: 0,
      missPercent: 0,
      dodgedPercent: 0,
    }
  );

  if (aggregated.minCrit === Infinity) aggregated.minCrit = 0;
  if (aggregated.minDmg === Infinity) aggregated.minDmg = 0;

  aggregated.critPercent = (aggregated.crit * 100) / aggregated.hit || 0;
  aggregated.missPercent = (aggregated.miss * 100) / aggregated.attack || 0;
  aggregated.dodgedPercent = (aggregated.dodged * 100) / aggregated.attack || 0;

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

export function orderReport(
  input: Report,
  order: [Order, OrderBy][] = [["dmg", "desc"]]
): Report {
  const [iteratees, orders] = unzip(order) as [Order[], OrderBy[]];
  const unsorted: [string, Group][] = Object.entries(input).map(
    ([key, { children, ...rest }]) => [
      key,
      {
        ...rest,
        children: isArray(children) ? children : orderReport(children, order),
      },
    ]
  );

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
  groupBy: GroupBy = ["participant", "weapon"]
): Report {
  const data = parseRegexGroups(
    backtrackCaster(parseBattles(parseInput(input)))
  );
  const aggregation = aggregate(data, groupBy);
  return aggregation;
}
