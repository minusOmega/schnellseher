import React, { useEffect, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { styled } from "@mui/material/styles";
import { BattleData } from "./BattleData";
import Reporter from "./table/Reporter";
import logo from "./logo.png";
import DiscordIcon from "./icons/Discord";
import GitHubIcon from '@mui/icons-material/GitHub';
import { createTheme, IconButton } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { cyan, teal, blue, lightBlue } from '@mui/material/colors';

const ColorModeContext = React.createContext({ toggleColorMode: () => { } });

const Root = styled("div")(({ theme }) => ({
  color: theme.palette.text.primary,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100vw",
  overflow: "scroll",
  background: `url(${logo}) no-repeat center center, ${theme.palette.grey[800]}`,
}));

const Main = styled("div")({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});

const Nav = styled("nav")({
  left: 0,
  position: "sticky",
  maxHeight: "50vh",
  padding: 5,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "center",
  fontSize: "calc(10px + 2vmin)",
  color: "white",
});

const Header = styled("h1")({
  width: "100%",
});

const TopBar = styled("div")({
  display: "flex",
  justifyContent: "space-between",
});

function App() {

  const [mode, setMode] = React.useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem("mode");
    if(stored === 'light') return stored;
    else return 'dark';
  });
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = (prevMode === 'light' ? 'dark' : 'light');
          localStorage.setItem("mode", nextMode);
          return nextMode;
        });
        
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
              // palette values for light mode
              primary: {
                dark: cyan[800],
                main: cyan[600],
                light: cyan[100],
              },
              secondary: {
                dark: teal.A700,
                main: teal.A400,
                light: teal.A100,
              },
            }
            : {
              // palette values for dark mode
              primary: {
                dark: cyan[900],
                main: cyan[800],
                light: cyan[700],
              },
              secondary: {
                dark: teal[400],
                main: teal[600],
                light: teal[800],
              },
            }),
        },
      }),
    [mode],
  );

  const [report, setReport] = useState<string | undefined>(() => {
    const stored = sessionStorage.getItem("report");
    return stored ? JSON.parse(stored) : undefined;
  });

  useEffect(() => {
    if (report === undefined) return;
    sessionStorage.setItem("report", JSON.stringify(report));
  }, [report]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Root>
          <Nav>
            <TopBar>
              <IconButton sx={{ ml: 1, justifySelf: "left" }} onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <div>
                <IconButton
                  href="https://github.com/minusOmega/schnellseher"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon />
                </IconButton>
                <IconButton
                  href="https://discord.gg/suaTb7arN9"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DiscordIcon />
                </IconButton>
              </div>
            </TopBar>
            <BattleData initial={report} onChange={(data) => setReport(data)} />
          </Nav>
          <Main>
            {report ? (
              <Reporter data={report} />
            ) : (

              <Header>Schnellseher</Header>

            )}
          </Main>
        </Root>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;