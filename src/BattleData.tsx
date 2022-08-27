import React, { useState } from "react";

export function BattleData({
  onChange,
}: {
  onChange?: (value: string) => void;
}) {
  const [report, setReport] = useState<string>("");
  return (
    <>
      <textarea onChange={(e) => setReport(e.target.value)} />
      <button onClick={() => onChange && onChange(report)}>
        Kampfbericht auswerten
      </button>
    </>
  );
}
