export function parseSrt(content: string): string {
  const lines = content.split(/\r?\n/);
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^\d+$/.test(trimmed)) continue;
    if (/^\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->/.test(trimmed)) continue;
    textLines.push(trimmed);
  }

  return textLines.join("\n");
}

export function fixSentenceBreaks(text: string): string {
  let result = text.replace(/\r\n/g, "\n").trim();

  result = result.replace(/([，,；;])\s*\n/g, "$1");
  result = result.replace(/([。！？.!?])\s*\n\s*(?![。！？.!?])/g, "$1\n");
  result = result.replace(/\n{3,}/g, "\n\n");
  result = result.replace(/([a-zA-Z])\n([a-zA-Z])/g, "$1 $2");

  const lines = result.split("\n");
  const fixed: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (fixed.length && fixed[fixed.length - 1] !== "") {
        fixed.push("");
      }
      continue;
    }
    if (trimmed.length < 4 && fixed.length > 0 && !/[。！？.!?]$/.test(fixed[fixed.length - 1])) {
      fixed[fixed.length - 1] += trimmed;
    } else {
      fixed.push(trimmed);
    }
  }

  return fixed.join("\n").trim();
}

export function processSubtitleContent(
  content: string,
  type: string
): { rawText: string; type: string } {
  let text = content;
  if (type === "srt" || content.includes("-->")) {
    text = parseSrt(content);
    type = "srt";
  } else {
    type = "txt";
  }
  text = fixSentenceBreaks(text);
  return { rawText: text, type };
}
