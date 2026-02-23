// Options 페이지 진입점
// API 키 설정, 다크모드 토글, 언어 선택 기능을 담당한다.

import './options.css';
import { initI18n, t, setLanguage, getCurrentLanguage, getSupportedLanguages } from '../i18n';
import { getStorage, setStorage } from '../utils/storage.util';
import { STORAGE_KEY_API_KEY, STORAGE_KEY_THEME, THEME_DARK, THEME_LIGHT } from '../constants';
import type { Language } from '../types/storage.types';

// ── DOM 참조 ───────────────────────────────────────────────

const apiKeyInput    = document.getElementById('api-key')        as HTMLInputElement;
const setupBtn       = document.getElementById('setup-btn')      as HTMLButtonElement;
const visibilityBtn  = document.getElementById('visibility-btn') as HTMLButtonElement;
const eyeIcon        = document.getElementById('eye-icon')       as HTMLSpanElement;
const saveMessage    = document.getElementById('save-message')   as HTMLParagraphElement;
const themeToggleBtn = document.getElementById('theme-toggle')   as HTMLButtonElement;
const langBtn        = document.getElementById('lang-btn')       as HTMLButtonElement;
const langMenu       = document.getElementById('lang-menu')      as HTMLDivElement;
const langLabel      = document.getElementById('lang-label')     as HTMLSpanElement;

// ── 다크모드 ───────────────────────────────────────────────

async function initTheme(): Promise<void> {
  const saved = await getStorage(STORAGE_KEY_THEME);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === THEME_DARK : prefersDark;
  document.documentElement.classList.toggle('dark', isDark);
}

function toggleTheme(): void {
  const isDark = document.documentElement.classList.toggle('dark');
  void setStorage({ [STORAGE_KEY_THEME]: isDark ? THEME_DARK : THEME_LIGHT });
}

// ── 비밀번호 가시성 토글 ───────────────────────────────────

function toggleVisibility(): void {
  const isPassword = apiKeyInput.type === 'password';
  apiKeyInput.type = isPassword ? 'text' : 'password';
  eyeIcon.textContent = isPassword ? 'visibility_off' : 'visibility';
}

// ── 저장 메시지 표시 ───────────────────────────────────────

function showSaveMessage(text: string, type: 'success' | 'error'): void {
  saveMessage.textContent = text;
  saveMessage.className = `save-message ${type}`;
  setTimeout(() => {
    saveMessage.className = 'save-message hidden';
  }, 3000);
}

// ── API 키 저장 ────────────────────────────────────────────

async function saveApiKey(): Promise<void> {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showSaveMessage(t('options', 'errorEmptyKey'), 'error');
    return;
  }

  await setStorage({ [STORAGE_KEY_API_KEY]: apiKey });
  showSaveMessage(t('options', 'savedMessage'), 'success');
}

// ── 언어 드롭다운 ──────────────────────────────────────────

function openLangMenu(): void {
  langMenu.classList.add('open');
  langBtn.setAttribute('aria-expanded', 'true');
}

function closeLangMenu(): void {
  langMenu.classList.remove('open');
  langBtn.setAttribute('aria-expanded', 'false');
}

function toggleLangMenu(): void {
  langMenu.classList.contains('open') ? closeLangMenu() : openLangMenu();
}

async function handleLangSelect(lang: Language): Promise<void> {
  await setLanguage(lang);
  closeLangMenu();
  applyI18n();
  updateActiveLangItem();
}

function updateActiveLangItem(): void {
  const current = getCurrentLanguage();
  document.querySelectorAll<HTMLAnchorElement>('.lang-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.lang === current);
  });
  // 헤더 언어 버튼 레이블 업데이트
  const langs = getSupportedLanguages();
  const found = langs.find((l) => l.code === current);
  if (found) langLabel.textContent = found.label;
}

// ── i18n 적용 ──────────────────────────────────────────────

function applyI18n(): void {
  // data-i18n 속성을 가진 요소 텍스트 교체
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n ?? '';
    const [section, k] = key.split('.') as [string, string];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      el.textContent = t(section as any, k as any);
    } catch {
      // 키가 없으면 그대로 유지
    }
  });

  // data-i18n-placeholder 속성을 가진 input placeholder 교체
  document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder ?? '';
    const [section, k] = key.split('.') as [string, string];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      el.placeholder = t(section as any, k as any);
    } catch {
      // 키가 없으면 그대로 유지
    }
  });
}

// ── 저장된 API 키 로드 ─────────────────────────────────────

async function loadApiKey(): Promise<void> {
  const saved = await getStorage(STORAGE_KEY_API_KEY);
  if (saved) apiKeyInput.value = saved;
}

// ── 이벤트 등록 ───────────────────────────────────────────

function bindEvents(): void {
  // API 키 저장
  setupBtn.addEventListener('click', () => { void saveApiKey(); });
  apiKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') void saveApiKey();
  });

  // 비밀번호 가시성
  visibilityBtn.addEventListener('click', toggleVisibility);

  // 다크모드
  themeToggleBtn.addEventListener('click', toggleTheme);

  // 언어 드롭다운 - 버튼 클릭 토글
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLangMenu();
  });

  // 언어 선택
  document.querySelectorAll<HTMLAnchorElement>('.lang-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = el.dataset.lang as Language;
      if (lang) void handleLangSelect(lang);
    });
  });

  // 외부 클릭 시 드롭다운 닫기
  document.addEventListener('click', (e) => {
    if (!langBtn.contains(e.target as Node) && !langMenu.contains(e.target as Node)) {
      closeLangMenu();
    }
  });
}

// ── 초기화 ────────────────────────────────────────────────

async function init(): Promise<void> {
  await initTheme();
  await initI18n();
  await loadApiKey();
  applyI18n();
  updateActiveLangItem();
  bindEvents();
}

void init();
