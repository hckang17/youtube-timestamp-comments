// Options 페이지 진입점
// API 키 설정, 다크모드 토글, 언어 선택 기능을 담당한다.

import './options.css';
import { initI18n, t, setLanguage, getCurrentLanguage, getSupportedLanguages } from '../i18n';
import { getStorage, setStorage } from '../utils/storage.util';
import { STORAGE_KEY_API_KEY, STORAGE_KEY_THEME, THEME_DARK, THEME_LIGHT } from '../constants';
import type { Language } from '../types/storage.types';

// ── DOM 헬퍼 ───────────────────────────────────────────────

/**
 * getElementById 래퍼 — 요소가 없으면 초기화 시점에 즉시 throw
 * HTML 구조 변경 시 런타임 에러를 빠르게 발견할 수 있다.
 */
function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element with id '${id}' not found.`);
  return el as T;
}

// ── DOM 참조 ───────────────────────────────────────────────

const apiKeyInput    = getElement<HTMLInputElement>('api-key');
const setupBtn       = getElement<HTMLButtonElement>('setup-btn');
const visibilityBtn  = getElement<HTMLButtonElement>('visibility-btn');
const eyeIcon        = getElement<HTMLSpanElement>('eye-icon');
const saveMessage    = getElement<HTMLParagraphElement>('save-message');
const themeToggleBtn = getElement<HTMLButtonElement>('theme-toggle');
const langBtn        = getElement<HTMLButtonElement>('lang-btn');
const langMenu       = getElement<HTMLDivElement>('lang-menu');
const langLabel      = getElement<HTMLSpanElement>('lang-label');

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

let saveMessageTimeoutId: number;

function showSaveMessage(text: string, type: 'success' | 'error'): void {
  clearTimeout(saveMessageTimeoutId);
  saveMessage.textContent = text;
  saveMessage.className = `save-message ${type}`;
  saveMessageTimeoutId = window.setTimeout(() => {
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
  const langs = getSupportedLanguages();
  const found = langs.find((l) => l.code === current);
  if (found) langLabel.textContent = found.label;
}

// ── i18n 적용 ──────────────────────────────────────────────

function applyI18nToElements(
  selector: string,
  apply: (el: HTMLElement, text: string) => void,
  dataKey: string,
): void {
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const key = (el.dataset[dataKey] ?? '');
    const [section, k] = key.split('.');
    if (!section || !k) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apply(el, t(section as any, k as any));
    } catch {
      // 키가 없으면 그대로 유지
    }
  });
}

function applyI18n(): void {
  // html lang 속성 업데이트 (스크린 리더 접근성)
  document.documentElement.lang = getCurrentLanguage();

  // data-i18n: textContent 교체
  applyI18nToElements('[data-i18n]', (el, text) => {
    el.textContent = text;
  }, 'i18n');

  // data-i18n-placeholder: input placeholder 교체
  applyI18nToElements('[data-i18n-placeholder]', (el, text) => {
    if (el instanceof HTMLInputElement) el.placeholder = text;
  }, 'i18nPlaceholder');
}

// ── 저장된 API 키 로드 ─────────────────────────────────────

async function loadApiKey(): Promise<void> {
  const saved = await getStorage(STORAGE_KEY_API_KEY);
  if (saved) apiKeyInput.value = saved;
}

// ── 이벤트 등록 ───────────────────────────────────────────

function bindEvents(): void {
  setupBtn.addEventListener('click', () => { void saveApiKey(); });
  apiKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') void saveApiKey();
  });

  visibilityBtn.addEventListener('click', toggleVisibility);
  themeToggleBtn.addEventListener('click', toggleTheme);

  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLangMenu();
  });

  document.querySelectorAll<HTMLAnchorElement>('.lang-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = el.dataset.lang as Language;
      if (lang) void handleLangSelect(lang);
    });
  });

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
