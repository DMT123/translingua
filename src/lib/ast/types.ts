export type ASTNodeType =
  | "document"
  | "heading"
  | "paragraph"
  | "table"
  | "tableRow"
  | "tableCell"
  | "list"
  | "listItem"
  | "horizontalRule"
  | "footer"
  | "pageBreak"
  | "text"
  | "bold"
  | "italic"
  | "code"
  | "link";

export interface ASTBaseNode {
  type: ASTNodeType;
  children?: ASTNode[];
}

export interface DocumentNode extends ASTBaseNode {
  type: "document";
  children: ASTNode[];
}

export interface HeadingNode extends ASTBaseNode {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ASTNode[];
}

export interface ParagraphNode extends ASTBaseNode {
  type: "paragraph";
  children: ASTNode[];
}

export interface TableNode extends ASTBaseNode {
  type: "table";
  children: TableRowNode[];
  alignments?: ("left" | "center" | "right" | null)[];
}

export interface TableRowNode extends ASTBaseNode {
  type: "tableRow";
  children: TableCellNode[];
  isHeader?: boolean;
}

export interface TableCellNode extends ASTBaseNode {
  type: "tableCell";
  children: ASTNode[];
  alignment?: "left" | "center" | "right" | null;
}

export interface ListNode extends ASTBaseNode {
  type: "list";
  ordered: boolean;
  start?: number;
  children: ListItemNode[];
}

export interface ListItemNode extends ASTBaseNode {
  type: "listItem";
  children: ASTNode[];
}

export interface HorizontalRuleNode extends ASTBaseNode {
  type: "horizontalRule";
}

export interface FooterNode extends ASTBaseNode {
  type: "footer";
  children: ASTNode[];
}

export interface PageBreakNode extends ASTBaseNode {
  type: "pageBreak";
}

export interface TextNode extends ASTBaseNode {
  type: "text";
  value: string;
}

export interface BoldNode extends ASTBaseNode {
  type: "bold";
  children: ASTNode[];
}

export interface ItalicNode extends ASTBaseNode {
  type: "italic";
  children: ASTNode[];
}

export interface CodeNode extends ASTBaseNode {
  type: "code";
  value: string;
}

export interface LinkNode extends ASTBaseNode {
  type: "link";
  url: string;
  children: ASTNode[];
}

export type ASTNode =
  | DocumentNode
  | HeadingNode
  | ParagraphNode
  | TableNode
  | TableRowNode
  | TableCellNode
  | ListNode
  | ListItemNode
  | HorizontalRuleNode
  | FooterNode
  | PageBreakNode
  | TextNode
  | BoldNode
  | ItalicNode
  | CodeNode
  | LinkNode;

export interface TextSegment {
  index: number;
  path: number[];
  value: string;
}

export interface TranslatedSegment extends TextSegment {
  translated: string;
}
