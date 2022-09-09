import React, { useState } from "react";
import { Button, IconButton, styled } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const Textarea = styled("textarea")({
  margin: 5,
  minWidth: 229.9,
  width: "100%",
  whiteSpace: "pre",
  overflowWrap: "normal",
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
      <div>
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
      </div>
    </>
  );
}
