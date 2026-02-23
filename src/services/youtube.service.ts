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
    message: string,
  ) {
    super(message);
    this.name = 'YouTubeApiError';
  }
}

// ── 에러 핸들링 ────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let message: string;

  switch (response.status) {
    case 400:
      message = 'Invalid request. Please check the video ID.';
      break;
    case 401:
      message = 'Invalid API Key. Please check your API Key in Settings.';
      break;
    case 403:
      message =
        'API quota exceeded or comments are disabled for this video.';
      break;
    case 404:
      message = 'Video not found.';
      break;
    default:
      message = `YouTube API error: ${response.status} ${response.statusText}`;
  }

  throw new YouTubeApiError(response.status, message);
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
  return handleResponse<YouTubeListResponse<CommentThread>>(response);
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
  return handleResponse<YouTubeListResponse<Comment>>(response);
}
