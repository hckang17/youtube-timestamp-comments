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

// ── 타임스탬프 → 링크 변환 ────────────────────────────────

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
