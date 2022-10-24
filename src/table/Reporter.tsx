import React, { useMemo, useState } from "react";
import {
  styled,
  IconButton,
  Tooltip,
  Badge,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from "@mui/material";

import reporter, {
  OrderBy,
  OrderFunc,
  OrderKey,
  GroupBy,
  orderReport,
} from "../reporter/reporter";
import { ContentsRow } from "./ContentsRow";
import { ExpanderArrow, Hash } from "./Icons";
import { ArrowDownward, ArrowUpward, Sort } from "@mui/icons-material";
import ButtonBarContent from "../ButtonBarContent";
import { Row } from "./Row";

const Table = styled("table")({
  backgroundColor: "white",
  display: "grid",
  gridTemplateColumns: "repeat(11,auto)",
  width: "fit-content",
  flex: "auto",
});

const Head = styled("thead")({
  display: "contents",
});

const Body = styled("tbody")({
  display: "contents",
});

const Column = styled("th")({
  "&:nth-of-type(1)": { flexDirection: "column-reverse" },
  "&:nth-of-type(2)": { zIndex: 2, left: 0 },
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
  name: OrderKey;
  func?: OrderFunc;
  order?: OrderBy;
  pos: number;
  onChange: (name: OrderKey, order?: OrderFunc) => void;
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

const groupTypeMap: {
  [key: string]: { groupBy: GroupBy; type: "ausgeteilt" | "erhalten" };
} = {
  Participant: { groupBy: ["participant", "weapon"], type: "ausgeteilt" },
  Target: { groupBy: ["target", "participant", "weapon"], type: "erhalten" },
  Rounds: {
    groupBy: ["start", "participant", "weapon"],
    type: "ausgeteilt",
  },
};

export default function Reporter({ data }: { data: string }) {
  const [expand, setExpand] = useState(false);
  const [showMonster, setShowMonster] = useState(true);
  const [sort, setSort] = useState<
    { group: OrderKey; by: OrderBy; func?: OrderFunc }[]
  >([]);
  const [groupType, setGroupType] = React.useState<string>("Participant");
  const { groupBy, type } = groupTypeMap[groupType];

  const handleGroupTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newGroupType: string
  ) => {
    if (newGroupType !== null) setGroupType(newGroupType);
  };

  const changeFilter = (group: OrderKey, func?: OrderFunc) => {
    const ordered = sort.find((s) => s.group === group);
    if (!ordered) setSort([{ group, by: "desc", func }]);
    else if (ordered.by === "desc") setSort([{ group, by: "asc", func }]);
    else setSort([]);
  };

  const filterBy = (
    name: OrderKey,
    func?: OrderFunc
  ): {
    name: OrderKey;
    func?: OrderFunc;
    order?: OrderBy;
    pos: number;
    onChange: (name: OrderKey, func?: OrderFunc) => void;
  } => ({
    name,
    func,
    order: sort.find((s) => s.group === name)?.by,
    pos: sort.findIndex((s) => s.group === name),
    onChange: changeFilter,
  });

  const memoizedReport = useMemo(
    () => reporter(data, groupBy),
    [data, groupBy]
  );

  const memoizedData = useMemo(
    () =>
      orderReport(
        memoizedReport,
        sort.map(({ by, group, func }) => [func || group, by])
      ),
    [memoizedReport, sort]
  );

  return (
    <>
      <ButtonBarContent>
        <Paper
          sx={{
            display: "flex",
            padding: 0.5,
          }}
        >
          <ToggleButtonGroup
            exclusive
            color="primary"
            value={groupType}
            onChange={handleGroupTypeChange}
          >
            <ToggleButton value={"Participant"}>Ausgehend</ToggleButton>
            <ToggleButton value={"Target"}>Eingehend</ToggleButton>
            <ToggleButton value={"Rounds"}>Kämpfe</ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </ButtonBarContent>

      <Table>
        <Head>
          <ContentsRow>
            <Column>
              <IconButton onClick={() => setExpand(!expand)} size="small">
                {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
                <ExpanderArrow expand={+expand} />
              </IconButton>
              <Tooltip
                title={`Monster ${showMonster ? "ausblenden" : "einblenden"}`}
              >
                <IconButton
                  onClick={() => setShowMonster(!showMonster)}
                  size="small"
                >
                  {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
                  <Hash active={+showMonster} />
                </IconButton>
              </Tooltip>
            </Column>
            <Column>Name</Column>
            <FilterColumn {...filterBy("dmg")}>
              Schaden {type} (Abgewehrt)
            </FilterColumn>
            <Column>Runden gekämpft</Column>
            <FilterColumn
              {...filterBy("rounds", ({ dmg, rounds }) => dmg / rounds.length)}
            >
              Schaden pro Runde
            </FilterColumn>
            <Column>min-max Schaden</Column>
            <Column>min-max Kritisch</Column>
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
            <FilterColumn {...filterBy("heal")}>Heilung {type}</FilterColumn>
          </ContentsRow>
        </Head>
        <Body>
          {Object.entries(memoizedData).map(([by, values]) => (
            <Row
              key={by + expand}
              by={by}
              values={values}
              isExpanded={expand}
              showMonster={showMonster}
            />
          ))}
        </Body>
      </Table>
    </>
  );
}
