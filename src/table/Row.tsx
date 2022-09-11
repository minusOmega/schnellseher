import React, { useState } from "react";
import Offensive from "./Offensive";
import Defensive from "./Defensive";
import { Participant } from "../reporter/reporter";
import { IconButton } from "@mui/material";
import { ContentsRow } from "./ContentsRow";
import { Cell } from "./Cell";
import { ExpanderArrow } from "./ExpanderArrow";

export function Row({
  data: {
    rounds,
    participant,
    children,
    crit,
    dmg,
    heal,
    hit,
    miss,
    attack,
    block,
    parry,
    blocked,
    dmged,
    dodged,
    healed,
    parried,
    struck,
  },
  isExpanded = false,
}: {
  data: Participant;
  isExpanded?: boolean;
}) {
  const [expand, setExpand] = useState(isExpanded);

  return (
    <>
      <ContentsRow key={participant + dmg}>
        <Cell>
          <IconButton onClick={() => setExpand(!expand)} size="small">
            {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
            <ExpanderArrow expand={+expand} />
          </IconButton>
        </Cell>
        <Cell>{participant}</Cell>
        <Offensive
          data={{ rounds, crit, dmg, heal, hit, miss, attack, block, parry }}
        />
        <Defensive data={{ blocked, dmged, dodged, healed, parried, struck }} />
      </ContentsRow>
      {expand &&
        children.map((child, index) => (
          <ContentsRow
            key={child.participant + child.attack + child.dmg + index}
          >
            <Cell />
            <Cell>{child.weapon}</Cell>
            <Offensive data={child} />
            <Cell />
            <Cell />
            <Cell />
            <Cell />
          </ContentsRow>
        ))}
    </>
  );
}
