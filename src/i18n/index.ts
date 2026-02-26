// i18n 모듈 - 다국어 지원 (영어, 한국어, 일본어, 중국어)

import { DEFAULT_LANGUAGE, STORAGE_KEY_LANGUAGE } from '../constants';
import { getStorage, setStorage } from '../utils/storage.util';
import type { Language } from '../types/storage.types';

import en from './locales/en.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

// ── 로케일 맵 ──────────────────────────────────────────────

const LOCALES: Record<Language, typeof en> = { en, ko, ja, zh };

// ── 현재 언어 상태 ─────────────────────────────────────────

let currentLanguage: Language = DEFAULT_LANGUAGE;

// ── 초기화 ─────────────────────────────────────────────────

/**
 * storage에서 저장된 언어를 로드하여 현재 언어로 설정
 * 페이지 진입 시 최초 1회 호출
 */
export async function initI18n(): Promise<void> {
  const saved = await getStorage(STORAGE_KEY_LANGUAGE);
  if (saved && saved in LOCALES) {
    currentLanguage = saved;
  }
}

// ── 번역 함수 ──────────────────────────────────────────────

type LocaleData = typeof en;
type LocaleSection = keyof LocaleData;
type LocaleKey<S extends LocaleSection> = keyof LocaleData[S];

/**
 * 번역 키로 현재 언어의 문자열을 반환
 * 변수 치환 지원: {{count}} 형태
 *
 * @example t('popup', 'sortPopularity') → "Popularity"
 * @example t('popup', 'showReplies', { count: 5 }) → "5 Replies"
 */
export function t<S extends LocaleSection>(
  section: S,
  key: LocaleKey<S>,
  variables?: Record<string, string | number>,
): string {
  const locale = LOCALES[currentLanguage] ?? LOCALES[DEFAULT_LANGUAGE];
  const sectionData = locale[section] as Record<string, string>;
  let text = sectionData[key as string] ?? String(key);

  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`{{${varKey}}}`, 'g'), String(value));
    });
  }

  return text;
}

// ── 언어 변경 ──────────────────────────────────────────────

/**
 * 언어를 변경하고 storage에 저장
 */
export async function setLanguage(language: Language): Promise<void> {
  currentLanguage = language;
  await setStorage({ [STORAGE_KEY_LANGUAGE]: language });
}

/**
 * 현재 언어 반환
 */
export function getCurrentLanguage(): Language {
  return currentLanguage;
}

/**
 * 지원 언어 목록 반환 (드롭다운 렌더링용)
 * 순서: English → 한국어 → 日本語 → 中文
 */
export function getSupportedLanguages(): { code: Language; label: string }[] {
  return [
    { code: 'en', label: 'English' },
    { code: 'ko', label: '한국어' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
  ];
}
