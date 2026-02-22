// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/vitest";

function createStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

if (typeof window !== "undefined") {
  if (
    !("localStorage" in window) ||
    typeof window.localStorage?.getItem !== "function"
  ) {
    Object.defineProperty(window, "localStorage", {
      value: createStorageMock(),
      configurable: true,
    });
  }

  if (
    !("sessionStorage" in window) ||
    typeof window.sessionStorage?.getItem !== "function"
  ) {
    Object.defineProperty(window, "sessionStorage", {
      value: createStorageMock(),
      configurable: true,
    });
  }
}
