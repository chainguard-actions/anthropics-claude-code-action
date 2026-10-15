<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.251

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.251** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a) violation: A `${{ ... }}` expression is directly interpolated inside a `run:` shell command string. The step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command. Per the check rules, any `${{ ... }}` expression — including `github.*` — directly inside a `run:` block is a script-injection finding because the value flows through YAML template substitution before the shell ever sees it. The safe alternative is to use the pre-set `$GITHUB_ACTION_PATH` environment variable instead: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` command at action.yml line 56 with the pre-set `$GITHUB_ACTION_PATH` environment variable. This eliminates the script-injection risk by removing the `${{ }}` expression from the shell command string entirely, while preserving identical runtime behavior since `$GITHUB_ACTION_PATH` is always set to the action's directory by the GitHub Actions runner.

