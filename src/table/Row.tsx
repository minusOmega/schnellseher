import React, { useState } from "react";
import { IconButton, styled, Tooltip } from "@mui/material";
import { groupByBattle, roundsToString, Group } from "../reporter/reporter";
import { ContentsRow } from "./ContentsRow";
import { Cell, Header } from "./Cell";
import { ExpanderArrow } from "./Icons";

const colorMap: { [key: string]: string } = {
  start: "divider",
  participant: "background.default",
  target: "primary.light",
  weapon: "secondary.light",
  undefined: "background.default",
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
      <Cell sx={{ bgcolor: colorMap[group] }}>
        <Tooltip
          title={
            <>
              {groupedRounds.length === 1
                ? roundsToString(rounds)
                : groupedRounds.map(([key, value]) => (
                    <p key={key}>{`${key.split(" ").at(-1)}: [${roundsToString(
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
      <Cell sx={{ bgcolor: colorMap[group] }}>{heal}</Cell>
      <Cell sx={{ bgcolor: colorMap[group] }}>
        {dmg} ({block + parry})
      </Cell>

      <Cell sx={{ bgcolor: colorMap[group] }}>
        {(dmg / rounds.length).toFixed(1)}
      </Cell>
      <Cell sx={{ bgcolor: colorMap[group] }}>
        {minDmg}-{maxDmg}
      </Cell>
      <Cell sx={{ bgcolor: colorMap[group] }}>
        {minCrit}-{maxCrit}
      </Cell>
      <Cell sx={{ bgcolor: colorMap[group] }}> {attack}</Cell>
      <Cell sx={{ bgcolor: colorMap[group] }}>
        <Spaced>
          <Percent>
            {Number.isFinite(missPercent)
              ? missPercent.toFixed(1) + "%"
              : "Fehler"}
          </Percent>
          <span>({miss})</span>
        </Spaced>
      </Cell>
      <Cell sx={{ bgcolor: colorMap[group] }}>
        <Spaced>
          <Percent>
            {Number.isFinite(dodgedPercent)
              ? dodgedPercent.toFixed(1) + "%"
              : "Fehler"}
          </Percent>
          <span>({dodged})</span>
        </Spaced>
      </Cell>
      <Cell sx={{ bgcolor: colorMap[group] }}>
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
      <Cell sx={{ bgcolor: colorMap[group] }}>
        <Spaced>
          <Percent>
            {Number.isFinite(critPercent)
              ? critPercent.toFixed(1) + "%"
              : "Fehler"}
          </Percent>
          <span>({crit})</span>
        </Spaced>
      </Cell>
      <Cell sx={{ bgcolor: colorMap[group] }}>
        <Spaced>
          <Percent>
            {Number.isFinite(blockPercent)
              ? blockPercent.toFixed(1) + "%"
              : "Fehler"}
          </Percent>
          <span>({blocked})</span>
        </Spaced>
      </Cell>
      <Cell sx={{ bgcolor: colorMap[group] }}>
        <Spaced>
          <Percent>
            {Number.isFinite(parryPercent)
              ? parryPercent.toFixed(1) + "%"
              : "Fehler"}
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
        <Cell sx={{ bgcolor: colorMap[values.group] }}>
          {!Array.isArray(values.children) && (
            <IconButton onClick={() => setExpand(!expand)} size="small">
              {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
              <ExpanderArrow expand={+expand} fontSize="inherit" />
            </IconButton>
          )}
        </Cell>
        <Header
          sx={{
            bgcolor: colorMap[values.group],
            whiteSpace: values.group !== "weapon" ? "nowrap" : undefined,
          }}
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
