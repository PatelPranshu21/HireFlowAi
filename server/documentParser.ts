import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

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

export async function extractTextFromBuffer(buffer: Buffer, fileName: string = ''): Promise<string> {
  const lowerName = fileName.toLowerCase();
  const isDocx = lowerName.endsWith('.docx') || (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b);
  const isPdf = lowerName.endsWith('.pdf') || (buffer.length > 4 && buffer.toString('utf8', 0, 5) === '%PDF-');

  if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value && result.value.trim().length > 0) {
        return sanitizePgString(result.value);
      }
    } catch (err) {
      console.error('[DocumentParser] Mammoth DOCX extraction error:', err);
    }
  }

  if (isPdf) {
    try {
      const uint8Data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const parser = new PDFParse({ data: uint8Data });
      const result = await parser.getText();
      if (result && result.text && result.text.trim().length > 0) {
        return sanitizePgString(result.text);
      }
    } catch (err) {
      console.error('[DocumentParser] pdf-parse PDF extraction error:', err);
    }
  }

  // Try decoding UTF-8 plain text for non-PDF and non-DOCX files
  if (!isPdf && !isDocx) {
    try {
      const rawText = buffer.toString('utf8');
      return sanitizePgString(rawText);
    } catch (err) {
      console.error('[DocumentParser] Plain text decoding error:', err);
      return '';
    }
  }

  return '';
}

export async function extractTextFromPayload(input: { fileText?: string; fileData?: string; fileName?: string }): Promise<string> {
  const { fileText, fileData, fileName } = input;

  // 1. If base64 data URL or raw base64 is provided
  if (fileData) {
    const base64Clean = fileData.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    const extracted = await extractTextFromBuffer(buffer, fileName);
    if (extracted && extracted.trim().length > 0) {
      return extracted;
    }
  }

  // 2. If fileText is provided, check if it's base64 or raw binary
  if (fileText) {
    if (fileText.startsWith('data:') && fileText.includes(';base64,')) {
      const base64Clean = fileText.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Clean, 'base64');
      return await extractTextFromBuffer(buffer, fileName);
    }

    if (fileText.startsWith('PK\x03\x04') || fileText.startsWith('%PDF-') || fileText.startsWith('PK\u0003\u0004')) {
      const buffer = Buffer.from(fileText, 'binary');
      return await extractTextFromBuffer(buffer, fileName);
    }

    return sanitizePgString(fileText);
  }

  return '';
}
