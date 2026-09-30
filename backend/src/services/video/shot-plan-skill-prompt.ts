import fs from "fs";
import path from "path";

const SKILL_REL = ".cursor/skills/learnv-shot-plan";

function repoRootFromHere(): string {
  // backend/dist/services/video → repo root
  return path.resolve(__dirname, "../../../..");
}

function stripFrontmatter(md: string): string {
  if (!md.startsWith("---")) return md;
  const end = md.indexOf("---", 3);
  if (end < 0) return md;
  return md.slice(end + 3).trim();
}

function readOptional(filePath: string, maxChars?: number): string | null {
  try {
    let text = fs.readFileSync(filePath, "utf-8");
    if (filePath.endsWith("SKILL.md")) text = stripFrontmatter(text);
    if (maxChars && text.length > maxChars) {
      text = `${text.slice(0, maxChars)}\n\n…（catalog 已截断，完整见仓库 ${SKILL_REL}/catalog.md）`;
    }
    return text.trim();
  } catch {
    return null;
  }
}

export interface SkillPromptStatus {
  loaded: boolean;
  skillPath: string;
  catalogPath: string;
  chars: number;
}

let cachedBlock: string | null = null;

/** Learnv 分镜 Skill：拼在 system 提示最前，与 Cursor Skill 同源文件。 */
export function buildLearnvSkillPromptBlock(): string {
  if (cachedBlock) return cachedBlock;

  const root = repoRootFromHere();
  const skillDir = path.join(root, SKILL_REL);
  const skill = readOptional(path.join(skillDir, "SKILL.md"));
  const catalog = readOptional(path.join(skillDir, "catalog.md"), 12000);

  if (!skill && !catalog) {
    cachedBlock = "";
    return cachedBlock;
  }

  const parts = [
    "## Learnv 分镜 Skill（必须遵守，优先于一般习惯）",
    skill || "（SKILL.md 未找到）",
    catalog ? `\n## 镜头类型速查（catalog）\n${catalog}` : "",
  ];
  cachedBlock = parts.filter(Boolean).join("\n\n");
  return cachedBlock;
}

export function getSkillPromptStatus(): SkillPromptStatus {
  const root = repoRootFromHere();
  const skillPath = path.join(root, SKILL_REL, "SKILL.md");
  const catalogPath = path.join(root, SKILL_REL, "catalog.md");
  const block = buildLearnvSkillPromptBlock();
  return {
    loaded: block.length > 0,
    skillPath,
    catalogPath,
    chars: block.length,
  };
}
