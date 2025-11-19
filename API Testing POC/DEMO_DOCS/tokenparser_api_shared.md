# tokenparser-api-shared Design & Usage Guide

**Version 1 – 18/11/25**

This note explains the rationale, structure, dependencies, and consumer workflows for the shared TypeScript API package that now powers DEMOAPP001 and DEMOAPP003.

---

## 1. Why a Shared Package?

| Goal | Description |
| --- | --- |
| Single Source of Truth | Express host, Swagger wiring, token parsers, and logging utilities now live in one package so changes automatically benefit all TypeScript stacks. |
| Faster Parity | DEMOAPP001 (Cypress) and DEMOAPP003 (Playwright) import the same compiled artefacts, eliminating copy/paste drift. |
| Migration Foundation | Future demos (or the .NET/Python stacks) can consume the compiled token parser logic without depending on an entire app directory. |

---

## 2. Package Layout (`packages/tokenparser-api-shared/src`)

| Path | Purpose |
| --- | --- |
| `server.ts` | Provides `createTokenParserApp` and `startTokenParserServer` (Express host, middleware, Swagger). |
| `config.ts` | Logging configuration + env helpers (supports `TOKENPARSER_LOG_LEVEL`). |
| `services/logger.ts` | Shared logger abstraction. |
| `services/common-utils.ts`, `services/symbol-consts.ts` | Legacy helper utilities and token constants. |
| `utils/date-utils.ts` | Canonical UTC formatter. |
| `tokenparser/TokenDateParser.ts` / `TokenDynamicStringParser.ts` | Parser implementations. |
| `index.ts` | Re-exports everything so consumers can `import { startTokenParserServer } from "tokenparser-api-shared"`. |

TypeScript builds to `dist/` via `npm run build` (package) or `npm run shared:build` (repo root).

---

## 3. Dependencies

| Category | Packages |
| --- | --- |
| Runtime | `express`, `body-parser`, `swagger-jsdoc`, `swagger-ui-express`, `date-fns`, `js-yaml`. |
| Dev / Types | `typescript`, `@types/express`, `@types/node`, `@types/js-yaml`, `@types/swagger-jsdoc`, `@types/swagger-ui-express`, `@types/body-parser`. |

Consumers *do not* need to install these packages directly—the compiled output bundles the code. However, TypeScript consumers point to `dist/` via path aliases to avoid pulling in redundant source files.

---

## 4. How Each DEMO Uses It

| Demo | Usage |
| --- | --- |
| **DEMOAPP001 (Cypress)** | `src/server.ts` calls `startTokenParserServer({ port })`. Local `src/tokenparser/*`/`src/services/*` re-export shared modules. `tsconfig.json` maps imports to `../../packages/tokenparser-api-shared/dist`. |
| **DEMOAPP003 (Playwright TS)** | Mirrors DEMOAPP001: thin bootstrap + tsconfig path aliases. Runs the shared server on port `3001`. |
| **DEMOAPP002 (C#)** | Not yet consuming the package; still hosts its own .NET API. Migration candidate once TypeScript shared host exposes a formal contract (Swagger already matches). |
| **DEMOAPP004 (Python)** | Calls the FastAPI implementation; documentation references the shared package for parity but no code usage yet. |

> When modifying the shared package, rebuild (`npm run shared:build`) and run `npm run ts:check` in both TypeScript demos to ensure the new artefacts load correctly.

---

## 5. Development Workflow

1. **Edit shared source** under `packages/tokenparser-api-shared/src/**`.
2. **Build**: `npm run build` inside the package (or `npm run shared:build` at repo root).
3. **Consume**: TypeScript demos already point to `dist/`. No additional steps are required unless new exports are needed.
4. **Document**: Update README + architecture docs (as done for DEMOAPP001/003) and note changes in `API Testing POC/DEMO_DOCS/Shared_TS_API_Inventory.md`.

---

## 6. Future Enhancements

- Publish the package to an internal npm feed so other repositories can consume it.
- Add unit tests (ts-jest or vitest) covering the parser logic directly inside the shared package.
- Introduce optional hooks for logging sinks (e.g., winston transports) to integrate with ELK/Azure Monitor.

For detailed file inventories, see `API Testing POC/DEMO_DOCS/Shared_TS_API_Inventory.md`.
