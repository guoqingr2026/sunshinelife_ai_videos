import fs from "fs";

/** 检查是否为可播放的 MP4（非空、含 ftyp 头） */
export function isPlayableMp4(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  const size = fs.statSync(filePath).size;
  if (size < 2048) return false;
  const fd = fs.openSync(filePath, "r");
  const header = Buffer.alloc(12);
  fs.readSync(fd, header, 0, 12, 0);
  fs.closeSync(fd);
  return header.slice(4, 8).toString("ascii") === "ftyp";
}
