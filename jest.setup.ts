import "@testing-library/jest-dom";

Object.defineProperty(window, "localStorage", {
  value: (() => {
    let store: Record<string, string> = {};
    return {
      getItem(key: string) {
        return store[key] || null;
      },
      setItem(key: string, value: string) {
        store[key] = value.toString();
      },
      removeItem(key: string) {
        delete store[key];
      },
      clear() {
        store = {};
      },
    };
  })(),
  writable: true,
});

jest.mock("jwt-decode", () => () => ({ exp: Date.now() / 1000 + 1000 }));
