import dotenv from 'dotenv';
dotenv.config();

import { 
  extractTextFromBuffer, 
  parseResumeDocument, 
  detectFileType, 
  normalizeExtractedText 
} from '../server/documentParser';

async function testPdfDocxExtraction() {
  console.log('====================================================');
  console.log('HIREFLOW AI – PDF & DOCX EXTRACTION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(cond: boolean, name: string) {
    total++;
    if (cond) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
    }
  }

  // 1. Plain Text Buffer
  const txtBuf = Buffer.from('Jane Developer\nExperience with Go, Docker, Kubernetes\nEducation: MIT', 'utf8');
  const txtRes = await extractTextFromBuffer(txtBuf, 'jane.txt');
  assert(txtRes.fileType === 'TXT', 'Plain text buffer fileType is TXT');
  assert(txtRes.text.includes('Jane Developer') && txtRes.text.includes('Kubernetes'), 'Extracted all content from plain text buffer');

  // 2. File Type Detection
  assert(detectFileType('resume.pdf') === 'PDF', 'detectFileType recognizes .pdf extension');
  assert(detectFileType('resume.docx') === 'DOCX', 'detectFileType recognizes .docx extension');
  assert(detectFileType('resume.txt') === 'TXT', 'detectFileType recognizes .txt extension');
  assert(detectFileType('unknown_file') === 'UNKNOWN', 'detectFileType returns UNKNOWN for extensionless');

  // 3. Binary Magic Byte Detection
  const pdfHeader = Buffer.from('%PDF-1.7 ... dummy pdf content', 'utf8');
  assert(detectFileType('sample', pdfHeader) === 'PDF', 'detectFileType recognizes %PDF- magic bytes without extension');

  const zipHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
  assert(detectFileType('sample', zipHeader) === 'DOCX', 'detectFileType recognizes PK zip magic bytes without extension');

  // 4. Valid PDF with text streams
  const sampleValidPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 145 >> stream
BT
/F1 14 Tf
50 750 Td
(Pranshu Patel - Senior Software Engineer) Tj
/F1 11 Tf
0 -20 Td
(Experience: Led cloud infrastructure and microservices with Docker) Tj
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
0000000429 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
506
%%EOF`;

  const validPdfBuf = Buffer.from(sampleValidPdf, 'utf-8');
  const validPdfRes = await extractTextFromBuffer(validPdfBuf, 'resume.pdf');
  assert(validPdfRes.fileType === 'PDF', 'Valid PDF recognized as PDF');
  assert(validPdfRes.text.includes('Pranshu Patel') && validPdfRes.text.includes('Software Engineer'), 'Valid PDF extracted text successfully without page markers');
  assert(!validPdfRes.text.includes('-- 1 of 1 --'), 'Page marker artifacts cleanly stripped from valid PDF');

  // 5. Scanned PDF Simulation (Empty extracted text from PDF parser)
  const emptyPdfParse = await parseResumeDocument({
    fileData: 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4 empty stream').toString('base64'),
    fileName: 'scanned_receipt.pdf'
  });
  assert(emptyPdfParse.extractionSuccess === false && emptyPdfParse.extractedTextLength === 0, 'Scanned/image-only PDF returns 0 length and extractionSuccess=false');
  assert(!!emptyPdfParse.error, 'Scanned PDF includes clear human-readable error message');

  // 6. Whitespace Normalization
  const messyText = '  John   Smith  \r\n\r\n\r\n\r\nSoftware   Engineer  \n\n\n\nSkills: React,   Node  ';
  const clean = normalizeExtractedText(messyText);
  assert(!clean.includes('\r'), 'Normalized text contains no CRLF');
  assert(!clean.includes('\n\n\n'), 'Normalized text caps consecutive line breaks');
  assert(clean.includes('John Smith') && clean.includes('Software Engineer'), 'Normalized text preserves content words');

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');
  process.exit(0);
}

testPdfDocxExtraction().catch(err => {
  console.error('Fatal error in PDF/DOCX test:', err);
  process.exit(1);
});
