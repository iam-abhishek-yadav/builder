# Builder

npm workspaces + Turborepo monorepo.

## Requirements

- Node.js >= 18
- npm 11.6.2 (see `devEngines` in root `package.json`)

## Setup

```sh
npm install
```

## Develop

Start all apps:

```sh
npm run dev
```

Start a single app from the repo root:

```sh
npm run dev --workspace=web
npm run dev --workspace=docs
```

Or from the app directory:

```sh
cd apps/web && npm run dev
```

| App  | Path       | Port |
| ---- | ---------- | ---- |
| web  | `apps/web` | 3000 |
| docs | `apps/docs`| 3001 |

`--workspace=<name>` tells npm which package’s script to run. The name matches the `"name"` field in that package’s `package.json`.

## Build

All packages:

```sh
npm run build
```

One package:

```sh
npm run build --workspace=web
```

## Other scripts

```sh
npm run lint
npm run check-types
npm run format
```

Same pattern for a single workspace:

```sh
npm run lint --workspace=web
npm run check-types --workspace=web
```

## Structure

```
apps/
  web/          Next.js app (port 3000)
  docs/         Next.js app (port 3001)
packages/
  ui/                 Shared React components (@repo/ui)
  eslint-config/      Shared ESLint configs (@repo/eslint-config)
  typescript-config/  Shared TypeScript configs (@repo/typescript-config)
```

## Useful links

- [Turborepo tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [Next.js](https://nextjs.org/docs)
