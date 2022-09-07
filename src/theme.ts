import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: "#0060DF",
    },
    secondary: {
      main: "#70C1A0",
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
