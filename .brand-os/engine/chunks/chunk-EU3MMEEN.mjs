import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  readKeychainProof,
  resolveApprovalProof
} from "./chunk-4QCLP6RD.mjs";
import {
  require_dist
} from "./chunk-NUYFBVWM.mjs";
import {
  __toESM
} from "./chunk-QDMMEM6P.mjs";

// scripts/proof.ts
var import_yaml = __toESM(require_dist(), 1);
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
async function readOwnerProof(options = {}) {
  if (!fs.existsSync(path.join(process.cwd(), "brand", ".private", "approval-secret")) && fs.existsSync(path.join(process.cwd(), "brand", "brand.config.yaml"))) {
    console.error(
      "This checkout has no approval secret yet (brand/.private/approval-secret), so nothing can be approved here.\n  First time on this computer:  npm run brand:doctor -- --create-approval-secret\n  Then (macOS) keep it in the Keychain so approvals stop asking:  npm run brand:doctor -- --store-proof-keychain\n  Moving from another computer? Copy brand/.private/approval-secret from there instead; a new secret does not verify approvals sealed with the old one."
    );
    return void 0;
  }
  const { proof } = await resolveApprovalProof({
    isTTY: Boolean(input.isTTY),
    readStdin: options.stdin === false ? void 0 : readFirstStdinLine,
    keychain: () => {
      const slug = options.slug ?? configuredSlug(process.cwd());
      return slug ? readKeychainProof(slug) : void 0;
    },
    prompt: () => hiddenPrompt(options.prompt ?? "Approval proof (input hidden): ")
  });
  return proof;
}
function configuredSlug(root) {
  try {
    const config = (0, import_yaml.parse)(fs.readFileSync(path.join(root, "brand", "brand.config.yaml"), "utf8"));
    return typeof config?.brand?.slug === "string" ? config.brand.slug : void 0;
  } catch {
    return void 0;
  }
}
async function readFirstStdinLine() {
  const chunks = [];
  for await (const chunk of input) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8").split(/\r?\n/)[0]?.trim() || void 0;
}
async function hiddenPrompt(question) {
  const { Writable } = await import("node:stream");
  let muted = false;
  const sink = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) output.write(chunk, encoding);
      callback();
    }
  });
  const rl = readline.createInterface({ input, output: sink, terminal: true });
  try {
    const pending = rl.question(question);
    muted = true;
    const answer = await pending;
    output.write("\n");
    return answer.trim() || void 0;
  } finally {
    rl.close();
  }
}

export {
  readOwnerProof
};
