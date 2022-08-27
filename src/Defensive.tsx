import clsx from "clsx";
import React from "react";
import { Defensive as DefensiveType } from "./reporter/reporter";
import { useStyles } from "./Row";

export default function Defensive({
  data: { blocked, dmged, dodged, healed, parried, struck },
}: {
  data: DefensiveType;
}) {
  const jss = useStyles();
  return (
    <>
      <td className={clsx(jss.text, jss.border)}>{dmged}</td>
      <td className={clsx(jss.text, jss.border)}>{blocked + parried}</td>
      <td className={clsx(jss.text, jss.border)}>{healed}</td>
      <td className={clsx(jss.text, jss.border)}>{struck}</td>
      <td className={clsx(jss.text, jss.border)}>
        {((dodged * 100) / (struck + dodged) || 0).toFixed(1)}%
      </td>
    </>
  );
}
