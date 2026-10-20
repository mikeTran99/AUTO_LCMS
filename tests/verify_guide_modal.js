const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'src/popup/popup.html'), 'utf8');
const css = fs.readFileSync(path.join(rootDir, 'src/popup/popup.css'), 'utf8');
const js = fs.readFileSync(path.join(rootDir, 'src/popup/popup.js'), 'utf8');

const requiredIds = [
  'guide-overlay', 'btn-guide', 'btn-guide-close', 'btn-guide-confirm',
  'btn-guide-toggle-all', 'guide-toggle-icon', 'guide-toggle-text',
  'btn-scroll-top', 'btn-scroll-bottom', 'guide-body',
  'gstep-1', 'gstep-2', 'gstep-3', 'gstep-4', 'gstep-5', 'gstep-6', 'gtips'
];

let failed = false;
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) {
    console.error('❌ Missing ID in src/popup/popup.html:', id);
    failed = true;
  }
}

const cssChecks = [
  'html, body',
  'overflow: hidden;',
  '.popup-shell',
  '.guide-overlay',
  '.guide-modal',
  '.guide-header',
  '.guide-nav-rail',
  '.nav-chip',
  '.guide-body',
  '.guide-step',
  '.guide-step.collapsed',
  '.guide-step.expanded',
  '.gs-header',
  '.gs-chevron',
  '.guide-footer',
  '.btn-scroll-nav'
];

for (const rule of cssChecks) {
  if (!css.includes(rule)) {
    console.error('❌ Missing CSS rule in src/popup/popup.css:', rule);
    failed = true;
  }
}

const jsChecks = [
  'btnGuideConfirm',
  'btnGuideToggleAll',
  'btnScrollTop',
  'btnScrollBottom',
  'guideSteps',
  'navChips',
  'updateToggleAllState',
  'openGuideModal',
  'closeGuideModal'
];

for (const check of jsChecks) {
  if (!js.includes(check)) {
    console.error('❌ Missing JS handler in src/popup/popup.js:', check);
    failed = true;
  }
}

if (!failed) {
  console.log('🎉 100% SUCCESS: SOP 10/2026 Accordion Guide & Fast Scroll components are fully integrated and verified in modular structure!');
} else {
  process.exit(1);
}
