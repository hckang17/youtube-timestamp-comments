// Content Script
// YouTube 페이지에서 현재 영상의 videoId를 추출한다.
// Popup이 chrome.tabs.sendMessage로 GET_VIDEO_ID를 요청하면 응답한다.

import { MessageType } from '../types/message.types';
import type { GetVideoIdRequest, GetVideoIdResponse } from '../types/message.types';

// ── videoId 추출 ───────────────────────────────────────────

/**
 * 현재 URL에서 YouTube videoId 파라미터를 추출
 * @example "https://www.youtube.com/watch?v=abc123" → "abc123"
 */
function extractVideoId(): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get('v');
}

// ── Popup 요청 리스너 ──────────────────────────────────────
// Popup이 chrome.tabs.sendMessage(tabId, { type: GET_VIDEO_ID })로 요청하면
// 현재 videoId를 응답한다.

chrome.runtime.onMessage.addListener(
  (
    message: GetVideoIdRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: GetVideoIdResponse) => void,
  ) => {
    if (message.type === MessageType.GET_VIDEO_ID) {
      sendResponse({
        type: MessageType.GET_VIDEO_ID,
        payload: { videoId: extractVideoId() },
      });
    }
    // 동기 응답이므로 true 반환 불필요
  },
);
