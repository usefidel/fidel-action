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
- uses: usefidel/fidel-action@v1
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
| `fail-on-score` | `0` | Fail the action when a successful check scores below this value (0–100). `0` never fails on score. |

## Action outputs

| Output | Description |
|---|---|
| `score` | Lowest score across successful checks. |
| `issues-count` | Total issue count across successful checks. |

## Versioning

| Tag | Behaviour |
|---|---|
| `@v1` | Tracks the latest `v1.x.x` release. Recommended. |
| `@v1.0.0` | Pinned and immutable. Never moves. |

## License

Apache License 2.0 — see [LICENSE](./LICENSE).
