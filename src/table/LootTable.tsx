import { IconButton, styled } from "@mui/material";
import { Loot } from "../reporter/reporter";
import { Cell, Header } from "./Cell";
import { ContentsRow } from "./ContentsRow";
import { useState } from "react";
import { ExpanderArrow } from "./Icons";

const Head = styled("thead")({
  display: "contents",
});

const Body = styled("tbody")({
  display: "contents",
});

const Column = styled("th")(({ theme }) => ({
  "&:nth-of-type(1)": { zIndex: 2, left: 0 },
  alignItems: "flex-start",
  border: "1px solid black",
  padding: 8,
  display: "flex",
  position: "sticky",
  top: 0,
  backgroundColor: theme.palette.background.default,
  zIndex: 1,
}));

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
            <Column style={{ minWidth: 120 }} >                   
              <IconButton onClick={() => setExpand(!expand)} size="small">
                {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
                <ExpanderArrow expand={+expand} fontSize="inherit" />
              </IconButton> {name}
            </Column>
            {participants.map((participant, index) => (
              <Column style={{ minWidth: 75 }} key={participant + index}>{participant}</Column>
            ))}
          </ContentsRow>
        </Head>
        <Body>
          {items.map((item, index) => {
            const important = item.startsWith("#");
            if (!expand && !important) {
                  return; 
                }
            return(
            <ContentsRow key={item + index}>
              <Header sx={{ bgcolor: 'background.default' }} whiteSpace="nowrap" fontWeight={item.startsWith("#") ? "bold" : "normal"}>
                {item}
              </Header>
              {participants.map((participant, index) => {                              
                const value = data[participant][item];
                const displayValue = typeof value === "number" && !Number.isInteger(value)
                  ? value.toFixed(2)
                  : value;
                return (
                <Cell key={participant + index} fontWeight={important ? "bold" : "normal"}>
                  {displayValue}                      
                </Cell>)})}
            </ContentsRow>
          )})}
        </Body>
      </Table>
    </Container>
  );
}
