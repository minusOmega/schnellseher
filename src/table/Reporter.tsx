import React, { useState } from "react";
import { styled, Badge } from "@mui/material";
import { ArrowUpward, ArrowDownward, Sort } from "@mui/icons-material";
import { orderBy } from "lodash";
import reporter, { Participant } from "../reporter/reporter";
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
  padding: 10,
  display: "flex",
  position: "sticky",
  userSelect: "none",
  top: 0,
  backgroundColor: "white",
  zIndex: 1,
});

type OrderBy = "asc" | "desc";

const FilterArrow = ({ order }: { order?: OrderBy }) => {
  if (order === "asc") return <ArrowUpward />;
  if (order === "desc") return <ArrowDownward />;
  return <Sort />;
};

const FilterColumn = ({
  children,
  onChange,
  name,
  order,
  pos,
}: {
  name: keyof Participant;
  order?: OrderBy;
  pos: number;
  onChange: (name: keyof Participant) => void;
  children: React.ReactNode;
}) => {
  return (
    <Column style={{ cursor: "pointer" }} onClick={() => onChange(name)}>
      {children}
      <Badge badgeContent={pos + 1} invisible={pos === undefined || pos === 0}>
        <FilterArrow order={order} />
      </Badge>
    </Column>
  );
};

type Order = {
  name: keyof Participant;
  order: OrderBy;
};

export function Reporter({ data }: { data: string }) {
  const [filter, setFilter] = useState<Order[]>([]);

  const changeFilter = (group: keyof Participant) => {
    const ordered = filter.find(({ name }) => name === group);
    if (!ordered) setFilter([{ name: group, order: "desc" }]);
    else if (ordered?.order === "desc")
      setFilter([{ name: group, order: "asc" }]);
    else setFilter([]);
  };

  const filterBy = (
    name: keyof Participant
  ): {
    name: keyof Participant;
    order?: OrderBy;
    pos: number;
    onChange: (name: keyof Participant) => void;
  } => {
    return {
      name,
      order: filter.find((entry) => entry.name === name)?.order,
      pos: filter.findIndex((entry) => entry.name === name),
      onChange: changeFilter,
    };
  };

  const report = reporter(data);
  const iteratees = filter.map(({ name }) => name);
  const orders = filter.map(({ order }) => order);
  const sorted = orderBy(
    report.map(({ children, ...rest }) => ({
      ...rest,
      children: orderBy(children, iteratees, orders),
    })),
    iteratees,
    orders
  );

  return (
    <ScrollOverflow>
      <Table>
        <Header>
          <ContentsRow>
            <Column />
            <FilterColumn {...filterBy("participant")}>Name</FilterColumn>
            <FilterColumn {...filterBy("dmg")}>
              Schaden Ausgeteilt (Abgewehrt)
            </FilterColumn>
            <Column>Runden gekämpft</Column>
            <FilterColumn {...filterBy("hit")}>Treffer</FilterColumn>
            <Column>Kritisch</Column>
            <Column>Verfehlt</Column>
            <FilterColumn {...filterBy("heal")}>
              Heilung Ausgeteilt
            </FilterColumn>
            <FilterColumn {...filterBy("healed")}>
              Heilung Erhalten
            </FilterColumn>
            <FilterColumn {...filterBy("dmged")}>
              Schaden Erhalten (Abgewehrt)
            </FilterColumn>
            <FilterColumn {...filterBy("struck")}>Getroffen</FilterColumn>
            <Column>Ausgewichen</Column>
          </ContentsRow>
        </Header>
        <Body>
          {sorted.map((row) => (
            <Report key={row.participant} data={row} />
          ))}
        </Body>
      </Table>
    </ScrollOverflow>
  );
}
