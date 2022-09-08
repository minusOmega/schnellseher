import { styled } from "@mui/material";
import React from "react";
import reporter from "../reporter/reporter";
import { ContentsRow } from "./ContentsRow";
import { Report } from "./Report";

const Table = styled("table")({
  height: "100%",
  display: "grid",
  gridTemplateColumns: "repeat(12,auto)",
});

const ScrollOverflow = styled("div")({
  overflow: "scroll",
});

const Header = styled("thead")({
  display: "contents",
});

const Body = styled("tbody")({
  display: "contents",
});

const Column = styled("th")({
  border: "1px solid black",
  padding: 5,
  position: "sticky",
  top: 0,
  backgroundColor: "white",
  zIndex: 1,
});

export function Reporter({ data }: { data: string }) {
  const report = reporter(data);

  return (
    <ScrollOverflow>
      <Table>
        <Header>
          <ContentsRow>
            <Column />
            <Column>Name</Column>
            <Column>Schaden Ausgeteilt (Abgewehrt)</Column>
            <Column>Runden gekämpft</Column>
            <Column>Treffer</Column>
            <Column>Kritisch</Column>
            <Column>Verfehlt</Column>
            <Column>Heilung Ausgeteilt</Column>
            <Column>Heilung Erhalten</Column>
            <Column>Schaden Erhalten (Abgewehrt)</Column>
            <Column>Getroffen</Column>
            <Column>Ausgewichen</Column>
          </ContentsRow>
        </Header>
        <Body>
          {report.map((row, index) => (
            <Report key={row.participant + index} data={row} />
          ))}
        </Body>
      </Table>
    </ScrollOverflow>
  );
}
