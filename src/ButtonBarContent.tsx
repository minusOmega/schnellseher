import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { buttonBarId } from "./BattleData";

type ButtonBarContentProps = {
  children: React.ReactNode;
};

export default function ButtonBarContent({ children }: ButtonBarContentProps) {
  const container = useRef(document.createElement("div"));

  useEffect(() => {
    const buttonBar = document.getElementById(buttonBarId);
    if (!buttonBar)
      throw new Error("<ButtonBarContent/> must be a child of <ButtonBar/>");
    const current = container.current;
    buttonBar.classList.forEach((className) => {
      // use parent styling
      current.classList.add(className);
    });

    buttonBar.appendChild(current);
    return () => {
      buttonBar.removeChild(current);
    };
  }, []);

  return ReactDOM.createPortal(children, container.current);
}
