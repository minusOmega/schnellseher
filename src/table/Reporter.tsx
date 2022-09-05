import React from "react";
import { createUseStyles } from "react-jss";
import reporter from "../reporter/reporter";
import { Row } from "./Row";

export const useStyles = createUseStyles({
  "@global": {
    "th, td": {
      border: "1px solid black",
      padding: 5,
    },
    table: {
      height: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(12,auto)",
      gridTemplateAreas: `
      "expander name dmg rounds hit crit miss heal healed struck dodged"
      `,
    },
    th: { position: "sticky", top: 0, backgroundColor: "white" },
    "thead, tbody, tr": { display: "contents" },
    "#tooltip": { gridArea: "rounds" },
  },
  container: {
    overflow: "scroll",
  },
});

export function Reporter({ data }: { data: string }) {
  const jss = useStyles();
  const rows = reporter(data);

  return (
    <div className={jss.container}>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Schaden Ausgeteilt (Abgewehrt)</th>
            <th>Runden gekämpft</th>
            <th>Treffer</th>
            <th>Kritisch</th>
            <th>Verfehlt</th>
            <th>Heilung Ausgeteilt</th>
            <th>Heilung Erhalten</th>
            <th>Schaden Erhalten (Abgewehrt)</th>
            <th>Getroffen</th>
            <th>Ausgewichen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <Row key={index} data={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
