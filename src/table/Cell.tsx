import { styled } from "@mui/material";

export const Cell = styled("td")<{
  fontWeight?: "normal" | "bold" | "bolder" | "lighter";
}>(({ fontWeight, theme }) => ({
  fontWeight: fontWeight,
  backgroundColor: theme.palette.background.default,
  border: "1px solid black",
  padding: 5,
}));

export const Header = styled("td")<{
  fontWeight?: "normal" | "bold" | "bolder" | "lighter";
  whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces";
}>(({ whiteSpace, fontWeight, theme }) => ({
  fontWeight: fontWeight,
  left: 0,
  position: "sticky",
  backgroundColor: theme.palette.background.default,
  border: "1px solid black",
  padding: 5,
  whiteSpace,
}));
