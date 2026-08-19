import { PDFParse } from 'pdf-parse';

export function extractTextFromPdfRawStreams(buffer: Buffer): string {
  try {
    const raw = buffer.toString('latin1');
    const textChunks: string[] = [];
    
    // Match text within BT ... ET blocks
    const btRegex = /BT[\s\S]*?ET/g;
    let match;
    while ((match = btRegex.exec(raw)) !== null) {
      const block = match[0];
      // Match (text) Tj
      const tjRegex = /\(((?:\\\(|\\\)|[^()])*)\)\s*(?:Tj|'|")/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        const str = tjMatch[1].replace(/\\([()\\])/g, '$1');
        if (str.trim()) textChunks.push(str);
      }
      // Match [(text)...] TJ array
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

    return textChunks.join(' ').replace(/\s{2,}/g, ' ').trim();
  } catch (e) {
    return '';
  }
}

async function run() {
  const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 55 >> stream
BT
/F1 12 Tf
72 712 Td
(Pranshu Patel Full Stack Engineer) Tj
[(Skills: React, Node.js, Django) 20 (and PostgreSQL)] TJ
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
0000000339 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
416
%%EOF`;

  const buf = Buffer.from(minimalPdf);
  const streamText = extractTextFromPdfRawStreams(buf);
  console.log('Stream extracted text:', streamText);
}

run();
