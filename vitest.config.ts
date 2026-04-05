import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    globals: true,
    // Only .test.ts — no component tests
    include: ["src/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/actions/**/*.ts", "src/lib/**/*.ts"],
      exclude: [
        "src/lib/prisma.ts",
        "src/lib/session.ts",
        "src/lib/email.ts",
        "**/*.test.ts",
      ],
    },
  },
});
