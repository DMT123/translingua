import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Packer,
  PageBreak,
  BorderStyle,
} from "docx";
import type { ASTNode, DocumentNode } from "../types";

const HEADING_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
};

export async function renderToDocx(ast: DocumentNode): Promise<Uint8Array> {
  const children = ast.children.flatMap(nodeToDocxElements);

  const doc = new Document({
    sections: [{ children }],
  });

  return await Packer.toBuffer(doc) as unknown as Uint8Array;
}

function nodeToDocxElements(node: ASTNode): (Paragraph | Table)[] {
  switch (node.type) {
    case "heading":
      return [
        new Paragraph({
          heading: HEADING_MAP[node.level],
          children: node.children.flatMap(inlineToTextRuns),
        }),
      ];

    case "paragraph":
      return [
        new Paragraph({
          children: node.children.flatMap(inlineToTextRuns),
        }),
      ];

    case "table": {
      const rows = node.children.map(
        (row) =>
          new TableRow({
            children: row.children.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: cell.children.flatMap(inlineToTextRuns),
                    }),
                  ],
                  width: { size: 100 / row.children.length, type: WidthType.PERCENTAGE },
                })
            ),
            tableHeader: row.isHeader,
          })
      );

      return [
        new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
      ];
    }

    case "list":
      return node.children.map(
        (item, i) =>
          new Paragraph({
            bullet: node.ordered ? undefined : { level: 0 },
            numbering: node.ordered
              ? { reference: "default-numbering", level: 0 }
              : undefined,
            children: item.children.flatMap(inlineToTextRuns),
          })
      );

    case "horizontalRule":
      return [
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
          },
          children: [],
        }),
      ];

    case "pageBreak":
      return [
        new Paragraph({
          children: [new PageBreak()],
        }),
      ];

    case "footer":
      return [
        new Paragraph({
          children: node.children.flatMap(inlineToTextRuns),
        }),
      ];

    default:
      return [];
  }
}

function inlineToTextRuns(node: ASTNode): TextRun[] {
  switch (node.type) {
    case "text":
      return [new TextRun({ text: node.value })];
    case "bold":
      return node.children.flatMap((child) => {
        const runs = inlineToTextRuns(child);
        return runs.map((r) => new TextRun({ ...r, bold: true }));
      });
    case "italic":
      return node.children.flatMap((child) => {
        const runs = inlineToTextRuns(child);
        return runs.map((r) => new TextRun({ ...r, italics: true }));
      });
    case "code":
      return [new TextRun({ text: node.value, font: "Courier New" })];
    default:
      return [];
  }
}
