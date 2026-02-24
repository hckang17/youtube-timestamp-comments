// ReplyList 컴포넌트
// 답글 토글 시 Background 요청, 스켈레톤, 캐시 재사용

import { t } from '../../i18n';
import { formatRelativeTime } from '../../utils/date.util';
import { escapeHtml, linkifyTimestamps, createAvatarImg } from '../../utils/dom.util';
import { MessageType } from '../../types/message.types';
import type { Comment, CommentThread } from '../../types/youtube.types';
import type { FetchRepliesRequest, FetchRepliesResponse } from '../../types/message.types';
import { createSkeletonCard } from './CommentCard';

// threadId → 캐시된 답글 목록
const replyCache = new Map<string, Comment[]>();

// ── 답글 카드 생성 ────────────────────────────────────────

function createReplyCard(comment: Comment): HTMLElement {
  const snippet = comment.snippet;
  const likeCount = snippet.likeCount ?? 0;

  const div = document.createElement('div');
  div.className = 'reply-card';

  const avatarSrc = snippet.authorProfileImageUrl ?? '';
  const authorName = escapeHtml(snippet.authorDisplayName ?? '');
  const publishedAt = formatRelativeTime(snippet.publishedAt);
  const bodyHtml = linkifyTimestamps(snippet.textDisplay ?? '');
  const likeHtml = likeCount > 0
    ? `<span class="comment-like-count">${likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount}</span>`
    : '';

  // avatar는 onerror 인라인 핸들러 대신 createElement + addEventListener('error') 방식
  const avatar = createAvatarImg(avatarSrc, authorName, 'comment-avatar-sm');

  const body = document.createElement('div');
  body.className = 'comment-body';
  body.innerHTML = `
    <div class="comment-meta">
      <span class="comment-author">${authorName}</span>
      <span class="comment-time">${publishedAt}</span>
    </div>
    <div class="comment-text">${bodyHtml}</div>
    <div class="comment-actions">
      <button class="comment-action-btn" disabled>
        <span class="material-icons">thumb_up</span>
        ${likeHtml}
      </button>
      <button class="comment-action-btn" disabled>
        <span class="material-icons">thumb_down</span>
      </button>
    </div>
  `;

  div.appendChild(avatar);
  div.appendChild(body);
  return div;
}

// ── ReplyList 토글 ────────────────────────────────────────

export async function toggleReplyList(
  thread: CommentThread,
  cardEl: HTMLElement,
): Promise<void> {
  const threadId = thread.id;
  const toggleBtn = cardEl.querySelector<HTMLElement>('.reply-toggle-btn');

  // 이미 열려 있으면 닫기
  const existing = cardEl.querySelector<HTMLElement>('.reply-list-container');
  if (existing) {
    existing.remove();
    if (toggleBtn) {
      toggleBtn.querySelector('span.material-icons')!.textContent = 'arrow_drop_down';
      toggleBtn.querySelector('span:last-child')!.textContent =
        t('popup', 'showReplies').replace('{{count}}', String(thread.snippet.totalReplyCount ?? 0));
    }
    return;
  }

  // 열기: 컨테이너 삽입
  const container = document.createElement('div');
  container.className = 'reply-list-container';

  // 토글 버튼 아이콘 변경
  if (toggleBtn) {
    toggleBtn.querySelector('span.material-icons')!.textContent = 'arrow_drop_up';
    toggleBtn.querySelector('span:last-child')!.textContent = t('popup', 'hideReplies');
  }

  cardEl.querySelector('.comment-body')?.appendChild(container);

  // 캐시 확인
  if (replyCache.has(threadId)) {
    renderReplies(container, replyCache.get(threadId)!);
    return;
  }

  // 스켈레톤
  const skeletons = Array.from({ length: 2 }, () => {
    const sk = createSkeletonCard();
    sk.classList.add('reply-skeleton');
    return sk;
  });
  skeletons.forEach((sk) => container.appendChild(sk));

  // Background에 답글 요청
  try {
    const request: FetchRepliesRequest = {
      type: MessageType.FETCH_REPLIES,
      payload: { parentId: threadId },
    };

    const response = await new Promise<FetchRepliesResponse>((resolve, reject) => {
      chrome.runtime.sendMessage(request, (res) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (res.type === MessageType.ERROR) {
          reject(new Error(res.error));
          return;
        }
        resolve(res as FetchRepliesResponse);
      });
    });

    const replies = response.payload.items;
    replyCache.set(threadId, replies);
    container.innerHTML = '';
    renderReplies(container, replies);
  } catch (err) {
    container.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'reply-error';
    p.textContent = err instanceof Error ? err.message : 'Failed to load replies.';
    container.appendChild(p);
  }
}

function renderReplies(container: HTMLElement, replies: Comment[]): void {
  if (replies.length === 0) {
    const p = document.createElement('p');
    p.className = 'reply-empty';
    p.textContent = t('popup', 'noComments');
    container.appendChild(p);
    return;
  }
  replies.forEach((reply) => container.appendChild(createReplyCard(reply)));
}
