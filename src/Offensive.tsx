import clsx from "clsx";
import React from "react";
import { Offensive as OffensiveType } from "./reporter/reporter";
import { useStyles } from "./Row";

export default function Offensive({
  data: { dmg, block, parry, hit, crit, attack, miss, heal },
}: {
  data: OffensiveType;
}) {
  const jss = useStyles();
  return (
    <>
      <td className={clsx(jss.text, jss.border)}>{dmg}</td>
      <td className={clsx(jss.text, jss.border)}>{block + parry}</td>
      <td className={clsx(jss.text, jss.border)}>{hit}</td>

      <td className={clsx(jss.text, jss.border)}>
        {((crit * 100) / (attack - miss)).toFixed(1)}%
      </td>
      <td className={clsx(jss.text, jss.border)}>
        {((miss * 100) / attack).toFixed(1)}%
      </td>
      <td className={clsx(jss.text, jss.border)}>{heal}</td>
    </>
  );
}
