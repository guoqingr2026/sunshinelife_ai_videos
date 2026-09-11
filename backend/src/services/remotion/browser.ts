import fs from "fs";

const CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  process.env.REMOTION_BROWSER_EXECUTABLE,
].filter(Boolean) as string[];

export function findBrowserExecutable(): string | undefined {
  if (process.env.REMOTION_BROWSER_EXECUTABLE) {
    return process.env.REMOTION_BROWSER_EXECUTABLE;
  }
  for (const p of CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}
