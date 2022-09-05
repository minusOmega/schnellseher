import React from "react";
import { Defensive as DefensiveType } from "../reporter/reporter";

export default function Defensive({
  data: { blocked, dmged, dodged, healed, parried, struck },
}: {
  data: DefensiveType;
}) {
  return (
    <>
      <td>{healed}</td>
      <td>
        {dmged} ({blocked + parried})
      </td>
      <td>{struck}</td>
      <td>{((dodged * 100) / (struck + dodged) || 0).toFixed(1)}%</td>
    </>
  );
}
