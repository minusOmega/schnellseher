import { styled } from "@mui/material/styles";
import { ArrowForwardIosSharp, Tag } from "@mui/icons-material";
import { orange } from '@mui/material/colors';

export const ExpanderArrow = styled(ArrowForwardIosSharp)<{
  expand: number;
}>`
  ${({ theme, expand }) => `
  cursor: pointer;
  color: ${orange[800]};
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
