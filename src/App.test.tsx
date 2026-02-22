import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "./App";

test("renders App", () => {
  render(<App />);
  const element = screen.getByText(/Schnellseher/i);
  expect(element).toBeInTheDocument();
});
