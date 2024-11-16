import { styled } from "@mui/material";

export const Cell = styled("td", {
  shouldForwardProp: (prop) => prop !== "backgroundColor",
})<{
  backgroundColor?: string;
  fontWeight?: "normal" | "bold" | "bolder" | "lighter";
}>(({ backgroundColor = "white", fontWeight }) => ({
  fontWeight: fontWeight,
  backgroundColor,
  border: "1px solid black",
  padding: 5,
}));

export const Header = styled("td", {
  shouldForwardProp: (prop) => prop !== "backgroundColor",
})<{
  backgroundColor?: string;
  fontWeight?: "normal" | "bold" | "bolder" | "lighter";
  whitespace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces";
}>(({ backgroundColor, whitespace, fontWeight }) => ({
  fontWeight: fontWeight,
  left: 0,
  position: "sticky",
  backgroundColor,
  border: "1px solid black",
  padding: 5,
  whitespace,
}));
