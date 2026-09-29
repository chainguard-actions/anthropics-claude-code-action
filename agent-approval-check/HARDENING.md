<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.215

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.215** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violation: The `run:` block directly interpolates `${{ github.action_path }}` — a `github.*` context expression — into the shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression inside a `run:` shell command is a script-injection risk because the value is substituted into the shell script before the shell parses it. The fix is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead, which is already available in composite action steps and avoids template substitution into the shell command.

Locations:

- `action.yml:59`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/action.yml line 59: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The `$GITHUB_ACTION_PATH` environment variable is pre-set by GitHub Actions in composite action steps and is equivalent to `github.action_path`, but avoids the template substitution that creates the injection risk.

