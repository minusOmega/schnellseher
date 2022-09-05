import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { BattleData } from "./BattleData";
import { Reporter } from "./table/Reporter";
import logo from "./logo.png";

export const useStyles = createUseStyles({
  app: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
  },
  nav: {
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
  },
});

function App() {
  const jss = useStyles();
  const [report, setReport] = useState<string | undefined>(() => {
    const stored = sessionStorage.getItem("report");
    return stored ? JSON.parse(stored) : undefined;
  });
  useEffect(() => {
    if (!report) return;
    sessionStorage.setItem("report", JSON.stringify(report));
  }, [report]);
  return (
    <div className={jss.app}>
      <nav className={jss.nav}>
        <p>Schnellseher</p>
        <BattleData initial={report} onChange={(data) => setReport(data)} />
      </nav>
      {report && <Reporter data={report} />}
    </div>
  );
}

export default App;
