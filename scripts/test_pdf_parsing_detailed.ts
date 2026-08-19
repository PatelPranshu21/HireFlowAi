import { PDFParse } from 'pdf-parse';
import { extractTextFromBuffer, detectFileType, parseResumeDocument } from '../server/documentParser';

async function testPdf() {
  console.log('Testing PDF Parsing in detail...');
  console.log('PDFParse class imported successfully');
  
  // Let's create a minimal valid PDF with text stream
  const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 55 >> stream
BT
/F1 12 Tf
72 712 Td
(Pranshu Patel Full Stack Engineer) Tj
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

  const pdfBuffer = Buffer.from(minimalPdf, 'utf-8');
  console.log('Created valid test PDF buffer, size:', pdfBuffer.length);

  const res = await extractTextFromBuffer(pdfBuffer, 'resume.pdf');
  console.log('extractTextFromBuffer result:', JSON.stringify(res, null, 2));

  const base64Data = 'data:application/pdf;base64,' + pdfBuffer.toString('base64');
  const parsed = await parseResumeDocument({ fileData: base64Data, fileName: 'resume.pdf' });
  console.log('parseResumeDocument result:', JSON.stringify(parsed, null, 2));

  process.exit(0);
}

testPdf().catch(err => {
  console.error('Test PDF failed:', err);
  process.exit(1);
});
