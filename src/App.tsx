import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { BattleData } from "./BattleData";
import { Reporter } from "./table/Reporter";
import logo from "./logo.png";

const Root = styled("div")({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100vw",
});

const Nav = styled("nav")({
  maxHeight: "50vh",
  backgroundImage: `url(${logo})`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  backgroundColor: "#DFCFC9",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "calc(10px + 2vmin)",
  color: "white",
  "& textarea": {
    maxWidth: "90vw",
  },
});

function App() {
  const [report, setReport] = useState<string | undefined>(() => {
    const stored = sessionStorage.getItem("report");
    return stored ? JSON.parse(stored) : undefined;
  });
  useEffect(() => {
    if (!report) return;
    sessionStorage.setItem("report", JSON.stringify(report));
  }, [report]);
  return (
    <Root>
      <Nav>
        <p>Schnellseher</p>
        <BattleData initial={report} onChange={(data) => setReport(data)} />
      </Nav>
      {report && <Reporter data={report} />}
    </Root>
  );
}

export default App;
