// DOM 유틸리티
// XSS 방지를 위한 HTML 이스케이프 및 타임스탬프 링크 변환 공유 함수

import { TIMESTAMP_REGEX } from './timestamp.util';

// ── HTML 이스케이프 ────────────────────────────────────────

/**
 * 문자열 내 HTML 특수문자를 엔티티로 변환하여 XSS를 방지한다.
 * innerHTML에 삽입되는 모든 외부 데이터에 적용해야 한다.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── 프로필 이미지 생성 ────────────────────────────────────

/** fallback SVG: 회색 원 */
const FALLBACK_AVATAR =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#e5e7eb"/></svg>');

/**
 * 프로필 이미지 <img> 요소를 생성한다.
 * CSP 위반 없이 addEventListener('error')로 fallback을 처리한다.
 */
export function createAvatarImg(src: string, alt: string, extraClass?: string): HTMLImageElement {
  const img = document.createElement('img');
  img.className = extraClass ? `comment-avatar ${extraClass}` : 'comment-avatar';
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  img.addEventListener('error', () => {
    img.src = FALLBACK_AVATAR;
  }, { once: true });
  return img;
}

/**
 * 댓글 텍스트 내 타임스탬프를 anchor 링크로 변환한다.
 * 텍스트를 먼저 이스케이프한 후 타임스탬프 패턴만 링크로 교체한다.
 */
export function linkifyTimestamps(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(
    new RegExp(TIMESTAMP_REGEX.source, 'g'),
    (ts) => `<a class="comment-ts-link" data-timestamp="${ts}">${ts}</a>`,
  );
}
