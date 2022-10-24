import React, { useState } from "react";
import { IconButton, styled, Tooltip } from "@mui/material";
import { groupByBattle, roundsToString, Group } from "../reporter/reporter";
import { ContentsRow } from "./ContentsRow";
import { Cell, Header } from "./Cell";
import { ExpanderArrow } from "./Icons";

const colorMap: { [key: string]: string } = {
  start: "rgb(230,240,245)",
  participant: "white",
  target: "rgb(230,240,245)",
  weapon: "rgb(230,250,245)",
  undefined: "white",
};

const TooltipText = styled("span")({
  borderBottom: "1px dotted black",
});

export function Aggregated({
  group,
  rounds,
  minDmg,
  maxDmg,
  minCrit,
  maxCrit,
  dmg,
  block,
  parry,
  hit,
  crit,
  cast,
  attack,
  miss,
  heal,
}: Group) {
  const groupedRounds = groupByBattle(rounds);
  return (
    <>
      <Cell backgroundColor={colorMap[group]}>
        {dmg} ({block + parry})
      </Cell>
      <Cell backgroundColor={colorMap[group]}>
        <Tooltip
          title={
            <>
              {groupedRounds.length === 1
                ? roundsToString(rounds)
                : groupedRounds.map(([key, value]) => (
                    <p>{`${key.split(" ").at(-1)}: [${roundsToString(
                      value
                    )}]`}</p>
                  ))}
            </>
          }
          arrow
        >
          <TooltipText>{rounds.length}</TooltipText>
        </Tooltip>
      </Cell>
      <Cell backgroundColor={colorMap[group]}>
        {(dmg / rounds.length).toFixed(1)}
      </Cell>
      <Cell backgroundColor={colorMap[group]}>
        {minDmg}-{maxDmg}
      </Cell>
      <Cell backgroundColor={colorMap[group]}>
        {minCrit}-{maxCrit}
      </Cell>
      <Cell backgroundColor={colorMap[group]}>{hit + cast}</Cell>
      <Cell backgroundColor={colorMap[group]}>
        {((crit * 100) / (attack - miss) || 0).toFixed(1)}%
      </Cell>
      <Cell backgroundColor={colorMap[group]}>
        {((miss * 100) / attack || 0).toFixed(1)}%
      </Cell>
      <Cell backgroundColor={colorMap[group]}>{heal}</Cell>
    </>
  );
}

export function Row({
  by,
  values,
  isExpanded = false,
  showMonster = false,
}: {
  by: string;
  values: Group;
  isExpanded?: boolean;
  showMonster?: boolean;
}) {
  const [expand, setExpand] = useState(isExpanded);
  if (!showMonster && by.includes("#")) return <></>;
  return (
    <>
      <ContentsRow key={by + expand}>
        <Cell backgroundColor={colorMap[values.group]}>
          {!Array.isArray(values.children) && (
            <IconButton onClick={() => setExpand(!expand)} size="small">
              {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
              <ExpanderArrow expand={+expand} />
            </IconButton>
          )}
        </Cell>
        <Header backgroundColor={colorMap[values.group]}>{by}</Header>
        <Aggregated {...values} />
      </ContentsRow>
      {expand &&
        !Array.isArray(values.children) &&
        Object.entries(values.children).map(([by, values]) => (
          <Row
            key={by + isExpanded}
            by={by}
            values={values}
            isExpanded={isExpanded}
            showMonster={showMonster}
          />
        ))}
    </>
  );
}
