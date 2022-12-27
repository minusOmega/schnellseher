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

export default function LootTable({
  data,
  items,
}: {
  data: Loot;
  items: string[];
}) {
  const Table = styled("table")({
    backgroundColor: "white",
    display: "grid",
    gridTemplateColumns: `repeat(${items.length + 1},auto)`,
    width: "fit-content",
    flex: "auto",
    margin: 8,
    marginLeft: 48,
  });

  return (
    <Table>
      <Head>
        <ContentsRow>
          <Column>Name</Column>
          {items.map((item) => (
            <Column>{item}</Column>
          ))}
        </ContentsRow>
      </Head>
      <Body>
        {Object.entries(data).map(([key, values]) => (
          <ContentsRow>
            <Header whiteSpace="nowrap" backgroundColor="white">
              {key}
            </Header>
            {items.map((item) =>
              values.hasOwnProperty(item) ? (
                <Cell>{values[item]}</Cell>
              ) : (
                <Cell></Cell>
              )
            )}
          </ContentsRow>
        ))}
      </Body>
    </Table>
  );
}
