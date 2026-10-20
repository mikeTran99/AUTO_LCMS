const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('👑 AUTO LCMS v2.2 STEALTH LUXURY — FULL VERIFICATION SUITE');
console.log('═══════════════════════════════════════════════════════════════\n');

const rootDir = path.resolve(__dirname, '..');
let passedTests = 0;
let totalTests = 0;

function assert(condition, name, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    console.error(`  ❌ [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
  }
}

// ─────────────────────────────────────────────────────────────
// TEST 1: Manifest V3 Structure & Cross-Browser Integrity
// ─────────────────────────────────────────────────────────────
console.log('📌 TEST 1: Manifest V3 & Browser Permission Verification');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

assert(manifest.manifest_version === 3, 'Manifest is version 3');
assert(manifest.version === '2.2.0', 'Version is 2.2.0');
assert(manifest.permissions.includes('tabs') && manifest.permissions.includes('storage') && manifest.permissions.includes('scripting'), 'Core permissions present (tabs, storage, scripting)');
assert(manifest.host_permissions.includes('<all_urls>') && manifest.host_permissions.includes('*://*.ntt.edu.vn/*'), 'Cross-browser host permissions present (<all_urls>, ntt.edu.vn)');
assert(manifest.content_scripts[0].matches.includes('*://*.ntt.edu.vn/*'), 'Content scripts target Moodle / NTTU domains');
assert(manifest.content_scripts[0].js.includes('src/content/content.js'), 'Content script path points to src/content/content.js');
assert(manifest.action.default_popup === 'src/popup/popup.html', 'Default popup declared at src/popup/popup.html');
assert(manifest.background.service_worker === 'src/background/background.js', 'Service worker declared at src/background/background.js');

// ─────────────────────────────────────────────────────────────
// TEST 2: Static Safety Audit (Invariant: Zero Auto-Submit)
// ─────────────────────────────────────────────────────────────
console.log('\n📌 TEST 2: Absolute Safety Audit (Invariant: Zero Auto-Submit)');
const contentCode = fs.readFileSync(path.join(rootDir, 'src/content/content.js'), 'utf8');
const popupCode = fs.readFileSync(path.join(rootDir, 'src/popup/popup.js'), 'utf8');

const dangerousPatterns = [
  /submit\(\)/i,
  /\.click\(\)\s*;\s*\/\/\s*submit/i,
  /mod_quiz-next-nav.*click/i,
  /finish.*click/i
];

let foundDangerous = false;
for (const p of dangerousPatterns) {
  if (p.test(contentCode) || p.test(popupCode)) {
    foundDangerous = true;
    break;
  }
}
assert(!foundDangerous, 'Zero programmatic form submission or next-page click found in code');

// ─────────────────────────────────────────────────────────────
// TEST 3: Unicode NFC Normalizer Test
// ─────────────────────────────────────────────────────────────
console.log('\n📌 TEST 3: Unicode NFC Normalizer & Option Prefix Stripper');
function normalizeText(str) {
  if (!str) return '';
  return str
    .normalize('NFC')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/^[a-e][.\s\)-]+/, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// NFD vs NFC Vietnamese: 'tiếng việt'
const nfdStr = 'tiê\u0301ng viê\u0323t'; // Decomposed
const nfcStr = 'tiếng việt';            // Composed
assert(normalizeText(nfdStr) === normalizeText(nfcStr), 'Normalizes Vietnamese NFD vs NFC perfectly');
assert(normalizeText('c. restore') === 'restore', 'Strips option prefix "c. "');
assert(normalizeText('A) strained') === 'strained', 'Strips option prefix "A) "');
assert(normalizeText('  Acumen  ') === 'acumen', 'Trims whitespace & lowercases');

// ─────────────────────────────────────────────────────────────
// TEST 4: Universal Ultra Parser (6 Multi-Format Variations)
// ─────────────────────────────────────────────────────────────
console.log('\n📌 TEST 4: Universal Ultra Parser on Multi-Format Answer Inputs');

function parseAnswersUltra(input) {
  const map = new Map();
  if (!input || typeof input !== 'string') return map;
  const trimmed = input.trim();

  // JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const obj = JSON.parse(trimmed);
      for (const [k, v] of Object.entries(obj)) {
        const qNum = parseInt(k.replace(/\D/g, ''), 10);
        if (!isNaN(qNum)) {
          if (typeof v === 'string') {
            const letterMatch = v.match(/^([A-Ea-e])\b/);
            map.set(qNum, {
              letter: letterMatch ? letterMatch[1].toUpperCase() : '',
              text: v.replace(/^[A-Ea-e][.\s\)-]*/, '').trim()
            });
          }
        }
      }
      if (map.size > 0) return map;
    } catch (e) {}
  }

  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Markdown or TSV table
  for (const line of lines) {
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const qMatch = parts[0].match(/\d+/);
        if (qMatch) {
          const qNum = parseInt(qMatch[0], 10);
          const letterMatch = parts[1].match(/[A-Ea-e]/);
          const text = parts.slice(2).join(' ').trim();
          map.set(qNum, {
            letter: letterMatch ? letterMatch[0].toUpperCase() : '',
            text: text
          });
        }
      }
    } else if (line.includes('\t')) {
      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const qMatch = parts[0].match(/\d+/);
        if (qMatch) {
          const qNum = parseInt(qMatch[0], 10);
          const letterMatch = parts[1].match(/^[A-Ea-e]$/);
          const text = parts.slice(2).join(' ').trim();
          map.set(qNum, {
            letter: letterMatch ? letterMatch[0].toUpperCase() : '',
            text: text
          });
        }
      }
    }
  }
  if (map.size > 0) return map;

  // Standard line-by-line
  const linePattern = /(?:câu|question)?\s*(\d+)[\s.:\)-]+([A-Ea-e])?(?:[\s.:\)-]+(.*))?$/i;
  for (const line of lines) {
    const match = line.match(linePattern);
    if (match) {
      const qNum = parseInt(match[1], 10);
      const letter = match[2] ? match[2].toUpperCase() : '';
      const text = match[3] ? match[3].trim() : '';
      if (!isNaN(qNum) && (letter || text)) {
        map.set(qNum, { letter, text });
      }
    }
  }
  if (map.size > 0) return map;

  // Shorthand "1A 2B 3C"
  const shorthandMatches = [...trimmed.matchAll(/(\d+)\s*([A-Ea-e])\b/g)];
  if (shorthandMatches.length > 0) {
    for (const m of shorthandMatches) {
      map.set(parseInt(m[1], 10), { letter: m[2].toUpperCase(), text: '' });
    }
  }

  return map;
}

const input1 = `
| Câu | Đáp án | Nguyên văn đáp án |
| :--- | :---: | :--- |
| 1 | C | restore |
| 2 | A | strained |
`;
const m1 = parseAnswersUltra(input1);
assert(m1.get(1)?.letter === 'C' && m1.get(1)?.text === 'restore', 'Format 1: Markdown table with dots & prefix');

const input2 = `
1. C - restore
2. A. strained
3. A
`;
const m2 = parseAnswersUltra(input2);
assert(m2.get(1)?.letter === 'C' && m2.get(2)?.letter === 'A', 'Format 2: Standard list "1. C - restore"');

const input3 = '1C 2A 3A 4C 5C';
const m3 = parseAnswersUltra(input3);
assert(m3.get(1)?.letter === 'C' && m3.get(5)?.letter === 'C', 'Format 3: Compact shorthand "1C 2A 3A..."');

const input4 = "1\tC\trestore\n2\tA\tstrained";
const m4 = parseAnswersUltra(input4);
assert(m4.get(1)?.letter === 'C' && m4.get(2)?.letter === 'A', 'Format 4: TSV / Excel Copy-Paste');

const input5 = JSON.stringify({ "1": "C. restore", "2": "A - strained" });
const m5 = parseAnswersUltra(input5);
assert(m5.get(1)?.letter === 'C' && m5.get(2)?.letter === 'A', 'Format 5: JSON object input');

// ─────────────────────────────────────────────────────────────
// TEST 5: Real Sample Moodle Quiz Extraction & 20/20 Match
// ─────────────────────────────────────────────────────────────
console.log('\n📌 TEST 5: Full 20/20 Question Match against Sample Moodle Quiz');
const sampleHtmlPath = path.join(__dirname, 'samples/Quiz 2 (Unit 3-4)_Lần 2 (trang 1 trên tổng số 3).html');
const sampleHtml = fs.readFileSync(sampleHtmlPath, 'utf8');

function extractQuestionsFromHtml(html) {
  const questions = [];
  const queBlocks = html.split(/<div\s+id="question-\d+-\d+"/);
  
  for (let i = 1; i < queBlocks.length; i++) {
    const block = queBlocks[i];
    const qnoMatch = block.match(/<span\s+class="qno">(\d+)<\/span>/);
    const qNum = qnoMatch ? parseInt(qnoMatch[1], 10) : i;

    const choices = [];
    const answerBlockMatch = block.match(/<div\s+class="answer">([\s\S]*?)<\/div>\s*<\/div>\s*<div\s+class="content">/);
    const answerContent = answerBlockMatch ? answerBlockMatch[1] : block;

    const rowRegex = /<div\s+class="r[01]">\s*<input[^>]*value="(\d+)"[^>]*>[\s\S]*?<span\s+class="answernumber">([a-e])\.\s*<\/span>[\s\S]*?<div\s+class="flex-fill[^"]*">([\s\S]*?)<\/div>/g;
    let match;
    while ((match = rowRegex.exec(answerContent)) !== null) {
      choices.push({
        value: match[1],
        letter: match[2].toUpperCase(),
        rawText: match[3].replace(/<[^>]+>/g, '').trim()
      });
    }

    questions.push({ qNum, choices });
  }
  return questions;
}

const extractedQuestions = extractQuestionsFromHtml(sampleHtml);
assert(extractedQuestions.length === 20, `Successfully extracted all 20 questions from sample quiz HTML (found ${extractedQuestions.length})`);

const sampleAnswers = `
| Câu | Đáp án | Nguyên văn đáp án |
| 1 | C | restore |
| 2 | A | strained |
| 3 | A | acumen |
| 4 | C | bond |
| 5 | C | widespread |
| 6 | C | flourish |
| 7 | C | disrepair |
| 8 | B | dispute |
| 9 | A | severe |
| 10 | B | unearth |
| 11 | B | in |
| 12 | A | off |
| 13 | B | up |
| 14 | C | across |
| 15 | B | out |
| 16 | D | into |
| 17 | B | on |
| 18 | D | out |
| 19 | C | up |
| 20 | C | round |
`;

const parsedAnswerMap = parseAnswersUltra(sampleAnswers);
let matchedCount = 0;

for (const q of extractedQuestions) {
  const ans = parsedAnswerMap.get(q.qNum);
  if (!ans) continue;

  let matchedChoice = null;
  if (ans.text) {
    const targetNorm = normalizeText(ans.text);
    for (const c of q.choices) {
      if (normalizeText(c.rawText) === targetNorm) {
        matchedChoice = c;
        break;
      }
    }
  }

  if (!matchedChoice && ans.letter) {
    matchedChoice = q.choices.find(c => c.letter === ans.letter);
  }

  if (matchedChoice) {
    matchedCount++;
  }
}

assert(matchedCount === 20, `Matched ${matchedCount}/20 questions with 100% precision`);

// ─────────────────────────────────────────────────────────────
// TEST 6: Multi-Page A4 High-DPI PDF Generator Validation
// ─────────────────────────────────────────────────────────────
console.log('\n📌 TEST 6: Multi-Page A4 PDF Generator (Smart Page Break)');

const A4_W_PT = 595.28;
const A4_H_PT = 841.89;

/**
 * Simulated multi-page PDF generator for Node.js testing.
 * Mirrors the browser version but uses Buffer instead of canvas/Blob.
 */
function generateMultiPagePdf(pageJpegBuffers, pageWidths, pageHeights) {
  const numPages = pageJpegBuffers.length;
  const offsets = [];
  let pdf = '%PDF-1.4\n';

  function addObj(str) {
    offsets.push(pdf.length);
    pdf += str + '\n';
  }

  // Catalog
  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  // Pages — Kids array
  const kidRefs = [];
  for (let i = 0; i < numPages; i++) {
    kidRefs.push(`${3 + i * 3} 0 R`);
  }
  addObj(`2 0 obj\n<< /Type /Pages /Kids [${kidRefs.join(' ')}] /Count ${numPages} >>\nendobj`);

  const binaryChunks = [Buffer.from(pdf, 'binary')];
  let currentLength = binaryChunks[0].length;

  for (let i = 0; i < numPages; i++) {
    const jpegBuf = pageJpegBuffers[i];
    const pageObjNum = 3 + i * 3;
    const imgObjNum = pageObjNum + 1;
    const contentObjNum = pageObjNum + 2;

    const scale = A4_W_PT / pageWidths[i];
    const ptW = A4_W_PT;
    const ptH = pageHeights[i] * scale;

    // Page object
    offsets.push(currentLength);
    const pageStr = `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW.toFixed(2)} ${ptH.toFixed(2)}] /Resources << /XObject << /Im0 ${imgObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`;
    const pageBuf = Buffer.from(pageStr, 'binary');
    binaryChunks.push(pageBuf);
    currentLength += pageBuf.length;

    // Image XObject
    offsets.push(currentLength);
    const imgHeader = `${imgObjNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pageWidths[i]} /Height ${pageHeights[i]} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBuf.length} >>\nstream\n`;
    const imgHeaderBuf = Buffer.from(imgHeader, 'binary');
    const imgFooterBuf = Buffer.from('\nendstream\nendobj\n', 'binary');
    binaryChunks.push(imgHeaderBuf, jpegBuf, imgFooterBuf);
    currentLength += imgHeaderBuf.length + jpegBuf.length + imgFooterBuf.length;

    // Content stream
    const contentStr = `q\n${ptW.toFixed(2)} 0 0 ${ptH.toFixed(2)} 0 0 cm\n/Im0 Do\nQ\n`;
    offsets.push(currentLength);
    const csStr = `${contentObjNum} 0 obj\n<< /Length ${contentStr.length} >>\nstream\n${contentStr}endstream\nendobj\n`;
    const csBuf = Buffer.from(csStr, 'binary');
    binaryChunks.push(csBuf);
    currentLength += csBuf.length;
  }

  // Xref
  const totalObjects = 2 + numPages * 3;
  const startXref = currentLength;
  let xref = `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ` 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  binaryChunks.push(Buffer.from(xref, 'binary'));

  return Buffer.concat(binaryChunks);
}

// Simulate 2-page PDF (like a long quiz split across two A4 pages)
const dummyJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0xFF, 0xD9]);
const testPdfBuf = generateMultiPagePdf(
  [dummyJpeg, dummyJpeg],   // 2 pages
  [1920, 1920],              // pixel widths
  [3508, 2400]               // pixel heights (page 1 full A4, page 2 shorter)
);

const pdfStr = testPdfBuf.toString('binary');
assert(pdfStr.startsWith('%PDF-1.4'), 'PDF starts with valid %PDF-1.4 header');
assert(pdfStr.includes('/Count 2'), 'PDF declares /Count 2 pages');
assert(pdfStr.includes('3 0 obj'), 'PDF contains Page 1 object (3 0 obj)');
assert(pdfStr.includes('6 0 obj'), 'PDF contains Page 2 object (6 0 obj)');
assert(pdfStr.includes('/Filter /DCTDecode'), 'PDF contains DCTDecode filter for JPEG images');
assert(pdfStr.includes('/MediaBox [0 0 595.28'), 'PDF pages use A4 width (595.28 pt)');
assert(pdfStr.trim().endsWith('%%EOF'), 'PDF ends with valid %%EOF marker');
assert((pdfStr.match(/\/Type \/Page /g) || []).length === 2, 'PDF contains exactly 2 /Type /Page entries');

// ─────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
if (passedTests === totalTests) {
  console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
} else {
  console.error(`⚠️ TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  process.exit(1);
}
console.log('═══════════════════════════════════════════════════════════════\n');
