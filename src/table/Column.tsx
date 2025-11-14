import { Badge, styled } from "@mui/material";
import { OrderBy, OrderFunc } from "../reporter/reporter";
import { ArrowDownward, ArrowUpward, Sort } from "@mui/icons-material";

export const Column = styled("th")<{ stickyIndex?: number }>(
  ({ theme, stickyIndex = 2 }) => ({
    [`&:nth-of-type(${stickyIndex})`]: { zIndex: 2, left: 0 },
    alignItems: "flex-start",
    border: "1px solid black",
    padding: 8,
    display: "flex",
    position: "sticky",
    userSelect: "none",
    top: 0,
    backgroundColor: theme.palette.background.default,
    zIndex: 1,
  })
);

const FilterArrow = ({ order }: { order?: OrderBy }) => {
  if (order === "asc") return <ArrowUpward />;
  if (order === "desc") return <ArrowDownward />;
  return <Sort />;
};

export const FilterColumn = <T,>({
  children,
  onChange,
  name,
  func,
  order,
  pos,
  stickyIndex,
}: {
  name: keyof T;
  func?: OrderFunc<T>;
  order?: OrderBy;
  pos: number;
  onChange: (name: keyof T, order?: OrderFunc<T>) => void;
  stickyIndex?: number;
  children: React.ReactNode;
}) => {
  return (
    <Column
      stickyIndex={stickyIndex}
      style={{ cursor: "pointer" }}
      onClick={() => onChange(name, func)}
    >
      {children}
      <Badge badgeContent={pos + 1} invisible={pos === undefined || pos === 0}>
        <FilterArrow order={order} />
      </Badge>
    </Column>
  );
};
