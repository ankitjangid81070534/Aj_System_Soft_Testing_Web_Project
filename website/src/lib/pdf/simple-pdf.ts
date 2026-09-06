/**
 * Minimal dependency-free PDF writer (PDF 1.4, Helvetica, WinAnsi text).
 *
 * Purpose: produce legally useful, deterministic evidence documents (agreement
 * versions + acceptance records) on Vercel's serverless runtime without pulling
 * in a heavy PDF library. Output is a plain text document with a header,
 * numbered sections, wrapped paragraphs and page numbers.
 *
 * Non-Latin characters are transliterated to "?" — the canonical legal text is
 * always the stored markdown body + SHA-256 checksum; the PDF is a readable
 * snapshot of it.
 */

export type PdfBlock =
  | { kind: "title"; text: string }
  | { kind: "subtitle"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "meta"; label: string; value: string }
  | { kind: "spacer"; size?: number }
  | { kind: "rule" };

type Line = { text: string; size: number; bold: boolean; gap: number };

const PAGE_WIDTH = 595.28; // A4 portrait (pt)
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 56;
const MARGIN_TOP = 64;
const MARGIN_BOTTOM = 64;
const FOOTER_Y = 36;

// Approximate Helvetica average glyph width as a fraction of font size.
const AVG_CHAR_WIDTH = 0.5;

function sanitize(input: string): string {
  // Escape PDF string delimiters and drop characters outside WinAnsi.
  return input
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrap(text: string, size: number, maxWidth: number): string[] {
  const maxChars = Math.max(10, Math.floor(maxWidth / (size * AVG_CHAR_WIDTH)));
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (word.length > maxChars) {
      if (current) lines.push(current);
      for (let index = 0; index < word.length; index += maxChars) {
        lines.push(word.slice(index, index + maxChars));
      }
      current = "";
      continue;
    }
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function layout(blocks: PdfBlock[]): Line[] {
  const width = PAGE_WIDTH - MARGIN_X * 2;
  const lines: Line[] = [];
  for (const block of blocks) {
    switch (block.kind) {
      case "title":
        for (const text of wrap(block.text, 18, width))
          lines.push({ text, size: 18, bold: true, gap: 24 });
        lines.push({ text: "", size: 6, bold: false, gap: 8 });
        break;
      case "subtitle":
        for (const text of wrap(block.text, 11, width))
          lines.push({ text, size: 11, bold: false, gap: 15 });
        break;
      case "heading":
        lines.push({ text: "", size: 6, bold: false, gap: 10 });
        for (const text of wrap(block.text, 12.5, width))
          lines.push({ text, size: 12.5, bold: true, gap: 17 });
        break;
      case "paragraph":
        for (const text of wrap(block.text, 10, width))
          lines.push({ text, size: 10, bold: false, gap: 14 });
        lines.push({ text: "", size: 4, bold: false, gap: 6 });
        break;
      case "meta":
        for (const text of wrap(`${block.label}: ${block.value}`, 10, width))
          lines.push({ text, size: 10, bold: false, gap: 14 });
        break;
      case "spacer":
        lines.push({ text: "", size: 4, bold: false, gap: block.size ?? 10 });
        break;
      case "rule":
        lines.push({ text: "__RULE__", size: 1, bold: false, gap: 12 });
        break;
    }
  }
  return lines;
}

function paginate(lines: Line[]): Line[][] {
  const pages: Line[][] = [];
  let current: Line[] = [];
  let y = PAGE_HEIGHT - MARGIN_TOP;
  for (const line of lines) {
    if (y - line.gap < MARGIN_BOTTOM) {
      pages.push(current);
      current = [];
      y = PAGE_HEIGHT - MARGIN_TOP;
    }
    current.push(line);
    y -= line.gap;
  }
  pages.push(current);
  return pages;
}

function pageContent(lines: Line[], pageNumber: number, pageCount: number, footer: string): string {
  const ops: string[] = [];
  let y = PAGE_HEIGHT - MARGIN_TOP;
  for (const line of lines) {
    if (line.text === "__RULE__") {
      ops.push(
        `0.75 G ${MARGIN_X} ${(y - 4).toFixed(2)} m ${(PAGE_WIDTH - MARGIN_X).toFixed(2)} ${(
          y - 4
        ).toFixed(2)} l S 0 G`,
      );
    } else if (line.text) {
      const font = line.bold ? "/F2" : "/F1";
      ops.push(
        `BT ${font} ${line.size} Tf ${MARGIN_X} ${y.toFixed(2)} Td (${sanitize(line.text)}) Tj ET`,
      );
    }
    y -= line.gap;
  }
  const footerText = sanitize(`${footer}  |  Page ${pageNumber} of ${pageCount}`);
  ops.push(`BT /F1 8 Tf ${MARGIN_X} ${FOOTER_Y} Td 0.35 g (${footerText}) Tj 0 g ET`);
  return ops.join("\n");
}

/** Build a PDF document as bytes. Deterministic for identical input. */
export function buildPdf(blocks: PdfBlock[], footer: string): Uint8Array {
  const pages = paginate(layout(blocks));
  const objects: string[] = [];
  const add = (body: string): number => {
    objects.push(body);
    return objects.length;
  };

  const fontRegular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const fontBold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const pagesIndex = objects.length + 1; // reserved
  objects.push(""); // placeholder for /Pages

  const pageIds: number[] = [];
  pages.forEach((lines, index) => {
    const stream = pageContent(lines, index + 1, pages.length, footer);
    const streamId = add(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
    const pageId = add(
      `<< /Type /Page /Parent ${pagesIndex} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
        `/Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${streamId} 0 R >>`,
    );
    pageIds.push(pageId);
  });

  objects[pagesIndex - 1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesIndex} 0 R >>`);

  let output = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(output, "latin1"));
    output += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(output, "latin1");
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) output += `${String(offset).padStart(10, "0")} 00000 n \n`;
  output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(output, "latin1"));
}

/**
 * Convert the stored markdown agreement body to PDF blocks: "## n. Title"
 * headings become numbered section headings, everything else paragraphs.
 */
export function markdownToBlocks(markdown: string): PdfBlock[] {
  const blocks: PdfBlock[] = [];
  const paragraphs = markdown.replace(/\r\n/g, "\n").split(/\n{2,}/);
  for (const raw of paragraphs) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const heading = chunk.match(/^#{1,6}\s+(.+)$/m);
    if (heading && chunk.split("\n").length === 1) {
      blocks.push({ kind: "heading", text: heading[1].trim() });
      continue;
    }
    const lines = chunk.split("\n");
    let buffer: string[] = [];
    const flush = () => {
      if (buffer.length) {
        blocks.push({
          kind: "paragraph",
          text: buffer.join(" ").replace(/[*_`]+/g, ""),
        });
        buffer = [];
      }
    };
    for (const line of lines) {
      const asHeading = line.match(/^#{1,6}\s+(.+)$/);
      if (asHeading) {
        flush();
        blocks.push({ kind: "heading", text: asHeading[1].trim() });
      } else if (/^[-*]\s+/.test(line)) {
        flush();
        blocks.push({ kind: "paragraph", text: `• ${line.replace(/^[-*]\s+/, "").replace(/[*_`]+/g, "")}` });
      } else {
        buffer.push(line.trim());
      }
    }
    flush();
  }
  return blocks;
}
