import { useMemo, useState } from "react";
import {
  Aggregation,
  OrderBy,
  OrderFunc,
  orderReport,
  ReportType,
  Sortable,
  Report,
} from "../reporter/reporter";
import { Body, Head, Table } from "./Table";
import { ContentsRow } from "./ContentsRow";
import { Column, FilterColumn } from "./Column";
import { IconButton } from "@mui/material";
import { ExpanderArrow } from "./Icons";
import { Row } from "./Row";

type filterProps<T> = {
  name: keyof T;
  func?: OrderFunc<T>;
  order?: OrderBy;
  pos: number;
  onChange: (name: keyof T, func?: OrderFunc<T>) => void;
};

function filterBy<T>(
  name: keyof T,
  current: Sortable<T>,
  onChange: (name: keyof T, func?: OrderFunc<T>) => void,
  func?: OrderFunc<T>
): filterProps<T> {
  return {
    name,
    func,
    order: current.find((s) => s.group === name)?.by,
    pos: current.findIndex((s) => s.group === name),
    onChange,
  };
}

export function BattleReportTable({
  report,
  showMonster,
  type,
}: {
  report: Report;
  showMonster?: boolean;
  type?: ReportType;
}) {
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
  const changeFilter = (
    group: keyof Aggregation,
    func?: OrderFunc<Aggregation>
  ) => {
    const ordered = sort.find((s) => s.group === group);
    if (!ordered) setSort([{ group, by: "desc", func }]);
    else if (ordered.by === "desc") setSort([{ group, by: "asc", func }]);
    else setSort([]);
  };
  const filterReportBy = (
    name: keyof Aggregation,
    func?: OrderFunc<Aggregation>
  ) => filterBy(name, sort, changeFilter, func);

  return (
    <Table>
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
          <FilterColumn {...filterReportBy("heal")}>
            Heilung {type}
          </FilterColumn>
          <FilterColumn {...filterReportBy("dmg")}>
            Schaden {type} (Abgewehrt)
          </FilterColumn>
          <FilterColumn
            {...filterReportBy(
              "rounds",
              ({ dmg, rounds }) => dmg / rounds.length
            )}
          >
            Schaden pro Runde
          </FilterColumn>
          <Column>min-max Schaden</Column>
          <Column>min-max Kritisch</Column>
          <FilterColumn {...filterReportBy("activate")}>Aktiv</FilterColumn>
          <FilterColumn {...filterReportBy("missPercent")}>
            Verfehlt
          </FilterColumn>
          <FilterColumn {...filterReportBy("dodgedPercent")}>
            Ausgewichen
          </FilterColumn>
          <FilterColumn {...filterReportBy("hit")}>Treffer</FilterColumn>
          <FilterColumn {...filterReportBy("critPercent")}>
            Kritisch
          </FilterColumn>
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
    </Table>
  );
}
