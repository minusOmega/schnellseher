import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";

export const ExpanderArrow = styled(ArrowForwardIosSharpIcon)<{
  expand: number;
}>`
  ${({ theme, expand }) => `
  cursor: pointer;
  color: ${theme.palette.primary.main};
  transition: ${theme.transitions.create(["transform"], {
    duration: theme.transitions.duration.standard,
  })};
  transform: ${expand ? "rotate(90deg)" : ""};
  `}
`;
