// Content Script
// YouTube 페이지에서 현재 영상의 videoId를 추출하여 Background에 전달한다.

import { MessageType } from '../types/message.types';
import type { GetVideoIdResponse } from '../types/message.types';

// ── videoId 추출 ───────────────────────────────────────────

/**
 * 현재 URL에서 YouTube videoId 파라미터를 추출
 * @example "https://www.youtube.com/watch?v=abc123" → "abc123"
 */
function extractVideoId(): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get('v');
}

// ── Background로 videoId 전달 ──────────────────────────────

function sendVideoId(videoId: string | null): void {
  const response: GetVideoIdResponse = {
    type: MessageType.GET_VIDEO_ID,
    payload: { videoId },
  };
  chrome.runtime.sendMessage(response);
}

// ── 초기 실행 ──────────────────────────────────────────────

sendVideoId(extractVideoId());

// ── YouTube SPA 네비게이션 감지 ───────────────────────────
// YouTube는 SPA 방식으로 동작하므로 페이지 이동 시 URL은 변경되지만
// Content Script가 재실행되지 않는다.
// 'yt-navigate-finish' 이벤트로 영상 전환을 감지하여 videoId를 재전송한다.

window.addEventListener('yt-navigate-finish', () => {
  sendVideoId(extractVideoId());
});
