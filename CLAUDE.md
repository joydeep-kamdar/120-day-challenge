@AGENTS.md

## GitHub automation (already set up)

- `gh` CLI is installed and authenticated for this repo (`joydeep-kamdar/120-day-challenge`)
  with `repo`, `workflow`, `read:org`, `gist` scopes. Use it directly — `gh pr list/view/
  create/checkout`, `gh issue create/comment`, etc. — no further auth setup needed.
- The Claude GitHub App is installed on this repo. Two workflows exist under
  `.github/workflows/`:
  - `claude.yml` (active) — fires when a comment/issue body contains `@claude`. Claude reads
    the issue/PR, pushes a fix to a `claude/issue-N-...` branch, and comments with a compare
    link. It does **not** auto-open the PR — run `gh pr create --head <branch> --base main`
    (or ask Claude to) once you're happy with the diff.
  - `claude-code-review.yml` (disabled via `gh workflow disable`) — was meant to
    auto-review every PR via the `code-review@claude-code-plugins` skill. Currently broken:
    Anthropic's plugin has a bug in its PR-eligibility sub-agent (it runs
    `gh pr view owner/repo/number`, which is invalid `gh` syntax, fails, retries, and the
    whole run silently exits after ~6 turns without posting anything — even with correct
    `pull-requests: write` permissions and `Skill` tool access). Re-enable with
    `gh workflow enable "Claude Code Review"` if/when that's fixed upstream.
  - Repo secret `CLAUDE_CODE_OAUTH_TOKEN` is already configured for both workflows.
- `main` has **no branch protection** — no required status checks, no required reviews.
  Workflow failures (including the disabled one above) never block a merge.
- Vercel auto-deploys every push to `main` straight to **production**
  (aliased to `https://120-day-challenge.vercel.app`); every PR gets its own preview
  deployment automatically via the Vercel GitHub App. No manual `vercel deploy` needed for
  normal merges.
