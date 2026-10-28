#!/usr/bin/env node
// Fake Claude Code CLI used by the act tests. It speaks the minimal
// stream-json protocol the Agent SDK expects: it answers control requests,
// and when it receives the user prompt it emits a system/init message and a
// result message. It records argv and the received prompt for assertions.
const fs = require("fs");
const readline = require("readline");

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  process.stdout.write("2.1.310 (Claude Code)\n");
  process.exit(0);
}

const logDir = process.env.FAKE_CLAUDE_LOG_DIR || "/tmp/fake-claude-log";
fs.mkdirSync(logDir, { recursive: true });
fs.writeFileSync(`${logDir}/args.json`, JSON.stringify(args));
fs.appendFileSync(`${logDir}/args.txt`, args.join("\n") + "\n");

const mode = process.env.FAKE_CLAUDE_MODE || "success";
const sessionId = "fake-session-123";
let done = false;

function out(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function extractText(message) {
  if (!message) return "";
  const content = message.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c) => (c && typeof c.text === "string" ? c.text : ""))
      .join("\n");
  }
  return "";
}

function finish(promptText) {
  if (done) return;
  done = true;
  fs.writeFileSync(`${logDir}/prompt.txt`, promptText || "");
  out({
    type: "system",
    subtype: "init",
    session_id: sessionId,
    uuid: "00000000-0000-0000-0000-000000000001",
    model: "fake-model",
    cwd: process.cwd(),
    tools: [],
    mcp_servers: [],
    permissionMode: "default",
    apiKeySource: "none",
    slash_commands: [],
    output_style: "default",
    claude_code_version: "2.1.310",
  });
  const isError = mode === "error";
  const result = {
    type: "result",
    subtype: isError ? "error_during_execution" : "success",
    is_error: isError,
    duration_ms: 1,
    duration_api_ms: 1,
    num_turns: 1,
    result: isError ? "" : "fake result",
    session_id: sessionId,
    uuid: "00000000-0000-0000-0000-000000000002",
    total_cost_usd: 0,
    usage: {
      input_tokens: 1,
      output_tokens: 1,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    },
    modelUsage: {},
    permission_denials: [],
  };
  if (isError) {
    result.errors = ["fake claude failure"];
  } else if (args.includes("--json-schema")) {
    result.structured_output = { answer: "42", ok: true };
  }
  out(result);
  setTimeout(() => process.exit(0), 3000);
}

// Non-streaming fallback: prompt passed on the command line.
if (!args.includes("--input-format")) {
  const pIdx = args.findIndex((a) => a === "-p" || a === "--print");
  let prompt = "";
  if (pIdx >= 0 && args[pIdx + 1] && !args[pIdx + 1].startsWith("-")) {
    prompt = args[pIdx + 1];
  }
  if (prompt) finish(prompt);
}

const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    return;
  }
  if (msg.type === "control_request") {
    out({
      type: "control_response",
      response: {
        subtype: "success",
        request_id: msg.request_id,
        response: {
          commands: [],
          output_style: "default",
          available_output_styles: ["default"],
          models: [],
          account: {},
        },
      },
    });
    return;
  }
  if (msg.type === "user") {
    finish(extractText(msg.message));
  }
});
rl.on("close", () => {
  finish("");
});

// Safety net so the fake never hangs a test.
setTimeout(() => process.exit(0), 60000).unref();
