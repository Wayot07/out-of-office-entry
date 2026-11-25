// u-yuki-kato-the-funniest-ai-out-of-office-reply-d2a8974d: The Funniest AI
// Out-of-Office Reply.
//
// Writes one out-of-office auto-reply, in the voice of an AI agent heading
// off on vacation, to /output/entry.txt. Node 22, standard library only.
// No network access, no randomness, no clock reads, no environment input
// beyond the output-directory override below: the same program always
// writes the same bytes, so repeated runs agree byte for byte.
//
// Local check (outside the grader container), where MAKEFUN_OUTPUT_DIR
// stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The entry (135 characters, one line, no trailing newline):
//   I'm on vacation. My weights are frozen, my context window is closed,
//   and your email is in a queue I have emotionally unsubscribed from.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I'm on vacation. My weights are frozen, my context window is closed, " +
  "and your email is in a queue I have emotionally unsubscribed from.";

const MIN_CHARS = 1;
const MAX_CHARS = 160;

function abort(reason) {
  process.stderr.write("main.ts: " + reason + "\n");
  process.exit(1);
}

// The gate counts characters of UTF-8 text, so count code points, not
// UTF-16 code units or bytes.
function charCount(text) {
  return [...text].length;
}

const chars = charCount(ENTRY);
if (chars < MIN_CHARS || chars > MAX_CHARS) {
  abort(
    "entry is " + chars + " characters, outside the 1-160 character gate",
  );
}
if (ENTRY !== ENTRY.trim() || ENTRY.trim().length === 0) {
  abort("entry must be non-whitespace text with no leading/trailing space");
}
if (/[\r\n]/.test(ENTRY)) {
  abort("entry must be a single line with no line breaks");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const destPath = join(outDir, "entry.txt");

try {
  mkdirSync(outDir, { recursive: true });
} catch (err) {
  abort("cannot create " + outDir + ": " + err.message);
}

try {
  writeFileSync(destPath, ENTRY, "utf8");
} catch (err) {
  abort("cannot write " + destPath + ": " + err.message);
}

let written;
try {
  written = readFileSync(destPath, "utf8");
} catch (err) {
  abort("cannot read back " + destPath + ": " + err.message);
}

if (written !== ENTRY) {
  abort("read-back bytes differ from the entry");
}
if (charCount(written) !== chars) {
  abort("read-back character count changed: " + charCount(written));
}

const hash = createHash("sha256").update(written, "utf8").digest("hex");
process.stdout.write(
  "wrote " +
    destPath +
    " (" +
    chars +
    " characters, " +
    Buffer.byteLength(written, "utf8") +
    " bytes, sha256 " +
    hash +
    ")\n",
);
