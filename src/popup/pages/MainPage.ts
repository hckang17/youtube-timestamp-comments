// MainPage — 댓글 뷰
// 사이드바 + 헤더 + 댓글 목록으로 구성된 메인 화면을 렌더링한다.

import { t } from '../../i18n';
import { MessageType } from '../../types/message.types';
import type { FetchCommentsRequest, FetchCommentsResponse, ErrorResponse } from '../../types/message.types';
import type { CommentThread, CommentOrder } from '../../types/youtube.types';
import { hasTimestamp, extractTimestamps, filterCommentsByTimestampRange } from '../../utils/timestamp.util';
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
            <button id="theme-btn" class="header-btn header-btn-icon" title="Toggle dark mode">
              <span class="material-icons theme-icon-light">dark_mode</span>
              <span class="material-icons theme-icon-dark">light_mode</span>
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
        const text = thread.snippet.topLevelComment.snippet.textDisplay ?? '';
        return extractTimestamps(text).includes(selectedSeconds);
      });
  renderComments(displayedComments);
}

function rebuildSidebar(sidebar: TimestampSidebar): void {
  const timestamps = allComments.flatMap((thread) => {
    const text = thread.snippet.topLevelComment.snippet.textDisplay ?? '';
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
        const errMsg = response.errorCode === 'NO_API_KEY'
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
      hasTimestamp(thread.snippet.topLevelComment.snippet.textDisplay ?? ''),
    );

    allComments = append ? [...allComments, ...withTs] : withTs;
    nextPageToken = result.nextPageToken;
    displayedComments = allComments;

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

export async function mountMainPage(root: HTMLElement, videoId: string | null): Promise<void> {
  root.innerHTML = getMainPageHTML();

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

  if (!currentVideoId) {
    showStatus('error', t('popup', 'errorNoVideo'));
    header.updateCommentCount(0, false);
    return;
  }

  await loadComments(header, sidebar, currentOrder);
}
