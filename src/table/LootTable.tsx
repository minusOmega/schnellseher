import { styled } from "@mui/material";
import { Loot } from "../reporter/reporter";
import { Cell, Header } from "./Cell";
import { ContentsRow } from "./ContentsRow";

const Head = styled("thead")({
  display: "contents",
});

const Body = styled("tbody")({
  display: "contents",
});

const Column = styled("th")({
  "&:nth-of-type(1)": { zIndex: 2, left: 0 },
  alignItems: "flex-start",
  border: "1px solid black",
  padding: 8,
  display: "flex",
  position: "sticky",
  top: 0,
  backgroundColor: "white",
  zIndex: 1,
});

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  margin: "8px 8px 8px 0",
});

const Name = styled("p")({
  backgroundColor: "white",
  border: "1px solid black",
  margin: 0,
});

export default function LootTable({
  name,
  caption = "Item",
  data,
  items,
}: {
  name: string;
  caption?: string;
  data: Loot;
  items: string[];
}) {
  if (items.length === 0) return null;
  const participants = Object.keys(data);
  const columns = participants.length + 1;
  const Table = styled("table")({
    backgroundColor: "white",
    display: "grid",
    gridTemplateColumns: `repeat(${columns},auto)`,
    width: "fit-content",
  });
  return (
    <Container>
      <Name>{name}</Name>
      <Table>
        <Head>
          <ContentsRow>
            <Column>{caption}</Column>
            {participants.map((participant, index) => (
              <Column key={participant + index}>{participant}</Column>
            ))}
          </ContentsRow>
        </Head>
        <Body>
          {items.map((item, index) => (
            <ContentsRow key={item + index}>
              <Header whiteSpace="nowrap" backgroundColor="white" fontWeight={item.startsWith("#") ? "bold" : "normal"}>
                {item}
              </Header>
              {participants.map((participant, index) => {
                const value = data[participant][item];
                const displayValue = typeof value === "number" && !Number.isInteger(value)
                  ? value.toFixed(2)
                  : value;
                return (
                <Cell key={participant + index} fontWeight={item.startsWith("#") ? "bold" : "normal"}>
                  {displayValue}                      
                </Cell>)})}
            </ContentsRow>
          ))}
        </Body>
      </Table>
    </Container>
  );
}
