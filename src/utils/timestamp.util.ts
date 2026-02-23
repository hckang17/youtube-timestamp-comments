// 타임스탬프 파싱 및 필터링 유틸리티

import type { CommentThread } from '../types/youtube.types';

/**
 * 댓글 텍스트에서 타임스탬프를 추출하는 정규식
 * 지원 형식:
 *   - MM:SS       (예: 1:23, 09:45)
 *   - H:MM:SS     (예: 1:23:45)
 *   - HH:MM:SS    (예: 01:23:45)
 */
const TIMESTAMP_REGEX = /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g;

/**
 * 타임스탬프 문자열을 초(seconds)로 변환
 * @example "1:23"    → 83
 * @example "1:23:45" → 5025
 */
export function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(':').map(Number);

  if (parts.some(isNaN)) return 0;

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return (minutes ?? 0) * 60 + (seconds ?? 0);
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
  }

  return 0;
}

/**
 * 초(seconds)를 "MM:SS" 또는 "H:MM:SS" 형식의 문자열로 변환
 * @example 83   → "1:23"
 * @example 5025 → "1:23:45"
 */
export function secondsToTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');

  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

/**
 * 댓글 텍스트에서 모든 타임스탬프를 초 단위 배열로 추출
 * @example "check 1:23 and 4:56" → [83, 296]
 */
export function extractTimestamps(text: string): number[] {
  const timestamps: number[] = [];
  const regex = new RegExp(TIMESTAMP_REGEX.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    timestamps.push(timestampToSeconds(match[0]));
  }

  return timestamps;
}

/**
 * 댓글 텍스트에 타임스탬프가 포함되어 있는지 여부 반환
 */
export function hasTimestamp(text: string): boolean {
  const regex = new RegExp(TIMESTAMP_REGEX.source, 'g');
  return regex.test(text);
}

/**
 * 타임스탬프 범위(target ± range)에 해당하는 CommentThread 필터링
 * @param comments  전체 CommentThread 배열
 * @param targetSec 검색 기준 타임스탬프 (초)
 * @param rangeSec  허용 범위 (초, 0 ~ 30)
 */
export function filterCommentsByTimestampRange(
  comments: CommentThread[],
  targetSec: number,
  rangeSec: number,
): CommentThread[] {
  const min = targetSec - rangeSec;
  const max = targetSec + rangeSec;

  return comments.filter((thread) => {
    const text = thread.snippet.topLevelComment.snippet.textOriginal;
    const timestamps = extractTimestamps(text);
    return timestamps.some((ts) => ts >= min && ts <= max);
  });
}
