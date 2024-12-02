import React, { useState } from "react";
import { Button, IconButton, styled } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { parseInput } from "./reporter/reporter";
export const buttonBarId = "button-bar";

const Textarea = styled("textarea")({
  minWidth: 229.9,
  whiteSpace: "pre",
  overflowWrap: "normal",
  marginLeft: 10,
  marginRight: 10,
  marginBottom: 5,
});

const ButtonContainer = styled("div")({
  marginLeft: 10,
  marginRight: 10,
});

const ButtonGroup = styled("div")({
  display: "flex",
});

const ButtonBar = styled("div")({
  minWidth: 300,
  display: "flex",
  justifyContent: "start",
  flexWrap: "wrap",
  gap: 5,
});

export function BattleData({
  initial = "",
  onChange,
}: {
  initial?: string;
  onChange?: (value: string) => void;
}) {
  const [report, setReport] = useState<string>(initial);
  const battles = report ? parseInput(report) : undefined;
  return (
    <>
      <Textarea
        placeholder="Kampfbericht hier einfügen"
        rows={5}
        onChange={(e) => setReport(e.target.value)}
        value={report}
      />
      <ButtonContainer>
        <ButtonBar id={buttonBarId}>
          <ButtonGroup>
            <Button variant="contained" onClick={() => onChange && onChange(report)}>
              {(battles?.length || 0) >= 1
                ? `${battles?.length} Kampfberichte auswerten (${battles?.reduce(
                    (acc, b) => acc + b.round,
                    0
                  )} Runden)`
                : "Kampfbericht auswerten"}
            </Button>
            <IconButton
              color="primary"
              onClick={() => {
                setReport("");
                onChange && onChange("");
              }}
            >
              <DeleteIcon />
            </IconButton>
          </ButtonGroup>
        </ButtonBar>
      </ButtonContainer>
    </>
  );
}
