/**
 * AUTO LCMS STEALTH v2.2 — POPUP WORKFLOW ENGINE
 * Step 1: Full-page screenshot (scroll+stitch) & PNG/JPG/PDF Export
 * Step 2: AI platform redirect + Gemini API 1-Click Auto-Solver
 * Step 3: Paste & stealth/burst auto-fill
 */
document.addEventListener('DOMContentLoaded', () => {
  // ═══ ELEMENTS ═══
  const steps = document.querySelectorAll('.step');
  const panes = document.querySelectorAll('.tab-pane');

  // Step 1: Capture
  const btnCapture = document.getElementById('btn-capture');
  const previewBox = document.getElementById('preview-box');
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const previewImg = document.getElementById('preview-img');
  const captureProgress = document.getElementById('capture-progress');
  const capStatus = document.getElementById('cap-status');
  const capCount = document.getElementById('cap-count');
  const capFill = document.getElementById('cap-fill');
  const formatRow = document.getElementById('format-row');
  const fmtBtns = document.querySelectorAll('.fmt-btn');
  const btnSave = document.getElementById('btn-save');

  // Step 2: AI & Gemini Solver
  const geminiModelSelect = document.getElementById('gemini-model-select');
  const geminiApiKeyInput = document.getElementById('gemini-api-key');
  const btnSaveKey = document.getElementById('btn-save-key');
  const btnGeminiSolve = document.getElementById('btn-gemini-solve');
  const geminiStatus = document.getElementById('gemini-status');
  const btnCopyPrompt = document.getElementById('btn-copy-prompt');
  const promptBox = document.getElementById('prompt-box');

  // Step 3: Paste & Fill
  const btnSpeedBurst = document.getElementById('btn-speed-burst');
  const btnSpeedStealth = document.getElementById('btn-speed-stealth');
  const fillInput = document.getElementById('fill-input');
  const btnFill = document.getElementById('btn-fill');
  const btnPasteFill = document.getElementById('btn-paste-fill');
  const fillStatus = document.getElementById('fill-status');

  // Guide Modal
  const btnGuide = document.getElementById('btn-guide');
  const guideOverlay = document.getElementById('guide-overlay');
  const btnGuideClose = document.getElementById('btn-guide-close');
  const btnGuideConfirm = document.getElementById('btn-guide-confirm');
  const btnGuideToggleAll = document.getElementById('btn-guide-toggle-all');
  const guideToggleText = document.getElementById('guide-toggle-text');
  const btnScrollTop = document.getElementById('btn-scroll-top');
  const btnScrollBottom = document.getElementById('btn-scroll-bottom');
  const guideBody = document.getElementById('guide-body');

  // ═══ STATE ═══
  let currentStep = 1;
  let capturedDataUrl = null;
  let stitchedCanvas = null;
  let selectedFormat = 'png';
  let speedMode = 'burst'; // 'burst' (0.02s) or 'stealth' (human delay)

  // Load saved state from storage
  chrome.storage.local.get(['lastAnswersInput', 'geminiApiKey', 'geminiModel', 'autoFillSpeed'], (res) => {
    if (res.lastAnswersInput) fillInput.value = res.lastAnswersInput;
    if (res.geminiApiKey) geminiApiKeyInput.value = res.geminiApiKey;
    if (res.geminiModel && geminiModelSelect) geminiModelSelect.value = res.geminiModel;
    if (res.autoFillSpeed) {
      speedMode = res.autoFillSpeed;
      updateSpeedButtons();
    }
  });

  if (geminiModelSelect) {
    geminiModelSelect.addEventListener('change', () => {
      chrome.storage.local.set({ geminiModel: geminiModelSelect.value });
    });
  }

  // ═══ STEP NAVIGATION ═══
  function setStep(n) {
    currentStep = n;
    steps.forEach(s => {
      const sn = parseInt(s.dataset.step);
      s.classList.toggle('active', sn === n);
      s.classList.toggle('completed', sn < n);
    });
    panes.forEach((p, i) => p.classList.toggle('active', i + 1 === n));
  }

  steps.forEach(s => {
    s.addEventListener('click', () => setStep(parseInt(s.dataset.step)));
  });

  // ═══ STEP 1: FULL-PAGE SCREENSHOT (SCROLL & STITCH) ═══
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function captureFullPage() {
    btnCapture.disabled = true;
    btnCapture.textContent = '⏳ Đang chụp...';
    captureProgress.style.display = 'block';
    capStatus.textContent = 'Đang đo kích thước trang...';
    capFill.style.width = '0%';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('Không tìm thấy tab hiện tại!');

      // 1. Get page dimensions
      const [dimResult] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({
          scrollHeight: Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight
          ),
          viewportHeight: window.innerHeight,
          viewportWidth: window.innerWidth,
          scrollTop: window.scrollY,
          dpr: window.devicePixelRatio || 1
        })
      });
      const dims = dimResult.result;

      // 2. Hide extension UI on page
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const host = document.getElementById('__lcms_host__');
          if (host) host.style.display = 'none';
        }
      });

      // 3. Compute slices safely
      const numSlices = Math.max(1, Math.ceil(dims.scrollHeight / dims.viewportHeight));
      const slices = [];

      for (let i = 0; i < numSlices; i++) {
        const maxScroll = Math.max(0, dims.scrollHeight - dims.viewportHeight);
        const scrollY = Math.min(i * dims.viewportHeight, maxScroll);

        // Scroll to position & hide fixed sticky elements on slices > 0 to avoid overlapping
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (y, isScrolled) => {
            window.scrollTo({ top: y, behavior: 'instant' });
            const navs = document.querySelectorAll('.navbar, .fixed-top, #page-header');
            navs.forEach(el => {
              if (el.dataset.origOpacity === undefined) el.dataset.origOpacity = el.style.opacity || '1';
              el.style.opacity = isScrolled ? '0' : el.dataset.origOpacity;
            });
          },
          args: [scrollY, i > 0]
        });

        // Wait for render stabilization
        await new Promise(r => setTimeout(r, 220));

        // Capture viewport
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId || null, { format: 'png' });
        slices.push({ dataUrl, scrollY });

        // Update progress
        const pct = Math.round(((i + 1) / numSlices) * 100);
        capFill.style.width = `${pct}%`;
        capCount.textContent = `${pct}%`;
        capStatus.textContent = `Chụp ${i + 1}/${numSlices} phần...`;
      }

      // 4. Restore scroll position and show UI & navbars
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (origY) => {
          window.scrollTo({ top: origY, behavior: 'instant' });
          const host = document.getElementById('__lcms_host__');
          if (host) host.style.display = '';
          const navs = document.querySelectorAll('.navbar, .fixed-top, #page-header');
          navs.forEach(el => {
            if (el.dataset.origOpacity !== undefined) {
              el.style.opacity = el.dataset.origOpacity;
              delete el.dataset.origOpacity;
            }
          });
        },
        args: [dims.scrollTop]
      });

      // 5. Stitch slices on HTML5 canvas
      capStatus.textContent = 'Đang ghép ảnh toàn trang...';

      const firstImg = await loadImage(slices[0].dataUrl);
      const imgW = firstImg.width;
      const imgH = firstImg.height;
      const scale = imgW / dims.viewportWidth;

      stitchedCanvas = document.createElement('canvas');
      stitchedCanvas.width = imgW;
      stitchedCanvas.height = Math.max(imgH, Math.round(dims.scrollHeight * scale));
      const ctx = stitchedCanvas.getContext('2d');

      for (let i = 0; i < slices.length; i++) {
        const img = i === 0 ? firstImg : await loadImage(slices[i].dataUrl);

        if (slices.length === 1) {
          ctx.drawImage(img, 0, 0);
        } else if (i === slices.length - 1) {
          // Last slice — anchor to the bottom of the canvas to avoid seam
          const drawY = stitchedCanvas.height - img.height;
          ctx.drawImage(img, 0, Math.max(0, drawY));
        } else {
          const destY = Math.round(slices[i].scrollY * scale);
          ctx.drawImage(img, 0, destY);
        }
      }

      capturedDataUrl = stitchedCanvas.toDataURL('image/png');

      // 6. Show preview
      previewPlaceholder.style.display = 'none';
      previewImg.src = capturedDataUrl;
      previewImg.style.display = 'block';
      formatRow.style.display = 'flex';
      capStatus.textContent = 'Chụp xong! Chọn định dạng (PNG/JPG/PDF A4 đa trang) và lưu.';
      capFill.style.width = '100%';

    } catch (err) {
      capStatus.textContent = 'Lỗi: ' + err.message;
      capFill.style.width = '0%';
      console.error('[AUTO LCMS] Screenshot error:', err);
    }

    btnCapture.disabled = false;
    btnCapture.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
      CHỤP TOÀN TRANG
    `;
  }

  btnCapture.addEventListener('click', captureFullPage);

  // Format selection (PNG / JPG / PDF)
  fmtBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      fmtBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFormat = btn.dataset.fmt;
    });
  });

  // ═══ MULTI-PAGE A4 HIGH-DPI PDF GENERATOR v2.2 ═══
  // A4 dimensions: 595.28 × 841.89 pt (210 × 297 mm)
  // Smart page break: 10% look-ahead zone avoids cutting mid-content
  const A4_WIDTH_PT = 595.28;
  const A4_HEIGHT_PT = 841.89;

  /**
   * Slice the stitched canvas into multiple A4-sized page canvases.
   * Uses aspect-ratio fitting so the full page width maps to A4 width,
   * then slices vertically at A4 height boundaries.
   */
  function sliceCanvasToA4Pages(sourceCanvas) {
    const srcW = sourceCanvas.width;
    const srcH = sourceCanvas.height;

    // Map source width → A4 width; derive pixel height per A4 page
    const scale = A4_WIDTH_PT / srcW;               // pt per pixel
    const pageHeightPx = Math.floor(A4_HEIGHT_PT / scale); // pixel rows per A4 page

    const pages = [];
    let yOffset = 0;

    while (yOffset < srcH) {
      let sliceH = Math.min(pageHeightPx, srcH - yOffset);

      // Smart page-break: if not the last page, look ahead 10% to
      // find a "quiet" row (mostly uniform color = gap between questions)
      if (yOffset + sliceH < srcH) {
        const lookAheadZone = Math.floor(pageHeightPx * 0.10); // 10% zone
        const scanStart = Math.max(0, sliceH - lookAheadZone);
        const ctx = sourceCanvas.getContext('2d');

        let bestBreakRow = sliceH; // fallback: full page height
        let bestScore = Infinity;

        for (let row = sliceH - 1; row >= scanStart; row--) {
          const rowData = ctx.getImageData(0, yOffset + row, srcW, 1).data;
          // Calculate variance of the row — low variance = uniform = good break
          let sum = 0, sumSq = 0;
          for (let px = 0; px < rowData.length; px += 4) {
            const lum = rowData[px] * 0.299 + rowData[px + 1] * 0.587 + rowData[px + 2] * 0.114;
            sum += lum;
            sumSq += lum * lum;
          }
          const n = srcW;
          const mean = sum / n;
          const variance = (sumSq / n) - (mean * mean);

          if (variance < bestScore) {
            bestScore = variance;
            bestBreakRow = row;
          }
          // Near-perfect uniform row (white/light gap) — break immediately
          if (variance < 50) break;
        }
        sliceH = bestBreakRow;
        if (sliceH < pageHeightPx * 0.5) sliceH = pageHeightPx; // safety: don't make tiny pages
      }

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = srcW;
      pageCanvas.height = sliceH;
      const pCtx = pageCanvas.getContext('2d');
      // White background (avoid transparency → black in JPEG)
      pCtx.fillStyle = '#ffffff';
      pCtx.fillRect(0, 0, srcW, sliceH);
      pCtx.drawImage(sourceCanvas, 0, yOffset, srcW, sliceH, 0, 0, srcW, sliceH);

      pages.push(pageCanvas);
      yOffset += sliceH;
    }

    return pages;
  }

  /**
   * Convert a single canvas page to JPEG Uint8Array.
   */
  function canvasToJpegBytes(canvas, quality) {
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        const buf = await blob.arrayBuffer();
        resolve(new Uint8Array(buf));
      }, 'image/jpeg', quality);
    });
  }

  /**
   * Generate a multi-page A4 PDF blob from the full stitched canvas.
   * Each page is an independent JPEG XObject at high DPI.
   */
  async function generatePdfBlob(canvas, quality = 0.92) {
    const pages = sliceCanvasToA4Pages(canvas);
    const numPages = pages.length;

    // Pre-encode all pages to JPEG
    const jpegDataArr = [];
    for (const pg of pages) {
      jpegDataArr.push(await canvasToJpegBytes(pg, quality));
    }

    const enc = new TextEncoder();
    const chunks = [];
    const offsets = [];
    let currentOffset = 0;

    function write(str) {
      const bytes = enc.encode(str);
      chunks.push(bytes);
      currentOffset += bytes.length;
    }

    function writeBytes(bytes) {
      chunks.push(bytes);
      currentOffset += bytes.length;
    }

    // PDF 1.4 Header with binary comment
    write('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

    // Object numbering layout:
    //   1 = Catalog
    //   2 = Pages
    //   For each page i (0-based):
    //     3 + i*3     = Page object
    //     3 + i*3 + 1 = Image XObject
    //     3 + i*3 + 2 = Content stream
    const totalObjects = 2 + numPages * 3;

    // Obj 1: Catalog
    offsets.push(currentOffset);
    write('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    // Obj 2: Pages — list all page references
    const kidRefs = [];
    for (let i = 0; i < numPages; i++) {
      kidRefs.push(`${3 + i * 3} 0 R`);
    }
    offsets.push(currentOffset);
    write(`2 0 obj\n<< /Type /Pages /Kids [${kidRefs.join(' ')}] /Count ${numPages} >>\nendobj\n`);

    // Per-page objects
    for (let i = 0; i < numPages; i++) {
      const pg = pages[i];
      const jpegBytes = jpegDataArr[i];
      const pageObjNum = 3 + i * 3;
      const imgObjNum = pageObjNum + 1;
      const contentObjNum = pageObjNum + 2;

      // Scale: fit page canvas width to A4 width, height proportional
      const scale = A4_WIDTH_PT / pg.width;
      const ptW = A4_WIDTH_PT;
      const ptH = pg.height * scale;

      // Page object
      offsets.push(currentOffset);
      write(`${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW.toFixed(2)} ${ptH.toFixed(2)}] /Resources << /XObject << /Im0 ${imgObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`);

      // Image XObject
      offsets.push(currentOffset);
      write(`${imgObjNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pg.width} /Height ${pg.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
      writeBytes(jpegBytes);
      write('\nendstream\nendobj\n');

      // Content stream
      const contentStr = `q\n${ptW.toFixed(2)} 0 0 ${ptH.toFixed(2)} 0 0 cm\n/Im0 Do\nQ\n`;
      const contentBytes = enc.encode(contentStr);
      offsets.push(currentOffset);
      write(`${contentObjNum} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
      writeBytes(contentBytes);
      write('endstream\nendobj\n');
    }

    // Xref Table
    const startXref = currentOffset;
    write(`xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`);
    for (let i = 0; i < offsets.length; i++) {
      write(offsets[i].toString().padStart(10, '0') + ' 00000 n \n');
    }

    // Trailer
    write(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`);

    return new Blob(chunks, { type: 'application/pdf' });
  }

  // Save file (PNG, JPG, or PDF)
  btnSave.addEventListener('click', async () => {
    if (!capturedDataUrl && !stitchedCanvas) return;

    let saveUrl = capturedDataUrl;
    let filename = `quiz_screenshot_${Date.now()}`;

    if (selectedFormat === 'pdf' && stitchedCanvas) {
      const pdfBlob = await generatePdfBlob(stitchedCanvas);
      saveUrl = URL.createObjectURL(pdfBlob);
      filename += '.pdf';
    } else if (selectedFormat === 'jpeg' && stitchedCanvas) {
      const c = document.createElement('canvas');
      c.width = stitchedCanvas.width;
      c.height = stitchedCanvas.height;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(stitchedCanvas, 0, 0);
      saveUrl = c.toDataURL('image/jpeg', 0.92);
      filename += '.jpg';
    } else {
      filename += '.png';
    }

    // Download via chrome.downloads with fallback
    try {
      chrome.downloads.download({
        url: saveUrl,
        filename: filename,
        saveAs: true
      }, () => {
        if (chrome.runtime.lastError) {
          const a = document.createElement('a');
          a.href = saveUrl;
          a.download = filename;
          a.click();
        }
      });
    } catch (e) {
      const a = document.createElement('a');
      a.href = saveUrl;
      a.download = filename;
      a.click();
    }
  });

  // ═══ STEP 2: AI PLATFORM & GEMINI DIRECT SOLVER ═══
  btnCopyPrompt.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(promptBox.textContent);
      btnCopyPrompt.textContent = '✅ Đã Copy!';
      setTimeout(() => { btnCopyPrompt.textContent = '📋 Copy Prompt'; }, 1500);
    } catch (e) {
      const range = document.createRange();
      range.selectNodeContents(promptBox);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      btnCopyPrompt.textContent = '⚠ Bấm Ctrl+C';
      setTimeout(() => { btnCopyPrompt.textContent = '📋 Copy Prompt'; }, 2000);
    }
  });

  // Save Gemini API Key
  btnSaveKey.addEventListener('click', () => {
    const key = geminiApiKeyInput.value.trim();
    chrome.storage.local.set({ geminiApiKey: key }, () => {
      showGeminiStatus('✅ Đã lưu API Key thành công!', 'success');
      setTimeout(() => { geminiStatus.style.display = 'none'; }, 2000);
    });
  });

  function showGeminiStatus(msg, type) {
    geminiStatus.style.display = 'block';
    geminiStatus.textContent = msg;
    geminiStatus.style.color = type === 'success' ? '#34d399' : type === 'error' ? '#f87171' : '#fbbf24';
  }

  // 1-Click Gemini Auto Solve
  async function solveWithGeminiDirect() {
    const apiKey = geminiApiKeyInput.value.trim();
    if (!apiKey) {
      showGeminiStatus('Vui lòng nhập Gemini API Key trước!', 'error');
      geminiApiKeyInput.focus();
      return;
    }

    chrome.storage.local.set({ geminiApiKey: apiKey });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showGeminiStatus('Không tìm thấy tab!', 'error');
      return;
    }

    const ready = await ensureContentScript(tab.id);
    if (!ready) {
      showGeminiStatus('Hãy mở tab quiz LCMS trước!', 'error');
      return;
    }

    btnGeminiSolve.disabled = true;
    showGeminiStatus('Đang quét câu hỏi từ trang quiz...', 'normal');

    try {
      // 1. Extract questions text from DOM
      const extractRes = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_QUESTIONS' }, (res) => {
          if (chrome.runtime.lastError) resolve({ success: false, error: chrome.runtime.lastError.message });
          else resolve(res || { success: false });
        });
      });

      if (!extractRes || !extractRes.questions || extractRes.questions.length === 0) {
        throw new Error(extractRes?.error || 'Không tìm thấy câu hỏi trắc nghiệm nào trên trang hiện tại!');
      }

      showGeminiStatus(`Đã tìm thấy ${extractRes.questions.length} câu. Đang gửi AI giải...`, 'normal');

      // 2. Build prompt
      let quizText = "Dưới đây là các câu hỏi trắc nghiệm cần giải:\n\n";
      extractRes.questions.forEach(q => {
        quizText += `Câu ${q.qNum}: ${q.qText}\n`;
        q.choices.forEach(c => {
          quizText += `  ${c.letter}. ${c.rawText}\n`;
        });
        quizText += '\n';
      });

      const prompt = `Bạn là chuyên gia giải đề thi trắc nghiệm học thuật với độ chính xác cao nhất có thể.\n` +
        `Nhiệm vụ: Phân tích kỹ lưỡng các câu hỏi sau, suy nghĩ sâu (ngữ pháp, từ vựng, logic) để chọn đáp án đúng nhất.\n\n` +
        `Sau khi suy luận kỹ, trả về DUY NHẤT một bảng Markdown theo định dạng:\n` +
        `| Câu | Đáp án | Nguyên văn đáp án |\n` +
        `| --- | ------ | ----------------- |\n` +
        `| 1   | C      | restore           |\n\n` +
        `LƯU Ý BẮT BUỘC:\n` +
        `- Cột "Đáp án" ghi đúng 1 chữ cái in hoa (A, B, C, D hoặc E).\n` +
        `- Cột "Nguyên văn đáp án" copy CHÍNH XÁC NGUYÊN VĂN từ ngữ của phương án đúng (để extension tự động nhận diện kháng đảo đề).\n` +
        `- TUYỆT ĐỐI CHỈ xuất bảng Markdown, KHÔNG thêm bất kỳ văn bản chào hỏi, giải thích hay mở đầu nào.\n\n` +
        quizText;

      // 3. Call Gemini API with user-chosen model and smart fallback chain
      const chosenModel = (geminiModelSelect && geminiModelSelect.value) ? geminiModelSelect.value : 'gemini-4-argon';
      const candidateModels = [
        chosenModel,
        'gemini-4-argon',
        'gemini-4-ultra',
        'gemini-3.1-pro',
        'gemini-2.5-flash',
        'gemini-2.0-flash-thinking-exp-01-21',
        'gemini-2.0-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash'
      ].filter((m, idx, arr) => arr.indexOf(m) === idx);

      let response = null;
      let usedModel = chosenModel;
      let lastError = null;

      for (const model of candidateModels) {
        showGeminiStatus(`Đang dùng ${model} giải ${extractRes.questions.length} câu...`, 'normal');
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        try {
          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.1 }
            })
          });

          if (res.ok) {
            response = res;
            usedModel = model;
            break;
          } else {
            const errJson = await res.json().catch(() => ({}));
            lastError = errJson.error?.message || `Model ${model} HTTP ${res.status}`;
          }
        } catch (fetchErr) {
          lastError = fetchErr.message;
        }
      }

      if (!response || !response.ok) {
        throw new Error(lastError || 'Không thể kết nối hoặc gọi mô hình Gemini!');
      }

      const resData = await response.json();
      const aiText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) throw new Error(`Mô hình ${usedModel} không trả về nội dung đáp án!`);

      showGeminiStatus(`✅ Đã giải xong bằng ${usedModel}! Đang chuyển sang Tab Điền...`, 'success');

      // 4. Fill text into step 3 & trigger fill
      fillInput.value = aiText;
      chrome.storage.local.set({ lastAnswersInput: aiText });

      setTimeout(() => {
        setStep(3);
        sendStealthFill(aiText);
      }, 700);

    } catch (err) {
      showGeminiStatus('Lỗi: ' + err.message, 'error');
    } finally {
      btnGeminiSolve.disabled = false;
    }
  }

  btnGeminiSolve.addEventListener('click', solveWithGeminiDirect);

  // ═══ STEP 3: PASTE & FILL ENGINE ═══
  function updateSpeedButtons() {
    btnSpeedBurst.classList.toggle('active', speedMode === 'burst');
    btnSpeedStealth.classList.toggle('active', speedMode === 'stealth');
  }

  btnSpeedBurst.addEventListener('click', () => {
    speedMode = 'burst';
    updateSpeedButtons();
    chrome.storage.local.set({ autoFillSpeed: 'burst' });
  });

  btnSpeedStealth.addEventListener('click', () => {
    speedMode = 'stealth';
    updateSpeedButtons();
    chrome.storage.local.set({ autoFillSpeed: 'stealth' });
  });

  function updateFillStatus(text, type) {
    fillStatus.innerText = text;
    fillStatus.style.color = type === 'success' ? '#34d399' : type === 'error' ? '#f87171' : '#64748b';
  }

  async function ensureContentScript(tabId) {
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'PING' });
      return true;
    } catch (e) {
      try {
        await chrome.scripting.executeScript({ target: { tabId }, files: ['src/content/content.js'] });
        await new Promise(r => setTimeout(r, 600));
        return true;
      } catch (err) {
        return false;
      }
    }
  }

  async function sendStealthFill(text) {
    if (!text || !text.trim()) {
      updateFillStatus('Vui lòng nhập nội dung đáp án!', 'error');
      return;
    }

    chrome.storage.local.set({ lastAnswersInput: text });
    updateFillStatus('Đang kết nối với trang quiz...', 'normal');

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      updateFillStatus('Không tìm thấy tab!', 'error');
      return;
    }

    const ready = await ensureContentScript(tab.id);
    if (!ready) {
      updateFillStatus('Không thể kết nối. Hãy mở trang quiz LCMS trước!', 'error');
      return;
    }

    const modeText = speedMode === 'burst' ? 'Siêu Tốc (0.02s)' : 'Stealth (Người Thật)';
    updateFillStatus(`Đang điền [${modeText}]...`, 'normal');
    btnFill.disabled = true;
    btnPasteFill.disabled = true;

    try {
      chrome.tabs.sendMessage(tab.id, { action: 'AUTO_FILL', data: text, speedMode }, (response) => {
        btnFill.disabled = false;
        btnPasteFill.disabled = false;

        if (chrome.runtime.lastError) {
          updateFillStatus('Lỗi: ' + chrome.runtime.lastError.message, 'error');
          return;
        }

        if (response && response.success) {
          updateFillStatus(
            `✅ Đã điền ${response.filledCount}/${response.totalQuestions} câu [${modeText}]. KHÔNG tự nộp — hãy kiểm tra!`,
            'success'
          );
        } else {
          updateFillStatus(response?.message || 'Có lỗi khi điền!', 'error');
        }
      });
    } catch (err) {
      btnFill.disabled = false;
      btnPasteFill.disabled = false;
      updateFillStatus('Lỗi: ' + err.message, 'error');
    }
  }

  btnFill.addEventListener('click', () => sendStealthFill(fillInput.value));

  btnPasteFill.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        fillInput.value = text;
        sendStealthFill(text);
      } else {
        updateFillStatus('Clipboard trống!', 'error');
      }
    } catch (e) {
      updateFillStatus('Không đọc được Clipboard. Bấm Ctrl+V vào ô rồi bấm ĐIỀN ĐÁP ÁN!', 'error');
    }
  });

  // ═══ GUIDE MODAL (SOP 10/2026 ACCORDION & FAST SCROLL CONTROLLER) ═══
  const guideSteps = document.querySelectorAll('.guide-step');
  const navChips = document.querySelectorAll('.nav-chip');

  function openGuideModal() {
    guideOverlay.classList.add('open');
    if (guideBody) guideBody.scrollTop = 0;
  }

  function closeGuideModal() {
    guideOverlay.classList.remove('open');
  }

  function updateToggleAllState() {
    if (!guideToggleText) return;
    const hasAnyCollapsed = Array.from(guideSteps).some(s => s.classList.contains('collapsed'));
    guideToggleText.textContent = hasAnyCollapsed ? 'Mở tất cả' : 'Thu gọn';
  }

  if (btnGuide) btnGuide.addEventListener('click', openGuideModal);
  if (btnGuideClose) btnGuideClose.addEventListener('click', closeGuideModal);
  if (btnGuideConfirm) btnGuideConfirm.addEventListener('click', closeGuideModal);

  guideOverlay.addEventListener('click', (e) => {
    if (e.target === guideOverlay) closeGuideModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && guideOverlay.classList.contains('open')) {
      closeGuideModal();
    }
  });

  // Accordion Step Click Handler
  guideSteps.forEach(step => {
    const header = step.querySelector('.gs-header');
    if (header) {
      header.addEventListener('click', () => {
        const isCollapsed = step.classList.contains('collapsed');
        if (isCollapsed) {
          step.classList.remove('collapsed');
          step.classList.add('expanded');
        } else {
          step.classList.remove('expanded');
          step.classList.add('collapsed');
        }
        updateToggleAllState();
      });
    }
  });

  // Toggle All Steps Button
  if (btnGuideToggleAll) {
    btnGuideToggleAll.addEventListener('click', () => {
      const hasAnyCollapsed = Array.from(guideSteps).some(s => s.classList.contains('collapsed'));
      guideSteps.forEach(s => {
        if (hasAnyCollapsed) {
          s.classList.remove('collapsed');
          s.classList.add('expanded');
        } else {
          s.classList.remove('expanded');
          s.classList.add('collapsed');
        }
      });
      updateToggleAllState();
    });
  }

  // Quick Jump Rail
  navChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const targetId = chip.getAttribute('data-target');
      const targetElem = document.getElementById(targetId);
      if (targetElem) {
        targetElem.classList.remove('collapsed');
        targetElem.classList.add('expanded');
        updateToggleAllState();
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // Smooth Fast Scroll Navigation ("Tua lên xuống")
  if (btnScrollTop && guideBody) {
    btnScrollTop.addEventListener('click', () => {
      guideBody.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (btnScrollBottom && guideBody) {
    btnScrollBottom.addEventListener('click', () => {
      guideBody.scrollTo({ top: guideBody.scrollHeight, behavior: 'smooth' });
    });
  }
});
