import { renderToHTML } from "./toHTML";
import type { DocumentNode } from "../types";

export async function renderToPdfBlob(ast: DocumentNode): Promise<Blob> {
  const html = renderToHTML(ast);
  const fullHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12pt; line-height: 1.6; margin: 40px; color: #1a1a1a; }
        h1 { font-size: 24pt; margin-top: 24pt; }
        h2 { font-size: 20pt; margin-top: 20pt; }
        h3 { font-size: 16pt; margin-top: 16pt; }
        h4, h5, h6 { font-size: 13pt; margin-top: 13pt; }
        table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
        th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: 600; }
        hr { border: none; border-top: 1px solid #ddd; margin: 20pt 0; }
        code { font-family: 'Courier New', monospace; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
        footer { margin-top: 40pt; padding-top: 12pt; border-top: 1px solid #ddd; font-size: 10pt; color: #666; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `;

  if (typeof window !== "undefined") {
    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");

    const container = document.createElement("div");
    container.innerHTML = fullHTML;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "794px";
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      return pdf.output("blob");
    } finally {
      document.body.removeChild(container);
    }
  }

  throw new Error("PDF generation requires a browser environment");
}

export function getPdfHTMLPreview(ast: DocumentNode): string {
  return renderToHTML(ast);
}
