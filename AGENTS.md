# migration.anychart.com — Agent Guide

AnyChart v7→v8 JavaScript API migration tool: a small Express app plus a CLI. Plain ES5 Node, Node 20 in Docker. **Frozen utility: minimal bug fixes only, no new features.** Online at https://migration.anychart.com/.

## Start Here

- Standalone repo with its own `package.json`; do not run workspace-level installs for it. Run `npm ci` here only if you must run it locally.
- Read `server.js` (98 lines) and `src/migration.js` first.
- JIRA: this project has no JIRA project (skipped in the workspace routing table), so no plan sync.

## Commands

```bash
npm ci
node server.js -p 3001        # web UI at http://localhost:3001
node server.js -p 3001 -t     # same, plus Google Tag Manager injected into the page (what production runs)
node cli.js <path> [-r] [-e html] [-l <local path|CDN>] [-v <version>] [-b <bundle>] [-t <replacer>] [-f <modules>]
```

`-p` is required (`server.js` prints help with no arguments). `-t` on `server.js` is `--tag-manager`, not "trust proxy" or "transform". `npm test` is the default placeholder and fails; there are no tests.

## High-Value Paths

- `server.js`: Express server; `GET /` serves `index.html`, `POST /migrate` runs `migrate(req.body.code)` and returns `{code, error?}`
- `cli.js`: console migration of files or folders
- `src/migration.js`: entry that applies the replacers
- `src/*-replacer.js` with `src/deprecated-api.js`, `enums.js`, `grid`, `interactivity-state`, `mapAs`, `modules`: v7→v8 mapping tables and replacers; `src/options-map.js` maps request options to CLI args
- `Dockerfile`: `node:20-alpine`, `CMD ["node","server.js","-p","3001","-t"]`
- `.github/workflows/deploy.yml`: on push to `master` (path-filtered) builds and pushes `anychart-web-migration:latest` to Docker Hub

## Repo-Specific Traps

- `node_modules` is gitignored (not vendored); the lockfile is the source of truth.
- `POST /migrate` passes options to the migration code by mutating `process.argv`, and only `path`, `replacer` and `bundle` are removed when absent, so other options set by one request persist into later requests. Do not "fix" this in passing; it is existing behaviour of the frozen tool.
- Deployment is two steps. Pushing to `master` only builds and pushes the image. The Swarm deploy is the separate `Deploy migration.anychart.com` workflow in the `servers-conf` repo (`workflow_dispatch`, or a push to its `master` that touches `services/migration.anychart.com/**`; the stack file is `stack.migration.yml`): stack `anychart-services`, published port 8100, pinned to `report-server-new`, proxied by the `anychart-com` nginx (`migration.anychart.com` → `127.0.0.1:8100`).
- Secrets: `DOCKERHUB_USER` / `DOCKERHUB_TOKEN` in this repo; SSH and Docker Hub secrets live in `servers-conf`.
- The Dockerfile comment calls `-t` "trust proxy"; the code treats it as Tag Manager only.

## Before You Finish

- Smoke-test `POST /migrate` with a small v7 snippet, since there are no automated tests.
