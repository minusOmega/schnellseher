import React, { useState } from "react";
import { IconButton, styled, Tooltip } from "@mui/material";
import { groupByBattle, roundsToString, Group } from "../reporter/reporter";
import { ContentsRow } from "./ContentsRow";
import { Cell, Header } from "./Cell";
import { ExpanderArrow } from "./Icons";

const colorMap: { [key: string]: string } = {
  start: "rgb(224,224,224)",
  participant: "white",
  target: "rgb(230,240,245)",
  weapon: "rgb(230,250,245)",
  undefined: "white",
};

const TooltipText = styled("span")({
  borderBottom: "1px dotted black",
});

const Spaced = styled("span")({
  display: "flex",
  justifyContent: "space-around",
});

const Percent = styled("span")({
  minWidth: "3em",
  textAlign: "end",
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
  critPercent,
  cast,
  attack,
  miss,
  missPercent,
  dodged,
  dodgedPercent,
  heal,
  blockPercent,
  parryPercent,
  blocked,
  parried,
}: Group) {
  const groupedRounds = groupByBattle(rounds);
  return (
    <>
      <Cell backgroundColor={colorMap[group]}>
        <Tooltip
          title={
            <>
              {groupedRounds.length === 1
                ? roundsToString(rounds)
                : groupedRounds.map(([key, value]) => (
                    <p>{`${key.split(" ").at(-1)}: [${roundsToString(value)}]`}</p>
                  ))}
            </>
          }
          arrow
        >
          <TooltipText>{rounds.length}</TooltipText>
        </Tooltip>
      </Cell>
      <Cell backgroundColor={colorMap[group]}>{heal}</Cell>
      <Cell backgroundColor={colorMap[group]}>
        {dmg} ({block + parry})
      </Cell>

      <Cell backgroundColor={colorMap[group]}>{(dmg / rounds.length).toFixed(1)}</Cell>
      <Cell backgroundColor={colorMap[group]}>
        {minDmg}-{maxDmg}
      </Cell>
      <Cell backgroundColor={colorMap[group]}>
        {minCrit}-{maxCrit}
      </Cell>
      <Cell backgroundColor={colorMap[group]}> {attack}</Cell>
      <Cell backgroundColor={colorMap[group]}>
        <Spaced>
          <Percent>
            {Number.isFinite(missPercent) ? missPercent.toFixed(1) + "%" : "Fehler"}
          </Percent>
          <span>({miss})</span>
        </Spaced>
      </Cell>
      <Cell backgroundColor={colorMap[group]}>
        <Spaced>
          <Percent>
            {Number.isFinite(dodgedPercent) ? dodgedPercent.toFixed(1) + "%" : "Fehler"}
          </Percent>
          <span>({dodged})</span>
        </Spaced>
      </Cell>
      <Cell backgroundColor={colorMap[group]}>
        {cast > 0 ? (
          <Tooltip title={`${hit} Treffer + ${cast} erfolgreiche Rundenzauber`}>
            <TooltipText>
              {hit} + {cast}
            </TooltipText>
          </Tooltip>
        ) : (
          hit
        )}
      </Cell>
      <Cell backgroundColor={colorMap[group]}>
        <Spaced>
          <Percent>
            {Number.isFinite(critPercent) ? critPercent.toFixed(1) + "%" : "Fehler"}
          </Percent>
          <span>({crit})</span>
        </Spaced>
      </Cell>
      <Cell backgroundColor={colorMap[group]}>
        <Spaced>
          <Percent>
            {Number.isFinite(blockPercent) ? blockPercent.toFixed(1) + "%" : "Fehler"}
          </Percent>
          <span>({blocked})</span>
        </Spaced>
      </Cell>
      <Cell backgroundColor={colorMap[group]}>
        <Spaced>
          <Percent>
            {Number.isFinite(parryPercent) ? parryPercent.toFixed(1) + "%" : "Fehler"}
          </Percent>
          <span>({parried})</span>
        </Spaced>
      </Cell>
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
              <ExpanderArrow expand={+expand} fontSize="inherit" />
            </IconButton>
          )}
        </Cell>
        <Header
          whiteSpace={values.group !== "weapon" ? "nowrap" : undefined}
          backgroundColor={colorMap[values.group]}
        >
          {by}
        </Header>
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
