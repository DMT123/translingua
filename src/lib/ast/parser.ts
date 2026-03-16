import type {
  ASTNode,
  DocumentNode,
  HeadingNode,
  ParagraphNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  ListNode,
  ListItemNode,
  TextNode,
  BoldNode,
  ItalicNode,
  HorizontalRuleNode,
  FooterNode,
  PageBreakNode,
} from "./types";

const FOOTER_MARKERS = ["---footer---", "<!-- footer -->", "[footer]"];
const PAGE_BREAK_MARKERS = ["---pagebreak---", "<!-- pagebreak -->", "[pagebreak]"];

export function parseDocument(input: string): DocumentNode {
  const lines = input.split("\n");
  const children: ASTNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (PAGE_BREAK_MARKERS.some((m) => line.trim().toLowerCase() === m)) {
      children.push({ type: "pageBreak" } as PageBreakNode);
      i++;
      continue;
    }

    if (FOOTER_MARKERS.some((m) => line.trim().toLowerCase() === m)) {
      i++;
      const footerChildren: ASTNode[] = [];
      while (i < lines.length) {
        footerChildren.push(...parseInline(lines[i]));
        i++;
      }
      children.push({ type: "footer", children: footerChildren } as FooterNode);
      continue;
    }

    if (/^---\s*$/.test(line) || /^\*\*\*\s*$/.test(line) || /^___\s*$/.test(line)) {
      children.push({ type: "horizontalRule" } as HorizontalRuleNode);
      i++;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      children.push({
        type: "heading",
        level,
        children: parseInline(headingMatch[2]),
      } as HeadingNode);
      i++;
      continue;
    }

    if (isTableLine(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const tableResult = parseTable(lines, i);
      children.push(tableResult.node);
      i = tableResult.nextIndex;
      continue;
    }

    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      const listResult = parseList(lines, i, true);
      children.push(listResult.node);
      i = listResult.nextIndex;
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const listResult = parseList(lines, i, false);
      children.push(listResult.node);
      i = listResult.nextIndex;
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^#{1,6}\s/) &&
      !isTableLine(lines[i]) &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^---\s*$/.test(lines[i]) &&
      !/^\*\*\*\s*$/.test(lines[i]) &&
      !FOOTER_MARKERS.some((m) => lines[i].trim().toLowerCase() === m) &&
      !PAGE_BREAK_MARKERS.some((m) => lines[i].trim().toLowerCase() === m)
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      children.push({
        type: "paragraph",
        children: parseInline(paragraphLines.join("\n")),
      } as ParagraphNode);
    }
  }

  return { type: "document", children };
}

function parseInline(text: string): ASTNode[] {
  const nodes: ASTNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      nodes.push({
        type: "bold",
        children: [{ type: "text", value: boldMatch[1] } as TextNode],
      } as BoldNode);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      nodes.push({
        type: "italic",
        children: [{ type: "text", value: italicMatch[1] } as TextNode],
      } as ItalicNode);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    const nextSpecial = remaining.search(/\*{1,2}[^*]/);
    if (nextSpecial > 0) {
      nodes.push({ type: "text", value: remaining.slice(0, nextSpecial) } as TextNode);
      remaining = remaining.slice(nextSpecial);
    } else {
      nodes.push({ type: "text", value: remaining } as TextNode);
      remaining = "";
    }
  }

  return nodes;
}

function isTableLine(line: string): boolean {
  return line.includes("|") && line.trim().startsWith("|");
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s:|-]+\|$/.test(line.trim());
}

function parseTable(
  lines: string[],
  startIndex: number
): { node: TableNode; nextIndex: number } {
  const rows: TableRowNode[] = [];
  let i = startIndex;

  const headerCells = parseTableRow(lines[i], true);
  rows.push(headerCells);
  i++;

  const separatorLine = lines[i];
  const alignments = parseSeparatorAlignments(separatorLine);
  i++;

  while (i < lines.length && isTableLine(lines[i])) {
    rows.push(parseTableRow(lines[i], false));
    i++;
  }

  return {
    node: { type: "table", children: rows, alignments },
    nextIndex: i,
  };
}

function parseTableRow(line: string, isHeader: boolean): TableRowNode {
  const cells = line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

  return {
    type: "tableRow",
    isHeader,
    children: cells.map(
      (cell) =>
        ({
          type: "tableCell",
          children: parseInline(cell),
        }) as TableCellNode
    ),
  };
}

function parseSeparatorAlignments(
  line: string
): ("left" | "center" | "right" | null)[] {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => {
      const trimmed = cell.trim();
      const left = trimmed.startsWith(":");
      const right = trimmed.endsWith(":");
      if (left && right) return "center";
      if (right) return "right";
      if (left) return "left";
      return null;
    });
}

function parseList(
  lines: string[],
  startIndex: number,
  ordered: boolean
): { node: ListNode; nextIndex: number } {
  const items: ListItemNode[] = [];
  let i = startIndex;
  const pattern = ordered ? /^\d+\.\s+(.+)$/ : /^[-*+]\s+(.+)$/;

  while (i < lines.length) {
    const match = lines[i].match(pattern);
    if (!match) break;

    items.push({
      type: "listItem",
      children: parseInline(match[1]),
    } as ListItemNode);
    i++;
  }

  return {
    node: {
      type: "list",
      ordered,
      start: ordered ? 1 : undefined,
      children: items,
    },
    nextIndex: i,
  };
}
