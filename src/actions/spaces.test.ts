import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { teamId: "team-1" } }),
}));

const mockInsertSpace = vi.fn().mockResolvedValue({
  id: "space-1",
  name: "My Space",
  color: "#60a5fa",
});

vi.mock("@/lib/db/spaces", () => ({
  insertSpace: mockInsertSpace,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { createSpace } = await import("@/actions/spaces");
const { auth } = await import("@/auth");
const { revalidatePath } = await import("next/cache");

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth).mockResolvedValue({ user: { teamId: "team-1" } } as never);
  mockInsertSpace.mockResolvedValue({ id: "space-1", name: "My Space", color: "#60a5fa" });
});

describe("createSpace", () => {
  const validInput = {
    name: "My Space",
    description: "A test space",
    color: "#60a5fa",
    visibility: "PRIVATE_TO_TEAM" as const,
  };

  it("creates space and revalidates dashboard on success", async () => {
    const result = await createSpace(validInput);
    expect(result.success).toBe(true);
    expect(mockInsertSpace).toHaveBeenCalledWith("team-1", {
      name: "My Space",
      description: "A test space",
      color: "#60a5fa",
      visibility: "PRIVATE_TO_TEAM",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("returns data on success", async () => {
    const result = await createSpace(validInput);
    if (!result.success) throw new Error("Expected success");
    expect(result.data).toEqual({ id: "space-1", name: "My Space", color: "#60a5fa" });
  });

  it("returns error when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const result = await createSpace(validInput);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toBe("Not authenticated");
    expect(mockInsertSpace).not.toHaveBeenCalled();
  });

  it("returns error for empty name", async () => {
    const result = await createSpace({ ...validInput, name: "" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toMatch(/required/i);
  });

  it("returns error for invalid color hex", async () => {
    const result = await createSpace({ ...validInput, color: "notahex" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toMatch(/color/i);
  });

  it("accepts PUBLIC visibility", async () => {
    const result = await createSpace({ ...validInput, visibility: "PUBLIC" });
    expect(result.success).toBe(true);
    expect(mockInsertSpace).toHaveBeenCalledWith(
      "team-1",
      expect.objectContaining({ visibility: "PUBLIC" })
    );
  });

  it("defaults visibility to PRIVATE_TO_TEAM when omitted", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { visibility: _visibility, ...withoutVisibility } = validInput;
    const result = await createSpace(withoutVisibility);
    expect(result.success).toBe(true);
    expect(mockInsertSpace).toHaveBeenCalledWith(
      "team-1",
      expect.objectContaining({ visibility: "PRIVATE_TO_TEAM" })
    );
  });

  it("handles null description", async () => {
    const result = await createSpace({ ...validInput, description: null });
    expect(result.success).toBe(true);
    expect(mockInsertSpace).toHaveBeenCalledWith(
      "team-1",
      expect.objectContaining({ description: null })
    );
  });

  it("returns error for name exceeding 100 chars", async () => {
    const result = await createSpace({ ...validInput, name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });
});
