import { IconButton, styled } from "@mui/material";
import { Loot } from "../reporter/reporter";
import { Cell, Header } from "./Cell";
import { ContentsRow } from "./ContentsRow";
import { useState } from "react";
import { ExpanderArrow } from "./Icons";
import { Column } from "./Column";

const Head = styled("thead")({
  display: "contents",
});

const Body = styled("tbody")({
  display: "contents",
});

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  margin: "8px 8px 8px 0",
});

export default function LootTable({
  name,
  data,
  items,
  expanded = false,
}: {
  name: string;
  data: Loot;
  items: string[];
  expanded?: boolean;
}) {
  const [expand, setExpand] = useState(expanded);
  if (items.length === 0) return null;
  const participants = Object.keys(data);
  const columns = participants.length + 1;
  const Table = styled("table")({
    display: "grid",
    gridTemplateColumns: `repeat(${columns},auto)`,
    width: "fit-content",
  });
  return (
    <Container>
      <Table>
        <Head>
          <ContentsRow>
            <Column stickyIndex={1}>
              <IconButton onClick={() => setExpand(!expand)} size="small">
                {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
                <ExpanderArrow expand={+expand} fontSize="inherit" />
              </IconButton>{" "}
              {name}
            </Column>
            {participants.map((participant, index) => (
              <Column stickyIndex={1} key={participant + index}>
                {participant}
              </Column>
            ))}
          </ContentsRow>
        </Head>
        <Body>
          {items.map((item, index) => {
            const important = item.startsWith("#");
            if (!expand && !important) {
              return null;
            }
            return (
              <ContentsRow key={item + index}>
                <Header
                  sx={{
                    bgcolor: "background.default",
                    whiteSpace: "nowrap",
                    fontWeight: important ? "bold" : "normal",
                  }}
                >
                  {item}
                </Header>
                {participants.map((participant, index) => {
                  const value = data[participant][item];
                  const displayValue =
                    typeof value === "number" && !Number.isInteger(value)
                      ? value.toFixed(2)
                      : value;
                  return (
                    <Cell
                      key={participant + index}
                      sx={{ fontWeight: important ? "bold" : "normal" }}
                    >
                      {displayValue}
                    </Cell>
                  );
                })}
              </ContentsRow>
            );
          })}
        </Body>
      </Table>
    </Container>
  );
}
