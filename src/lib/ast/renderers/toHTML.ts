import type { ASTNode } from "../types";

export function renderToHTML(node: ASTNode): string {
  switch (node.type) {
    case "document":
      return node.children.map(renderToHTML).join("\n");

    case "heading":
      return `<h${node.level}>${node.children.map(renderToHTML).join("")}</h${node.level}>`;

    case "paragraph":
      return `<p>${node.children.map(renderToHTML).join("")}</p>`;

    case "table": {
      const rows = node.children.map((row) => {
        const tag = row.isHeader ? "th" : "td";
        const cells = row.children
          .map((cell, i) => {
            const align = node.alignments?.[i];
            const style = align ? ` style="text-align:${align}"` : "";
            return `<${tag}${style}>${cell.children.map(renderToHTML).join("")}</${tag}>`;
          })
          .join("");
        return `<tr>${cells}</tr>`;
      });

      const headerRows = rows.filter((_, i) => node.children[i].isHeader);
      const bodyRows = rows.filter((_, i) => !node.children[i].isHeader);

      let html = "<table>";
      if (headerRows.length) html += `<thead>${headerRows.join("")}</thead>`;
      if (bodyRows.length) html += `<tbody>${bodyRows.join("")}</tbody>`;
      html += "</table>";
      return html;
    }

    case "list": {
      const tag = node.ordered ? "ol" : "ul";
      const start = node.ordered && node.start ? ` start="${node.start}"` : "";
      const items = node.children
        .map((item) => `<li>${item.children.map(renderToHTML).join("")}</li>`)
        .join("");
      return `<${tag}${start}>${items}</${tag}>`;
    }

    case "horizontalRule":
      return "<hr />";

    case "pageBreak":
      return '<div style="page-break-after: always;"></div>';

    case "footer":
      return `<footer>${node.children.map(renderToHTML).join("")}</footer>`;

    case "bold":
      return `<strong>${node.children.map(renderToHTML).join("")}</strong>`;

    case "italic":
      return `<em>${node.children.map(renderToHTML).join("")}</em>`;

    case "text":
      return escapeHTML(node.value);

    case "code":
      return `<code>${escapeHTML(node.value)}</code>`;

    case "link":
      return `<a href="${escapeHTML(node.url)}">${node.children.map(renderToHTML).join("")}</a>`;

    default:
      return "";
  }
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
