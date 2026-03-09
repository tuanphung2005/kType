# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Lesson Source

The app now ships with a large built-in Korean lesson pool and local phrase generator.

- no API key required
- works offline
- includes a broad mix of standalone vocabulary and generated sentence patterns

Lessons are shuffled and cached in-session to reduce repetition while keeping the pool large.
