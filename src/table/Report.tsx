import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Offensive from "./Offensive";
import Defensive from "./Defensive";
import { Participant } from "../reporter/reporter";
import { IconButton } from "@mui/material";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import { ContentsRow } from "./ContentsRow";
import { Cell } from "./Cell";

const Arrow = styled(ArrowForwardIosSharpIcon)<{ expand: number }>`
  ${({ theme, expand }) => `
  cursor: pointer;
  color: ${theme.palette.primary.main};
  transition: ${theme.transitions.create(["transform"], {
    duration: theme.transitions.duration.standard,
  })};
  transform: ${expand ? "rotate(90deg)" : ""};
  `}
`;

export function Report({
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
}: {
  data: Participant;
}) {
  const [expand, setExpand] = useState(false);

  return (
    <>
      <ContentsRow key={participant + dmg}>
        <Cell>
          <IconButton onClick={() => setExpand(!expand)} size="small">
            {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
            <Arrow expand={+expand} />
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
