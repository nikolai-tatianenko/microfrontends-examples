#!/usr/bin/env node
/**
 * Writes the CI report into the pull request description, touching ONLY the
 * block between the two markers. Everything the author wrote outside of them is
 * left byte-for-byte untouched.
 *
 * Usage: node scripts/ci/update-pr-body.mjs --file report.md [--pr 123]
 * Env:   GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_API_URL (optional),
 *        PR_NUMBER or GITHUB_EVENT_PATH (pull_request event payload)
 *
 * Failures that are expected on fork PRs (read-only token) only warn: the
 * report is still available in the job summary.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const START = "<!-- ci-report:start -->";
export const END = "<!-- ci-report:end -->";

/** GitHub rejects PR bodies above 65,536 characters. */
const BODY_LIMIT = 65_000;

/**
 * Pure: put `block` between the markers of `body`.
 * - markers present  -> only the span from START to END is replaced
 * - markers missing  -> a fresh marker block is appended
 * - idempotent: replaceBlock(replaceBlock(b, x), x) === replaceBlock(b, x)
 * - line endings of the body win (GitHub stores PR bodies with CRLF once edited in the UI)
 * @param {string|null|undefined} body
 * @param {string} block
 */
export function replaceBlock(body, block) {
  const text = body ?? "";
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const inner = `${START}${eol}${block.replace(/\r?\n/g, eol).trimEnd()}${eol}${END}`;

  const start = text.indexOf(START);
  if (start >= 0) {
    const end = text.indexOf(END, start + START.length);
    // A lone START marker (hand-edited): treat everything after it as ours.
    const stop = end >= 0 ? end + END.length : text.length;
    return text.slice(0, start) + inner + text.slice(stop);
  }
  if (text === "") return inner + eol;
  const gap = /\n$/.test(text) ? eol : eol + eol;
  return text + gap + inner + eol;
}

/** PR number from --pr, PR_NUMBER or the GitHub event payload. */
export function resolvePrNumber(args, env, readFile = readFileSync) {
  const direct = args.pr ?? env.PR_NUMBER;
  if (direct) return Number(direct);
  if (env.GITHUB_EVENT_PATH) {
    const event = JSON.parse(readFile(env.GITHUB_EVENT_PATH, "utf8"));
    return event.pull_request?.number ?? event.number ?? null;
  }
  return null;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

const warn = (msg) => console.log(`::warning::${msg}`);

export async function main(
  argv = process.argv.slice(2),
  env = process.env,
  fetchImpl = fetch,
) {
  const args = parseArgs(argv);
  if (!args.file) {
    console.error("Usage: update-pr-body.mjs --file report.md [--pr N]");
    return 1;
  }
  const { GITHUB_TOKEN: token, GITHUB_REPOSITORY: repo } = env;
  const pr = resolvePrNumber(args, env);
  if (!token || !repo || !pr) {
    warn(
      "PR description not updated: missing GITHUB_TOKEN, GITHUB_REPOSITORY or PR number.",
    );
    return 0;
  }

  const url = `${env.GITHUB_API_URL || "https://api.github.com"}/repos/${repo}/pulls/${pr}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  const current = await fetchImpl(url, { headers });
  if (!current.ok) {
    if ([401, 403, 404].includes(current.status)) {
      warn(
        `PR description not updated: GitHub returned ${current.status} (read-only token / fork PR?).`,
      );
      return 0;
    }
    console.error(`GET ${url} failed: ${current.status}`);
    return 1;
  }
  const { body } = await current.json();

  const next = replaceBlock(body, readFileSync(resolve(args.file), "utf8"));
  if (next === (body ?? "")) {
    console.log("PR description already up to date.");
    return 0;
  }
  if (next.length > BODY_LIMIT) {
    warn(
      `PR description not updated: ${next.length} characters exceeds the GitHub limit.`,
    );
    return 0;
  }

  const patch = await fetchImpl(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ body: next }),
  });
  if (!patch.ok) {
    if ([401, 403, 404].includes(patch.status)) {
      warn(
        `PR description not updated: GitHub returned ${patch.status} on write (fork PR?).`,
      );
      return 0;
    }
    console.error(`PATCH ${url} failed: ${patch.status}`);
    return 1;
  }
  console.log(`Updated CI report block in PR #${pr}.`);
  return 0;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  process.exitCode = await main();
}
