import { styled } from "@mui/material";

export const Cell = styled("td")<{
  variant?: "highlight" | "normal";
}>(({ variant, theme }: any) => ({
  backgroundColor: theme.palette.background.default,
  border: "1px solid black",
  padding: 5,
  color:
    variant === "highlight"
      ? theme.palette.secondary.dark
      : theme.palette.text.primary,
}));

export const Header = styled("td")<{
  variant?: "highlight" | "normal";
}>(({ variant, theme }) => ({
  left: 0,
  position: "sticky",
  backgroundColor: theme.palette.background.default,
  border: "1px solid black",
  padding: 5,
  color:
    variant === "highlight"
      ? theme.palette.secondary.dark
      : theme.palette.text.primary,
}));
