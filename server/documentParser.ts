// Ensure Node.js structuredClone does not fail with DOMException [DataCloneError] when LoopbackPort transfers internal buffers
if (typeof globalThis.structuredClone === 'function') {
  const nativeStructuredClone = globalThis.structuredClone;
  globalThis.structuredClone = function (obj: any, options?: any) {
    if (options && options.transfer && Array.isArray(options.transfer) && options.transfer.length > 0) {
      try {
        return nativeStructuredClone(obj, options);
      } catch {
        return nativeStructuredClone(obj);
      }
    }
    return nativeStructuredClone(obj, options);
  };
}

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import zlib from 'zlib';

export function sanitizePgString(str: any): string {
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') {
    str = String(str);
  }

  // Remove null bytes (\u0000 / \x00) and unprintable ASCII control characters except \n, \r, \t
  return str
    .replace(/\u0000/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\\u0000/g, '');
}

export function cleanPdfPageMarkers(text: string): string {
  if (!text) return '';
  return text
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '')
    .replace(/^Page\s+\d+(\s+of\s+\d+)?$/gim, '')
    .replace(/^-\s*\d+\s*-$/gm, '')
    .trim();
}

export function normalizeExtractedText(text: string): string {
  if (!text) return '';
  const withoutMarkers = cleanPdfPageMarkers(text);
  return sanitizePgString(withoutMarkers)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function sanitizePgJson<T = any>(obj: T): T {
  if (obj === null || obj === undefined) {
    return {} as T;
  }

  if (typeof obj === 'string') {
    // If string looks like raw binary magic bytes from DOCX/PDF zip headers, return empty
    if (obj.startsWith('PK\x03\x04') || obj.startsWith('%PDF-') || obj.startsWith('PK\u0003\u0004')) {
      return '' as unknown as T;
    }
    return sanitizePgString(obj) as unknown as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // If object is Buffer or Uint8Array or ArrayBuffer, discard
  if (Buffer.isBuffer(obj) || obj instanceof Uint8Array || obj instanceof ArrayBuffer) {
    return {} as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizePgJson(item)) as unknown as T;
  }

  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val && (Buffer.isBuffer(val) || val instanceof Uint8Array || val instanceof ArrayBuffer)) {
      continue;
    }

    if (key === 'content' || key === 'resumeText' || key === 'fileText') {
      if (typeof val === 'string' && (val.startsWith('PK\x03\x04') || val.startsWith('%PDF-') || val.startsWith('PK\u0003\u0004'))) {
        // Exclude raw binary strings
        continue;
      }
    }

    if (typeof val === 'string') {
      cleaned[key] = sanitizePgString(val);
    } else {
      cleaned[key] = sanitizePgJson(val);
    }
  }

  return cleaned as T;
}

export function detectFileType(fileName: string = '', buffer?: Buffer): 'PDF' | 'DOCX' | 'DOC' | 'TXT' | 'UNKNOWN' {
  const lowerName = fileName.toLowerCase();
  if (buffer && buffer.length >= 4) {
    if (buffer.toString('utf8', 0, 5).startsWith('%PDF-') || (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46)) {
      return 'PDF';
    }
    if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
      return 'DOCX';
    }
    if (buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0) {
      return 'DOC';
    }
  }

  if (lowerName.endsWith('.pdf')) return 'PDF';
  if (lowerName.endsWith('.docx')) return 'DOCX';
  if (lowerName.endsWith('.doc')) return 'DOC';
  if (lowerName.endsWith('.txt')) return 'TXT';

  return 'UNKNOWN';
}

function decodePdfEscapeString(str: string): string {
  return str
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\(\d{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function decodePdfHexString(hex: string): string {
  const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
  if (cleanHex.length === 0) return '';
  let result = '';
  // Check if UTF-16BE (starts with FEFF or 4-digit hex chars)
  if (cleanHex.length % 4 === 0 && cleanHex.startsWith('FEFF')) {
    for (let i = 4; i < cleanHex.length; i += 4) {
      const code = parseInt(cleanHex.substring(i, i + 4), 16);
      if (code >= 32) result += String.fromCharCode(code);
    }
  } else {
    for (let i = 0; i < cleanHex.length; i += 2) {
      const code = parseInt(cleanHex.substring(i, i + 2), 16);
      if (code >= 32 && code < 127) result += String.fromCharCode(code);
    }
  }
  return result;
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
          
          // Match literal strings: (text) Tj or ' or "
          const tjRegex = /\(((?:\\\(|\\\)|[^()])*)\)\s*(?:Tj|'|")/g;
          let tjMatch;
          while ((tjMatch = tjRegex.exec(block)) !== null) {
            const str = decodePdfEscapeString(tjMatch[1]);
            if (str.trim()) textChunks.push(str);
          }

          // Match hex strings: <hex> Tj
          const hexTjRegex = /<([0-9A-Fa-f\s]+)>\s*(?:Tj|'|")/g;
          let hexMatch;
          while ((hexMatch = hexTjRegex.exec(block)) !== null) {
            const decoded = decodePdfHexString(hexMatch[1]);
            if (decoded.trim()) textChunks.push(decoded);
          }

          // Match TJ arrays: [(text) -10 (text) <hex>] TJ
          const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
          let arrayMatch;
          while ((arrayMatch = tjArrayRegex.exec(block)) !== null) {
            const arrContent = arrayMatch[1];
            
            // Extract (literal) strings within array
            const itemRegex = /\(((?:\\\(|\\\)|[^()])*)\)/g;
            let itemMatch;
            while ((itemMatch = itemRegex.exec(arrContent)) !== null) {
              const str = decodePdfEscapeString(itemMatch[1]);
              if (str.trim()) textChunks.push(str);
            }

            // Extract <hex> strings within array
            const itemHexRegex = /<([0-9A-Fa-f\s]+)>/g;
            let itemHexMatch;
            while ((itemHexMatch = itemHexRegex.exec(arrContent)) !== null) {
              const decoded = decodePdfHexString(itemHexMatch[1]);
              if (decoded.trim()) textChunks.push(decoded);
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

export function extractTextFromPdfRawStreams(buffer: Buffer): string {
  return extractFromFlateStreams(buffer);
}

function toFreshUint8Array(buffer: Buffer): Uint8Array {
  const ab = new ArrayBuffer(buffer.byteLength);
  const u8 = new Uint8Array(ab);
  u8.set(buffer);
  return u8;
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<{ text: string; isScannedPdf?: boolean }> {
  // Tier 1: pdf-parse with page-level inspection & marker cleaning
  let parser: any = null;
  try {
    const uint8_1 = toFreshUint8Array(buffer);
    parser = new PDFParse({ data: uint8_1 });
    const result = await parser.getText();
    let text = '';
    if (result && Array.isArray(result.pages) && result.pages.length > 0) {
      const pageTexts = result.pages.map((p: any) => cleanPdfPageMarkers(p.text || '')).filter(Boolean);
      text = pageTexts.join('\n\n');
    }
    if (!text && result && result.text) {
      text = cleanPdfPageMarkers(result.text);
    }
    const normalized = normalizeExtractedText(text);
    // Ensure we have substantive text with alphabetical characters
    if (normalized.length >= 15 && /[a-zA-Z]{2,}/.test(normalized)) {
      if (parser && parser.destroy) await parser.destroy().catch(() => {});
      return { text: normalized };
    }
  } catch (err) {
    console.warn('[DocumentParser] Tier 1 pdf-parse extraction warning:', err);
  } finally {
    if (parser && parser.destroy) await parser.destroy().catch(() => {});
  }

  // Tier 2: Direct pdfjs-dist extraction with vertical coordinate line-grouping
  let doc: any = null;
  try {
    const uint8_2 = toFreshUint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8_2,
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
      verbosity: 0,
      stopAtErrors: false
    });
    doc = await loadingTask.promise;
    const pageStrings: string[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent({
        includeMarkedContent: false
      });

      const items = textContent.items as Array<{ str?: string; transform?: number[]; hasEOL?: boolean }>;
      const linesMap = new Map<number, string[]>();

      for (const item of items) {
        if (!item.str || !item.str.trim()) continue;
        const y = item.transform ? Math.round(item.transform[5] / 4) * 4 : 0;
        if (!linesMap.has(y)) {
          linesMap.set(y, []);
        }
        linesMap.get(y)!.push(item.str);
      }

      const sortedYs = Array.from(linesMap.keys()).sort((a, b) => b - a);
      const pageLines = sortedYs.map(y => linesMap.get(y)!.join(' ').trim()).filter(Boolean);
      const pageText = cleanPdfPageMarkers(pageLines.join('\n'));
      if (pageText) {
        pageStrings.push(pageText);
      }
    }

    const combined = normalizeExtractedText(pageStrings.join('\n\n'));
    if (combined.length >= 15 && /[a-zA-Z]{2,}/.test(combined)) {
      if (doc && doc.destroy) await doc.destroy().catch(() => {});
      return { text: combined };
    }
  } catch (err) {
    console.warn('[DocumentParser] Tier 2 pdfjs-dist extraction warning:', err);
  } finally {
    if (doc && doc.destroy) await doc.destroy().catch(() => {});
  }

  // Tier 3: Decompressed Flate & raw streams parser
  try {
    const streamText = extractFromFlateStreams(buffer);
    const cleaned = normalizeExtractedText(streamText);
    if (cleaned.length >= 20 && /[a-zA-Z]{2,}/.test(cleaned)) {
      return { text: cleaned };
    }
  } catch (err) {
    console.warn('[DocumentParser] Tier 3 stream extraction warning:', err);
  }

  return { text: '', isScannedPdf: true };
}

export async function extractTextFromBuffer(buffer: Buffer, fileName: string = ''): Promise<{ text: string; fileType: string; isScannedPdf?: boolean }> {
  const fileType = detectFileType(fileName, buffer);

  if (fileType === 'DOCX') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value && result.value.trim().length > 0) {
        const cleaned = normalizeExtractedText(result.value);
        if (cleaned.length > 0) {
          return { text: cleaned, fileType: 'DOCX' };
        }
      }
    } catch (err) {
      console.error('[DocumentParser] Mammoth DOCX extraction error:', err);
    }
  }

  if (fileType === 'PDF') {
    const pdfRes = await extractTextFromPdfBuffer(buffer);
    if (pdfRes.text && pdfRes.text.length > 0) {
      return { text: pdfRes.text, fileType: 'PDF' };
    }
    return { text: '', fileType: 'PDF', isScannedPdf: true };
  }

  if (fileType === 'DOC') {
    // Legacy binary DOC format
    try {
      const raw = buffer.toString('utf8');
      const printable = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{2,}/g, ' ').trim();
      const cleaned = normalizeExtractedText(printable);
      if (cleaned.length > 30) {
        return { text: cleaned, fileType: 'DOC' };
      }
    } catch (err) {
      console.error('[DocumentParser] Legacy DOC decoding error:', err);
    }
    return { text: '', fileType: 'DOC' };
  }

  // Plain text or other format
  try {
    const rawText = buffer.toString('utf8');
    const cleaned = normalizeExtractedText(rawText);
    if (cleaned.length > 0) {
      return { text: cleaned, fileType: fileType === 'UNKNOWN' ? 'TXT' : fileType };
    }
  } catch (err) {
    console.error('[DocumentParser] Plain text decoding error:', err);
  }

  return { text: '', fileType };
}

export async function parseResumeDocument(input: { fileText?: string; fileData?: string; fileName?: string }): Promise<{
  text: string;
  fileType: string;
  fileName: string;
  extractedTextLength: number;
  extractionSuccess: boolean;
  isScannedPdf?: boolean;
  error?: string;
}> {
  const fileName = input.fileName || 'resume.pdf';
  const { fileText, fileData } = input;

  let buffer: Buffer | null = null;

  // 1. If base64 data URL or raw base64 is provided
  if (fileData) {
    const base64Clean = fileData.replace(/^data:[^;]+;base64,/, '').trim();
    buffer = Buffer.from(base64Clean, 'base64');
  } else if (fileText) {
    if (fileText.startsWith('data:') && fileText.includes(';base64,')) {
      const base64Clean = fileText.replace(/^data:[^;]+;base64,/, '').trim();
      buffer = Buffer.from(base64Clean, 'base64');
    } else if (fileText.startsWith('JVBERi') || fileText.startsWith('UEsDB')) {
      buffer = Buffer.from(fileText.trim(), 'base64');
    } else if (fileText.startsWith('PK\x03\x04') || fileText.startsWith('%PDF-') || fileText.startsWith('PK\u0003\u0004')) {
      buffer = Buffer.from(fileText, 'binary');
    } else {
      const normalized = normalizeExtractedText(fileText);
      const length = normalized.length;
      const fileType = detectFileType(fileName);
      const success = length >= 15 && /[a-zA-Z]{2,}/.test(normalized);
      console.log(`[RESUME PARSE] fileName=${fileName} fileType=${fileType} extractedTextLength=${success ? length : 0} extractionSuccess=${success}`);
      return {
        text: success ? normalized : '',
        fileType,
        fileName,
        extractedTextLength: success ? length : 0,
        extractionSuccess: success,
        error: !success ? 'No readable text content provided.' : undefined
      };
    }
  }

  if (buffer && buffer.length > 0) {
    const res = await extractTextFromBuffer(buffer, fileName);
    const length = res.text.length;
    const success = length >= 15 && /[a-zA-Z]{2,}/.test(res.text);

    console.log(`[RESUME PARSE] fileName=${fileName} fileType=${res.fileType} extractedTextLength=${success ? length : 0} extractionSuccess=${success}`);

    let error: string | undefined = undefined;
    if (!success) {
      if (res.isScannedPdf || res.fileType === 'PDF') {
        error = 'Text extraction unavailable: This PDF appears to be a scanned image or contains no selectable text. Please upload a searchable PDF or a DOCX document.';
      } else {
        error = `Text extraction unavailable: Unable to extract readable text from uploaded ${res.fileType} document.`;
      }
    }

    return {
      text: success ? res.text : '',
      fileType: res.fileType,
      fileName,
      extractedTextLength: success ? length : 0,
      extractionSuccess: success,
      isScannedPdf: res.isScannedPdf,
      error
    };
  }

  const fileType = detectFileType(fileName);
  console.log(`[RESUME PARSE] fileName=${fileName} fileType=${fileType} extractedTextLength=0 extractionSuccess=false`);
  return {
    text: '',
    fileType,
    fileName,
    extractedTextLength: 0,
    extractionSuccess: false,
    error: 'Empty document payload provided.'
  };
}

export async function extractTextFromPayload(input: { fileText?: string; fileData?: string; fileName?: string }): Promise<string> {
  const parsed = await parseResumeDocument(input);
  return parsed.text;
}
