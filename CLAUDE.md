# Axon

Axon is an open-source, high-performance repository designed to eliminate knowledge silos within software engineering teams. Inspired by the way neurons transmit vital impulses, Axon acts as the central nervous system for your team's collective brain.

@AGENTS.md

## Context Files

Read the following files to get a better understanding of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

```bash
pnpm dev        # start dev server
pnpm build      # production build
pnpm lint       # run ESLint
```

## Stack

- **Next.js 16.2.1** with App Router (`src/app/`) — see `AGENTS.md` warning about breaking changes
- **React 19** with React Compiler (`babel-plugin-react-compiler`) — manual memoization (`useMemo`, `useCallback`, `memo`) is unnecessary
- **Tailwind CSS v4** — uses `@import "tailwindcss"` (not `@tailwind` directives); theme customization goes in `@theme {}` blocks in CSS
- **TypeScript 5**
- **pnpm** as package manager

## Neon MCP

- Project ID: `dark-thunder-44552316`
- **Always use the `development` branch (`br-muddy-bread-ablchyeh`) for all queries and operations**
- **Never touch the `production` branch (`br-flat-heart-abule1ln`)**
