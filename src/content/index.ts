// Content Script
// YouTube 페이지에서 현재 영상의 videoId를 추출한다.
// Popup이 chrome.tabs.sendMessage로 GET_VIDEO_ID를 요청하면 응답한다.
// Popup이 chrome.tabs.sendMessage로 SEEK_TO를 요청하면 영상 시간을 이동한다.

import { MessageType } from '../types/message.types';
import type { GetVideoIdRequest, GetVideoIdResponse, SeekToRequest } from '../types/message.types';

// ── videoId 추출 ───────────────────────────────────────────

/**
 * 현재 URL에서 YouTube videoId 파라미터를 추출
 * @example "https://www.youtube.com/watch?v=abc123" → "abc123"
 */
function extractVideoId(): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get('v');
}

// ── 영상 시간 이동 ─────────────────────────────────────────

/**
 * YouTube 영상 <video> 요소의 currentTime을 변경해 특정 구간으로 이동한다.
 */
function seekTo(seconds: number): void {
  const video = document.querySelector<HTMLVideoElement>('video');
  if (video) video.currentTime = seconds;
}

// ── 메시지 리스너 ──────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (
    message: GetVideoIdRequest | SeekToRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: GetVideoIdResponse) => void,
  ) => {
    if (message.type === MessageType.GET_VIDEO_ID) {
      sendResponse({
        type: MessageType.GET_VIDEO_ID,
        payload: { videoId: extractVideoId() },
      });
    }

    if (message.type === MessageType.SEEK_TO) {
      seekTo(message.payload.seconds);
    }
  },
);
