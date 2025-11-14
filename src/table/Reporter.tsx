import React, { useMemo, useState } from "react";
import {
  styled,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Divider,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import reporter, { GroupBy, ReportType } from "../reporter/reporter";
import ButtonBarContent from "../ButtonBarContent";
import Loot from "./LootTable";
import { BattleReportTable } from "./BattleReportTable";
import { DefeatsTable } from "./DefeatsTable";
import {
  Bandage,
  Monster,
  LootBag,
  CrossedSwords,
  ArrowsShield,
  Sword02,
  Sword03,
  Grave,
} from "../icons/Icons";
import { parse } from "path";

const LootTable = styled("div")({
  display: "flex",
  marginLeft: 48,
});

const groupTypeMap: {
  [key: string]: { groupBy: GroupBy; type: ReportType };
} = {
  Participant: { groupBy: ["participant", "weapon"], type: "ausgeteilt" },
  Target: { groupBy: ["target", "participant", "weapon"], type: "erhalten" },
};

export default function Reporter({ data }: { data: string }) {
  const [showMonster, setShowMonster] = useState(false);
  const [groupType, setGroupType] = React.useState<string>("Participant");
  const [showLoot, setShowLoot] = React.useState<boolean>(true);
  const [showDefeated, setDefeated] = React.useState<boolean>(false);
  const [apPerRound, setApPerRound] = React.useState<number>(2);
  const [showBandaging, setShowBandaging] = React.useState<boolean>(false);
  const [showBattles, setShowBattles] = React.useState<boolean>(false);
  const { groupBy, type } = groupTypeMap[groupType];
  const [
    memoizedReport,
    memorizedLoot,
    memorizedItems,
    memorizedValue,
    memorizedDescriptions,
    memorizedExp,
    memorizedInfo,
    memorizedParticipants,
    memorizedDefeats,
    memorizedDamageBefore,
    memorizedDefeatsByKey,
    memorizedDamageBeforeByKey,
  ] = useMemo(
    () =>
      reporter(
        data,
        showBattles ? ["start", ...groupBy] : groupBy,
        showBandaging,
        apPerRound
      ),
    [data, showBattles, groupBy, showBandaging, apPerRound]
  );

  const handleGroupTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    next: string
  ) => {
    if (next !== null) setGroupType(next);
  };

  const GroupTypeToggle = () => (
    <Tooltip title="Schaden">
      <ToggleButtonGroup
        exclusive
        color="primary"
        value={groupType}
        onChange={handleGroupTypeChange}
      >
        <ToggleButton value={"Participant"}>
          <CrossedSwords style={{ width: 24, height: 24 }} />
        </ToggleButton>

        <ToggleButton value={"Target"}>
          <ArrowsShield style={{ width: 24, height: 24 }} />
        </ToggleButton>
      </ToggleButtonGroup>
    </Tooltip>
  );

  const BandagingToggle = () => (
    <Tooltip title="Bandagieren">
      <ToggleButton
        color="primary"
        value={"check"}
        selected={showBandaging}
        onChange={() => setShowBandaging((prev) => !prev)}
      >
        <Bandage style={{ width: 24, height: 24 }} />
      </ToggleButton>
    </Tooltip>
  );

  const BattlesToggle = () => (
    <Tooltip title="Kämpfe">
      <ToggleButton
        color="primary"
        value={"check"}
        selected={showBattles}
        onChange={() => setShowBattles((prev) => !prev)}
      >
        {showBattles ? (
          <Sword03 style={{ width: 24, height: 24 }} />
        ) : (
          <Sword02 style={{ width: 24, height: 24 }} />
        )}
      </ToggleButton>
    </Tooltip>
  );

  const LootToggle = () => (
    <Tooltip title="Beute">
      <ToggleButton
        color="primary"
        value={"check"}
        selected={showLoot}
        onChange={() => setShowLoot((prev) => !prev)}
      >
        <LootBag style={{ width: 24, height: 24 }} />
      </ToggleButton>
    </Tooltip>
  );

  const DefeatedToggle = () => (
    <Tooltip title="Niederlagen">
      <ToggleButton
        color="primary"
        value={"check"}
        selected={showDefeated}
        onChange={() => setDefeated((prev) => !prev)}
      >
        <Grave style={{ width: 24, height: 24 }} />
      </ToggleButton>
    </Tooltip>
  );

  const ApToggle = () => (
    <FormControl fullWidth>
      <InputLabel id="ap-label">AP</InputLabel>
      <Select
        labelId="ap-label"
        id="ap-select"
        value={apPerRound.toString()}
        label="AP"
        onChange={(event: SelectChangeEvent) => {
          setApPerRound(parseInt(event.target.value));
        }}
      >
        <MenuItem value={1}>-</MenuItem>
        <MenuItem value={2}>2</MenuItem>
        <MenuItem value={4}>4</MenuItem>
        <MenuItem value={8}>8</MenuItem>
      </Select>
    </FormControl>
  );

  const MonsterToggle = () => (
    <Tooltip title="Monster">
      <ToggleButton
        color="primary"
        value={"check"}
        selected={showMonster}
        onChange={() => setShowMonster((prev) => !prev)}
      >
        <Monster style={{ width: 24, height: 24 }} />
      </ToggleButton>
    </Tooltip>
  );

  const VerticalDivider = () => (
    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
  );

  const sxFlex = {
    display: "flex",
    padding: 0.75,
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
        </Paper>
        <Paper sx={sxFlex}>
          <LootToggle />
          <VerticalDivider />
          <DefeatedToggle />
        </Paper>
        <Paper sx={sxFlex}>
          <ApToggle />
        </Paper>
      </ButtonBarContent>
      {showDefeated && (
        <DefeatsTable
          participants={memorizedParticipants}
          defeatsByKey={memorizedDefeatsByKey}
          damageBeforeByKey={memorizedDamageBeforeByKey}
          damageBefore={memorizedDamageBefore || {}}
          defeats={memorizedDefeats}
          showMonster={showMonster}
        />
      )}
      {showLoot && (
        <LootTable>
          <Loot name="Jagdbeute" data={memorizedLoot} items={memorizedItems} />
        </LootTable>
      )}
      {showLoot && (
        <LootTable>
          <Loot
            name="Werte"
            data={memorizedValue}
            items={memorizedDescriptions}
          />
        </LootTable>
      )}
      {apPerRound && (
        <LootTable>
          <Loot
            name="Erfahrung"
            data={memorizedExp}
            items={memorizedInfo}
            expanded
          />
        </LootTable>
      )}
      <BattleReportTable
        report={memoizedReport}
        showMonster={showMonster}
        type={type}
      />
    </>
  );
}
