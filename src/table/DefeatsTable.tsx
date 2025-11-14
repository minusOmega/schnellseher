import React, { useMemo, useState } from "react";
import { OrderFunc, ParticipantStats, Sortable } from "../reporter/reporter";
import { Cell, Header } from "./Cell";
import { FilterColumn } from "./Column";
import { ContentsRow } from "./ContentsRow";
import { Body, Head, Table } from "./Table";
import { orderBy } from "lodash";
import { styled } from "@mui/material";

type Defeat = { name: string; stufe: string; count: number };
type DefeatWithDmg = Defeat & { dmgMin?: number; dmgMax?: number };

const Container = styled("div")({
  display: "flex",
  margin: "8px 8px 8px 48px",
});

export const DefeatsTable = ({
  participants,
  defeatsByKey,
  damageBeforeByKey,
  damageBefore,
  defeats,
  showMonster,
}: {
  participants: Record<string, ParticipantStats>;
  defeatsByKey: Record<string, number>;
  damageBeforeByKey: Record<string, number[]>;
  damageBefore: Record<string, number[]>;
  defeats: Record<string, number>;
  showMonster: boolean;
}) => {
  const aggregatedDefeatsByTargetKey = useMemo(() => {
    const out: Record<string, number> = {};
    const participantKeys = Object.keys(participants || {});
    const isMonsterFor = (normalized: string) =>
      participantKeys.some(
        (k) => k.replace(/ #\d+$/g, "") === normalized && /#\d+$/.test(k)
      );
    if (defeatsByKey) {
      for (const [srcKey, val] of Object.entries(defeatsByKey)) {
        const [normalized, stufe] = srcKey.split("|");
        const targetKey = isMonsterFor(normalized)
          ? `${normalized}|${stufe}`
          : `${normalized}|`;
        out[targetKey] = (out[targetKey] || 0) + val;
      }
    }
    return out;
  }, [defeatsByKey, participants]);

  const aggregatedDamageByTargetKey = useMemo(() => {
    const out: Record<string, number[]> = {};
    const participantKeys = Object.keys(participants || {});
    const isMonsterFor = (normalized: string) =>
      participantKeys.some(
        (k) => k.replace(/ #\d+$/g, "") === normalized && /#\d+$/.test(k)
      );
    if (damageBeforeByKey) {
      for (const [srcKey, arr] of Object.entries(damageBeforeByKey)) {
        const [normalized, stufe] = srcKey.split("|");
        const targetKey = isMonsterFor(normalized)
          ? `${normalized}|${stufe}`
          : `${normalized}|`;
        out[targetKey] = (out[targetKey] || []).concat(arr || []);
      }
    }
    // also include base per-normalized damageBefore into the normalized target key
    for (const [normalized, arr] of Object.entries(damageBefore || {})) {
      const targetKey = `${normalized}|`;
      out[targetKey] = (out[targetKey] || []).concat(arr || []);
    }
    return out;
  }, [damageBeforeByKey, damageBefore, participants]);

  const [defeatsSort, setDefeatsSort] = useState<Sortable<DefeatWithDmg>>([]);

  const computeDefeats = React.useCallback(
    (participants: Record<string, any>): Defeat[] => {
      const results: Defeat[] = [];
      const map = new Map<
        string,
        { normalized: string; stufen: Set<number | string>; count: number }
      >();
      const participantKeys = Object.keys(participants || {});
      const isMonsterFor = (normalized: string) =>
        participantKeys.some(
          (k) => k.replace(/ #\d+$/g, "") === normalized && /#\d+$/.test(k)
        );

      // add participant-derived entries, but map to targetKey: include stufe only for monsters
      for (const [instanceName, stats] of Object.entries(participants || {})) {
        const normalized = instanceName.replace(/ #\d+$/, "");
        const stufeStr = stats && stats.stufe ? `${stats.stufe}` : "";
        const targetKey = isMonsterFor(normalized)
          ? `${normalized}|${stufeStr}`
          : `${normalized}|`;
        const stufeNum = parseInt(stufeStr, 10);
        const entry = map.get(targetKey) || {
          normalized,
          stufen: new Set<number | string>(),
          count: 0,
        };
        if (!Number.isNaN(stufeNum)) entry.stufen.add(stufeNum);
        else if (stufeStr) entry.stufen.add(stufeStr);
        map.set(targetKey, entry);
      }

      // ensure keys from aggregated defeatsByTargetKey are present
      for (const key of Object.keys(aggregatedDefeatsByTargetKey || {})) {
        if (!map.has(key)) {
          const [normalized, stufeStr] = key.split("|");
          const entry = {
            normalized,
            stufen: new Set<number | string>(),
            count: 0,
          };
          const stufeNum = parseInt(stufeStr, 10);
          if (!Number.isNaN(stufeNum)) entry.stufen.add(stufeNum);
          else if (stufeStr) entry.stufen.add(stufeStr);
          map.set(key, entry);
        }
      }

      // compute counts per target key using aggregatedDefeatsByTargetKey first, then falls back to normalized defeats
      for (const [key, entry] of map.entries()) {
        const [normalized] = key.split("|");
        let count = 0;
        if (aggregatedDefeatsByTargetKey && aggregatedDefeatsByTargetKey[key])
          count += aggregatedDefeatsByTargetKey[key];
        else if (defeats && defeats[normalized]) count += defeats[normalized];
        entry.count = count;
      }

      // also add any normalized-only defeats that have no entry yet
      if (defeats) {
        for (const [normalized, cnt] of Object.entries(defeats)) {
          const has = Array.from(map.keys()).some((k) =>
            k.startsWith(`${normalized}|`)
          );
          if (!has) {
            const key = `${normalized}|`;
            const entry = {
              normalized,
              stufen: new Set<number | string>(),
              count: cnt,
            };
            map.set(key, entry);
          }
        }
      }

      for (const [key, { normalized, stufen, count }] of map.entries()) {
        let stufeStr = key.split("|")[1] || "";
        if (stufeStr === "") {
          if (stufen.size === 0) stufeStr = "";
          else if (stufen.size === 1) stufeStr = `${Array.from(stufen)[0]}`;
          else {
            const arr = Array.from(stufen)
              .map((v) => (typeof v === "number" ? v : parseInt(`${v}`, 10)))
              .sort((a, b) => a - b);
            stufeStr = `${arr[0]}-${arr[arr.length - 1]}`;
          }
        }
        results.push({ name: normalized, stufe: stufeStr, count });
      }

      return results;
    },
    [defeats, aggregatedDefeatsByTargetKey]
  );

  const damageBeforeMap = useMemo(() => damageBefore || {}, [damageBefore]);
  const damageBeforeByKeyMap = useMemo(
    () => (typeof damageBeforeByKey !== "undefined" ? damageBeforeByKey : {}),
    [damageBeforeByKey]
  );
  const defeatsData = useMemo(
    () => computeDefeats(participants),
    [computeDefeats, participants]
  );

  const withDamage = useMemo(() => {
    return defeatsData.map((d) => {
      const key = `${d.name}|${d.stufe}`;
      const arrAgg = aggregatedDamageByTargetKey[key] || [];
      const arrKey = damageBeforeByKeyMap[key] || [];
      const arrBase = damageBeforeMap[d.name] || [];
      const arr =
        arrAgg.length > 0 ? arrAgg : arrKey.length > 0 ? arrKey : arrBase;
      if (arr.length === 0) return { ...d } as DefeatWithDmg;
      const positives = arr.filter((v) => v > 0).sort((a, b) => a - b);
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      const dmgMin = positives.length > 0 ? positives[0] : min;
      return { ...d, dmgMin, dmgMax: max } as DefeatWithDmg;
    });
  }, [
    defeatsData,
    damageBeforeMap,
    damageBeforeByKeyMap,
    aggregatedDamageByTargetKey,
  ]);

  const sortedDefeats = useMemo(() => {
    if (defeatsSort.length === 0) return withDamage;
    const { group, by, func } = defeatsSort[0] as any;
    return orderBy(withDamage as any[], [func ? func : (group as any)], [by]);
  }, [withDamage, defeatsSort]);

  const visibleDefeats = useMemo(() => {
    if (showMonster) return sortedDefeats;
    if (!participants) return sortedDefeats;
    return sortedDefeats.filter((d) => {
      // detect if original participants contained numbered instances for this normalized name
      return !Object.keys(participants).some((k) => {
        const base = k.replace(/ #\d+$/g, "");
        return base === d.name && /#\d+$/.test(k);
      });
    });
  }, [sortedDefeats, showMonster, participants]);

  const changeDefeatsSort = (
    group: keyof DefeatWithDmg,
    func?: OrderFunc<DefeatWithDmg>
  ) => {
    const ordered = defeatsSort.find((s) => s.group === (group as any));
    if (!ordered)
      setDefeatsSort([{ group: group as any, by: "desc", func: func as any }]);
    else if (ordered.by === "desc")
      setDefeatsSort([{ group: group as any, by: "asc", func: func as any }]);
    else setDefeatsSort([]);
  };

  const defeatsFilterBy = (
    name: keyof DefeatWithDmg,
    func?: OrderFunc<DefeatWithDmg>
  ) => ({
    name,
    func,
    order: defeatsSort.find(({ group }) => group === (name as any))?.by,
    pos: defeatsSort.findIndex(({ group }) => group === (name as any)),
    onChange: (_: keyof DefeatWithDmg, f?: OrderFunc<DefeatWithDmg>) =>
      changeDefeatsSort(name, f || func),
  });

  const stufeOrder: OrderFunc<Defeat> = ({ stufe }) => {
    let number = parseInt(stufe, 10);
    if (!Number.isNaN(number)) return number;
    else {
      const m = stufe.match(/^(\d+)(?:-(\d+))?$/);
      if (m) return parseInt(m[1], 10);
      return 0;
    }
  };

  return (
    <Container>
      <Table cols={4}>
        <Head>
          <ContentsRow>
            {/* <Column></Column> */}
            <FilterColumn stickyIndex={1} {...defeatsFilterBy("name")}>
              Angreifer & Verteidiger
            </FilterColumn>
            <FilterColumn
              stickyIndex={1}
              {...defeatsFilterBy("stufe", stufeOrder)}
            >
              Stufe
            </FilterColumn>
            <FilterColumn stickyIndex={1} {...defeatsFilterBy("count")}>
              Besiegt
            </FilterColumn>
            <FilterColumn
              stickyIndex={1}
              {...defeatsFilterBy("dmgMin", (d: any) => d.dmgMin ?? 0)}
            >
              Schaden
            </FilterColumn>
          </ContentsRow>
        </Head>
        <Body>
          {visibleDefeats.map((d: any) => {
            const isMonster =
              participants &&
              Object.keys(participants).some(
                (k) => k.replace(/ #\d+$/g, "") === d.name && /#\d+$/.test(k)
              );
            const dmg = d.dmgMin !== undefined ? `${d.dmgMin}` : "";
            const rowKey = `${d.name}|${d.stufe}`;
            return (
              <ContentsRow key={rowKey}>
                <Header variant={isMonster ? "normal" : "highlight"}>
                  {d.name}
                </Header>
                <Cell variant={isMonster ? "normal" : "highlight"}>
                  {d.stufe}
                </Cell>
                <Cell variant={isMonster ? "normal" : "highlight"}>
                  {d.count}
                </Cell>
                <Cell variant={isMonster ? "normal" : "highlight"}>{dmg}</Cell>
              </ContentsRow>
            );
          })}
        </Body>
      </Table>
    </Container>
  );
};
