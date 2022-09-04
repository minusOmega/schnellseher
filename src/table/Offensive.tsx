import clsx from "clsx";
import React from "react";
import Tooltip from "../base/Tooltip";
import { Offensive as OffensiveType } from "../reporter/reporter";
import { useStyles } from "./Row";

export default function Offensive({
  data: { rounds, dmg, block, parry, hit, crit, attack, miss, heal },
}: {
  data: OffensiveType;
}) {
  const jss = useStyles();
  return (
    <>
      <td className={clsx(jss.text, jss.border)}>
        {dmg} ({block + parry})
      </td>
      <td className={clsx(jss.text, jss.border)}>
        <Tooltip
          title={
            <span style={{ whiteSpace: "nowrap" }}>{rounds.join(", ")}</span>
          }
        >
          {rounds[0]}-{rounds[rounds.length - 1]}
        </Tooltip>
      </td>
      <td className={clsx(jss.text, jss.border)}>{hit}</td>
      <td className={clsx(jss.text, jss.border)}>
        {((crit * 100) / (attack - miss) || 0).toFixed(1)}%
      </td>
      <td className={clsx(jss.text, jss.border)}>
        {((miss * 100) / attack || 0).toFixed(1)}%
      </td>
      <td className={clsx(jss.text, jss.border)}>{heal}</td>
    </>
  );
}
