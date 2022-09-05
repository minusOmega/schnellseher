import React, { useState } from "react";
import clsx from "clsx";
import { createUseStyles } from "react-jss";
import Offensive from "./Offensive";
import Defensive from "./Defensive";
import { Participant } from "../reporter/reporter";
import Button from "../base/Button";

export const useStyles = createUseStyles({
  border: {
    border: "1px solid black",
  },
  text: {
    textAlign: "left",
    padding: 5,
  },
  children: {
    paddingLeft: 20,
  },
});

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
}: {
  data: Participant;
}) {
  const jss = useStyles();
  const [expand, setExpand] = useState(false);

  return (
    <>
      <tr key={participant}>
        <td className={jss.border}>
          <Button onClick={() => setExpand(!expand)}>
            {expand ? "🔺" : "🔻"}
          </Button>
        </td>
        <td className={clsx(jss.text, jss.border)}>{participant}</td>
        <Offensive
          data={{ rounds, crit, dmg, heal, hit, miss, attack, block, parry }}
        />
        <Defensive data={{ blocked, dmged, dodged, healed, parried, struck }} />
      </tr>
      {expand &&
        children.map((child, index) => (
          <tr key={child.attack}>
            <td></td>
            <td className={clsx(jss.text, jss.border, jss.children)}>
              {child.weapon}
            </td>
            <Offensive data={child} />
          </tr>
        ))}
    </>
  );
}