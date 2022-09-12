import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { BattleData } from "./BattleData";
import { Reporter } from "./table/Reporter";
import logo from "./logo.png";

const Root = styled("div")({
  background: "linear-gradient( #CBB3A9, #D7C3B9 5%, #E3D6CF 10%)",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100vw",
  overflow: "scroll",
});

const Main = styled("div")({
  width: "100vw",
});

const Nav = styled("nav")({
  left: 0,
  position: "sticky",
  maxHeight: "50vh",
  backgroundImage: `url(${logo})`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  padding: 5,
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
    if (report === undefined) return;
    sessionStorage.setItem("report", JSON.stringify(report));
  }, [report]);
  return (
    <Root>
      <Nav>
        <BattleData initial={report} onChange={(data) => setReport(data)} />
      </Nav>
      <Main>{report ? <Reporter data={report} /> : <h1>Schnellseher</h1>}</Main>
    </Root>
  );
}

export default App;
