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
  whitespace: "nowrap",
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
  showNames = true,
}: {
  name: string;
  data: Loot;
  items: string[];
  showNames?: boolean;
}) {
  if (items.length === 0) return null;
  const columns = items.length + (showNames ? 1 : 0);
  const Table = styled("table")({
    backgroundColor: "white",
    display: "grid",
    gridTemplateColumns: `repeat(${columns},auto)`,
    width: "fit-content",
    flex: "auto",
  });
  return (
    <Container>
      <Name>{name}</Name>
      <Table>
        <Head>
          <ContentsRow>
            {showNames && <Column>Item</Column>}
            {items.map((item, index) => (
              <Column key={name + index}>{item}</Column>
            ))}
          </ContentsRow>
        </Head>
        <Body>
          {Object.entries(data).map(([key, values], index) => (
            <ContentsRow key={name + index}>
              {showNames && (
                <Header
                  whitespace="nowrap"
                  backgroundColor="white"
                  fontWeight={key.includes("#") ? "bold" : "normal"}
                >
                  {key}
                </Header>
              )}
              {items.map((item, index) =>
                values.hasOwnProperty(item) ? (
                  <Cell key={name + index} fontWeight={key.includes("#") ? "bold" : "normal"}>
                    {values[item]}
                  </Cell>
                ) : (
                  <Cell key={name + index}></Cell>
                )
              )}
            </ContentsRow>
          ))}
        </Body>
      </Table>
    </Container>
  );
}
