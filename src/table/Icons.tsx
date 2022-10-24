import { styled } from "@mui/material/styles";
import { ArrowForwardIosSharp, Tag } from "@mui/icons-material";

export const ExpanderArrow = styled(ArrowForwardIosSharp)<{
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

export const Hash = styled(Tag)<{
  active: number;
}>`
  ${({ theme, active }) => `
  cursor: pointer;
  color: ${active ? theme.palette.primary.main : theme.palette.grey};
  transition: ${theme.transitions.create(["transform"], {
    duration: theme.transitions.duration.standard,
  })};
  `}
`;
