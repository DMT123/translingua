import type { ASTNode, TextSegment } from "./types";

export function extractTextSegments(node: ASTNode): TextSegment[] {
  const segments: TextSegment[] = [];
  let index = 0;

  function walk(node: ASTNode, path: number[]) {
    if (node.type === "text") {
      if (node.value.trim()) {
        segments.push({ index: index++, path: [...path], value: node.value });
      }
      return;
    }

    if (node.type === "code") {
      if (node.value.trim()) {
        segments.push({ index: index++, path: [...path], value: node.value });
      }
      return;
    }

    if (node.type === "horizontalRule" || node.type === "pageBreak") {
      return;
    }

    const children = node.children;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        walk(children[i], [...path, i]);
      }
    }
  }

  walk(node, []);
  return segments;
}

export function getSegmentTexts(segments: TextSegment[]): string[] {
  return segments.map((s) => s.value);
}
