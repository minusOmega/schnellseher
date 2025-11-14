import styled from "@emotion/styled";

export const Table = styled("table")<{ cols?: number }>(
  ({ theme, cols }: any) => ({
    backgroundColor: theme.palette.background.default,
    display: "grid",
    gridTemplateColumns: `repeat(${cols || 15}, auto)`,
    width: "fit-content",
    /* don't allow the table to grow to fill available flex space */
    flex: "0 0 auto",
  })
);

export const Head = styled("thead")({
  display: "contents",
});

export const Body = styled("tbody")({
  display: "contents",
});
