// Header 컴포넌트
// 댓글 수/more 버튼, Sort by 드롭다운, 타임스탬프 검색, Settings, 다크모드 토글

import { t } from '../../i18n';
import { setStorage } from '../../utils/storage.util';
import { STORAGE_KEY_THEME, THEME_DARK, THEME_LIGHT } from '../../constants';
import type { CommentOrder } from '../../types/youtube.types';

export interface HeaderCallbacks {
  onMore: () => void;
  onSortChange: (order: CommentOrder) => void;
  onSearchTimestamp: () => void;
  onSettings: () => void;
}

export class Header {
  private el: HTMLElement;
  private commentCountEl: HTMLElement;
  private sortMenu: HTMLElement;
  private callbacks: HeaderCallbacks;

  constructor(el: HTMLElement, callbacks: HeaderCallbacks) {
    this.el = el;
    this.callbacks = callbacks;
    this.commentCountEl = this.getEl('comment-count');
    this.sortMenu = this.getEl('sort-menu');
    this.bindEvents();
  }

  private getEl(id: string): HTMLElement {
    const el = this.el.querySelector<HTMLElement>(`#${id}`);
    if (!el) throw new Error(`Header: #${id} not found`);
    return el;
  }

  // ── 댓글 수 업데이트 ────────────────────────────────────

  updateCommentCount(count: number, hasMore: boolean): void {
    const label = t('popup', 'commentCount');
    const moreText = hasMore ? `<span id="more-btn" class="header-more-btn">${t('popup', 'more')}</span>` : '';
    this.commentCountEl.innerHTML =
      `<span class="header-count-label">${label} ${count}${hasMore ? '+' : ''}</span>${moreText}`;

    const moreBtn = this.commentCountEl.querySelector<HTMLElement>('#more-btn');
    moreBtn?.addEventListener('click', () => this.callbacks.onMore());
  }

  // ── 이벤트 바인딩 ────────────────────────────────────────

  private bindEvents(): void {
    // Sort by 드롭다운
    const sortBtn = this.el.querySelector<HTMLElement>('#sort-btn');
    sortBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.sortMenu.classList.toggle('open');
    });

    this.el.querySelectorAll<HTMLElement>('[data-order]').forEach((item) => {
      item.addEventListener('click', () => {
        const order = item.dataset.order as CommentOrder;
        this.sortMenu.classList.remove('open');
        this.callbacks.onSortChange(order);
      });
    });

    document.addEventListener('click', () => this.sortMenu.classList.remove('open'));

    // 타임스탬프 검색 버튼
    const searchBtn = this.el.querySelector<HTMLElement>('#search-timestamp-btn');
    searchBtn?.addEventListener('click', () => this.callbacks.onSearchTimestamp());

    // Settings 버튼
    const settingsBtn = this.el.querySelector<HTMLElement>('#settings-btn');
    settingsBtn?.addEventListener('click', () => {
      this.callbacks.onSettings();
    });

    // 다크모드 토글
    const themeBtn = this.el.querySelector<HTMLElement>('#theme-btn');
    themeBtn?.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      void setStorage({ [STORAGE_KEY_THEME]: isDark ? THEME_DARK : THEME_LIGHT });
    });
  }

  // ── i18n 적용 ────────────────────────────────────────────

  applyI18n(): void {
    const sortLabel = this.el.querySelector<HTMLElement>('#sort-label');
    const searchLabel = this.el.querySelector<HTMLElement>('#search-label');
    const popularityItem = this.el.querySelector<HTMLElement>('[data-order="relevance"]');
    const latestItem = this.el.querySelector<HTMLElement>('[data-order="time"]');

    if (sortLabel) sortLabel.textContent = t('popup', 'sortBy');
    if (searchLabel) searchLabel.textContent = t('popup', 'searchByTimestamp');
    if (popularityItem) popularityItem.textContent = t('popup', 'sortPopularity');
    if (latestItem) latestItem.textContent = t('popup', 'sortLatest');
  }
}
