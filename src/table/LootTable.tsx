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
  data,
  items,
}: {
  name: string;
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
            <Column>Item</Column>
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
              {participants.map((participant, index) => (
                <Cell key={participant + index} fontWeight={item.startsWith("#") ? "bold" : "normal"}>{data[participant][item] || ""}</Cell>
              ))}
            </ContentsRow>
          ))}
        </Body>
      </Table>
    </Container>
  );
}
