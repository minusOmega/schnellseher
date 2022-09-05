import { Tooltip } from "@mui/material";
import React from "react";
import { Offensive as OffensiveType } from "../reporter/reporter";

export default function Offensive({
  data: { rounds, dmg, block, parry, hit, crit, attack, miss, heal },
}: {
  data: OffensiveType;
}) {
  return (
    <>
      <td>
        {dmg} ({block + parry})
      </td>
      <td>
        <Tooltip title={rounds.join(", ")} arrow>
          <span>
            {rounds[0]}-{rounds[rounds.length - 1]}
          </span>
        </Tooltip>
      </td>
      <td>{hit}</td>
      <td>{((crit * 100) / (attack - miss) || 0).toFixed(1)}%</td>
      <td>{((miss * 100) / attack || 0).toFixed(1)}%</td>
      <td>{heal}</td>
    </>
  );
}
