// 날짜 포맷 유틸리티

/**
 * ISO 8601 날짜 문자열을 상대 시간 표현으로 변환
 * @example "2024-04-01T00:00:00Z" → "10 months ago"
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const past = new Date(isoString).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'just now';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;

  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
}

/**
 * ISO 8601 날짜 문자열을 "YYYY. MM. DD." 형식으로 변환
 * @example "2024-04-01T00:00:00Z" → "2024. 04. 01."
 */
export function formatAbsoluteDate(isoString: string): string {
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}. ${mm}. ${dd}.`;
}
