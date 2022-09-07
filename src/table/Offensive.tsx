import React from "react";
import { Tooltip, styled } from "@mui/material";
import { Offensive as OffensiveType } from "../reporter/reporter";
import { Cell } from "./Cell";

const TooltipText = styled("span")({
  borderBottom: "1px dotted black",
});

export default function Offensive({
  data: { rounds, dmg, block, parry, hit, crit, attack, miss, heal },
}: {
  data: OffensiveType;
}) {
  return (
    <>
      <Cell>
        {dmg} ({block + parry})
      </Cell>
      <Cell>
        <Tooltip title={rounds.join(", ")} arrow>
          <TooltipText>
            {rounds[0]}-{rounds[rounds.length - 1]}
          </TooltipText>
        </Tooltip>
      </Cell>
      <Cell>{hit}</Cell>
      <Cell>{((crit * 100) / (attack - miss) || 0).toFixed(1)}%</Cell>
      <Cell>{((miss * 100) / attack || 0).toFixed(1)}%</Cell>
      <Cell>{heal}</Cell>
    </>
  );
}
