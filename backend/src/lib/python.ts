import { spawn } from "child_process";

/** Windows 上用 py -3；其他平台用 python3 */
export function getPythonLauncher(): { command: string; args: string[] } {
  if (process.platform === "win32") {
    return { command: "py", args: ["-3"] };
  }
  return { command: "python3", args: [] };
}

export function spawnPython(
  scriptArgs: string[],
  options?: Parameters<typeof spawn>[2]
) {
  const { command, args } = getPythonLauncher();
  return spawn(command, [...args, ...scriptArgs], { shell: true, ...options });
}

export function checkCmd(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { shell: true });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

export async function checkPythonAvailable(): Promise<boolean> {
  const { command, args } = getPythonLauncher();
  return checkCmd(command, [...args, "--version"]);
}

export async function checkManimModule(): Promise<boolean> {
  const { command, args } = getPythonLauncher();
  if (await checkCmd(command, [...args, "-m", "manim", "--version"])) {
    return true;
  }
  return checkCmd("manim", ["--version"]);
}
