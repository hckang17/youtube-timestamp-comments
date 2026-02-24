// Background Service Worker
// API 키를 chrome.storage.local에서 읽어 YouTube API 호출을 대리 처리한다.

import { fetchCommentThreads, fetchReplies, YouTubeApiError } from '../services/youtube.service';
import { getStorage } from '../utils/storage.util';
import { STORAGE_KEY_API_KEY } from '../constants';
import { MessageType } from '../types/message.types';
import type {
  RequestMessage,
  FetchCommentsRequest,
  FetchRepliesRequest,
  ResponseMessage,
} from '../types/message.types';

// ── 메시지 핸들러 ──────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (
    message: RequestMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseMessage) => void,
  ) => {
    void handleMessage(message, sendResponse);
    // 비동기 응답을 위해 true 반환
    return true;
  },
);

async function handleMessage(
  message: RequestMessage,
  sendResponse: (response: ResponseMessage) => void,
): Promise<void> {
  switch (message.type) {
    case MessageType.FETCH_COMMENTS:
      await handleFetchComments(message, sendResponse);
      break;

    case MessageType.FETCH_REPLIES:
      await handleFetchReplies(message, sendResponse);
      break;

    case MessageType.GET_VIDEO_ID:
      // Popup → Content Script 직접 쿼리 방식으로 처리하므로
      // Background에서는 포트 에러 방지를 위해 빈 응답만 반환
      sendResponse({
        type: MessageType.GET_VIDEO_ID,
        payload: { videoId: null },
      });
      break;

    default:
      sendResponse({
        type: MessageType.ERROR,
        error: 'Unknown message type.',
      });
  }
}

// ── API 키 조회 헬퍼 ───────────────────────────────────────

/**
 * chrome.storage.local에서 API 키를 읽어 반환
 * API 키가 없으면 null 반환
 */
async function getApiKey(): Promise<string | null> {
  const apiKey = await getStorage(STORAGE_KEY_API_KEY);
  return apiKey ?? null;
}

// ── FETCH_COMMENTS 처리 ────────────────────────────────────

async function handleFetchComments(
  message: FetchCommentsRequest,
  sendResponse: (response: ResponseMessage) => void,
): Promise<void> {
  try {
    const apiKey = await getApiKey();

    if (!apiKey) {
      sendResponse({
        type: MessageType.ERROR,
        error: 'API Key is not set. Please go to Settings.',
        code: 401,
        errorCode: 'NO_API_KEY',
      });
      return;
    }

    const { videoId, order, pageToken } = message.payload;
    const result = await fetchCommentThreads(videoId, apiKey, order, pageToken);

    sendResponse({
      type: MessageType.FETCH_COMMENTS,
      payload: {
        items: result.items,
        nextPageToken: result.nextPageToken,
      },
    });
  } catch (err) {
    sendResponse(buildErrorResponse(err));
  }
}

// ── FETCH_REPLIES 처리 ─────────────────────────────────────

async function handleFetchReplies(
  message: FetchRepliesRequest,
  sendResponse: (response: ResponseMessage) => void,
): Promise<void> {
  try {
    const apiKey = await getApiKey();

    if (!apiKey) {
      sendResponse({
        type: MessageType.ERROR,
        error: 'API Key is not set. Please go to Settings.',
        code: 401,
        errorCode: 'NO_API_KEY',
      });
      return;
    }

    const { parentId } = message.payload;
    const result = await fetchReplies(parentId, apiKey);

    sendResponse({
      type: MessageType.FETCH_REPLIES,
      payload: {
        items: result.items,
      },
    });
  } catch (err) {
    sendResponse(buildErrorResponse(err));
  }
}

// ── 에러 응답 빌더 ─────────────────────────────────────────

function buildErrorResponse(err: unknown): ResponseMessage {
  if (err instanceof YouTubeApiError) {
    return {
      type: MessageType.ERROR,
      error: err.message,
      code: err.code,
    };
  }
  return {
    type: MessageType.ERROR,
    error: err instanceof Error ? err.message : 'An unexpected error occurred.',
  };
}
