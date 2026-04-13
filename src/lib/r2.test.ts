import { describe, it, expect } from "vitest";
import {
  isImage,
  isAllowedType,
  maxBytes,
  MAX_IMAGE_BYTES,
  MAX_FILE_BYTES,
} from "@/lib/r2";

describe("isImage", () => {
  it("returns true for image MIME types", () => {
    expect(isImage("image/png")).toBe(true);
    expect(isImage("image/jpeg")).toBe(true);
    expect(isImage("image/gif")).toBe(true);
    expect(isImage("image/webp")).toBe(true);
    expect(isImage("image/svg+xml")).toBe(true);
  });

  it("returns false for non-image MIME types", () => {
    expect(isImage("application/pdf")).toBe(false);
    expect(isImage("text/plain")).toBe(false);
    expect(isImage("application/json")).toBe(false);
    expect(isImage("text/csv")).toBe(false);
  });

  it("returns false for unknown MIME types", () => {
    expect(isImage("application/octet-stream")).toBe(false);
    expect(isImage("video/mp4")).toBe(false);
    expect(isImage("")).toBe(false);
  });
});

describe("isAllowedType", () => {
  it("allows all image types", () => {
    expect(isAllowedType("image/png")).toBe(true);
    expect(isAllowedType("image/jpeg")).toBe(true);
    expect(isAllowedType("image/gif")).toBe(true);
    expect(isAllowedType("image/webp")).toBe(true);
    expect(isAllowedType("image/svg+xml")).toBe(true);
  });

  it("allows all file types", () => {
    expect(isAllowedType("application/pdf")).toBe(true);
    expect(isAllowedType("text/plain")).toBe(true);
    expect(isAllowedType("text/markdown")).toBe(true);
    expect(isAllowedType("application/json")).toBe(true);
    expect(isAllowedType("application/x-yaml")).toBe(true);
    expect(isAllowedType("text/yaml")).toBe(true);
    expect(isAllowedType("application/xml")).toBe(true);
    expect(isAllowedType("text/xml")).toBe(true);
    expect(isAllowedType("text/csv")).toBe(true);
    expect(isAllowedType("application/toml")).toBe(true);
  });

  it("rejects disallowed types", () => {
    expect(isAllowedType("video/mp4")).toBe(false);
    expect(isAllowedType("application/octet-stream")).toBe(false);
    expect(isAllowedType("application/zip")).toBe(false);
    expect(isAllowedType("")).toBe(false);
  });
});

describe("maxBytes", () => {
  it("returns 5 MB limit for images", () => {
    expect(maxBytes("image/png")).toBe(MAX_IMAGE_BYTES);
    expect(maxBytes("image/jpeg")).toBe(MAX_IMAGE_BYTES);
    expect(maxBytes("image/svg+xml")).toBe(MAX_IMAGE_BYTES);
    expect(MAX_IMAGE_BYTES).toBe(5 * 1024 * 1024);
  });

  it("returns 10 MB limit for non-image files", () => {
    expect(maxBytes("application/pdf")).toBe(MAX_FILE_BYTES);
    expect(maxBytes("text/plain")).toBe(MAX_FILE_BYTES);
    expect(maxBytes("application/json")).toBe(MAX_FILE_BYTES);
    expect(MAX_FILE_BYTES).toBe(10 * 1024 * 1024);
  });
});
