import { describe, expect, it, vi, afterEach } from "vitest";
import { relativeTime } from "./time";

describe("relativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for a timestamp within the last second", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00.000Z"));
    expect(relativeTime("2024-01-01T12:00:00.500Z")).toBe("just now");
  });

  it("returns a minute-based relative string", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:05:00.000Z"));
    expect(relativeTime("2024-01-01T12:00:00.000Z")).toBe("5 minutes ago");
  });

  it("returns an hour-based relative string", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T14:00:00.000Z"));
    expect(relativeTime("2024-01-01T12:00:00.000Z")).toBe("2 hours ago");
  });

  it("returns a day-based relative string", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-03T12:00:00.000Z"));
    expect(relativeTime("2024-01-01T12:00:00.000Z")).toBe("2 days ago");
  });

  it("returns 'last week' for ~7 days ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-08T12:00:00.000Z"));
    expect(relativeTime("2024-01-01T12:00:00.000Z")).toBe("last week");
  });
});
