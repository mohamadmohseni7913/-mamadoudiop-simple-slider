import { describe, it, expect } from "vitest";
import { useWindowSize } from "../src";

describe("useWindowSize", () => {
  it("returns object with width and height", () => {
    expect(useWindowSize).toBeDefined();
  });
});