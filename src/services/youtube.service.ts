// YouTube Data API v3 서비스 레이어

import {
  COMMENT_THREADS_ENDPOINT,
  COMMENTS_ENDPOINT,
  MAX_RESULTS_PER_PAGE,
} from '../constants';
import type {
  CommentThread,
  Comment,
  CommentOrder,
  YouTubeListResponse,
} from '../types/youtube.types';

// ── 에러 타입 ──────────────────────────────────────────────

export class YouTubeApiError extends Error {
  constructor(
    public readonly code: number,
    public readonly reason: string,
    message: string,
  ) {
    super(message);
    this.name = 'YouTubeApiError';
  }
}

// ── YouTube API 에러 응답 구조 ─────────────────────────────

interface YouTubeErrorDetail {
  reason: string;
  message: string;
}

interface YouTubeErrorResponse {
  error: {
    code: number;
    errors: YouTubeErrorDetail[];
  };
}

// ── reason별 에러 메시지 맵 ────────────────────────────────

const COMMENT_THREADS_ERROR_MESSAGES: Record<string, string> = {
  // 400
  operationNotSupported: 'This operation is not supported for the given filter.',
  processingFailure: 'The request failed to process. Please check the request and try again.',
  // 403
  commentsDisabled: 'Comments are disabled for this video.',
  forbidden: 'You do not have permission to access this comment thread.',
  // 404
  channelNotFound: 'The specified channel could not be found.',
  commentThreadNotFound: 'The specified comment thread could not be found.',
  videoNotFound: 'The video could not be found. Please check the video ID.',
};

const COMMENTS_ERROR_MESSAGES: Record<string, string> = {
  // 400
  operationNotSupported: 'This operation is not supported for the given filter.',
  // 403
  forbidden: 'You do not have permission to access this comment.',
  // 404
  commentNotFound: 'The specified comment or reply could not be found.',
};

// ── 에러 핸들링 ────────────────────────────────────────────

async function handleResponse<T>(
  response: Response,
  errorMessages: Record<string, string>,
): Promise<T> {
  if (response.ok) {
    return response.json();
  }

  // YouTube API 에러 응답 본문 파싱 시도
  let reason = 'unknown';
  let message: string;

  try {
    const errorBody = await response.json() as YouTubeErrorResponse;
    reason = errorBody.error.errors[0]?.reason ?? 'unknown';
    message =
      errorMessages[reason] ??
      getFallbackMessage(response.status, reason);
  } catch {
    message = getFallbackMessage(response.status, reason);
  }

  throw new YouTubeApiError(response.status, reason, message);
}

function getFallbackMessage(status: number, reason: string): string {
  switch (status) {
    case 400:
      return `Invalid request (${reason}). Please check the request parameters.`;
    case 401:
      return 'Invalid API Key. Please check your API Key in Settings.';
    case 403:
      return `Access forbidden (${reason}). The request is not authorized.`;
    case 404:
      return `Resource not found (${reason}).`;
    default:
      return `YouTube API error: ${status} (${reason})`;
  }
}

// ── API 함수 ───────────────────────────────────────────────

/**
 * CommentThreads.list — 영상의 최상위 댓글 목록 조회
 *
 * @param videoId   YouTube 영상 ID
 * @param apiKey    YouTube Data API v3 키
 * @param order     정렬 기준 ('relevance' | 'time')
 * @param pageToken 다음 페이지 토큰 (더보기 시 사용)
 */
export async function fetchCommentThreads(
  videoId: string,
  apiKey: string,
  order: CommentOrder = 'relevance',
  pageToken?: string,
): Promise<YouTubeListResponse<CommentThread>> {
  const params = new URLSearchParams({
    part: 'snippet,replies',
    videoId,
    key: apiKey,
    maxResults: String(MAX_RESULTS_PER_PAGE),
    order,
    ...(pageToken ? { pageToken } : {}),
  });

  const response = await fetch(`${COMMENT_THREADS_ENDPOINT}?${params.toString()}`);
  return handleResponse<YouTubeListResponse<CommentThread>>(
    response,
    COMMENT_THREADS_ERROR_MESSAGES,
  );
}

/**
 * Comments.list — 특정 댓글의 답글 목록 조회
 *
 * @param parentId 최상위 댓글 ID
 * @param apiKey   YouTube Data API v3 키
 */
export async function fetchReplies(
  parentId: string,
  apiKey: string,
): Promise<YouTubeListResponse<Comment>> {
  const params = new URLSearchParams({
    part: 'snippet',
    parentId,
    key: apiKey,
    maxResults: String(MAX_RESULTS_PER_PAGE),
  });

  const response = await fetch(`${COMMENTS_ENDPOINT}?${params.toString()}`);
  return handleResponse<YouTubeListResponse<Comment>>(
    response,
    COMMENTS_ERROR_MESSAGES,
  );
}
