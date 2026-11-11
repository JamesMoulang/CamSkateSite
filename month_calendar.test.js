import { expect, describe, it } from "@jest/globals";
import {
  getMonthGrid,
  weekProgressDays,
  formatTimeRange,
  eventStartDate,
  dateKey,
} from "./month_calendar";

describe("getMonthGrid", () => {
  it("starts on the Monday on or before the 1st", () => {
    // 1st November 2026 is a Sunday
    const weeks = getMonthGrid(2026, 10);
    expect(dateKey(weeks[0][0])).toBe("2026-10-26");
    expect(weeks[0][6].getDate()).toBe(1);
  });

  it("covers every day of the month and nothing more than needed", () => {
    const weeks = getMonthGrid(2026, 10);
    expect(weeks).toHaveLength(6);
    expect(dateKey(weeks.at(-1)[0])).toBe("2026-11-30");
    for (const week of weeks) expect(week).toHaveLength(7);
  });

  it("needs only four rows for a February starting on a Monday", () => {
    expect(getMonthGrid(2027, 1)).toHaveLength(4);
  });
});

describe("weekProgressDays", () => {
  const monday = new Date(2026, 10, 9);

  it("is 0 before the week starts", () => {
    expect(weekProgressDays(monday, new Date(2026, 10, 8, 12))).toBe(0);
  });

  it("is 7 once the week is over", () => {
    expect(weekProgressDays(monday, new Date(2026, 10, 16, 0, 1))).toBe(7);
  });

  it("uses the day column plus the fraction of that day", () => {
    // Tuesday at noon
    expect(weekProgressDays(monday, new Date(2026, 10, 10, 12))).toBeCloseTo(
      1.5,
    );
  });
});

describe("formatTimeRange", () => {
  it("drops :00 and keeps other minutes", () => {
    const event = {
      start: { dateTime: new Date(2026, 10, 10, 18, 0).toISOString() },
      end: { dateTime: new Date(2026, 10, 10, 20, 30).toISOString() },
    };
    expect(formatTimeRange(event)).toBe("6pm-8:30pm");
  });

  it("labels all-day events", () => {
    expect(formatTimeRange({ start: { date: "2026-11-10" } })).toBe("All day");
  });
});

describe("eventStartDate", () => {
  it("reads all-day dates as local dates", () => {
    expect(dateKey(eventStartDate({ start: { date: "2026-11-10" } }))).toBe(
      "2026-11-10",
    );
  });
});
