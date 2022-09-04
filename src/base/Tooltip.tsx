import React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    position: "relative",
    display: "inline-block",
    borderBottom: "1px dotted Black",
    "&:hover $tooltip": {
      visibility: "visible",
    },
  },
  tooltip: {
    visibility: "collapse",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    color: "#fff",
    textAlign: "center",
    borderRadius: 6,
    padding: "5px 10px",
    position: "absolute",
    zIndex: "1",
    top: "-5px",
    left: "calc(100% + 10px)",
    "&:after": {
      content: "''",
      position: "absolute",
      top: "50%",
      right: "100%",
      marginTop: "-5px",
      borderWidth: "5px",
      borderStyle: "solid",
      borderColor: "transparent rgba(0, 0, 0, 0.75) transparent transparent",
    },
  },
});

type TooltipType = {
  title: React.ReactNode;
  children: React.ReactNode;
};

export default function Tooltip({ children, title }: TooltipType) {
  const jss = useStyles();

  return (
    <div className={jss.root}>
      {children}
      <span className={jss.tooltip}>{title}</span>
    </div>
  );
}
