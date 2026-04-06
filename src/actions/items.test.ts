import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1" } }),
}));

vi.mock("@/lib/db/users", () => ({
  getUser: vi.fn().mockResolvedValue({ id: "user-1", teamId: "team-1" }),
}));

const mockGetItemRawMetadata = vi.fn().mockResolvedValue({});
const mockDbUpdateItem = vi.fn();
const mockSoftDeleteItem = vi.fn().mockResolvedValue(true);

vi.mock("@/lib/db/items", () => ({
  getItemRawMetadata: mockGetItemRawMetadata,
  updateItem: mockDbUpdateItem,
  softDeleteItem: mockSoftDeleteItem,
}));

vi.mock("@/lib/type-config", () => ({
  ITEM_TYPES: [
    "SNIPPET",
    "RUNBOOK",
    "SECRET_REF",
    "DOC",
    "RESOURCE",
    "ASSET",
    "BLUEPRINT",
  ] as const,
}));

// Import after mocks
const { updateItem, deleteItem } = await import("@/actions/items");
const { auth } = await import("@/auth");
const { getUser } = await import("@/lib/db/users");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const updatedItem = { id: "item-1", title: "T", type: "SNIPPET" };

beforeEach(() => {
  vi.clearAllMocks();
  mockDbUpdateItem.mockResolvedValue(updatedItem);
  mockGetItemRawMetadata.mockResolvedValue({});
  mockSoftDeleteItem.mockResolvedValue(true);
  vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
  vi.mocked(getUser).mockResolvedValue({ id: "user-1", teamId: "team-1" } as never);
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe("updateItem — validation", () => {
  it("returns error when title is empty", async () => {
    const result = await updateItem("item-1", {
      type: "DOC",
      title: "   ",
      content: "some content",
    });
    expect(result.success).toBe(false);
    if (!result.success && typeof result.error !== "string") {
      expect(result.error.title).toBeDefined();
    }
  });

  it("returns error when RESOURCE url is invalid", async () => {
    const result = await updateItem("item-1", {
      type: "RESOURCE",
      title: "My resource",
      url: "not-a-url",
    });
    expect(result.success).toBe(false);
    if (!result.success && typeof result.error !== "string") {
      expect(result.error.url).toBeDefined();
    }
  });

  it("accepts a valid RESOURCE url", async () => {
    const result = await updateItem("item-1", {
      type: "RESOURCE",
      title: "My resource",
      url: "https://example.com",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Content assembly ─────────────────────────────────────────────────────────

describe("updateItem — content assembly", () => {
  it("assembles RESOURCE content as URL line + notes", async () => {
    await updateItem("item-1", {
      type: "RESOURCE",
      title: "Link",
      url: "https://example.com",
      notes: "Some notes",
    });

    expect(mockDbUpdateItem).toHaveBeenCalledWith(
      "item-1",
      "team-1",
      expect.objectContaining({
        content: "URL: https://example.com\nSome notes",
      }),
    );
  });

  it("assembles RESOURCE content without notes", async () => {
    await updateItem("item-1", {
      type: "RESOURCE",
      title: "Link",
      url: "https://example.com",
      notes: null,
    });

    expect(mockDbUpdateItem).toHaveBeenCalledWith(
      "item-1",
      "team-1",
      expect.objectContaining({ content: "URL: https://example.com" }),
    );
  });

  it("passes content directly for DOC", async () => {
    await updateItem("item-1", {
      type: "DOC",
      title: "My doc",
      content: "# Hello",
    });

    expect(mockDbUpdateItem).toHaveBeenCalledWith(
      "item-1",
      "team-1",
      expect.objectContaining({ content: "# Hello" }),
    );
  });

  it("passes content directly for RUNBOOK", async () => {
    await updateItem("item-1", {
      type: "RUNBOOK",
      title: "Deploy",
      content: "```bash\nnpm run deploy\n```",
    });

    expect(mockDbUpdateItem).toHaveBeenCalledWith(
      "item-1",
      "team-1",
      expect.objectContaining({ content: "```bash\nnpm run deploy\n```" }),
    );
  });

  it("does not pass content for ASSET", async () => {
    await updateItem("item-1", {
      type: "ASSET",
      title: "Diagram",
      content: "should be ignored",
    });

    const call = mockDbUpdateItem.mock.calls[0][2];
    expect(call.content).toBeUndefined();
  });
});

// ─── SNIPPET metadata merge ───────────────────────────────────────────────────

describe("updateItem — SNIPPET metadata", () => {
  it("sets language in metadata", async () => {
    await updateItem("item-1", {
      type: "SNIPPET",
      title: "My snippet",
      content: "const x = 1",
      language: "typescript",
    });

    expect(mockDbUpdateItem).toHaveBeenCalledWith(
      "item-1",
      "team-1",
      expect.objectContaining({
        metadata: expect.objectContaining({ language: "typescript" }),
      }),
    );
  });

  it("merges language into existing metadata without overwriting other keys", async () => {
    mockGetItemRawMetadata.mockResolvedValue({ someOtherKey: "preserved" });

    await updateItem("item-1", {
      type: "SNIPPET",
      title: "My snippet",
      content: "const x = 1",
      language: "python",
    });

    expect(mockDbUpdateItem).toHaveBeenCalledWith(
      "item-1",
      "team-1",
      expect.objectContaining({
        metadata: { someOtherKey: "preserved", language: "python" },
      }),
    );
  });

  it("sets language to null when empty string provided", async () => {
    await updateItem("item-1", {
      type: "SNIPPET",
      title: "My snippet",
      content: "const x = 1",
      language: "",
    });

    expect(mockDbUpdateItem).toHaveBeenCalledWith(
      "item-1",
      "team-1",
      expect.objectContaining({
        metadata: expect.objectContaining({ language: null }),
      }),
    );
  });
});

// ─── DB failure ───────────────────────────────────────────────────────────────

describe("updateItem — DB failure", () => {
  it("returns error when item is not found", async () => {
    mockDbUpdateItem.mockResolvedValue(null);

    const result = await updateItem("item-1", {
      type: "DOC",
      title: "My doc",
      content: "content",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });
});

// ─── deleteItem ───────────────────────────────────────────────────────────────

describe("deleteItem", () => {
  it("returns success when item is soft-deleted", async () => {
    const result = await deleteItem("item-1");
    expect(result.success).toBe(true);
    expect(mockSoftDeleteItem).toHaveBeenCalledWith("item-1", "team-1");
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const result = await deleteItem("item-1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not authenticated/i);
    expect(mockSoftDeleteItem).not.toHaveBeenCalled();
  });

  it("returns error when user has no teamId", async () => {
    vi.mocked(getUser).mockResolvedValueOnce(null);
    const result = await deleteItem("item-1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/user not found/i);
    expect(mockSoftDeleteItem).not.toHaveBeenCalled();
  });

  it("returns error when item does not exist or already deleted", async () => {
    mockSoftDeleteItem.mockResolvedValueOnce(false);
    const result = await deleteItem("item-1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found|already deleted/i);
  });
});
