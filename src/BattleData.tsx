import React, { useState } from "react";
import { Button, IconButton, styled } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
export const buttonBarId = "button-bar";

const Textarea = styled("textarea")({
  minWidth: 229.9,
  whiteSpace: "pre",
  overflowWrap: "normal",
  marginLeft: 10,
  marginRight: 10,
  marginBottom: 5,
});

const ButtonGroup = styled("div")({
  display: "flex",
});

const ButtonBar = styled("div")({
  minWidth: 300,
  display: "flex",
  justifyContent: "space-evenly",
  flexFlow: "row-reverse",
  marginLeft: 10,
  marginRight: 10,
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

  return (
    <>
      <Textarea
        placeholder="Kampfbericht hier einfügen"
        rows={5}
        onChange={(e) => setReport(e.target.value)}
        value={report}
      />
      <ButtonBar id={buttonBarId}>
        <ButtonGroup>
          <Button
            variant="contained"
            onClick={() => onChange && onChange(report)}
          >
            Kampfbericht auswerten
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
    </>
  );
}
