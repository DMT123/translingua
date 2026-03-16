import type { ASTNode } from "../types";

export function renderToTxt(node: ASTNode): string {
  switch (node.type) {
    case "document":
      return node.children.map(renderToTxt).join("\n\n");

    case "heading":
      return node.children.map(extractText).join("");

    case "paragraph":
      return node.children.map(extractText).join("");

    case "table": {
      return node.children
        .map((row) =>
          row.children.map((cell) => cell.children.map(extractText).join("")).join("\t")
        )
        .join("\n");
    }

    case "list": {
      return node.children
        .map((item, i) => {
          const prefix = node.ordered ? `${(node.start ?? 1) + i}. ` : "- ";
          return prefix + item.children.map(extractText).join("");
        })
        .join("\n");
    }

    case "horizontalRule":
      return "---";

    case "pageBreak":
      return "\n\n";

    case "footer":
      return node.children.map(extractText).join("");

    default:
      return extractText(node);
  }
}

function extractText(node: ASTNode): string {
  if (node.type === "text") return node.value;
  if (node.type === "code") return node.value;
  if ("children" in node && node.children) {
    return node.children.map(extractText).join("");
  }
  return "";
}
