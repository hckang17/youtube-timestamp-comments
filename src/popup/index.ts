// Popup Entry Point
// 라우터를 초기화하고 현재 라우트에 맞는 페이지를 root에 마운트한다.

import './popup.css';

import { initI18n } from '../i18n';
import { getStorageMultiple } from '../utils/storage.util';
import { STORAGE_KEY_THEME, STORAGE_KEY_LANGUAGE, THEME_DARK } from '../constants';
import { router } from './router';
import { mountMainPage } from './pages/MainPage';
import { mountSettingsPage } from './pages/SettingsPage';

// ── videoId / tabId 추출 ──────────────────────────────────

async function getTabInfo(): Promise<{ videoId: string | null; tabId: number | null }> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  const url = tab?.url ?? '';
  const match = url.match(/[?&]v=([^&]+)/);
  return {
    videoId: match?.[1] ?? null,
    tabId: tab?.id ?? null,
  };
}

// ── 진입점 ────────────────────────────────────────────────

async function main(): Promise<void> {
  // 저장된 테마 적용
  const stored = await getStorageMultiple([STORAGE_KEY_THEME, STORAGE_KEY_LANGUAGE]);
  if (stored.theme === THEME_DARK) document.documentElement.classList.add('dark');

  // i18n 초기화
  await initI18n();

  // videoId / tabId 사전 추출
  const { videoId, tabId } = await getTabInfo();

  const root = document.getElementById('root')!;

  // 라우트 변경 시 페이지 전환
  router.onRouteChange((route) => {
    if (route === '/') {
      void mountMainPage(root, videoId, tabId);
    } else if (route === '/settings') {
      mountSettingsPage(root);
    }
  });

  // 초기 라우트 — 메인 페이지
  void mountMainPage(root, videoId, tabId);
}

document.addEventListener('DOMContentLoaded', () => { void main(); });
