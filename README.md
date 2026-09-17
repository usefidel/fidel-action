<!--
  This file is the README published to the PUBLIC usefidel/fidel-action repo.
  release-action.yml copies it to _release/README.md. It is NOT the README for
  github-action/ inside the monorepo, and NOT the README published to npm.

  It MUST keep a `## Configuration` heading. github-action/src/config.ts points
  users at https://github.com/usefidel/fidel-action#configuration when their config
  file is missing, and that link is already baked into runner/dist/runner.js — the
  artifact the App runner executes for every customer PR check. Renaming this
  heading breaks the anchor in an error message customers actually see.
  See plan 038 §7 / Step 10.
-->

# Fidel — design validation on every pull request

Fidel checks that what you shipped matches what was designed. It captures your live
page, reads your Figma frame, and comments on the pull request with the differences —
colour, spacing, typography, missing elements.

```yaml
- uses: usefidel/fidel-action@v3
```

Get started at **[usefidel.com](https://usefidel.com)**.

---

> ### This repository is a generated release artifact
>
> Everything here is build output, published automatically from Fidel's source
> repository on each release. **Pull requests opened here cannot be merged** — the
> next release would overwrite them.
>
> Found a bug, or want a feature? Get in touch via
> **[usefidel.com](https://usefidel.com)** so it lands in the source repository,
> where it will stick.

---

## Quick start

Scaffold a config file and the workflow:

```bash
npx usefidel init
```

## Configuration

Fidel reads **`fidel.config.json`** from the root of your repository. When it is
missing, the action fails with a link back to this section.

```json
{
  "checks": [
    {
      "name": "Marketing homepage",
      "figma": "https://www.figma.com/design/FILE_KEY/Site?node-id=1-2",
      "url": "https://staging.example.com/"
    }
  ],
  "defaults": {
    "viewport": { "width": 1440, "height": 900 }
  }
}
```

### `checks[]` — Figma frame vs. live page

| Field | Required | Description |
|---|---|---|
| `name` | yes | Label shown in the pull-request comment. |
| `figma` | yes | Link to the Figma frame, copied from Figma. |
| `url` | yes | The live or preview URL to validate. Supports variables (below). |
| `viewport` | no | `{ width, height }`. Defaults to `1440 × 900`. |
| `waitForSelector` | no | CSS selector to wait for before capturing. |
| `waitForLoadState` | no | `load`, `domcontentloaded`, or `networkidle` (default). |
| `waitAfterLoadMs` | no | Extra settle time, in milliseconds. Defaults to `500`. |
| `textMode` | no | Text comparison mode. Defaults to `styling-only`. |

`checks` may be an empty array if your config only uses `designSystemChecks`.

### `designSystemChecks[]` — design-system compliance

Checks your components against a designated brand context rather than a single Figma
frame. This leg runs through the Fidel GitHub App. Set it up with `npx usefidel init`.

### `defaults`

Applied to every check that does not override them. Accepts `viewport`,
`waitForSelector`, `waitForLoadState`, `waitAfterLoadMs`, and `textMode`.

### `triggers`

Controls which changed files cause a check to run. By default Fidel runs only when a
pull request touches a frontend file:

```
**/*.{ts,tsx,js,jsx,mjs,cjs,css,scss,sass,less,html,vue,svelte}
```

A pull request that changes **only** `fidel.config.json` will therefore not trigger a
run. To see your first check, include a frontend file in the same pull request.

Override the default with your own globs:

```json
{
  "triggers": { "paths": ["src/**", "styles/**"] }
}
```

Supported glob syntax: `*` (within a segment), `**` (across segments), `?` (single
character), and `{a,b,c}` brace expansion.

### Variables in `url`

| Variable | Value |
|---|---|
| `{pr}` | Pull-request number. |
| `{branch}` | Head branch name. |
| `{sha}` | Head commit SHA. |
| `${VAR}` / `$VAR` | Environment variable from the workflow step. |

```json
{ "url": "https://pr-{pr}.preview.example.com/" }
```

## Action inputs

| Input | Default | Description |
|---|---|---|
| `config-path` | `fidel.config.json` | Path to the config file. |
| `github-token` | `${{ github.token }}` | Token used to create or update the pull-request comment. |
| `fail-on-drift` | unset (off) | Block the pull request when Fidel confirms a violation — drift or off-token — against a fully verified result. An **incomplete** result blocks regardless of this input — see below. |
| `fail-on-score` | `0` | **Deprecated — use `fail-on-drift`.** Fail the action when a successful check scores below this value (0–100). `0` never fails on score. Ignored when `fail-on-drift` is set. |

### What the two inputs gate, and what they don't

They gate **enforcement**, never **evidence**. `result` reports `fail_violation` whenever Fidel
confirms a violation — drift or off-token — whether or not you chose to block on it, so "did
Fidel find violations?" and "did the build fail?" stay separate questions.

Neither input can make an **incomplete** result exit 0. If Fidel could not inspect the full
required scope, the action exits non-zero and `result` is `incomplete`, with `partial-reasons`
naming why. A result Fidel could not verify is never reported as a pass.

`fail-on-score` is translated once into the same enforcement decision — it enforces only when
a successful check actually scored below the threshold, exactly as before. Setting both inputs
is not an error: `fail-on-drift` wins and a warning names the deprecated one.

## Action outputs

Set on **every** exit path, including skips and fatal errors — an unset output reads as an
empty string, and an empty string reads as "fine".

| Output | Description |
|---|---|
| `score` | Lowest score across successful checks. |
| `issues-count` | Total issue count across successful checks. |
| `result` | `pass` · `fail_violation` · `incomplete` · `fail_operational`. |
| `completeness` | `complete` · `partial` · `unverified` · `configuration_required` · `operational_failure`. |
| `verified` | `true` only when the full required scope was inspected. |
| `drift-count` | Confirmed drift: a declared token whose rendered value differs. Meaningful only when `verified` is `true`. |
| `off-token-count` | Confirmed off-token violations: values using no design token at all. These are **not** drift and are never merged into `drift-count`. |
| `confirmed-violation-count` | `drift-count` + `off-token-count`. This is what decides whether the run is clean. |
| `unverified-count` | Checks that reached no verdict. |
| `partial-reasons` | Comma-separated reasons the result is not complete. |
| `retryable` | `true` when re-running could plausibly produce a different answer. |
| `drift-enforcement` | `true` when confirmed drift blocks this run. Never affects whether an incomplete result blocks. |

## Versioning

> **v2 and earlier stop working on 2026-09-23** when GitHub removes Node 20 from Actions runners. Pin `@v3` before that date.

| Tag | Behaviour |
|---|---|
| `@v3` | Tracks the latest `v3.x.x` release. Recommended. |
| `@v3.0.1` | Pinned and immutable. Never moves. |
| `@v3.0.0` | Pinned and immutable. Never moves. |

## License

Apache License 2.0 — see [LICENSE](./LICENSE).
