import type { ASTNode } from "../types";

export function renderToMarkdown(node: ASTNode): string {
  switch (node.type) {
    case "document":
      return node.children.map(renderToMarkdown).join("\n\n");

    case "heading":
      return `${"#".repeat(node.level)} ${node.children.map(renderInline).join("")}`;

    case "paragraph":
      return node.children.map(renderInline).join("");

    case "table": {
      const rows = node.children.map((row) =>
        "| " + row.children.map((cell) => cell.children.map(renderInline).join("")).join(" | ") + " |"
      );

      if (rows.length > 0 && node.children[0]?.isHeader) {
        const separator =
          "| " +
          (node.alignments ?? node.children[0].children.map(() => null))
            .map((a) => {
              if (a === "center") return ":---:";
              if (a === "right") return "---:";
              if (a === "left") return ":---";
              return "---";
            })
            .join(" | ") +
          " |";
        return [rows[0], separator, ...rows.slice(1)].join("\n");
      }

      return rows.join("\n");
    }

    case "list": {
      return node.children
        .map((item, i) => {
          const prefix = node.ordered ? `${(node.start ?? 1) + i}. ` : "- ";
          return prefix + item.children.map(renderInline).join("");
        })
        .join("\n");
    }

    case "horizontalRule":
      return "---";

    case "pageBreak":
      return "---pagebreak---";

    case "footer":
      return "---footer---\n" + node.children.map(renderInline).join("");

    default:
      return renderInline(node);
  }
}

function renderInline(node: ASTNode): string {
  switch (node.type) {
    case "bold":
      return `**${node.children.map(renderInline).join("")}**`;
    case "italic":
      return `*${node.children.map(renderInline).join("")}*`;
    case "text":
      return node.value;
    case "code":
      return `\`${node.value}\``;
    case "link":
      return `[${node.children.map(renderInline).join("")}](${node.url})`;
    default:
      return "";
  }
}
