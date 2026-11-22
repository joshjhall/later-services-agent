import "@testing-library/jest-dom/vitest";

// cmdk (Find or ask) measures its list and scrolls items into view; jsdom has neither.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= () => {};
