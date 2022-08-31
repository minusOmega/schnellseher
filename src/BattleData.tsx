import React, { useState } from "react";

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
      <textarea onChange={(e) => setReport(e.target.value)}>{report}</textarea>
      <button onClick={() => onChange && onChange(report)}>
        Kampfbericht auswerten
      </button>
    </>
  );
}
