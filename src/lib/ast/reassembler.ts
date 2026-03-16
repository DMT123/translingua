import type { ASTNode, DocumentNode, TextSegment } from "./types";

export function reassemble(
  ast: DocumentNode,
  originalSegments: TextSegment[],
  translatedTexts: string[]
): { ast: DocumentNode; coverage: number } {
  const translationMap = new Map<string, string>();
  for (let i = 0; i < originalSegments.length; i++) {
    const key = originalSegments[i].path.join(",");
    translationMap.set(key, translatedTexts[i] ?? originalSegments[i].value);
  }

  let totalSegments = 0;
  let translatedSegments = 0;

  function walkAndReplace(node: ASTNode, path: number[]): ASTNode {
    if (node.type === "text") {
      totalSegments++;
      const key = path.join(",");
      const translated = translationMap.get(key);
      if (translated !== undefined) {
        translatedSegments++;
        return { ...node, value: translated };
      }
      return node;
    }

    if (node.type === "code") {
      totalSegments++;
      const key = path.join(",");
      const translated = translationMap.get(key);
      if (translated !== undefined) {
        translatedSegments++;
        return { ...node, value: translated };
      }
      return node;
    }

    if (!node.children) return node;

    const newChildren = node.children.map((child, i) =>
      walkAndReplace(child, [...path, i])
    );

    return { ...node, children: newChildren } as ASTNode;
  }

  const newAst = walkAndReplace(ast, []) as DocumentNode;
  const coverage = totalSegments > 0 ? (translatedSegments / totalSegments) * 100 : 100;

  return { ast: newAst, coverage };
}
