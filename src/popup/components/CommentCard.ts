// CommentCard 컴포넌트
// 댓글 카드 렌더링: 프로필/작성자/시간, 타임스탬프 링크 변환, 좋아요/답글 버튼, 스켈레톤

import { t } from '../../i18n';
import { formatRelativeTime } from '../../utils/date.util';
import { escapeHtml, linkifyTimestamps, createAvatarImg } from '../../utils/dom.util';
import type { CommentThread } from '../../types/youtube.types';

export type ReplyToggleCallback = (thread: CommentThread, el: HTMLElement) => void;

// ── 스켈레톤 ──────────────────────────────────────────────

export function createSkeletonCard(): HTMLElement {
  const article = document.createElement('article');
  article.className = 'comment-card comment-card-skeleton';
  article.innerHTML = `
    <div class="comment-avatar skeleton-block" style="width:40px;height:40px;border-radius:50%;flex-shrink:0;"></div>
    <div class="comment-body" style="flex:1;">
      <div class="skeleton-block" style="width:30%;height:14px;margin-bottom:8px;border-radius:4px;"></div>
      <div class="skeleton-block" style="width:80%;height:14px;border-radius:4px;"></div>
    </div>
  `;
  return article;
}

// ── 좋아요 수 포맷 ────────────────────────────────────────

function formatLikeCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

// ── CommentCard 생성 ──────────────────────────────────────

export function createCommentCard(
  thread: CommentThread,
  onReplyToggle: ReplyToggleCallback,
): HTMLElement {
  const snippet = thread.snippet.topLevelComment.snippet;
  const replyCount = thread.snippet.totalReplyCount ?? 0;
  const likeCount = snippet.likeCount ?? 0;
  const isEdited = snippet.textOriginal !== snippet.textDisplay;

  const article = document.createElement('article');
  article.className = 'comment-card';
  article.dataset.threadId = thread.id;

  // 프로필 이미지 (CSP 안전 방식)
  const avatarSrc = snippet.authorProfileImageUrl ?? '';
  const authorName = escapeHtml(snippet.authorDisplayName ?? '');
  const publishedAt = formatRelativeTime(snippet.publishedAt);
  const editedSuffix = isEdited ? ` (edited)` : '';
  const bodyHtml = linkifyTimestamps(snippet.textDisplay ?? '');
  const likeHtml = likeCount > 0
    ? `<span class="comment-like-count">${formatLikeCount(likeCount)}</span>`
    : '';
  const repliesHtml = replyCount > 0 ? `
    <div class="comment-replies-toggle">
      <button class="reply-toggle-btn" data-thread-id="${thread.id}">
        <span class="material-icons">arrow_drop_down</span>
        <span>${t('popup', 'showReplies').replace('{{count}}', String(replyCount))}</span>
      </button>
    </div>
  ` : '';

  // avatar는 onerror 인라인 핸들러 대신 createElement + addEventListener('error') 방식
  const avatar = createAvatarImg(avatarSrc, authorName);

  const body = document.createElement('div');
  body.className = 'comment-body';
  body.innerHTML = `
    <div class="comment-meta">
      <span class="comment-author">${authorName}</span>
      <span class="comment-time">${publishedAt}${editedSuffix}</span>
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
      <span class="comment-reply-label">${t('popup', 'reply')}</span>
    </div>
    ${repliesHtml}
  `;

  article.appendChild(avatar);
  article.appendChild(body);

  // 답글 토글 이벤트
  const replyToggleBtn = article.querySelector<HTMLElement>('.reply-toggle-btn');
  if (replyToggleBtn) {
    replyToggleBtn.addEventListener('click', () => {
      onReplyToggle(thread, article);
    });
  }

  return article;
}
