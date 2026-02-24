// 프로젝트 전역 상수 정의

// ── YouTube API ────────────────────────────────────────────
export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const COMMENT_THREADS_ENDPOINT = `${YOUTUBE_API_BASE_URL}/commentThreads`;
export const COMMENTS_ENDPOINT = `${YOUTUBE_API_BASE_URL}/comments`;

// ── 댓글 조회 설정 ──────────────────────────────────────────
export const MAX_RESULTS_PER_PAGE = 100;

// ── 타임스탬프 검색 설정 ────────────────────────────────────
export const TIMESTAMP_RANGE_MIN = 0;    // 최소 ± 범위 (초)
export const TIMESTAMP_RANGE_MAX = 30;   // 최대 ± 범위 (초)
export const TIMESTAMP_RANGE_STEP = 5;   // ± 범위 조절 단위 (초)
export const TIMESTAMP_RANGE_DEFAULT = 0; // 기본 ± 범위 (초)

// ── Storage 키 ─────────────────────────────────────────────
export const STORAGE_KEY_API_KEY = 'apiKey';
export const STORAGE_KEY_THEME = 'theme';
export const STORAGE_KEY_LANGUAGE = 'language';

// ── 다크모드 ───────────────────────────────────────────────
export const THEME_DARK = 'dark';
export const THEME_LIGHT = 'light';

// ── 기본 언어 ──────────────────────────────────────────────
export const DEFAULT_LANGUAGE = 'en';
