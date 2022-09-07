import React from "react";
import { Defensive as DefensiveType } from "../reporter/reporter";
import { Cell } from "./Cell";

export default function Defensive({
  data: { blocked, dmged, dodged, healed, parried, struck },
}: {
  data: DefensiveType;
}) {
  return (
    <>
      <Cell>{healed}</Cell>
      <Cell>
        {dmged} ({blocked + parried})
      </Cell>
      <Cell>{struck}</Cell>
      <Cell>{((dodged * 100) / (struck + dodged) || 0).toFixed(1)}%</Cell>
    </>
  );
}
