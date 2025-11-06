import React, { useMemo, useState } from "react";
import {
  styled,
  IconButton,
  Badge,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Divider,
} from "@mui/material";

import reporter, { OrderBy, OrderFunc, GroupBy, orderReport, Aggregation, Report } from "../reporter/reporter";
import { ContentsRow } from "./ContentsRow";
import { ExpanderArrow } from "./Icons";
import { ArrowDownward, ArrowUpward, Sort } from "@mui/icons-material";
import ButtonBarContent from "../ButtonBarContent";
import { Row } from "./Row";
import Loot from "./LootTable";

const Table = styled("table")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  display: "grid",
  gridTemplateColumns: "repeat(15,auto)",
  width: "fit-content",
  flex: "auto",
}));

const Head = styled("thead")({
  display: "contents",
});

const Body = styled("tbody")({
  display: "contents",
});

const Column = styled("th")(({ theme }) => ({
  "&:nth-of-type(1)": { flexDirection: "column-reverse" },
  "&:nth-of-type(2)": { zIndex: 2, left: 0 },
  alignItems: "flex-start",
  border: "1px solid black",
  padding: 8,
  display: "flex",
  position: "sticky",
  userSelect: "none",
  top: 0,
  backgroundColor: theme.palette.background.default,
  zIndex: 1,
}));

const LootTable = styled("div")({
  display: "flex",
  marginLeft: 48,
});

const FilterArrow = ({ order }: { order?: OrderBy }) => {
  if (order === "asc") return <ArrowUpward />;
  if (order === "desc") return <ArrowDownward />;
  return <Sort />;
};

const FilterColumn = <T,>({
  children,
  onChange,
  name,
  func,
  order,
  pos,
}: {
  name: keyof T;
  func?: OrderFunc<T>;
  order?: OrderBy;
  pos: number;
  onChange: (name: keyof T, order?: OrderFunc<T>) => void;
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

type ReportType = "ausgeteilt" | "erhalten";

const groupTypeMap: {
  [key: string]: { groupBy: GroupBy; type: ReportType };
} = {
  Participant: { groupBy: ["participant", "weapon"], type: "ausgeteilt" },
  Target: { groupBy: ["target", "participant", "weapon"], type: "erhalten" },
};

type Sortable<T> = { group: keyof T; by: OrderBy; func?: OrderFunc<T> }[]
type filterProps<T> = {
  name: keyof T;
  func?: OrderFunc<T>;
  order?: OrderBy;
  pos: number;
  onChange: (name: keyof T, func?: OrderFunc<T>) => void;
}

function filterBy<T>(name: keyof T,
  current: Sortable<T>,
  onChange: (name: keyof T, func?: OrderFunc<T>) => void,
  func?: OrderFunc<T>,): filterProps<T> {
  return {
    name,
    func,
    order: current.find((s) => s.group === name)?.by,
    pos: current.findIndex((s) => s.group === name),
    onChange,
  }
}

function BattleReportTable({ report, showMonster, type }: { report: Report, showMonster?: boolean, type?: ReportType }) {
  const [expand, setExpand] = useState(false);
  const [sort, setSort] = useState<Sortable<Aggregation>>([]);
  const memoizedData = useMemo(
    () =>
      orderReport(
        report,
        sort.map(({ by, group, func }) => [func || group, by])
      ),
    [report, sort]
  );
  const changeFilter = (group: keyof Aggregation, func?: OrderFunc<Aggregation>) => {
    const ordered = sort.find((s) => s.group === group);
    if (!ordered) setSort([{ group, by: "desc", func }]);
    else if (ordered.by === "desc") setSort([{ group, by: "asc", func }]);
    else setSort([]);
  };
  const filterReportBy = (name: keyof Aggregation, func?: OrderFunc<Aggregation>) => filterBy(name, sort, changeFilter, func);

  return (<Table>
    <Head>
      <ContentsRow>
        <Column>
          <IconButton onClick={() => setExpand(!expand)} size="small">
            {/* Use {+expand} to fix Received `false` for a non-boolean attribute */}
            <ExpanderArrow expand={+expand} fontSize="small" />
          </IconButton>
        </Column>
        <Column>Name</Column>
        <Column>Runden</Column>
        <FilterColumn {...filterReportBy("heal")}>Heilung {type}</FilterColumn>
        <FilterColumn {...filterReportBy("dmg")}>Schaden {type} (Abgewehrt)</FilterColumn>
        <FilterColumn {...filterReportBy("rounds", ({ dmg, rounds }) => dmg / rounds.length)}>
          Schaden pro Runde
        </FilterColumn>
        <Column>min-max Schaden</Column>
        <Column>min-max Kritisch</Column>
        <FilterColumn {...filterReportBy("activate")}>Aktiv</FilterColumn>
        <FilterColumn {...filterReportBy("missPercent")}>Verfehlt</FilterColumn>
        <FilterColumn {...filterReportBy("dodgedPercent")}>Ausgewichen</FilterColumn>
        <FilterColumn {...filterReportBy("hit")}>Treffer</FilterColumn>
        <FilterColumn {...filterReportBy("critPercent")}>Kritisch</FilterColumn>
        <FilterColumn {...filterReportBy("blocked")}>Blockiert</FilterColumn>
        <FilterColumn {...filterReportBy("parried")}>Parriert</FilterColumn>
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
  </Table>)
}

export default function Reporter({ data }: { data: string }) {
  const [showMonster, setShowMonster] = useState(false);
  const [groupType, setGroupType] = React.useState<string>("Participant");
  const [showLoot, setShowLoot] = React.useState<boolean>(true);
  const [apPerRound, setApPerRound] = React.useState<number>(2);
  const [showBandaging, setShowBandaging] = React.useState<boolean>(false);
  const [showBattles, setShowBattles] = React.useState<boolean>(false);
  const { groupBy, type } = groupTypeMap[groupType];
  const [memoizedReport, memorizedLoot, memorizedItems, memorizedValue, memorizedDescriptions, memorizedExp, memorizedInfo] =
    useMemo(
      () => reporter(data, showBattles ? ["start", ...groupBy] : groupBy, showBandaging, apPerRound),
      [data, showBattles, groupBy, showBandaging, apPerRound]
    );

  const handleGroupTypeChange = (_: React.MouseEvent<HTMLElement>, next: string) => {
    if (next !== null) setGroupType(next);
  };

  const GroupTypeToggle = () => (
    <ToggleButtonGroup exclusive color="primary" value={groupType} onChange={handleGroupTypeChange}>
      <ToggleButton value={"Participant"}>Ausgehend</ToggleButton>
      <ToggleButton value={"Target"}>Eingehend</ToggleButton>
    </ToggleButtonGroup>
  );

  const BandagingToggle = () => (
    <ToggleButton color="primary" value={"check"} selected={showBandaging} onChange={() => setShowBandaging((prev) => !prev)}>Bandagieren</ToggleButton>
  );

  const BattlesToggle = () => (
    <ToggleButton color="primary" value={"check"} selected={showBattles} onChange={() => setShowBattles((prev) => !prev)}>Kämpfe</ToggleButton>
  );

  const LootToggle = () => (
    <ToggleButton color="primary" value={"check"} selected={showLoot} onChange={() => setShowLoot((prev) => !prev)}>Beute</ToggleButton>
  );

  const ExpToggle = () => (
    <ToggleButtonGroup
      color="primary"
      value={apPerRound}
      exclusive
      onChange={(_, value) => {
        if (value !== null) setApPerRound(value as number);
      }}
      aria-label="AP pro Runde"
    >
      <ToggleButton value={1} selected color="primary" style={{ pointerEvents: "none" }}>AP:</ToggleButton>
      <ToggleButton value={1}>-</ToggleButton>
      <ToggleButton value={2}>2</ToggleButton>
      <ToggleButton value={4}>4</ToggleButton>
      <ToggleButton value={8}>8</ToggleButton>
    </ToggleButtonGroup>
  );

  const MonsterToggle = () => (
    <ToggleButton color="primary" value={"check"} selected={showMonster} onChange={() => setShowMonster((prev) => !prev)}>Monster</ToggleButton>
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
          <GroupTypeToggle />
        </Paper>
        <Paper sx={sxFlex}>
          <BandagingToggle />
          <VerticalDivider />
          <MonsterToggle />
          <VerticalDivider />
          <BattlesToggle />
          <VerticalDivider />
          <LootToggle />
        </Paper>
        <Paper sx={sxFlex}>
          <ExpToggle />
        </Paper>
      </ButtonBarContent>
      {showLoot && <LootTable><Loot name="Beute" data={memorizedLoot} items={memorizedItems} /></LootTable>}
      {showLoot && <LootTable><Loot name="Werte" data={memorizedValue} items={memorizedDescriptions} /></LootTable>}
      {apPerRound > 1 && <LootTable><Loot name="Erfahrung" data={memorizedExp} items={memorizedInfo} expanded /></LootTable>}
      <BattleReportTable report={memoizedReport} showMonster={showMonster} type={type} />
    </>
  );
}
