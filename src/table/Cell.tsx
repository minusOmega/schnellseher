import { styled } from "@mui/material";

export const Cell = styled("td", {
  shouldForwardProp: (prop) => prop !== "backgroundColor",
})<{ backgroundColor?: string }>(({ backgroundColor = "white" }) => ({
  backgroundColor,
  border: "1px solid black",
  padding: 5,
}));

export const Header = styled("td", {
  shouldForwardProp: (prop) => prop !== "backgroundColor",
})<{ backgroundColor?: string }>(({ backgroundColor }) => ({
  left: 0,
  position: "sticky",
  backgroundColor,
  border: "1px solid black",
  padding: 5,
}));
