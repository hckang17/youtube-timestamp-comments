// Popup Entry Point — Step 11
// 컴포넌트들을 조합하여 메인 팝업을 완성한다.

import './popup.css';

import { initI18n } from '../i18n';
import { getStorageMultiple } from '../utils/storage.util';
import {
  hasTimestamp,
  extractTimestamps,
  filterCommentsByTimestampRange,
} from '../utils/timestamp.util';
import { STORAGE_KEY_THEME, STORAGE_KEY_LANGUAGE, THEME_DARK } from '../constants';
import { MessageType } from '../types/message.types';
import type {
  FetchCommentsRequest,
  FetchCommentsResponse,
  ErrorResponse,
} from '../types/message.types';
import type { CommentThread, CommentOrder } from '../types/youtube.types';

import { Header } from './components/Header';
import { TimestampSidebar } from './components/TimestampSidebar';
import { TimestampModal } from './components/TimestampModal';
import { createCommentCard, createSkeletonCard } from './components/CommentCard';
import { toggleReplyList } from './components/ReplyList';

// ── 상태 ──────────────────────────────────────────────────

/** 로드된 전체 댓글 (타임스탬프 포함 여부 무관) */
let allComments: CommentThread[] = [];
/** 화면에 표시 중인 댓글 (필터 적용 후) */
let displayedComments: CommentThread[] = [];
/** 다음 페이지 토큰 */
let nextPageToken: string | undefined;
/** 현재 정렬 방식 */
let currentOrder: CommentOrder = 'relevance';
/** 현재 영상 ID */
let currentVideoId: string | null = null;
/** API 요청 중 여부 */
let isFetching = false;

// ── DOM 참조 ──────────────────────────────────────────────

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) throw new Error(`popup: #${id} not found`);
  return el;
}

// ── 상태 메시지 ───────────────────────────────────────────

type StatusType = 'loading' | 'error' | 'empty' | 'none';

function showStatus(type: StatusType, message = ''): void {
  const statusEl = getEl('status-message');
  const listEl   = getEl('comment-list');

  if (type === 'none') {
    statusEl.classList.add('hidden');
    statusEl.classList.remove('is-error');
    listEl.style.display = '';
    return;
  }

  listEl.style.display = 'none';
  statusEl.classList.remove('hidden', 'is-error');

  if (type === 'loading') {
    statusEl.innerHTML = `<div class="spinner"></div><span>${message || 'Loading…'}</span>`;
  } else if (type === 'error') {
    statusEl.classList.add('is-error');
    statusEl.innerHTML = `<span class="material-icons">error_outline</span><span>${message}</span>`;
  } else {
    statusEl.innerHTML = `<span class="material-icons">chat_bubble_outline</span><span>${message}</span>`;
  }
}

// ── 댓글 목록 렌더링 ──────────────────────────────────────

function renderComments(comments: CommentThread[]): void {
  const listEl = getEl('comment-list');
  listEl.innerHTML = '';

  if (comments.length === 0) {
    showStatus('empty', 'No timestamped comments found.');
    return;
  }

  showStatus('none');

  comments.forEach((thread) => {
    const card = createCommentCard(thread, (t, el) => {
      void toggleReplyList(t, el);
    });
    listEl.appendChild(card);
  });
}

// ── 스켈레톤 표시 ─────────────────────────────────────────

function renderSkeletons(count = 5): void {
  const listEl = getEl('comment-list');
  listEl.innerHTML = '';
  listEl.style.display = '';
  getEl('status-message').classList.add('hidden');

  for (let i = 0; i < count; i++) {
    listEl.appendChild(createSkeletonCard());
  }
}

// ── 타임스탬프 필터링 & 사이드바 갱신 ───────────────────

function applyFilter(selectedSeconds: number | null): void {
  if (selectedSeconds === null) {
    displayedComments = allComments;
  } else {
    displayedComments = allComments.filter((thread) => {
      const text = thread.snippet.topLevelComment.snippet.textDisplay ?? '';
      const timestamps = extractTimestamps(text);
      return timestamps.includes(selectedSeconds);
    });
  }
  renderComments(displayedComments);
}

function rebuildSidebar(sidebar: TimestampSidebar): void {
  // 전체 댓글에서 타임스탬프 수집
  const allTimestamps = allComments.flatMap((thread) => {
    const text = thread.snippet.topLevelComment.snippet.textDisplay ?? '';
    return extractTimestamps(text);
  });
  sidebar.render(allTimestamps);
}

// ── Background에서 댓글 조회 ──────────────────────────────

async function fetchComments(
  videoId: string,
  order: CommentOrder,
  pageToken?: string,
): Promise<{ items: CommentThread[]; nextPageToken?: string }> {
  const request: FetchCommentsRequest = {
    type: MessageType.FETCH_COMMENTS,
    payload: { videoId, order, pageToken },
  };

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(request, (response: FetchCommentsResponse | ErrorResponse) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (response.type === MessageType.ERROR) {
        reject(new Error(response.error));
        return;
      }
      resolve({
        items: (response as FetchCommentsResponse).payload.items,
        nextPageToken: (response as FetchCommentsResponse).payload.nextPageToken,
      });
    });
  });
}

// ── 현재 탭에서 videoId 추출 ──────────────────────────────

async function getVideoIdFromTab(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? '';
      const match = url.match(/[?&]v=([^&]+)/);
      resolve(match?.[1] ?? null);
    });
  });
}

// ── 초기 로드 ─────────────────────────────────────────────

async function loadComments(
  header: Header,
  sidebar: TimestampSidebar,
  order: CommentOrder = 'relevance',
  append = false,
): Promise<void> {
  if (isFetching || !currentVideoId) return;
  isFetching = true;

  if (!append) {
    allComments = [];
    nextPageToken = undefined;
    renderSkeletons(6);
  }

  try {
    const result = await fetchComments(currentVideoId, order, append ? nextPageToken : undefined);

    // 타임스탬프가 포함된 댓글만 필터
    const withTs = result.items.filter((thread) => {
      const text = thread.snippet.topLevelComment.snippet.textDisplay ?? '';
      return hasTimestamp(text);
    });

    if (append) {
      allComments = [...allComments, ...withTs];
    } else {
      allComments = withTs;
    }

    nextPageToken = result.nextPageToken;
    displayedComments = allComments;

    header.updateCommentCount(allComments.length, !!nextPageToken);
    rebuildSidebar(sidebar);
    renderComments(displayedComments);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch comments.';
    showStatus('error', message);
  } finally {
    isFetching = false;
  }
}

// ── 진입점 ────────────────────────────────────────────────

async function main(): Promise<void> {
  // 1. 저장된 테마/언어 적용
  const stored = await getStorageMultiple([STORAGE_KEY_THEME, STORAGE_KEY_LANGUAGE]);

  if (stored.theme === THEME_DARK) {
    document.documentElement.classList.add('dark');
  }

  // 2. i18n 초기화
  await initI18n();

  // 3. DOM 요소 획득
  const headerEl   = getEl('popup-header');
  const sidebarEl  = getEl('sidebar');
  const expanderEl = getEl('sidebar-expander');
  const modalEl    = getEl('timestamp-modal');

  // 4. 컴포넌트 초기화
  const sidebar = new TimestampSidebar(
    sidebarEl,
    expanderEl,
    (selectedSeconds) => applyFilter(selectedSeconds),
  );

  const modal = new TimestampModal(modalEl, (targetSec, rangeSec) => {
    // 타임스탬프 범위 검색
    displayedComments = filterCommentsByTimestampRange(allComments, targetSec, rangeSec);
    renderComments(displayedComments);
  });

  const header = new Header(headerEl, {
    onMore: () => {
      void loadComments(header, sidebar, currentOrder, true);
    },
    onSortChange: (order) => {
      currentOrder = order;
      void loadComments(header, sidebar, order, false);
    },
    onSearchTimestamp: () => modal.open(),
  });

  // i18n 적용
  header.applyI18n();
  modal.applyI18n();

  // 5. videoId 획득 → 댓글 로드
  currentVideoId = await getVideoIdFromTab();

  if (!currentVideoId) {
    showStatus('error', 'No YouTube video detected. Please open a YouTube video page.');
    header.updateCommentCount(0, false);
    return;
  }

  await loadComments(header, sidebar, currentOrder, false);
}

document.addEventListener('DOMContentLoaded', () => {
  void main();
});

