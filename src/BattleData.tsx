import React, { useState } from "react";
import { Button, styled } from "@mui/material";

const Textarea = styled("textarea")({
  margin: 20,
  minWidth: 229.9,
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
        onChange={(e) => setReport(e.target.value)}
        defaultValue={report}
      />
      <Button variant="contained" onClick={() => onChange && onChange(report)}>
        Kampfbericht auswerten
      </Button>
    </>
  );
}
