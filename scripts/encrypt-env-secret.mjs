#!/usr/bin/env node
/**
 * Encrypt a secret for .env (offline, on your machine).
 *
 *   node scripts/encrypt-env-secret.mjs "sk-or-v1-..."
 *   APP_SECRETS_KEY=<64-hex> node scripts/encrypt-env-secret.mjs "sk-or-v1-..."
 *
 * Put output in ECS .env:
 *   APP_SECRETS_KEY=<same master key, chmod 600>
 *   OPENROUTER_API_KEY=enc:v1:...
 */
import crypto from "crypto";
import readline from "readline";

const ENC_PREFIX = "enc:v1:";

function masterKey() {
  const raw = process.env.APP_SECRETS_KEY?.trim();
  if (!raw) {
    console.error("请设置 APP_SECRETS_KEY（建议: openssl rand -hex 32）");
    process.exit(1);
  }
  if (raw.length === 64 && /^[0-9a-f]+$/i.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  return crypto.createHash("sha256").update(raw, "utf8").digest();
}

function encrypt(plaintext) {
  const key = masterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const packed = Buffer.concat([iv, tag, ciphertext]);
  return ENC_PREFIX + packed.toString("base64");
}

async function main() {
  let value = process.argv[2];
  if (!value) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    value = await new Promise((resolve) => {
      rl.question("Secret (input hidden): ", (line) => {
        rl.close();
        resolve(line);
      });
    });
  }
  if (!value?.trim()) {
    console.error("空 secret");
    process.exit(1);
  }
  console.log(encrypt(value.trim()));
}

main();
