import React from "react";
import { createUseStyles } from "react-jss";

import reporter from "../reporter/reporter";
import { Row } from "./Row";

export const useStyles = createUseStyles({
  border: {
    border: "1px solid black",
    padding: 5,
  },
});

export function Reporter({ data }: { data: string }) {
  const jss = useStyles();
  const rows = reporter(data);

  return (
    <table className={jss.border}>
      <thead>
        <tr>
          <th className={jss.border}></th>
          <th className={jss.border}>Name</th>
          <th className={jss.border}>Schaden Ausgeteilt (Abgewehrt)</th>
          <th className={jss.border}>Runden gekämpft</th>
          <th className={jss.border}>Treffer</th>
          <th className={jss.border}>Kritisch</th>
          <th className={jss.border}>Verfehlt</th>
          <th className={jss.border}>Heilung Ausgeteilt</th>
          <th className={jss.border}>Heilung Erhalten</th>
          <th className={jss.border}>Schaden Erhalten (Abgewehrt)</th>
          <th className={jss.border}>Getroffen</th>
          <th className={jss.border}>Ausgewichen</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <Row key={index} data={row} />
        ))}
      </tbody>
    </table>
  );
}