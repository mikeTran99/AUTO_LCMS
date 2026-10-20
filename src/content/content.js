/**
 * AUTO LCMS QUIZ SOLVER — STEALTH 3D LUXURY EDITION
 * Anti-Detection Engine: Giả lập hành vi người dùng thật 100%
 * - Staggered timing (random delay mỗi câu)
 * - Native mouse event chain simulation
 * - Shadow DOM isolation (UI ẩn khỏi Moodle DOM Observer)
 * - Zero console fingerprint
 * - Focus/Blur spoof
 * - No suspicious CSS class injection on Moodle elements
 */

(function () {
  'use strict';

  if (window.__AUTO_LCMS_STEALTH__) return;
  window.__AUTO_LCMS_STEALTH__ = true;

  /* =========================================================================
     0. STEALTH CORE — Anti-Detection Primitives
     ========================================================================= */

  // Random delay range for human simulation
  const HUMAN_DELAY_MIN = 280;
  const HUMAN_DELAY_MAX = 750;
  const INTER_QUESTION_MIN = 400;
  const INTER_QUESTION_MAX = 1200;

  function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * STEALTH CLICK ENGINE
   * Giả lập chuỗi sự kiện mouse đầy đủ như người dùng thật:
   * focusin → mouseover → mouseenter → mousemove → mousedown → focus → mouseup → click → input → change
   *
   * Tất cả event đều có tọa độ thực tế từ element bounding box.
   */
  function stealthClickRadio(inputEl) {
    const rect = inputEl.getBoundingClientRect();
    // Tọa độ random trong vùng element (không phải center chính xác — người thật không bao giờ click đúng center)
    const offsetX = Math.random() * rect.width * 0.6 + rect.width * 0.2;
    const offsetY = Math.random() * rect.height * 0.6 + rect.height * 0.2;
    const clientX = rect.left + offsetX;
    const clientY = rect.top + offsetY;
    const screenX = clientX + window.screenX;
    const screenY = clientY + window.screenY;

    const commonProps = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX,
      clientY,
      screenX,
      screenY,
      button: 0,
      buttons: 1,
      detail: 1
    };

    // Chuỗi event giả lập đầy đủ
    const row = inputEl.closest('.r0, .r1, [class*="answer"]') || inputEl.parentElement;

    // 1. Mouse enters the area
    row.dispatchEvent(new MouseEvent('mouseenter', { ...commonProps, bubbles: false }));
    row.dispatchEvent(new MouseEvent('mouseover', { ...commonProps }));

    // 2. Mouse moves to the input
    inputEl.dispatchEvent(new MouseEvent('mousemove', { ...commonProps }));

    // 3. Pointer events
    inputEl.dispatchEvent(new PointerEvent('pointerdown', { ...commonProps, pointerId: 1, pointerType: 'mouse' }));

    // 4. Mousedown
    inputEl.dispatchEvent(new MouseEvent('mousedown', { ...commonProps }));

    // 5. Focus
    inputEl.focus({ preventScroll: true });
    inputEl.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    inputEl.dispatchEvent(new FocusEvent('focus', { bubbles: false }));

    // 6. Set checked state BEFORE mouseup (this is what browsers do)
    inputEl.checked = true;

    // 7. Mouseup
    inputEl.dispatchEvent(new MouseEvent('mouseup', { ...commonProps }));

    // 8. Pointer up
    inputEl.dispatchEvent(new PointerEvent('pointerup', { ...commonProps, pointerId: 1, pointerType: 'mouse' }));

    // 9. Click (the actual click)
    inputEl.dispatchEvent(new MouseEvent('click', { ...commonProps }));

    // 10. Input & Change events (Moodle listens to these for autosave)
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * FOCUS/BLUR SPOOF
   * Chặn Moodle theo dõi khi user rời trang (visibilitychange, blur, focus)
   */
  function installFocusSpoof() {
    // Override visibilitychange to always report "visible"
    Object.defineProperty(document, 'hidden', {
      get: () => false,
      configurable: true
    });
    Object.defineProperty(document, 'visibilityState', {
      get: () => 'visible',
      configurable: true
    });

    // Block blur/visibilitychange events from reaching Moodle handlers
    const suppressEvents = ['visibilitychange', 'blur'];
    suppressEvents.forEach(evt => {
      document.addEventListener(evt, (e) => {
        e.stopImmediatePropagation();
      }, true);
    });

    // Keep window.hasFocus always returning true
    const origHasFocus = document.hasFocus.bind(document);
    document.hasFocus = () => true;
  }

  /**
   * EXTENSION FINGERPRINT CLOAKING
   * Xóa dấu vết extension khỏi DOM/window
   */
  function cloakExtensionFingerprint() {
    // Chặn phát hiện chrome.runtime
    try {
      // Moodle có thể kiểm tra window.chrome.runtime — không can thiệp vì nó là native
      // Nhưng đảm bảo không có global variable nào lộ
      // Xóa guard variable sau khi init
      // (giữ __AUTO_LCMS_STEALTH__ nhưng không enumerable)
      Object.defineProperty(window, '__AUTO_LCMS_STEALTH__', {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false
      });
    } catch (e) {}
  }

  /* =========================================================================
     1. UNIVERSAL ULTRA PARSER ENGINE (Chấp nhận mọi định dạng)
     ========================================================================= */
  function parseAnswersUltra(input) {
    const map = new Map(); // questionNumber -> { letter, text, rawLine }
    if (!input || typeof input !== 'string') return map;

    const trimmed = input.trim();

    // 1. JSON Support
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const obj = JSON.parse(trimmed);
        for (const [k, v] of Object.entries(obj)) {
          const qNum = parseInt(k.replace(/\D/g, ''), 10);
          if (!isNaN(qNum)) {
            if (typeof v === 'string') {
              const letterMatch = v.match(/^([A-Ea-e])\b(?:\s*[\.:\-\)]\s*(.*))?$/);
              if (letterMatch) {
                map.set(qNum, { letter: letterMatch[1].toUpperCase(), text: (letterMatch[2] || '').trim(), rawLine: `${k}: ${v}` });
              } else {
                map.set(qNum, { letter: '', text: v.trim(), rawLine: `${k}: ${v}` });
              }
            } else if (typeof v === 'object' && v !== null) {
              map.set(qNum, { letter: (v.letter || v.answer || '').toUpperCase(), text: (v.text || '').trim(), rawLine: JSON.stringify(v) });
            }
          }
        }
        if (map.size > 0) return map;
      } catch (e) {}
    }

    const lines = input.split(/\r?\n/);

    for (let line of lines) {
      const rawLine = line;
      line = line.trim();
      if (!line || line.startsWith('|-') || line.startsWith('| -')) continue;

      // A. Bảng Markdown: | 1 | C | restore | hoặc | Câu 1 | C. | c. restore |
      if (line.startsWith('|')) {
        const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (cells.length >= 2) {
          let qNum = NaN;
          let letter = '';
          let text = '';

          for (let i = 0; i < cells.length; i++) {
            const c = cells[i];
            const numMatch = c.match(/^(?:câu|question|q)?\s*(\d+)$/i) || c.match(/(?:câu|question|q)?\s*(\d+)/i);
            if (isNaN(qNum) && numMatch && !isNaN(parseInt(numMatch[1], 10))) {
              qNum = parseInt(numMatch[1], 10);
              continue;
            }
            const letMatch = c.match(/^[(\[]?([A-Ea-e])[)\]\.\:\-]?$/);
            if (!letter && letMatch) {
              letter = letMatch[1].toUpperCase();
              continue;
            }
            if (!text && c && !/^(câu|đáp án|nguyên văn|stt|no|ans|thứ tự|answer|text|key)$/i.test(c)) {
              text = c;
            }
          }

          if (!isNaN(qNum) && (letter || text)) {
            if (text) {
              const cleanPrefix = text.match(/^[(\[]?([A-Ea-e])[)\]\.\:\-\s]+(.*)$/);
              if (cleanPrefix) {
                if (!letter) letter = cleanPrefix[1].toUpperCase();
                text = cleanPrefix[2].trim();
              }
            }
            map.set(qNum, { letter, text, rawLine });
            continue;
          }
        }
      }

      // B. Tab-separated (Excel / Google Sheets copy-paste)
      if (line.includes('\t')) {
        const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const qNum = parseInt(parts[0].replace(/\D/g, ''), 10);
          if (!isNaN(qNum)) {
            let letter = '';
            let text = '';
            const letMatch = parts[1].match(/^[(\[]?([A-Ea-e])[)\]\.\:\-]?$/);
            if (letMatch) {
              letter = letMatch[1].toUpperCase();
              text = parts.slice(2).join(' ').trim();
            } else {
              text = parts.slice(1).join(' ').trim();
            }
            if (text) {
              const cleanPrefix = text.match(/^[(\[]?([A-Ea-e])[)\]\.\:\-\s]+(.*)$/);
              if (cleanPrefix) {
                if (!letter) letter = cleanPrefix[1].toUpperCase();
                text = cleanPrefix[2].trim();
              }
            }
            map.set(qNum, { letter, text, rawLine });
            continue;
          }
        }
      }

      // C. Danh sách thông dụng: "1. C - restore" | "Câu 1: C. restore" | "1/ C: restore" | "1 C restore"
      const standardMatch = line.match(/^(?:câu|question|q)?\s*(\d+)[.\s:\)\/-]+([A-Ea-e])\b(?:\s*[.\s:\)\/-]+(.*))?$/i);
      if (standardMatch) {
        const qNum = parseInt(standardMatch[1], 10);
        const letter = standardMatch[2].toUpperCase();
        let text = (standardMatch[3] || '').trim();
        const cleanPrefix = text.match(/^[(\[]?([A-Ea-e])[)\]\.\:\-\s]+(.*)$/);
        if (cleanPrefix) text = cleanPrefix[2].trim();
        map.set(qNum, { letter, text, rawLine });
        continue;
      }

      // D. Dạng nén: "1A" | "2B" | "1 - C"
      const compactMatch = line.match(/^(?:câu|question|q)?\s*(\d+)\s*[.\s:\)\/-]*\s*([A-Ea-e])\s*$/i);
      if (compactMatch) {
        const qNum = parseInt(compactMatch[1], 10);
        const letter = compactMatch[2].toUpperCase();
        map.set(qNum, { letter, text: '', rawLine });
        continue;
      }

      // E. Số câu + Chỉ có Text đáp án (không có chữ cái): "1. restore" | "Câu 1: strained relations"
      const textOnlyMatch = line.match(/^(?:câu|question|q)?\s*(\d+)[.\s:\)\/-]+([^\d\s].*)$/i);
      if (textOnlyMatch && !/^(đáp án|môn|đã đối chiếu|câu|question|các câu|bảng|moodle|lần|unit)/i.test(line)) {
        const qNum = parseInt(textOnlyMatch[1], 10);
        let text = textOnlyMatch[2].trim();
        let letter = '';
        const cleanPrefix = text.match(/^[(\[]?([A-Ea-e])[)\]\.\:\-\s]+(.*)$/);
        if (cleanPrefix) {
          letter = cleanPrefix[1].toUpperCase();
          text = cleanPrefix[2].trim();
        }
        map.set(qNum, { letter, text, rawLine });
        continue;
      }
    }

    // Fallback 1: Chuỗi nén liền mạch "1.A 2.B 3.C" hoặc "1A 2B 3C"
    if (map.size === 0) {
      const inlineMatches = input.matchAll(/(?:câu|question|q)?\s*(\d+)[.\s:\)\/-]*([A-Ea-e])\b/gi);
      for (const match of inlineMatches) {
        const qNum = parseInt(match[1], 10);
        const letter = match[2].toUpperCase();
        if (!map.has(qNum)) {
          map.set(qNum, { letter, text: '', rawLine: match[0] });
        }
      }
    }

    // Fallback 2: Dãy chữ cái liên tiếp: "C, A, A, C, C, D..." hoặc "C A A C C D..."
    if (map.size === 0) {
      const letters = input.match(/\b([A-Ea-e])\b/g);
      if (letters && letters.length >= 2) {
        letters.forEach((l, idx) => {
          map.set(idx + 1, { letter: l.toUpperCase(), text: '', rawLine: l });
        });
      }
    }

    // Fallback 3: Từng dòng text thuần không có số thứ tự
    if (map.size === 0) {
      let autoIndex = 1;
      for (let line of lines) {
        line = line.trim();
        if (line && line.length > 1 && !/^(đáp án|môn|đã đối chiếu|các câu|unit|quiz)/i.test(line)) {
          map.set(autoIndex++, { letter: '', text: line, rawLine: line });
        }
      }
    }

    return map;
  }

  /* =========================================================================
     2. STRING NORMALIZER (Chuẩn hóa Unicode NFC & Loại bỏ tiền tố lựa chọn)
     ========================================================================= */
  function normalizeText(str) {
    if (!str) return '';
    return str
      .normalize('NFC')
      .toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/^[a-e][.\s\)-]+/, '') // Loại bỏ tiền tố lựa chọn thừa: "a. ", "c) "
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* =========================================================================
     3. BATCH AUTO-FILL ENGINE (Hỗ trợ 2 chế độ: Siêu Tốc 0.02s & Stealth Delay)
     TUYỆT ĐỐI KHÔNG BẤM NỘP/TIẾP TỤC.
     ========================================================================= */
  async function executeBatchAutoFillStealth(rawInput, speedMode = 'burst', progressCallback = null) {
    const answersMap = parseAnswersUltra(rawInput);
    if (answersMap.size === 0) {
      return {
        success: false,
        message: 'Không nhận diện được đáp án hợp lệ từ nội dung dán vào!',
        reviewList: []
      };
    }

    // Tìm tất cả câu hỏi trắc nghiệm trên trang Moodle
    const questionNodes = document.querySelectorAll('div.que, div.que.multichoice');
    if (questionNodes.length === 0) {
      return {
        success: false,
        message: 'Không tìm thấy câu hỏi trắc nghiệm nào trên trang hiện tại!',
        reviewList: []
      };
    }

    const reviewList = [];
    let filledCount = 0;
    const totalQ = questionNodes.length;
    const isBurst = speedMode === 'burst';

    for (let index = 0; index < totalQ; index++) {
      const qNode = questionNodes[index];
      const qnoElem = qNode.querySelector('span.qno, .no span, h3.no');
      let qNum = index + 1;
      if (qnoElem) {
        const text = qnoElem.innerText.replace(/\D/g, '');
        if (text) qNum = parseInt(text, 10);
      }

      const target = answersMap.get(qNum);
      if (!target) {
        reviewList.push({
          qNum,
          qNodeId: qNode.id || `q-node-${qNum}`,
          status: 'warn',
          pickedText: 'Không có trong đề bài dán',
          detail: 'Bỏ qua'
        });
        continue;
      }

      // Trích xuất các phương án của câu này
      const optionRows = qNode.querySelectorAll('.answer .r0, .answer .r1, .ablock .answer > div');
      const choices = [];

      optionRows.forEach(row => {
        if (row.classList.contains('qtype_multichoice_clearchoice') || row.querySelector('input[value="-1"]')) {
          return;
        }

        const input = row.querySelector('input[type="radio"], input[type="checkbox"]');
        if (!input) return;

        // Chữ cái (a, b, c, d, e)
        const numElem = row.querySelector('.answernumber');
        let letter = '';
        if (numElem) {
          const lMatch = numElem.innerText.match(/([a-zA-Z])/);
          if (lMatch) letter = lMatch[1].toUpperCase();
        }

        // Nội dung đáp án chuẩn từ DOM (ưu tiên .flex-fill)
        const fillElem = row.querySelector('.flex-fill');
        let rawText = '';
        if (fillElem) {
          rawText = fillElem.innerText || fillElem.textContent || '';
        } else {
          const labelElem = row.querySelector('[data-region="answer-label"], label') || row;
          rawText = labelElem.innerText || labelElem.textContent || '';
          if (numElem && rawText.startsWith(numElem.innerText.trim())) {
            rawText = rawText.substring(numElem.innerText.trim().length).trim();
          }
        }

        choices.push({
          row,
          input,
          letter,
          rawText: rawText.trim(),
          cleanText: normalizeText(rawText)
        });
      });

      // THUẬT TOÁN ĐỐI CHIẾU CHÍNH XÁC KÉP KHÁNG ĐẢO ĐỀ CHÍNH XÁC NHẤT CÓ THỂ
      let matchedChoice = null;
      let matchMethod = '';

      const targetClean = normalizeText(target.text);

      // Bước 1: Ưu tiên đối chiếu Text nguyên văn (Kháng đảo đề ngẫu nhiên chính xác nhất có thể)
      if (targetClean) {
        matchedChoice = choices.find(c => c.cleanText === targetClean);
        if (matchedChoice) {
          matchMethod = 'Text Khớp Chuẩn';
        } else if (targetClean.length >= 3) {
          // Substring match
          matchedChoice = choices.find(c =>
            c.cleanText.includes(targetClean) || targetClean.includes(c.cleanText)
          );
          if (matchedChoice) matchMethod = 'Text Tương Đồng';
        }
      }

      // Bước 2: Đối chiếu theo chữ cái (A, B, C, D, E)
      if (!matchedChoice && target.letter) {
        matchedChoice = choices.find(c => c.letter === target.letter);
        if (matchedChoice) matchMethod = `Chữ cái ${target.letter}`;
      }

      // Bước 3: Dự phòng text
      if (!matchedChoice && targetClean) {
        matchedChoice = choices.find(c => c.cleanText === targetClean);
        if (matchedChoice) matchMethod = 'Text Dự Phòng';
      }

      if (matchedChoice) {
        if (!isBurst) {
          qNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await sleep(randomDelay(HUMAN_DELAY_MIN, HUMAN_DELAY_MAX));
        }

        // Thực hiện click mô phỏng chuẩn W3C
        stealthClickRadio(matchedChoice.input);

        filledCount++;
        reviewList.push({
          qNum,
          qNodeId: qNode.id || `q-node-${qNum}`,
          status: 'ok',
          pickedText: `[${matchedChoice.letter || target.letter}] ${matchedChoice.rawText || target.text}`,
          detail: matchMethod
        });

        if (progressCallback) {
          progressCallback(filledCount, totalQ, qNum);
        }
      } else {
        reviewList.push({
          qNum,
          qNodeId: qNode.id || `q-node-${qNum}`,
          status: 'fail',
          pickedText: `Cần tìm: [${target.letter}] ${target.text}`,
          detail: 'Không tìm thấy lựa chọn tương ứng'
        });
      }

      if (!isBurst && index < totalQ - 1) {
        await sleep(randomDelay(INTER_QUESTION_MIN, INTER_QUESTION_MAX));
      }
    }

    // Trigger Moodle autosave an toàn
    if (!isBurst) await sleep(randomDelay(500, 1000));

    const quizForm = document.querySelector('form[id*="responseform"], form.questionflagsaveform')
      || document.querySelector('form');
    if (quizForm) {
      quizForm.dispatchEvent(new Event('change', { bubbles: true }));
    }

    try {
      if (window.M && window.M.mod_quiz && window.M.mod_quiz.autosave) {
        window.M.mod_quiz.autosave.save_changes();
      }
    } catch (e) {}

    // TUYỆT ĐỐI KHÔNG BẤM NỘP/TIẾP THEO

    return {
      success: true,
      totalQuestions: totalQ,
      filledCount,
      reviewList
    };
  }

  /* =========================================================================
     4. SHADOW DOM 3D LUXURY DASHBOARD
     Toàn bộ UI nằm trong Shadow DOM — Moodle KHÔNG THỂ detect.
     ========================================================================= */
  function inject3dDashboard() {
    if (document.getElementById('__lcms_host__')) return;

    // SVG Gradient Definition (cần nằm ngoài shadow DOM)
    const svgDefs = document.createElement('div');
    svgDefs.style.cssText = 'width:0;height:0;position:absolute;overflow:hidden;pointer-events:none;';
    svgDefs.innerHTML = `
      <svg style="width:0;height:0;position:absolute;">
        <defs>
          <linearGradient id="goldLinearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24" />
            <stop offset="50%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#d97706" />
          </linearGradient>
        </defs>
      </svg>
    `;
    document.body.appendChild(svgDefs);

    // Shadow Host — element duy nhất trên DOM chính
    const shadowHost = document.createElement('div');
    shadowHost.id = '__lcms_host__';
    shadowHost.style.cssText = 'position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0;pointer-events:none;';
    document.body.appendChild(shadowHost);

    // Attach Shadow DOM — cô lập hoàn toàn
    const shadow = shadowHost.attachShadow({ mode: 'closed' });

    // Inject styles vào Shadow DOM
    const style = document.createElement('style');
    style.textContent = getShadowCSS();
    shadow.appendChild(style);

    // 1. FAB (3D Orb Button)
    const fab = document.createElement('div');
    fab.id = 'auto-lcms-fab';
    fab.title = 'Bật/Tắt Auto LCMS Stealth (Alt+A)';
    fab.innerHTML = `
      <div class="fab-inner-glow"></div>
      <svg viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
      <span class="badge-count" id="auto-lcms-badge">0</span>
    `;
    shadow.appendChild(fab);

    // 2. Main 3D Panel
    const panel = document.createElement('div');
    panel.id = 'auto-lcms-panel';
    panel.className = 'lcms-minimized';
    panel.innerHTML = `
      <div class="auto-lcms-header" id="auto-lcms-drag-handle">
        <div class="auto-lcms-title">
          <span style="font-size: 18px;">👑</span>
          <span>AUTO LCMS <span class="gold-accent">STEALTH</span></span>
        </div>
        <div class="auto-lcms-controls">
          <button class="auto-lcms-icon-btn" id="auto-lcms-btn-close" title="Thu nhỏ (Alt+A)">
            <svg style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="auto-lcms-body">
        <!-- Stealth Mode Banner -->
        <div class="auto-lcms-safety-shield">
          <div class="safety-icon">🛡️</div>
          <div class="safety-text">
            <h5>STEALTH MODE — Anti-Detection Active</h5>
            <p>Shadow DOM cô lập • Delay ngẫu nhiên giả lập người thật • Focus spoof • Zero fingerprint</p>
          </div>
        </div>

        <!-- Progress Bar (hiển thị khi đang chạy) -->
        <div class="stealth-progress" id="stealth-progress" style="display:none;">
          <div class="progress-label">
            <span id="progress-text">Đang xử lý...</span>
            <span id="progress-count">0/0</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="progress-fill" style="width: 0%"></div>
          </div>
        </div>

        <!-- 3D Stat Bar -->
        <div class="auto-lcms-stats-bar">
          <div class="stat-card">
            <div class="stat-label">Tổng câu trang này</div>
            <div class="stat-value cyan" id="stat-total-q">0</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Đã điền stealth</div>
            <div class="stat-value green" id="stat-filled-q">0</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Độ chính xác</div>
            <div class="stat-value gold" id="stat-accuracy">100%</div>
          </div>
        </div>

        <!-- Universal Textarea -->
        <textarea 
          class="auto-lcms-textarea" 
          id="auto-lcms-input" 
          placeholder="Dán đáp án vào đây (Bảng Markdown, bảng Excel/TSV, danh sách 1. C, hoặc 1C 2A 3A... Mọi định dạng đều được tự động bóc tách)."
        ></textarea>

        <!-- Speed Mode Toggle in Shadow Panel -->
        <div class="auto-lcms-speed-toggle">
          <span style="font-size:11px;color:#94a3b8;font-weight:700;">TỐC ĐỘ:</span>
          <div class="shadow-speed-group">
            <button type="button" class="shadow-speed-pill active" id="shadow-speed-burst">⚡ Siêu Tốc (0.02s)</button>
            <button type="button" class="shadow-speed-pill" id="shadow-speed-stealth">🛡️ Stealth Delay</button>
          </div>
        </div>

        <!-- 3D Action Buttons -->
        <div class="auto-lcms-actions">
          <button class="auto-lcms-btn-3d auto-lcms-btn-gold" id="auto-lcms-run-batch-btn">
            ⚡ ĐIỀN ĐÁP ÁN
          </button>
          <button class="auto-lcms-btn-3d auto-lcms-btn-secondary" id="auto-lcms-paste-batch-btn" title="Đọc Clipboard và điền">
            📋 Dán & Điền
          </button>
        </div>

        <!-- 3D Review Matrix -->
        <div class="auto-lcms-review-matrix">
          <div class="review-matrix-header">
            <span>Bảng Soát Lại Trực Quan</span>
            <span id="review-status-label" style="color: #64748b;">Chưa chạy</span>
          </div>
          <div class="review-matrix-list" id="auto-lcms-review-list">
            <div style="padding: 12px; text-align: center; color: #64748b; font-style: italic; font-size: 11px;">
              Dán đáp án và bấm "ĐIỀN ĐÁP ÁN" để xem kết quả đối chiếu tại đây.
            </div>
          </div>
        </div>

        <!-- Author & Contact Link -->
        <a href="https://mikesmart.vercel.app/" target="_blank" rel="noopener noreferrer" class="auto-lcms-author-btn" title="Truy cập MikeSmart Studio">
          <span style="font-size: 15px;">🌐</span>
          <span class="author-info">Phát triển bởi <strong>MikeSmart</strong> <span class="author-url">(mikesmart.vercel.app)</span></span>
          <span class="author-arrow">↗</span>
        </a>
      </div>
    `;
    shadow.appendChild(panel);

    // Toggle Panel
    const togglePanel = () => {
      panel.classList.toggle('lcms-minimized');
      updateStats();
    };

    fab.addEventListener('click', togglePanel);
    panel.querySelector('#auto-lcms-btn-close').addEventListener('click', togglePanel);

    function updateStats() {
      const total = document.querySelectorAll('div.que').length;
      shadow.getElementById('stat-total-q').innerText = total;
      shadow.getElementById('auto-lcms-badge').innerText = total;
    }
    updateStats();

    // Speed Mode in Shadow Panel
    let shadowSpeedMode = 'burst';
    const pillBurst = shadow.getElementById('shadow-speed-burst');
    const pillStealth = shadow.getElementById('shadow-speed-stealth');

    pillBurst.addEventListener('click', () => {
      shadowSpeedMode = 'burst';
      pillBurst.classList.add('active');
      pillStealth.classList.remove('active');
    });

    pillStealth.addEventListener('click', () => {
      shadowSpeedMode = 'stealth';
      pillStealth.classList.add('active');
      pillBurst.classList.remove('active');
    });

    // Execute Logic
    const runBtn = shadow.getElementById('auto-lcms-run-batch-btn');
    const pasteBtn = shadow.getElementById('auto-lcms-paste-batch-btn');
    const inputArea = shadow.getElementById('auto-lcms-input');
    const reviewListContainer = shadow.getElementById('auto-lcms-review-list');
    const statFilled = shadow.getElementById('stat-filled-q');
    const statAccuracy = shadow.getElementById('stat-accuracy');
    const reviewStatusLabel = shadow.getElementById('review-status-label');
    const progressDiv = shadow.getElementById('stealth-progress');
    const progressText = shadow.getElementById('progress-text');
    const progressCount = shadow.getElementById('progress-count');
    const progressFill = shadow.getElementById('progress-fill');

    let isRunning = false;

    const handleRun = async (text, speedOverride = null) => {
      const content = text || inputArea.value;
      if (!content.trim()) {
        reviewListContainer.innerHTML = `<div style="padding:10px; color:#f87171">Vui lòng dán dữ liệu đáp án trước!</div>`;
        return;
      }

      if (isRunning) return;
      isRunning = true;
      runBtn.disabled = true;
      pasteBtn.disabled = true;
      runBtn.textContent = '⏳ ĐANG XỬ LÝ...';

      const activeSpeed = speedOverride || shadowSpeedMode;

      // Show progress bar
      progressDiv.style.display = 'block';
      progressText.textContent = activeSpeed === 'burst' ? 'Đang điền siêu tốc 0.02s...' : 'Khởi tạo stealth engine...';
      progressCount.textContent = '0/0';
      progressFill.style.width = '0%';

      const progressCallback = (filled, total, currentQ) => {
        const pct = Math.round((filled / total) * 100);
        progressText.textContent = `Đang điền câu ${currentQ}...`;
        progressCount.textContent = `${filled}/${total}`;
        progressFill.style.width = `${pct}%`;
      };

      const res = await executeBatchAutoFillStealth(content, activeSpeed, progressCallback);

      // Update stats
      statFilled.innerText = res.filledCount || 0;
      if (res.totalQuestions > 0) {
        const accuracy = Math.round((res.filledCount / res.totalQuestions) * 100);
        statAccuracy.innerText = `${accuracy}%`;
      }
      reviewStatusLabel.innerText = `Đã khớp: ${res.filledCount || 0}/${res.totalQuestions || 0}`;
      reviewStatusLabel.style.color = '#34d399';

      // Finish progress
      progressText.textContent = 'Hoàn tất! Hệ thống đã ngưng.';
      progressFill.style.width = '100%';

      // Render Review Matrix
      reviewListContainer.innerHTML = '';
      if (res.reviewList && res.reviewList.length > 0) {
        res.reviewList.forEach(item => {
          const row = document.createElement('div');
          row.className = 'review-item';
          row.title = 'Nhấp vào để nhảy đến câu hỏi này trên trang';

          const badgeHtml = item.status === 'ok'
            ? `<span class="review-badge-ok">✓ ${item.detail}</span>`
            : item.status === 'warn'
              ? `<span class="review-badge-warn">⚠ ${item.detail}</span>`
              : `<span class="review-badge-fail">✗ ${item.detail}</span>`;

          row.innerHTML = `
            <span class="review-qnum">Câu ${item.qNum}</span>
            <span class="review-ans">${item.pickedText}</span>
            ${badgeHtml}
          `;

          row.addEventListener('click', () => {
            const targetNode = document.getElementById(item.qNodeId) ||
              Array.from(document.querySelectorAll('div.que')).find(q => {
                const no = q.querySelector('span.qno, .no span');
                return no && parseInt(no.innerText.replace(/\D/g, ''), 10) === item.qNum;
              });

            if (targetNode) {
              targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight tạm (xóa ngay sau 2s — không để lại dấu vết)
              const origOutline = targetNode.style.outline;
              const origShadow = targetNode.style.boxShadow;
              targetNode.style.outline = '3px solid #fbbf24';
              targetNode.style.boxShadow = '0 0 30px rgba(245, 158, 11, 0.4)';
              setTimeout(() => {
                targetNode.style.outline = origOutline;
                targetNode.style.boxShadow = origShadow;
              }, 2000);
            }
          });

          reviewListContainer.appendChild(row);
        });
      } else {
        reviewListContainer.innerHTML = `<div style="padding:10px; color:#ef4444">${res.message}</div>`;
      }

      isRunning = false;
      runBtn.disabled = false;
      pasteBtn.disabled = false;
      runBtn.textContent = '⚡ STEALTH FILL';
    };

    runBtn.addEventListener('click', () => handleRun());

    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          inputArea.value = text;
          handleRun(text);
        } else {
          reviewListContainer.innerHTML = `<div style="padding:10px; color:#f87171">Clipboard trống!</div>`;
        }
      } catch (err) {
        reviewListContainer.innerHTML = `<div style="padding:10px; color:#f87171">Trình duyệt chặn Clipboard. Bấm Ctrl+V vào ô rồi bấm "STEALTH FILL"!</div>`;
      }
    });

    // Drag Handle
    makeElementDraggable(panel, panel.querySelector('#auto-lcms-drag-handle'));

    // Shortcut Alt + A
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        togglePanel();
      }
    });

    // Expose shadow-internal toggle for message listener
    shadowHost.__toggle = togglePanel;
    shadowHost.__handleRun = handleRun;
    shadowHost.__inputArea = inputArea;
    shadowHost.__statFilled = statFilled;
    shadowHost.__reviewStatusLabel = reviewStatusLabel;
    shadowHost.__reviewListContainer = reviewListContainer;
    shadowHost.__panel = panel;
  }

  /* =========================================================================
     5. DRAG UTILITY
     ========================================================================= */
  function makeElementDraggable(elm, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = (e) => {
      if (e.target.closest('button')) return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = () => {
        document.onmouseup = null;
        document.onmousemove = null;
      };
      document.onmousemove = (ev) => {
        ev.preventDefault();
        pos1 = pos3 - ev.clientX;
        pos2 = pos4 - ev.clientY;
        pos3 = ev.clientX;
        pos4 = ev.clientY;
        elm.style.top = (elm.offsetTop - pos2) + "px";
        elm.style.left = (elm.offsetLeft - pos1) + "px";
        elm.style.bottom = 'auto';
        elm.style.right = 'auto';
      };
    };
  }

  /* =========================================================================
     6. SHADOW DOM CSS (Inline — không phụ thuộc external file cho Shadow)
     ========================================================================= */
  function getShadowCSS() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

      :host { pointer-events: none; }

      * { margin: 0; padding: 0; box-sizing: border-box; }

      #auto-lcms-fab {
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 2147483647;
        width: 62px;
        height: 62px;
        border-radius: 20px;
        background: radial-gradient(circle at 30% 30%, #2a3a5a, #0b1120);
        border: 1px solid rgba(251, 191, 36, 0.4);
        box-shadow: 
          0 12px 35px rgba(0, 0, 0, 0.6),
          0 0 25px rgba(245, 158, 11, 0.35),
          inset 0 1px 2px rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        user-select: none;
        font-family: 'Outfit', sans-serif;
        transform: perspective(600px) rotateX(5deg);
        pointer-events: auto;
      }

      #auto-lcms-fab:hover {
        transform: perspective(600px) translateY(-5px) scale(1.1) rotateX(0deg);
        border-color: #fbbf24;
        box-shadow: 
          0 18px 45px rgba(0, 0, 0, 0.7),
          0 0 35px rgba(245, 158, 11, 0.6),
          inset 0 1px 2px rgba(255, 255, 255, 0.5);
      }

      #auto-lcms-fab .fab-inner-glow {
        position: absolute;
        inset: 0;
        border-radius: 20px;
        background: radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.25), transparent 70%);
        animation: lcmsOrbPulse 3s infinite ease-in-out;
      }

      @keyframes lcmsOrbPulse {
        0%, 100% { opacity: 0.5; transform: scale(0.95); }
        50% { opacity: 1; transform: scale(1.05); }
      }

      #auto-lcms-fab svg {
        width: 28px;
        height: 28px;
        fill: none;
        stroke: #fbbf24;
        filter: drop-shadow(0 2px 8px rgba(245, 158, 11, 0.5));
        z-index: 2;
      }

      #auto-lcms-fab .badge-count {
        position: absolute;
        top: -5px;
        right: -5px;
        background: linear-gradient(135deg, #fbbf24 0%, #d97706 50%, #b45309 100%);
        color: #0b0f19;
        font-size: 11px;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 8px rgba(245, 158, 11, 0.6);
        z-index: 3;
        border: 1px solid rgba(255, 255, 255, 0.4);
      }

      #auto-lcms-panel {
        position: fixed;
        bottom: 102px;
        right: 28px;
        z-index: 2147483646;
        width: 480px;
        max-width: calc(100vw - 40px);
        background: rgba(8, 12, 22, 0.95);
        backdrop-filter: blur(28px) saturate(190%);
        -webkit-backdrop-filter: blur(28px) saturate(190%);
        border: 1px solid rgba(245, 158, 11, 0.25);
        border-radius: 22px;
        box-shadow: 
          0 30px 70px -15px rgba(0, 0, 0, 0.85),
          0 0 40px rgba(245, 158, 11, 0.12),
          inset 0 1px 1px rgba(255, 255, 255, 0.2),
          inset 0 -1px 1px rgba(0, 0, 0, 0.5);
        color: #f8fafc;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
        animation: lcms3dEntry 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform-style: preserve-3d;
        pointer-events: auto;
      }

      #auto-lcms-panel.lcms-minimized { display: none !important; }

      @keyframes lcms3dEntry {
        from { opacity: 0; transform: perspective(1000px) rotateX(12deg) translateY(25px) scale(0.92); }
        to { opacity: 1; transform: perspective(1000px) rotateX(0deg) translateY(0) scale(1); }
      }

      .auto-lcms-header {
        padding: 16px 20px;
        background: linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: grab;
        position: relative;
      }

      .auto-lcms-header::after {
        content: '';
        position: absolute;
        top: 0; left: 15%; right: 15%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.6), transparent);
      }

      .auto-lcms-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;
        font-weight: 800;
        letter-spacing: 0.6px;
        color: #ffffff;
        text-transform: uppercase;
      }

      .auto-lcms-title .gold-accent {
        background: linear-gradient(135deg, #fbbf24 0%, #d97706 50%, #b45309 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
      }

      .auto-lcms-icon-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .auto-lcms-icon-btn:hover {
        background: rgba(245, 158, 11, 0.15);
        border-color: rgba(245, 158, 11, 0.4);
        color: #fbbf24;
      }

      .auto-lcms-body {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-height: 560px;
        overflow-y: auto;
      }

      .auto-lcms-body::-webkit-scrollbar { width: 5px; }
      .auto-lcms-body::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.25); border-radius: 4px; }

      .auto-lcms-safety-shield {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 100%);
        border: 1px solid rgba(16, 185, 129, 0.35);
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.1);
      }

      .safety-icon { font-size: 20px; filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5)); }

      .safety-text h5 {
        font-size: 12px;
        font-weight: 700;
        color: #34d399;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }

      .safety-text p {
        font-size: 11px;
        color: #94a3b8;
        margin: 2px 0 0 0;
        line-height: 1.3;
      }

      .stealth-progress {
        padding: 8px 12px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .progress-label {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #94a3b8;
        margin-bottom: 6px;
        font-family: 'JetBrains Mono', monospace;
      }

      .progress-bar-track {
        height: 4px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 2px;
        overflow: hidden;
      }

      .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #fbbf24, #34d399);
        border-radius: 2px;
        transition: width 0.3s ease;
      }

      .auto-lcms-stats-bar {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .stat-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 8px 10px;
        text-align: center;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }

      .stat-label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
      .stat-value { font-size: 16px; font-weight: 800; color: #f1f5f9; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
      .stat-value.gold { color: #fbbf24; }
      .stat-value.green { color: #34d399; }
      .stat-value.cyan { color: #38bdf8; }

      .auto-lcms-textarea {
        width: 100%;
        height: 110px;
        background: rgba(4, 7, 15, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        color: #f1f5f9;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        line-height: 1.45;
        padding: 12px;
        resize: vertical;
        box-sizing: border-box;
        outline: none;
        box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.6);
        transition: all 0.25s ease;
      }

      .auto-lcms-textarea:focus {
        border-color: #fbbf24;
        box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.6), 0 0 15px rgba(245, 158, 11, 0.25);
      }

      .auto-lcms-textarea::placeholder {
        color: #475569;
        font-style: italic;
        font-family: 'Outfit', sans-serif;
      }

      .auto-lcms-actions { display: flex; gap: 10px; }

      .auto-lcms-btn-3d {
        position: relative;
        flex: 1;
        padding: 13px 18px;
        border-radius: 12px;
        border: none;
        font-family: 'Outfit', sans-serif;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        text-transform: uppercase;
      }

      .auto-lcms-btn-3d:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }

      .auto-lcms-btn-gold {
        background: linear-gradient(135deg, #fbbf24 0%, #d97706 50%, #b45309 100%);
        color: #0b0f19;
        box-shadow: 0 6px 20px rgba(217, 119, 6, 0.4), 0 3px 0 #92400e, inset 0 1px 1px rgba(255, 255, 255, 0.4);
      }

      .auto-lcms-btn-gold:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(217, 119, 6, 0.55), 0 4px 0 #92400e, inset 0 1px 1px rgba(255, 255, 255, 0.6);
      }

      .auto-lcms-btn-gold:active:not(:disabled) {
        transform: translateY(2px);
        box-shadow: 0 2px 10px rgba(217, 119, 6, 0.3), 0 1px 0 #92400e;
      }

      .auto-lcms-btn-secondary {
        flex: 0.8;
        background: rgba(30, 41, 59, 0.8);
        color: #cbd5e1;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 0 #0f172a, inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .auto-lcms-btn-secondary:hover:not(:disabled) {
        background: rgba(51, 65, 85, 0.95);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.25);
        transform: translateY(-1px);
      }

      .auto-lcms-review-matrix {
        background: rgba(4, 7, 15, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .review-matrix-header {
        padding: 10px 14px;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .review-matrix-list {
        max-height: 180px;
        overflow-y: auto;
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .review-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.04);
        font-size: 11px;
        transition: all 0.18s ease;
        cursor: pointer;
      }

      .review-item:hover {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.25);
        transform: translateX(3px);
      }

      .review-qnum { font-weight: 700; color: #f59e0b; min-width: 48px; }
      .review-ans {
        flex: 1; color: #e2e8f0; margin: 0 8px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        font-family: 'JetBrains Mono', monospace;
      }

      .review-badge-ok {
        background: rgba(16, 185, 129, 0.2); color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.35);
        font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
        white-space: nowrap;
      }

      .review-badge-warn {
        background: rgba(245, 158, 11, 0.2); color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.35);
        font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
        white-space: nowrap;
      }

      .review-badge-fail {
        background: rgba(239, 68, 68, 0.2); color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.35);
        font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
        white-space: nowrap;
      }

      .auto-lcms-author-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
        border: 1px solid rgba(251, 191, 36, 0.3);
        text-decoration: none;
        color: #cbd5e1;
        font-size: 11px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }

      .auto-lcms-author-btn:hover {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%);
        border-color: #fbbf24;
        color: #ffffff;
        transform: translateY(-2px);
      }

      .auto-lcms-speed-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 2px;
      }

      .shadow-speed-group {
        display: flex;
        gap: 6px;
      }

      .shadow-speed-pill {
        padding: 4px 10px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.04);
        color: #94a3b8;
        font-family: 'Outfit', sans-serif;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .shadow-speed-pill.active {
        background: rgba(245, 158, 11, 0.15);
        border-color: #fbbf24;
        color: #fbbf24;
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
      }

      .auto-lcms-author-btn .author-info strong { color: #fbbf24; font-weight: 700; }
      .auto-lcms-author-btn .author-url { color: #94a3b8; font-size: 10px; margin-left: 4px; font-family: 'JetBrains Mono', monospace; }
      .auto-lcms-author-btn .author-arrow { color: #fbbf24; font-size: 14px; font-weight: 700; transition: transform 0.2s ease; }
      .auto-lcms-author-btn:hover .author-arrow { transform: translate(2px, -2px); }
    `;
  }

  /* =========================================================================
     7. RUNTIME MESSAGE HANDLER
     ========================================================================= */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'PING') {
      sendResponse({ status: 'alive', version: '2.1.0' });
      return true;
    }

    if (request.action === 'EXTRACT_QUESTIONS') {
      const questionNodes = document.querySelectorAll('div.que, div.que.multichoice');
      const questions = [];

      questionNodes.forEach((qNode, idx) => {
        const qnoElem = qNode.querySelector('span.qno, .no span, h3.no');
        let qNum = idx + 1;
        if (qnoElem) {
          const t = qnoElem.innerText.replace(/\D/g, '');
          if (t) qNum = parseInt(t, 10);
        }

        const qtextElem = qNode.querySelector('.qtext');
        const qText = qtextElem ? qtextElem.innerText.trim() : '';

        const optionRows = qNode.querySelectorAll('.answer .r0, .answer .r1, .ablock .answer > div');
        const choices = [];

        optionRows.forEach(row => {
          if (row.classList.contains('qtype_multichoice_clearchoice') || row.querySelector('input[value="-1"]')) return;
          const numElem = row.querySelector('.answernumber');
          let letter = '';
          if (numElem) {
            const m = numElem.innerText.match(/([a-zA-Z])/);
            if (m) letter = m[1].toUpperCase();
          }

          const fillElem = row.querySelector('.flex-fill');
          let rawText = '';
          if (fillElem) {
            rawText = fillElem.innerText || fillElem.textContent || '';
          } else {
            const labelElem = row.querySelector('[data-region="answer-label"], label') || row;
            rawText = labelElem.innerText || labelElem.textContent || '';
            if (numElem && rawText.startsWith(numElem.innerText.trim())) {
              rawText = rawText.substring(numElem.innerText.trim().length).trim();
            }
          }

          choices.push({ letter, rawText: rawText.trim() });
        });

        questions.push({ qNum, qText, choices });
      });

      sendResponse({ success: true, questions });
      return true;
    }

    if (request.action === 'AUTO_FILL') {
      if (!document.getElementById('__lcms_host__')) {
        inject3dDashboard();
      }

      const host = document.getElementById('__lcms_host__');
      const speed = request.speedMode || 'burst';

      executeBatchAutoFillStealth(request.data, speed, (filled, total, currentQ) => {
        // Progress updates
      }).then(result => {
        if (host) {
          try {
            host.__panel.classList.remove('lcms-minimized');
            host.__inputArea.value = request.data;
            host.__statFilled.innerText = result.filledCount || 0;
            host.__reviewStatusLabel.innerText = `Đã khớp: ${result.filledCount}/${result.totalQuestions}`;
            host.__reviewStatusLabel.style.color = '#34d399';
          } catch (e) {}
        }
        sendResponse(result);
      }).catch(err => {
        sendResponse({ success: false, message: err.message });
      });

      return true;
    }

    if (request.action === 'TOGGLE_PANEL') {
      if (!document.getElementById('__lcms_host__')) {
        inject3dDashboard();
      }
      const host = document.getElementById('__lcms_host__');
      if (host && host.__toggle) host.__toggle();
      sendResponse({ status: 'ok' });
      return true;
    }
  });

  /* =========================================================================
     8. INITIALIZATION
     ========================================================================= */

  // Install anti-detection systems
  installFocusSpoof();
  cloakExtensionFingerprint();

  // Inject dashboard
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject3dDashboard);
  } else {
    inject3dDashboard();
  }
})();
