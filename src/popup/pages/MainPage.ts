// MainPage — 댓글 뷰
// 사이드바 + 헤더 + 댓글 목록으로 구성된 메인 화면을 렌더링한다.

import { t } from '../../i18n';
import { MessageType, ErrorCode } from '../../types/message.types';
import type { FetchCommentsRequest, FetchCommentsResponse, ErrorResponse } from '../../types/message.types';
import type { CommentThread, CommentOrder } from '../../types/youtube.types';
import { hasTimestamp, extractTimestamps, filterCommentsByTimestampRange, timestampToSeconds } from '../../utils/timestamp.util';
import { getSessionStorageMultiple, setSessionStorage } from '../../utils/storage.util';
import {
  SESSION_KEY_COMMENTS,
  SESSION_KEY_VIDEO_ID,
  SESSION_KEY_NEXT_PAGE_TOKEN,
  SESSION_KEY_ORDER,
} from '../../constants';
import { Header } from '../components/Header';
import { TimestampSidebar } from '../components/TimestampSidebar';
import { TimestampModal } from '../components/TimestampModal';
import { createCommentCard, createSkeletonCard } from '../components/CommentCard';
import { toggleReplyList } from '../components/ReplyList';
import { router } from '../router';

// ── HTML 템플릿 ───────────────────────────────────────────

export function getMainPageHTML(): string {
  return `
    <div id="app" class="app-wrapper">

      <aside id="sidebar" class="sidebar">
        <div id="sidebar-collapse-btn" class="sidebar-collapse-trigger" title="Collapse">
          <span class="material-icons">chevron_left</span>
        </div>
        <div class="sidebar-scroll">
          <button id="sidebar-all-btn" class="sidebar-all-btn sidebar-btn-active">ALL</button>
          <div id="sidebar-list" class="sidebar-list"></div>
        </div>
      </aside>

      <button id="sidebar-expander" class="sidebar-expander" style="display:none;" title="Expand">
        <span class="material-icons">chevron_right</span>
      </button>

      <main class="main-area">
        <header id="popup-header" class="popup-header">
          <div id="comment-count" class="header-comment-count"></div>
          <div class="header-actions">
            <div class="header-sort-wrap">
              <button id="sort-btn" class="header-btn">
                <span class="material-icons">sort</span>
                <span id="sort-label">Sort by</span>
              </button>
              <div id="sort-menu" class="sort-menu">
                <button class="sort-menu-item" data-order="relevance">Popularity</button>
                <button class="sort-menu-item" data-order="time">Latest</button>
              </div>
            </div>
            <button id="search-timestamp-btn" class="header-btn">
              <span class="material-icons">search</span>
              <span id="search-label">Search by timestamp</span>
            </button>
            <button id="settings-btn" class="header-btn header-btn-icon" title="Settings">
              <span class="material-icons">settings</span>
            </button>
          </div>
        </header>

        <div id="comment-list" class="comment-list"></div>
        <div id="status-message" class="status-message hidden"></div>
      </main>

    </div>

    <!-- 타임스탬프 검색 모달 -->
    <div id="timestamp-modal" class="modal-overlay hidden">
      <div class="modal-card">
        <button id="modal-close-btn" class="modal-close-btn" title="Close">
          <span class="material-icons">close</span>
        </button>
        <h2 id="modal-title" class="modal-title">Please enter a timestamp</h2>
        <div class="modal-time-row">
          <input id="modal-mm" class="modal-time-input" type="text" placeholder="00" maxlength="3" inputmode="numeric" />
          <span class="modal-time-sep">:</span>
          <input id="modal-ss" class="modal-time-input" type="text" placeholder="00" maxlength="2" inputmode="numeric" />
        </div>
        <div class="modal-range-row">
          <button id="modal-range-plus" class="modal-range-btn" title="Increase range">
            <span class="material-icons">add</span>
          </button>
          <div id="modal-range-display" class="modal-range-display">0s</div>
          <button id="modal-range-minus" class="modal-range-btn" title="Decrease range">
            <span class="material-icons">remove</span>
          </button>
        </div>
        <button id="modal-search-btn" class="modal-search-btn">Search</button>
      </div>
    </div>
  `;
}

// ── 상태 ──────────────────────────────────────────────────

let allComments: CommentThread[] = [];
let displayedComments: CommentThread[] = [];
let nextPageToken: string | undefined;
let currentOrder: CommentOrder = 'relevance';
let currentVideoId: string | null = null;
let isFetching = false;

// ── DOM 헬퍼 ──────────────────────────────────────────────

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) throw new Error(`MainPage: #${id} not found`);
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

// ── 댓글 렌더링 ───────────────────────────────────────────

function renderComments(comments: CommentThread[]): void {
  const listEl = getEl('comment-list');
  listEl.innerHTML = '';

  if (comments.length === 0) {
    showStatus('empty', t('popup', 'noComments'));
    return;
  }

  showStatus('none');
  comments.forEach((thread) => {
    const card = createCommentCard(thread, (th, el) => { void toggleReplyList(th, el); });
    listEl.appendChild(card);
  });
}

function renderSkeletons(count = 5): void {
  const listEl = getEl('comment-list');
  listEl.innerHTML = '';
  listEl.style.display = '';
  getEl('status-message').classList.add('hidden');
  for (let i = 0; i < count; i++) listEl.appendChild(createSkeletonCard());
}

// ── 필터 & 사이드바 ───────────────────────────────────────

function applyFilter(selectedSeconds: number | null): void {
  displayedComments = selectedSeconds === null
    ? allComments
    : allComments.filter((thread) => {
        const text = thread.snippet.topLevelComment.snippet.textOriginal ?? '';
        return extractTimestamps(text).includes(selectedSeconds);
      });
  renderComments(displayedComments);
}

function rebuildSidebar(sidebar: TimestampSidebar): void {
  const timestamps = allComments.flatMap((thread) => {
    const text = thread.snippet.topLevelComment.snippet.textOriginal ?? '';
    return extractTimestamps(text);
  });
  sidebar.render(timestamps);
}

// ── Background 통신 ───────────────────────────────────────

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
      if (chrome.runtime.lastError) { reject(new Error(chrome.runtime.lastError.message)); return; }
      if (response.type === MessageType.ERROR) {
        const errMsg = response.errorCode === ErrorCode.NO_API_KEY
          ? t('popup', 'errorNoApiKey')
          : response.error;
        reject(new Error(errMsg));
        return;
      }
      resolve({
        items: (response).payload.items,
        nextPageToken: (response).payload.nextPageToken,
      });
    });
  });
}

// ── 댓글 로드 ─────────────────────────────────────────────

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
    const withTs = result.items.filter((thread) =>
      hasTimestamp(thread.snippet.topLevelComment.snippet.textOriginal ?? ''),
    );

    allComments = append ? [...allComments, ...withTs] : withTs;
    nextPageToken = result.nextPageToken;
    displayedComments = allComments;

    // 팝업 재진입 시 복원을 위해 세션에 캐싱
    void setSessionStorage({
      [SESSION_KEY_COMMENTS]: allComments,
      [SESSION_KEY_VIDEO_ID]: currentVideoId,
      [SESSION_KEY_NEXT_PAGE_TOKEN]: nextPageToken ?? null,
      [SESSION_KEY_ORDER]: currentOrder,
    });

    header.updateCommentCount(allComments.length, !!nextPageToken);
    rebuildSidebar(sidebar);
    renderComments(displayedComments);
  } catch (err) {
    showStatus('error', err instanceof Error ? err.message : t('popup', 'errorFetch'));
  } finally {
    isFetching = false;
  }
}

// ── 마운트 ────────────────────────────────────────────────

export async function mountMainPage(root: HTMLElement, videoId: string | null, tabId: number | null): Promise<void> {
  root.innerHTML = getMainPageHTML();

  const prevVideoId = currentVideoId;
  currentVideoId = videoId;

  const headerEl   = getEl('popup-header');
  const sidebarEl  = getEl('sidebar');
  const expanderEl = getEl('sidebar-expander');
  const modalEl    = getEl('timestamp-modal');

  const sidebar = new TimestampSidebar(sidebarEl, expanderEl, applyFilter);

  const modal = new TimestampModal(modalEl, (targetSec, rangeSec) => {
    displayedComments = filterCommentsByTimestampRange(allComments, targetSec, rangeSec);
    renderComments(displayedComments);
  });

  const header = new Header(headerEl, {
    onMore:            () => { void loadComments(header, sidebar, currentOrder, true); },
    onSortChange:      (order) => { currentOrder = order; void loadComments(header, sidebar, order); },
    onSearchTimestamp: () => modal.open(),
    onSettings:        () => router.navigate('/settings'),
  });

  header.applyI18n();
  modal.applyI18n();

  // 타임스탬프 링크 클릭 → 영상 해당 구간으로 이동 (이벤트 위임)
  if (tabId !== null) {
    const listEl = getEl('comment-list');
    listEl.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest<HTMLElement>('.comment-ts-link');
      if (!link) return;
      e.preventDefault();
      const ts = link.dataset.timestamp;
      if (!ts) return;
      // 콜백을 넘겨 lastError를 소비함으로써 content script 미주입 탭에서의 uncaught 오류 방지
      chrome.tabs.sendMessage(
        tabId,
        { type: MessageType.SEEK_TO, payload: { seconds: timestampToSeconds(ts) } },
        () => { void chrome.runtime.lastError; },
      );
    });
  }

  if (!currentVideoId) {
    showStatus('error', t('popup', 'errorNoVideo'));
    header.updateCommentCount(0, false);
    return;
  }

  // 동일 videoId로 재진입 시 (예: 설정 페이지 갔다가 돌아온 경우)
  // 기존 댓글 상태를 그대로 복원해 불필요한 API 재호출 방지
  if (videoId === prevVideoId && allComments.length > 0) {
    header.updateCommentCount(allComments.length, !!nextPageToken);
    rebuildSidebar(sidebar);
    renderComments(displayedComments);
    return;
  }

  // 팝업을 닫았다 다시 열었을 때 세션 캐시로 복원
  type SessionCache = {
    [SESSION_KEY_COMMENTS]: CommentThread[];
    [SESSION_KEY_VIDEO_ID]: string;
    [SESSION_KEY_NEXT_PAGE_TOKEN]: string | null;
    [SESSION_KEY_ORDER]: CommentOrder;
  };
  const cache = await getSessionStorageMultiple<SessionCache>([
    SESSION_KEY_COMMENTS,
    SESSION_KEY_VIDEO_ID,
    SESSION_KEY_NEXT_PAGE_TOKEN,
    SESSION_KEY_ORDER,
  ]);

  if (cache[SESSION_KEY_VIDEO_ID] === videoId && cache[SESSION_KEY_COMMENTS]?.length) {
    allComments = cache[SESSION_KEY_COMMENTS];
    displayedComments = allComments;
    nextPageToken = cache[SESSION_KEY_NEXT_PAGE_TOKEN] ?? undefined;
    currentOrder = cache[SESSION_KEY_ORDER] ?? 'relevance';
    header.updateCommentCount(allComments.length, !!nextPageToken);
    rebuildSidebar(sidebar);
    renderComments(displayedComments);
    return;
  }

  await loadComments(header, sidebar, currentOrder);
}
