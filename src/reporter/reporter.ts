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
  uvp: "# UVP",
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

function splitAtFirstOccurrence(str: string, word: string): [string, string] {
  const index = str.indexOf(word);
  if (index === -1) {
    return [str, ""];
  }

  const newlineIndex = str.lastIndexOf("\n", index);
  const firstPart = str.substring(0, newlineIndex);
  const secondPart = str.substring(newlineIndex);
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
      const [before] = splitAtFirstOccurrence(battle, "versorgt");
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
  /[A-ZÄÖÜß][a-zäöüßA-Z´]+(?:(?:(?: |-)[a-zäöüßA-Z]+){0,2}(?:(?: |-)[A-ZÄÖÜß][a-zäöüßA-Z]+){0,2}(?:(?: |-)[A-ZÄÖÜß][a-zäöüßA-Z]+))?/
    .source;
const participantOrMonsterPattern = new RegExp(`${participant}(?: #\\d+)?`)
  .source;
const spacer = /[ \t]+/.source;
const lootPattern = /\d[^\t\n]*[a-z|)]/.source;
const valuePattern = /\d* [^\n\t]*/.source;
const timePattern = /\d+:\d\d/.source;
const weaponPattern = /(?<=\[).+?(?=\])/.source;
const numbersPattern = /\d+/.source;
const hitPattern = /[a-z]+\s?[A-Za-z]+?(?=\.| )/.source;
const typPattern = /(?<=\()exzellenter Treffer|krit. Treffer(?=\))/.source;
const blockPattern = /(?<=\()\d+(?=\sSchaden geblockt\)\.)/.source;
const parryPattern = /(?<=\()\d+(?=\sSchaden pariert\)\.)/.source;
let battleLinePattern = new RegExp(
  `(?<time>${timePattern}) (?<participant>${participantOrMonsterPattern})?(?: (?<move>nähert sich) | (?<defeated>sinkt kampfunfähig zu Boden)| (?<swap>wechselt in den (?:Nahkampf|Fernkampf))|(?:(?:.+)(?<weapon>${weaponPattern})(?:]\\s(?:[a-z]+\\s){1,2})))(?<target>${participantOrMonsterPattern})?(?:.*?: )?(?:(?:verursacht (?<damage>${numbersPattern}))|(?:heilt (?<heal>${numbersPattern})))?(?<hit>${hitPattern})?(?:\\s[a-zA-Z]+\\s\\()?(?<typ>${typPattern})?(?:.+\\()?(?:(?<block>${blockPattern})|(?<parry>${parryPattern}))?`,
  "g"
);

export type ParticipantStats = {
  name: string;
  stufe: string;
  status: string;
  lp: string;
  exp?: number;
  round?: number;
};

function parseParticipants({
  input,
}: Battle): Record<string, ParticipantStats> {
  const regex =
    /^\[\?\]\s+(?<name>.*?)\s+(?<stufe>\d+)\s+(?<status>\S+)(?:\s+(?<lp>\d+%(?:\s+\+\d+%)?))?(?:\s+(?<exp>\d+\.?\d+))?/gm;
  const results: Record<string, ParticipantStats> = {};

  for (const match of input.matchAll(regex)) {
    if (match?.groups?.name) {
      let participant: ParticipantStats = {
        name: match.groups.name,
        stufe: match.groups.stufe,
        status: match.groups.status,
        lp: match.groups.lp,
      };
      if (match.groups.exp) participant["exp"] = parseFloat(match.groups.exp);
      results[participant.name] = participant;
    }
  }

  if (isEmpty(results)) return results;

  let maxRound = 0;
  for (const match of input.matchAll(/^Runde\s+(\d+)/gm)) {
    const r = parseInt(match[1], 10);
    if (r > maxRound) maxRound = r;
  }

  for (const match of input.matchAll(
    // /^(?<time>\d+:\d\d)\s+(?<name>.+?)\s+sinkt kampfunfähig zu Boden\./gm
    /^(?<prev>.+)\r?\n(?<time>\d+:\d\d)\s+(?<name>.+?)\s+sinkt kampfunfähig zu Boden\./gm
  )) {
    if (match?.groups) {
      const defeatedName = match.groups.name.trim();
      console.warn(
        `checking defeat for ${defeatedName} at ${match.groups.time}`
      );
      const round = parseTime(match.groups.time);
      if (toRound(parseTimeToSeconds(match.groups.time) - 1) < round) {
        if (/Runde \d+/.test(match.groups.prev)) {
          console.log(`defeat at round transition ${match.groups.prev}`);
          results[defeatedName].round = round - 1;
          continue;
        }

        let foundEarlier = false;
        const inputBefore = input.substring(0, match.index) + match.groups.prev;
        for (const matchTime of inputBefore.matchAll(
          RegExp(`^${match.groups.time}\\s+.*$`, "gm")
        )) {
          if (!matchTime) continue;
          const line = battleLinePattern.exec(matchTime[0]);
          if (!line?.groups?.target) continue;
          if (line?.groups?.target === defeatedName) {
            foundEarlier = true;
            console.log(
              `found matching target for ${defeatedName}`,
              line?.groups
            );
          } else {
            console.log(
              `${line?.groups?.target} does not match ${defeatedName}`,
              line?.groups
            );
          }
        }

        if (!foundEarlier) {
          console.log("no valid target found earlier, adjusting round");
          results[defeatedName].round = round - 1;
          continue;
        }
      }

      results[match.groups.name.trim()].round = round;
    }
  }

  for (const participant in results) {
    if (!results[participant].round) results[participant].round = maxRound;
  }

  return results;
}

function parseLoot({ input }: Battle): { value: Loot; loot: Loot; uvp: Loot } {
  let regex = new RegExp(
    `^(?!Sieger${spacer}Beuteverteilung)(?<participant>${participant})${spacer}(?<loot>${lootPattern})\\s+(?<uvp>\\d*)(?:\\n|${spacer}(?<value>${valuePattern}))?`,
    "gm"
  );
  let match: RegExpExecArray | null;
  let collectedLoot: Loot = {};
  let collectedUVP: Loot = {};
  let collectedValue: Loot = {};
  while ((match = regex.exec(input))) {
    if (match?.groups) {
      const { participant, loot, value, uvp } = match.groups;
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

      const sum = parseInt(uvp);
      if (Number.isNaN(sum)) {
      } else if (collectedUVP[participant])
        collectedUVP[participant][constants.uvp] = sum || 0;
      else collectedUVP[participant] = { [constants.uvp]: sum || 0 };
      collectedValue = (value || "")
        .replace(/^\t+/, "")
        .split(", ")
        .reduce(collect, collectedValue);
      collectedLoot = loot.split(", ").reduce(collect, collectedLoot);
    }
  }
  return { loot: collectedLoot, value: collectedValue, uvp: collectedUVP };
}

export function parseBattles(
  battles: Battles,
  apPerRound = 2
): {
  groups: RawData[];
  value: [Loot, string[]];
  loot: [Loot, string[]];
  exp: [Loot, string[]];
  participants: Record<string, ParticipantStats>;
  defeats: Record<string, number>;
  defeatsByKey: Record<string, number>;
  damageBefore: Record<string, number[]>;
  damageBeforeByKey: Record<string, number[]>;
} {
  const SUM = "# Summe";
  const ROUNDS = "Runden";
  const EXP = "EXP";
  const EXP_ROUND = `# EXP pro ${apPerRound > 1 ? "AP" : "Runde"}`;
  const UVP_ROUND = `# UVP pro ${apPerRound > 1 ? "AP" : "Runde"}`;
  const groups: RawData[] = [];
  const allLoot: Loot[] = [];
  const values: Loot[] = [];
  const uvps: Loot[] = [];
  const allExp: Loot[] = [];
  let rounds: number = 0;
  const participantsAll: Record<string, ParticipantStats> = {};
  const defeats: Record<string, number> = {};
  const defeatsByKey: Record<string, number> = {};
  const damageBefore: Record<string, number[]> = {};
  const damageBeforeByKey: Record<string, number[]> = {};
  battles.forEach((battle) => {
    const { input, start } = battle;
    const { loot, value, uvp } = parseLoot(battle);
    const participants = parseParticipants(battle);
    for (const [name, stats] of Object.entries(participants)) {
      if (!participantsAll[name]) participantsAll[name] = stats;
    }
    allExp.push(
      Object.fromEntries(
        Object.entries(participants)
          .filter(([, stats]) => stats.exp)
          .map(([name, stats]) => {
            return [
              name,
              { [EXP]: stats.exp || 0, [ROUNDS]: stats.round || 0 },
            ];
          })
      )
    );
    rounds += battle.round;
    allLoot.push(loot);
    values.push(value);
    uvps.push(uvp);
    // track cumulative damage per instance within this battle
    const cumulative: Record<string, number> = {};
    let match: RegExpExecArray | null;
    while ((match = battleLinePattern.exec(input))) {
      if (match?.groups) {
        const g = { ...(match.groups as RegexGroups), start };
        groups.push(g);

        // accumulate damage/heal for the target instance
        const targetName = (g.target || "").trim();
        const dmg = g.damage ? parseInt(g.damage, 10) : 0;
        const heal = g.heal ? parseInt(g.heal, 10) : 0;
        if (targetName) {
          if (!Number.isNaN(dmg) && dmg !== 0)
            cumulative[targetName] = (cumulative[targetName] || 0) + dmg;
          if (!Number.isNaN(heal) && heal !== 0)
            cumulative[targetName] = (cumulative[targetName] || 0) - heal;
        }

        // count defeated occurrences: participant is the name that sinks
        if (g.defeated) {
          const name = (g.participant || "").trim();
          if (name) {
            const normalized = name.replace(/ #\d+$/, "");
            // base defeats aggregated by normalized name (compat)
            defeats[normalized] = (defeats[normalized] || 0) + 1;
            const before = cumulative[name] || 0;
            if (!damageBefore[normalized]) damageBefore[normalized] = [];
            damageBefore[normalized].push(before);

            // attempt to find stufe for this instance from participants map
            const stufe =
              participants[name] && participants[name].stufe
                ? participants[name].stufe
                : "";
            const key = `${normalized}|${stufe}`;
            defeatsByKey[key] = (defeatsByKey[key] || 0) + 1;
            if (!damageBeforeByKey[key]) damageBeforeByKey[key] = [];
            damageBeforeByKey[key].push(before);

            // reset cumulative for this instance after defeat
            cumulative[name] = 0;
          }
        }
      }
    }
  });

  const collect = (input: Loot[], name?: string): [Loot, string[]] => {
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

    if (name && !isEmpty(sum)) output[name] = sum;
    return [output, names];
  };

  const loot = collect(allLoot.concat(uvps), SUM);
  const value = collect(values, SUM);
  let exp = collect(allExp);
  for (const participant in exp[0]) {
    exp[0][participant][EXP_ROUND] =
      exp[0][participant][EXP] /
      (exp[0][participant][ROUNDS] || 1) /
      apPerRound;
    if (loot[0][participant])
      loot[0][participant][UVP_ROUND] =
        loot[0][participant][constants.uvp] /
        (exp[0][participant][ROUNDS] || 1) /
        apPerRound;
  }
  if (loot[0][SUM]) {
    loot[0][SUM][UVP_ROUND] =
      loot[0][SUM][constants.uvp] /
      (rounds || 1) /
      (Object.entries(loot[0]).length - 1) /
      apPerRound;
    loot[1].push(UVP_ROUND);
  }
  if (Object.entries(exp[0]).length > 0) exp[1].push(EXP_ROUND);
  return {
    groups,
    value,
    loot,
    exp,
    participants: participantsAll,
    defeats,
    defeatsByKey,
    damageBefore,
    damageBeforeByKey,
  };
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
    const previous = groups[index - 1];
    switch (element.weapon) {
      case "Letztes Aufgebot":
      case "Vampirismus":
        return {
          ...element,
          participant: element.target,
          hit: constants.noParticipant,
        };
      case "Bluttransfer":
        return {
          ...element,
          participant: previous.target,
          hit: constants.noParticipant,
        };
      case "Blutritual":
        return {
          ...element,
          participant: previous.participant,
          hit: constants.noParticipant,
        };
      default:
        const predecessor = getPredecessorIfCaster(element, groups);
        if (predecessor && predecessor.participant) {
          return {
            ...element,
            participant: predecessor.participant,
            hit: constants.backtracked,
          };
        } else {
          const match = dot.find(({ time, weapon, target }) => {
            if (weapon !== element.weapon) return false;
            if (target !== element.target) return false;
            return element.time.localeCompare(time) >= 0;
          });
          if (match)
            return {
              ...element,
              participant: match.participant,
              hit: constants.backtracked,
            };
          else {
            console.error(
              `Cannot find participant for ${JSON.stringify(element)}`
            );
          }
        }
    }
    return element;
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

function parseTimeToSeconds(time: string): number {
  const [minutes, seconds] = time.split(":");
  return parseInt(minutes) * 60 + parseInt(seconds);
}

function toRound(seconds: number): number {
  return Math.floor(seconds / 24 + 1);
}

function parseTime(time: string): number {
  return toRound(parseTimeToSeconds(time));
}

export function parseRegexGroups(groups: RawData[]): Data[] {
  let previousData: Data | null = null;
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

    if (target === undefined && defeated === constants.defeated) {
      target = participant;
      if (
        previousData &&
        previousData.target === participant &&
        previousData.participant
      ) {
        participant = previousData.participant;
      }
    }
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

    const data = {
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
    previousData = data;
    return data;
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

export const groupByBattle = (rounds: Round[]) =>
  Object.entries(groupBy(rounds, "start"));
export const roundsToString = (rounds: Round[]) =>
  rounds.map(({ round }) => round).join(", ");

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

  const { attack, hit, dodged, healed, miss, crit, blocked, parried } =
    aggregated;
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
export type ReportType = "ausgeteilt" | "erhalten";
export type Sortable<T> = {
  group: keyof T;
  by: OrderBy;
  func?: OrderFunc<T>;
}[];
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

export type OrderFunc<T> = (item: T) => keyof T | number;
export type Order<T> = keyof T | OrderFunc<T>;
export function orderReport(
  input: Report,
  order: [Order<Aggregation>, OrderBy][] = [["dmg", "desc"]]
): Report {
  const [iteratees, orders] = unzip(order) as [Order<Aggregation>[], OrderBy[]];
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
  groupBy: GroupBy = ["participant", "weapon", "target"],
  showBandaging = false,
  apPerRound = 2
): [
  Report,
  Loot,
  string[],
  Loot,
  string[],
  Loot,
  string[],
  Record<string, ParticipantStats>,
  Record<string, number>,
  Record<string, number[]>,
  Record<string, number>,
  Record<string, number[]>
] {
  const {
    groups,
    loot,
    value,
    exp,
    participants,
    defeats,
    defeatsByKey,
    damageBefore,
    damageBeforeByKey,
  } = parseBattles(parseInput(input, showBandaging), apPerRound);
  const [values, descriptions] = value;
  const [loots, categories] = loot;
  const [exps, info] = exp;
  const data = parseRegexGroups(backtrackCaster(groups));
  const aggregation = aggregate(data, groupBy);
  return [
    aggregation,
    loots,
    categories,
    values,
    descriptions,
    exps,
    info,
    participants,
    defeats,
    damageBefore || {},
    defeatsByKey || {},
    damageBeforeByKey || {},
  ];
}
