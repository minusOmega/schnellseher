import React, { useMemo, useState } from "react";
import {
  styled,
  IconButton,
  Tooltip,
  Badge,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Divider,
} from "@mui/material";

import reporter, { OrderBy, OrderFunc, OrderKey, GroupBy, orderReport } from "../reporter/reporter";
import { ContentsRow } from "./ContentsRow";
import { ExpanderArrow, Hash } from "./Icons";
import { ArrowDownward, ArrowUpward, Sort } from "@mui/icons-material";
import ButtonBarContent from "../ButtonBarContent";
import { Row } from "./Row";
import Loot from "./LootTable";

const Table = styled("table")({
  backgroundColor: "white",
  display: "grid",
  gridTemplateColumns: "repeat(15,auto)",
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

const LootTable = styled("div")({
  display: "flex",
  marginLeft: 48,
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
};

export default function Reporter({ data }: { data: string }) {
  const [expand, setExpand] = useState(false);
  const [showMonster, setShowMonster] = useState(true);
  const [sort, setSort] = useState<{ group: OrderKey; by: OrderBy; func?: OrderFunc }[]>([]);
  const [groupType, setGroupType] = React.useState<string>("Participant");
  const [showLoot, setShowLoot] = React.useState<boolean>(false);
  const [showBandaging, setShowBandaging] = React.useState<boolean>(false);
  const [showBattles, setShowBattles] = React.useState<boolean>(false);
  const { groupBy, type } = groupTypeMap[groupType];
  const [memoizedReport, memorizedLoot, memorizedItems, memorizedValue, memorizedDescriptions] =
    useMemo(
      () => reporter(data, showBattles ? ["start", ...groupBy] : groupBy, showBandaging),
      [data, showBattles, groupBy, showBandaging]
    );

  const memoizedData = useMemo(
    () =>
      orderReport(
        memoizedReport,
        sort.map(({ by, group, func }) => [func || group, by])
      ),
    [memoizedReport, sort]
  );

  const handleGroupTypeChange = (_: React.MouseEvent<HTMLElement>, next: string) => {
    if (next !== null) setGroupType(next);
  };

  const handleShowLootChange = (_: React.MouseEvent<HTMLElement>, next: boolean | null) => {
    setShowLoot(next !== null ? next : false);
  };

  const handleShowBattlesChange = (_: React.MouseEvent<HTMLElement>, next: boolean | null) => {
    setShowBattles(next !== null ? next : false);
  };

  const handleShowBandagingChange = (_: React.MouseEvent<HTMLElement>, next: boolean | null) => {
    setShowBandaging(next !== null ? next : false);
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

  const GroupTypeToggle = () => (
    <ToggleButtonGroup exclusive color="primary" value={groupType} onChange={handleGroupTypeChange}>
      <ToggleButton value={"Participant"}>Ausgehend</ToggleButton>
      <ToggleButton value={"Target"}>Eingehend</ToggleButton>
    </ToggleButtonGroup>
  );
  const BandagingToggle = () => (
    <ToggleButtonGroup
      exclusive
      color="primary"
      value={showBandaging}
      onChange={handleShowBandagingChange}
    >
      <ToggleButton value={"Bandaging"}>Bandagieren</ToggleButton>
    </ToggleButtonGroup>
  );

  const BattlesToggle = () => (
    <ToggleButtonGroup
      exclusive
      color="primary"
      value={showBattles}
      onChange={handleShowBattlesChange}
    >
      <ToggleButton value={"Battles"}>Kämpfe</ToggleButton>
    </ToggleButtonGroup>
  );

  const LootToggle = () => (
    <ToggleButtonGroup exclusive color="primary" value={showLoot} onChange={handleShowLootChange}>
      <ToggleButton value={"Loot"}>Beute</ToggleButton>
    </ToggleButtonGroup>
  );

  const VerticalDivider = () => (
    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
  );

  const sxFlex = {
    display: "flex",
    padding: 0.5,
  };

  return (
    <>
      <ButtonBarContent>
        <Paper sx={sxFlex}>
          <BandagingToggle />
          <VerticalDivider />
          <BattlesToggle />
          <VerticalDivider />
          <LootToggle />
        </Paper>
        <Paper sx={sxFlex}>
          <GroupTypeToggle />
        </Paper>
      </ButtonBarContent>
      <LootTable>
        {showLoot && <Loot name="Beute" data={memorizedLoot} items={memorizedItems} />}
        {showLoot && <Loot name="Werte" data={memorizedValue} items={memorizedDescriptions} />}
      </LootTable>
      <Table>
        <Head>
          <ContentsRow>
            <Column>
              <IconButton onClick={() => setExpand(!expand)} size="small">
                {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
                <ExpanderArrow expand={+expand} fontSize="small" />
              </IconButton>
              <Tooltip title={`Monster ${showMonster ? "ausblenden" : "einblenden"}`}>
                <IconButton onClick={() => setShowMonster(!showMonster)} size="small">
                  {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
                  <Hash active={+showMonster} fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Column>
            <Column>Name</Column>
            <Column>Runden</Column>
            <FilterColumn {...filterBy("heal")}>Heilung {type}</FilterColumn>
            <FilterColumn {...filterBy("dmg")}>Schaden {type} (Abgewehrt)</FilterColumn>
            <FilterColumn {...filterBy("rounds", ({ dmg, rounds }) => dmg / rounds.length)}>
              Schaden pro Runde
            </FilterColumn>
            <Column>min-max Schaden</Column>
            <Column>min-max Kritisch</Column>
            <FilterColumn {...filterBy("attack")}>Aktiv</FilterColumn>
            <FilterColumn {...filterBy("missPercent")}>Verfehlt</FilterColumn>
            <FilterColumn {...filterBy("dodgedPercent")}>Ausgewichen</FilterColumn>
            <FilterColumn {...filterBy("hit")}>Treffer</FilterColumn>
            <FilterColumn {...filterBy("critPercent")}>Kritisch</FilterColumn>
            <FilterColumn {...filterBy("blocked")}>Blockiert</FilterColumn>
            <FilterColumn {...filterBy("parried")}>Parriert</FilterColumn>
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
