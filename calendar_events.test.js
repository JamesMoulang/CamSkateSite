import { expect, describe, it } from "@jest/globals";
import {
  directAccessStrategy,
  alternativeTitleStrategy,
} from "./calendar_events";

describe("Direct Access Strategy", () => {
  const sessionConfig = {
    "beginner session": {},
    closed: {},
  };

  it("matches an exact key (lowercase input)", () => {
    const event = { summary: "closed" };
    const result = directAccessStrategy(event, sessionConfig);
    expect(result).toEqual({ title: "closed", ...sessionConfig["closed"] });
  });

  it("is case-insensitive when matching event summary", () => {
    const event = { summary: "CLOSED" };
    const result = directAccessStrategy(event, sessionConfig);
    expect(result).toEqual({ title: "CLOSED", ...sessionConfig["closed"] });
  });

  it("returns null when no match is found", () => {
    const event = { summary: "Top Secret Meeting" };
    const result = directAccessStrategy(event, sessionConfig);
    expect(result).toBeNull();
  });

  it("preserves the original casing of event.summary in the returned title", () => {
    const event = { summary: "Beginner Session" };
    const result = directAccessStrategy(event, sessionConfig);
    expect(result.title).toBe("Beginner Session");
  });

  it("returns null when sessionConfig is empty", () => {
    const event = { summary: "Morning Swim" };
    const result = directAccessStrategy(event, {});
    expect(result).toBeNull();
  });
});

describe("Alternative Title Strategy", () => {
  const sessionConfig = {
    "quads and blades": {
      altTitles: ["quads & blades", "quads blades"],
    },
  };

  it("returns a match when the event summary matches an altTitle", () => {
    const event = { summary: "Quads & Blades" };
    const result = alternativeTitleStrategy(event, sessionConfig);
    expect(result).toEqual({
      title: "quads and blades",
      altTitles: ["quads & blades", "quads blades"],
    });
  });

  it("is case-insensitive when matching altTitles", () => {
    const event = { summary: "QUADS & BLADES" };
    const result = alternativeTitleStrategy(event, sessionConfig);
    expect(result).toEqual({
      title: "quads and blades",
      altTitles: ["quads & blades", "quads blades"],
    });
  });

  it("uses the sessionConfig key (not the altTitle) as the returned title", () => {
    const event = { summary: "Quads & Blades" };
    const result = alternativeTitleStrategy(event, sessionConfig);
    expect(result.title).toBe("quads and blades");
  });

  it("returns null when the event summary matches no altTitles", () => {
    const event = { summary: "Top Secret Meeting" };
    const result = alternativeTitleStrategy(event, sessionConfig);
    expect(result).toBeNull();
  });

  it("returns null when sessionConfig is empty", () => {
    const event = { summary: "Quads and Blades" };
    const result = alternativeTitleStrategy(event, {});
    expect(result).toBeNull();
  });
});
