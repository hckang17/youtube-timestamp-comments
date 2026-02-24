// SettingsPage — 설정 뷰
// options/index.ts 의 로직을 이관하여 라우터 기반으로 동작한다.

import { t, setLanguage, getCurrentLanguage, getSupportedLanguages } from '../../i18n';
import { getStorage, setStorage } from '../../utils/storage.util';
import { STORAGE_KEY_API_KEY, STORAGE_KEY_THEME, THEME_DARK, THEME_LIGHT } from '../../constants';
import type { Language } from '../../types/storage.types';
import { router } from '../router';

// ── HTML 템플릿 ───────────────────────────────────────────

export function getSettingsPageHTML(): string {
  return `
    <div class="settings-page">

      <!-- 헤더 -->
      <div class="settings-header">
        <button id="settings-back-btn" class="settings-back-btn" title="Back">
          <span class="material-icons">arrow_back</span>
        </button>
        <span class="settings-title" id="settings-title-label">Settings</span>

        <div class="settings-header-right">
          <!-- 언어 드롭다운 -->
          <div class="lang-dropdown-wrapper">
            <button class="lang-btn" id="lang-btn" aria-haspopup="true" aria-expanded="false">
              <span class="material-icons icon-sm">language</span>
              <span id="lang-label">Language</span>
              <span class="material-icons icon-xs">expand_more</span>
            </button>
            <div class="lang-menu" id="lang-menu" role="menu">
              <ul>
                <li><a href="#" class="lang-item" data-lang="en" role="menuitem">English</a></li>
                <li><a href="#" class="lang-item" data-lang="ko" role="menuitem">한국어</a></li>
                <li><a href="#" class="lang-item" data-lang="ja" role="menuitem">日本語</a></li>
                <li><a href="#" class="lang-item" data-lang="zh" role="menuitem">中文</a></li>
              </ul>
            </div>
          </div>

          <!-- 다크모드 토글 -->
          <button class="settings-theme-btn" id="settings-theme-btn" aria-label="Toggle dark mode">
            <span class="material-icons settings-theme-icon-light">dark_mode</span>
            <span class="material-icons settings-theme-icon-dark">light_mode</span>
          </button>
        </div>
      </div>

      <!-- 본문 -->
      <div class="settings-body">
        <div class="settings-title-wrap">
          <h1 class="settings-main-title" id="settings-main-title">YouTube Timestamp Comments</h1>
          <p class="settings-subtitle" id="settings-subtitle">Enhance your viewing experience with timestamped notes.</p>
        </div>

        <div class="settings-form-group">
          <label class="settings-label" id="settings-api-label" for="settings-api-key">API Key</label>
          <div class="settings-input-wrapper">
            <input
              class="settings-input"
              id="settings-api-key"
              type="password"
              placeholder="Enter your API Key here"
              autocomplete="off"
            />
            <button class="settings-visibility-btn" id="settings-visibility-btn" type="button">
              <span class="material-icons" id="settings-eye-icon">visibility</span>
            </button>
          </div>
        </div>

        <p class="settings-save-message hidden" id="settings-save-message"></p>

        <button class="settings-save-btn" id="settings-save-btn" type="button">Set up</button>

        <div class="settings-footer">
          <p class="settings-footer-text">
            <span id="settings-guide-text">Need help finding your API Key?</span>
            <a
              class="settings-footer-link"
              id="settings-guide-link"
              href="https://developers.google.com/youtube/v3/getting-started"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the guide
              <span class="material-icons icon-xs">open_in_new</span>
            </a>
          </p>
        </div>
      </div>

    </div>
  `;
}

// ── 헬퍼 ──────────────────────────────────────────────────

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) throw new Error(`SettingsPage: #${id} not found`);
  return el;
}

// ── i18n 적용 ─────────────────────────────────────────────

function applyI18n(apiKeyInput: HTMLInputElement): void {
  const mainTitle = document.getElementById('settings-main-title');
  const subtitle  = document.getElementById('settings-subtitle');
  const apiLabel  = document.getElementById('settings-api-label');
  const saveBtn   = document.getElementById('settings-save-btn');
  const guideText = document.getElementById('settings-guide-text');
  const guideLink = document.getElementById('settings-guide-link');

  if (mainTitle) mainTitle.textContent = t('options', 'title');
  if (subtitle)  subtitle.textContent  = t('options', 'subtitle');
  if (apiLabel)  apiLabel.textContent  = t('options', 'apiKeyLabel');
  if (saveBtn)   saveBtn.textContent   = t('options', 'setupButton');
  if (guideText) guideText.textContent = t('options', 'guideText');
  if (guideLink) {
    // 텍스트 노드만 업데이트 (icon 요소 보존)
    const textNode = Array.from(guideLink.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = t('options', 'guideLink') + ' ';
  }

  apiKeyInput.placeholder = t('options', 'apiKeyPlaceholder');
}

function updateActiveLangItem(langLabel: HTMLElement): void {
  const current = getCurrentLanguage();
  document.querySelectorAll<HTMLAnchorElement>('.lang-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.lang === current);
  });
  const found = getSupportedLanguages().find((l) => l.code === current);
  if (found) langLabel.textContent = found.label;
}

// ── 마운트 ────────────────────────────────────────────────

export function mountSettingsPage(root: HTMLElement): void {
  root.innerHTML = getSettingsPageHTML();

  const backBtn       = getEl('settings-back-btn');
  const apiKeyInput   = getEl<HTMLInputElement>('settings-api-key');
  const visibilityBtn = getEl('settings-visibility-btn');
  const eyeIcon       = getEl('settings-eye-icon');
  const saveBtn       = getEl('settings-save-btn');
  const saveMsg       = getEl('settings-save-message');
  const langBtn       = getEl('lang-btn');
  const langMenu      = getEl('lang-menu');
  const langLabel     = getEl('lang-label');
  const themeBtn      = getEl('settings-theme-btn');

  // 저장된 API Key 로드
  void getStorage(STORAGE_KEY_API_KEY).then((key) => {
    if (key) apiKeyInput.value = key;
  });

  // i18n 초기 적용
  applyI18n(apiKeyInput);
  updateActiveLangItem(langLabel);

  // ← 뒤로가기 + document 리스너 정리는 아래 onDocumentClick 블록에서 함께 처리

  // API Key 저장
  let saveTimeout: number;

  function showSaveMsg(text: string, type: 'success' | 'error'): void {
    clearTimeout(saveTimeout);
    saveMsg.textContent = text;
    saveMsg.className = `settings-save-message ${type}`;
    saveTimeout = window.setTimeout(() => {
      saveMsg.className = 'settings-save-message hidden';
    }, 3000);
  }

  async function saveApiKey(): Promise<void> {
    const key = apiKeyInput.value.trim();
    if (!key) { showSaveMsg(t('options', 'errorEmptyKey'), 'error'); return; }
    await setStorage({ [STORAGE_KEY_API_KEY]: key });
    showSaveMsg(t('options', 'savedMessage'), 'success');
  }

  saveBtn.addEventListener('click', () => { void saveApiKey(); });
  apiKeyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') void saveApiKey(); });

  // 비밀번호 토글
  visibilityBtn.addEventListener('click', () => {
    const isPass = apiKeyInput.type === 'password';
    apiKeyInput.type = isPass ? 'text' : 'password';
    eyeIcon.textContent = isPass ? 'visibility_off' : 'visibility';
  });

  // 다크모드 토글
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    void setStorage({ [STORAGE_KEY_THEME]: isDark ? THEME_DARK : THEME_LIGHT });
  });

  // 언어 드롭다운
  function openLangMenu(): void  { langMenu.classList.add('open');    langBtn.setAttribute('aria-expanded', 'true');  }
  function closeLangMenu(): void { langMenu.classList.remove('open'); langBtn.setAttribute('aria-expanded', 'false'); }

  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.contains('open') ? closeLangMenu() : openLangMenu();
  });

  document.querySelectorAll<HTMLAnchorElement>('.lang-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = el.dataset.lang as Language;
      if (!lang) return;
      void setLanguage(lang).then(() => {
        closeLangMenu();
        updateActiveLangItem(langLabel);
        applyI18n(apiKeyInput);
      });
    });
  });

  // named function으로 선언하여 페이지 이탈 시 removeEventListener로 정리 가능하게 함
  function onDocumentClick(e: MouseEvent): void {
    if (!langBtn.contains(e.target as Node) && !langMenu.contains(e.target as Node)) {
      closeLangMenu();
    }
  }
  document.addEventListener('click', onDocumentClick);

  // 뒤로가기 시 document 리스너 정리
  backBtn.addEventListener('click', () => {
    document.removeEventListener('click', onDocumentClick);
    router.navigate('/');
  }, { once: true });
}
