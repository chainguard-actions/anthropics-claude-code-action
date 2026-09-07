<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.216

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.216** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a `run:` shell command string. The step runs: `python "${{ github.action_path }}/agent_approval_check.py"`. The expression `${{ github.action_path }}` is substituted by the YAML template engine before the shell processes the command, meaning any special characters in the value are parsed by the shell without quoting protection. The safe alternative is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` shell command on line 56 of action.yml with the pre-set environment variable `$GITHUB_ACTION_PATH`. This eliminates the script-injection risk because the value is no longer interpolated by the YAML template engine before the shell processes the command — instead, the shell reads it directly from the environment where it is already safely set by GitHub Actions.

