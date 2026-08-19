import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFParse } from 'pdf-parse';
import zlib from 'zlib';

function cleanPdfPageMarkers(text: string): string {
  if (!text) return '';
  return text
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '')
    .replace(/^Page\s+\d+\s+of\s+\d+$/gim, '')
    .replace(/^-\s*\d+\s*-$/gm, '')
    .trim();
}

export function extractFromFlateStreams(buffer: Buffer): string {
  try {
    const raw = buffer.toString('latin1');
    const textChunks: string[] = [];
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;

    while ((match = streamRegex.exec(raw)) !== null) {
      const streamContent = match[1];
      const streamBuf = Buffer.from(streamContent, 'latin1');

      let decompressed = '';
      try {
        decompressed = zlib.inflateSync(streamBuf).toString('latin1');
      } catch {
        try {
          decompressed = zlib.inflateRawSync(streamBuf).toString('latin1');
        } catch {
          decompressed = streamContent;
        }
      }

      if (decompressed) {
        const btRegex = /BT[\s\S]*?ET/g;
        let btMatch;
        while ((btMatch = btRegex.exec(decompressed)) !== null) {
          const block = btMatch[0];
          const tjRegex = /\(((?:\\\(|\\\)|[^()])*)\)\s*(?:Tj|'|")/g;
          let tjMatch;
          while ((tjMatch = tjRegex.exec(block)) !== null) {
            const str = tjMatch[1].replace(/\\([()\\])/g, '$1');
            if (str.trim()) textChunks.push(str);
          }
          const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
          let arrayMatch;
          while ((arrayMatch = tjArrayRegex.exec(block)) !== null) {
            const arrContent = arrayMatch[1];
            const itemRegex = /\(((?:\\\(|\\\)|[^()])*)\)/g;
            let itemMatch;
            while ((itemMatch = itemRegex.exec(arrContent)) !== null) {
              const str = itemMatch[1].replace(/\\([()\\])/g, '$1');
              if (str.trim()) textChunks.push(str);
            }
          }
        }
      }
    }

    return textChunks.join(' ').replace(/\s{2,}/g, ' ').trim();
  } catch {
    return '';
  }
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<{ text: string; isScannedPdf?: boolean }> {
  const uint8Data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  // Tier 1: pdf-parse
  try {
    const parser = new PDFParse({ data: uint8Data });
    const result = await parser.getText();
    let text = '';
    if (result && Array.isArray(result.pages) && result.pages.length > 0) {
      const pageTexts = result.pages.map(p => cleanPdfPageMarkers(p.text || '')).filter(Boolean);
      text = pageTexts.join('\n\n');
    }
    if (!text && result && result.text) {
      text = cleanPdfPageMarkers(result.text);
    }
    if (text && text.trim().length > 10) {
      return { text: text.trim() };
    }
  } catch (err) {
    console.warn('[extractTextFromPdfBuffer] Tier 1 pdf-parse error:', err);
  }

  // Tier 2: Direct pdfjs-dist
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Data,
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
      verbosity: 0,
      stopAtErrors: false
    });
    const doc = await loadingTask.promise;
    const pageStrings: string[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent({
        includeMarkedContent: false
      });

      // Group items by vertical position (Y coordinate) to preserve lines
      const items = textContent.items as Array<{ str?: string; transform?: number[]; hasEOL?: boolean }>;
      const linesMap = new Map<number, string[]>();

      for (const item of items) {
        if (!item.str || !item.str.trim()) continue;
        // transform[5] is Y coordinate
        const y = item.transform ? Math.round(item.transform[5] / 4) * 4 : 0;
        if (!linesMap.has(y)) {
          linesMap.set(y, []);
        }
        linesMap.get(y)!.push(item.str);
      }

      // Sort Y descending (top of page to bottom)
      const sortedYs = Array.from(linesMap.keys()).sort((a, b) => b - a);
      const pageLines = sortedYs.map(y => linesMap.get(y)!.join(' ').trim()).filter(Boolean);
      const pageText = cleanPdfPageMarkers(pageLines.join('\n'));
      if (pageText) {
        pageStrings.push(pageText);
      }
    }

    const combined = pageStrings.join('\n\n').trim();
    if (combined.length > 10) {
      return { text: combined };
    }
  } catch (err) {
    console.warn('[extractTextFromPdfBuffer] Tier 2 pdfjs-dist error:', err);
  }

  // Tier 3: Decompressed Flate & raw streams
  try {
    const streamText = extractFromFlateStreams(buffer);
    const cleaned = cleanPdfPageMarkers(streamText);
    if (cleaned.length > 20) {
      return { text: cleaned };
    }
  } catch (err) {
    console.warn('[extractTextFromPdfBuffer] Tier 3 stream error:', err);
  }

  return { text: '', isScannedPdf: true };
}

// Test against valid PDF
const samplePdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 135 >> stream
BT
/F1 14 Tf
50 750 Td
(Pranshu Patel - Senior Software Engineer) Tj
/F1 11 Tf
0 -20 Td
(Skills: TypeScript, React, Node.js, PostgreSQL, Docker) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000234 00000 n 
0000000419 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
496
%%EOF`;

const validBuf = Buffer.from(samplePdf);
const resValid = await extractTextFromPdfBuffer(validBuf);
console.log('Valid PDF Extraction result:');
console.log(resValid);

// Test against empty/scanned PDF
const emptyPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
trailer << /Size 4 /Root 1 0 R >>
startxref
190
%%EOF`;

const emptyBuf = Buffer.from(emptyPdf);
const resEmpty = await extractTextFromPdfBuffer(emptyBuf);
console.log('\nEmpty/Scanned PDF Extraction result:');
console.log(resEmpty);
