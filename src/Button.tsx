import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import clsx from "clsx";

export const useStyles = createUseStyles({
  button: {
    cursor: "pointer",
    fontSize: "1.5rem",

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    verticalAlign: "middle",

    borderRadius: "50%",
    border: "0px none",
    backgroundColor: "inherit",
    transition: "background-color .5s ease 0ms",
    "&:hover": {
      backgroundColor: "rgba(255, 0, 0, 0.1)",
    },
  },
  fade: {
    transition: "background-color 1s ease 0ms",
    "&:active": {
      backgroundColor: "rgba(255, 0, 0, 0.3)",
    },
  },
});

export default function Button({
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const jss = useStyles();
  const [fade, setFade] = useState(false);
  return (
    <button
      {...props}
      className={clsx(fade && jss.fade, jss.button)}
      onMouseDown={(e) => {
        props.onMouseDown && props.onMouseDown(e);
        setFade(true);
      }}
      onMouseUp={(e) => {
        props.onMouseDown && props.onMouseDown(e);
        setFade(false);
      }}
    >
      {children}
    </button>
  );
}
