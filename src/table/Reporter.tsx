import React, { useState } from "react";
import { styled, Badge, IconButton } from "@mui/material";
import { ArrowUpward, ArrowDownward, Sort } from "@mui/icons-material";
import { orderBy } from "lodash";
import reporter, { Participant, Weapon } from "../reporter/reporter";
import { ContentsRow } from "./ContentsRow";
import { Row } from "./Row";
import { ExpanderArrow } from "./ExpanderArrow";

const Table = styled("table")({
  backgroundColor: "white",
  display: "grid",
  gridTemplateColumns: "repeat(12,auto)",
  width: "fit-content",
});

const Header = styled("thead")({
  display: "contents",
});

const Body = styled("tbody")({
  display: "contents",
});

const Column = styled("th")({
  "&:nth-child(2)": { zIndex: 2, left: 0 },
  minHeight: 90,
  alignItems: "flex-start",
  border: "1px solid black",
  padding: 8,
  display: "flex",
  position: "sticky",
  userSelect: "none",
  top: 0,
  backgroundColor: "white",
  zIndex: 1,
});

type OrderBy = "asc" | "desc";
// type Iteratee = keyof Participant | ((item: Participant) => string | number);

const FilterArrow = ({ order }: { order?: OrderBy }) => {
  if (order === "asc") return <ArrowUpward />;
  if (order === "desc") return <ArrowDownward />;
  return <Sort />;
};

const FilterColumn = ({
  children,
  onChange,
  name,
  func,
  order,
  pos,
}: {
  name: keyof Participant;
  func?: OrderFunc;
  order?: OrderBy;
  pos: number;
  onChange: (name: keyof Participant, order?: OrderFunc) => void;
  children: React.ReactNode;
}) => {
  return (
    <Column style={{ cursor: "pointer" }} onClick={() => onChange(name, func)}>
      {children}
      <Badge badgeContent={pos + 1} invisible={pos === undefined || pos === 0}>
        <FilterArrow order={order} />
      </Badge>
    </Column>
  );
};

type OrderFunc = (item: Participant | Weapon) => string | number;

type Order = {
  name: keyof Participant;
  func?: OrderFunc;
  order: OrderBy;
};

export function Reporter({ data }: { data: string }) {
  const [expand, setExpand] = useState(false);
  const [sort, setSort] = useState<Order[]>([]);

  const changeFilter = (group: keyof Participant, func?: OrderFunc) => {
    const ordered = sort.find(({ name }) => name === group);
    if (!ordered) setSort([{ name: group, func, order: "desc" }]);
    else if (ordered?.order === "desc")
      setSort([{ name: group, func, order: "asc" }]);
    else setSort([]);
  };

  const filterBy = (
    name: keyof Participant,
    func?: OrderFunc
  ): {
    name: keyof Participant;
    func?: OrderFunc;
    order?: OrderBy;
    pos: number;
    onChange: (name: keyof Participant, func?: OrderFunc) => void;
  } => {
    return {
      name,
      func,
      order: sort.find((entry) => entry.name === name)?.order,
      pos: sort.findIndex((entry) => entry.name === name),
      onChange: changeFilter,
    };
  };

  const report = reporter(data);
  const iteratees = sort.map(({ name, func }) => func || name);
  const orders = sort.map(({ order }) => order);
  const sorted = orderBy<Participant>(
    report.map(({ children, ...rest }) => ({
      ...rest,
      children: children && orderBy<Weapon>(children, iteratees, orders),
    })),
    iteratees,
    orders
  );

  return (
    <Table>
      <Header>
        <ContentsRow>
          <Column>
            <IconButton onClick={() => setExpand(!expand)} size="small">
              {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
              <ExpanderArrow expand={+expand} />
            </IconButton>
          </Column>
          <FilterColumn {...filterBy("participant")}>Name</FilterColumn>
          <FilterColumn {...filterBy("dmg")}>
            Schaden Ausgeteilt (Abgewehrt)
          </FilterColumn>
          <Column>Runden gekämpft</Column>
          <FilterColumn {...filterBy("hit")}>Treffer</FilterColumn>
          <FilterColumn
            {...filterBy(
              "crit",
              ({ crit, attack, miss }) => (crit * 100) / (attack - miss) || 0
            )}
          >
            Kritisch
          </FilterColumn>
          <FilterColumn
            {...filterBy(
              "miss",
              ({ miss, attack }) => (miss * 100) / attack || 0
            )}
          >
            Verfehlt
          </FilterColumn>
          <FilterColumn {...filterBy("heal")}>Heilung Ausgeteilt</FilterColumn>
          <FilterColumn {...filterBy("healed")}>Heilung Erhalten</FilterColumn>
          <FilterColumn {...filterBy("dmged")}>
            Schaden Erhalten (Abgewehrt)
          </FilterColumn>
          <FilterColumn {...filterBy("struck")}>Getroffen</FilterColumn>
          <Column>Ausgewichen</Column>
        </ContentsRow>
      </Header>
      <Body>
        {sorted.map((row) => (
          <Row key={row.participant + expand} data={row} isExpanded={expand} />
        ))}
      </Body>
    </Table>
  );
}
