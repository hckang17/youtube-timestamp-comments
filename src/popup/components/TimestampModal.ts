// TimestampModal 컴포넌트
// MM/SS 입력, ±range 조절(0~30s, 5s 단위), 필터링 실행

import { t } from '../../i18n';
import {
  TIMESTAMP_RANGE_MIN,
  TIMESTAMP_RANGE_MAX,
  TIMESTAMP_RANGE_STEP,
  TIMESTAMP_RANGE_DEFAULT,
} from '../../constants';

export type ModalSearchCallback = (targetSeconds: number, rangeSeconds: number) => void;

export class TimestampModal {
  private el: HTMLElement;
  private mmInput: HTMLInputElement;
  private ssInput: HTMLInputElement;
  private rangeDisplay: HTMLElement;
  private rangeValue: number = TIMESTAMP_RANGE_DEFAULT;
  private onSearch: ModalSearchCallback;

  constructor(el: HTMLElement, onSearch: ModalSearchCallback) {
    this.el = el;
    this.onSearch = onSearch;
    this.mmInput = this.getEl<HTMLInputElement>('modal-mm');
    this.ssInput = this.getEl<HTMLInputElement>('modal-ss');
    this.rangeDisplay = this.getEl('modal-range-display');
    this.bindEvents();
    this.updateRangeDisplay();
  }

  private getEl<T extends HTMLElement>(id: string): T {
    const el = this.el.querySelector<T>(`#${id}`);
    if (!el) throw new Error(`TimestampModal: #${id} not found`);
    return el;
  }

  // ── 열기 / 닫기 ───────────────────────────────────────────

  open(): void {
    this.el.classList.remove('hidden');
    this.mmInput.value = '';
    this.ssInput.value = '';
    this.rangeValue = TIMESTAMP_RANGE_DEFAULT;
    this.updateRangeDisplay();
    this.mmInput.focus();
  }

  close(): void {
    this.el.classList.add('hidden');
  }

  // ── range 표시 업데이트 ───────────────────────────────────

  private updateRangeDisplay(): void {
    this.rangeDisplay.textContent = `${this.rangeValue}s`;
  }

  // ── 입력값 파싱 ───────────────────────────────────────────

  private parseInputSeconds(): number | null {
    const mm = parseInt(this.mmInput.value || '0', 10);
    const ss = parseInt(this.ssInput.value || '0', 10);
    if (isNaN(mm) || isNaN(ss) || ss > 59) return null;
    return mm * 60 + ss;
  }

  // ── 이벤트 바인딩 ─────────────────────────────────────────

  private bindEvents(): void {
    // 닫기 버튼
    const closeBtn = this.el.querySelector<HTMLElement>('#modal-close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    // 배경 클릭으로 닫기
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close();
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.el.classList.contains('hidden')) {
        this.close();
      }
    });

    // range + 버튼
    const plusBtn = this.el.querySelector<HTMLElement>('#modal-range-plus');
    plusBtn?.addEventListener('click', () => {
      if (this.rangeValue < TIMESTAMP_RANGE_MAX) {
        this.rangeValue += TIMESTAMP_RANGE_STEP;
        this.updateRangeDisplay();
      }
    });

    // range - 버튼
    const minusBtn = this.el.querySelector<HTMLElement>('#modal-range-minus');
    minusBtn?.addEventListener('click', () => {
      if (this.rangeValue > TIMESTAMP_RANGE_MIN) {
        this.rangeValue -= TIMESTAMP_RANGE_STEP;
        this.updateRangeDisplay();
      }
    });

    // MM 입력: 숫자만, 2자리 자동 이동
    this.mmInput.addEventListener('input', () => {
      this.mmInput.value = this.mmInput.value.replace(/\D/g, '').slice(0, 3);
      if (this.mmInput.value.length >= 2) this.ssInput.focus();
    });

    // SS 입력: 숫자만, 59 초과 방지
    this.ssInput.addEventListener('input', () => {
      let val = this.ssInput.value.replace(/\D/g, '').slice(0, 2);
      if (parseInt(val, 10) > 59) val = '59';
      this.ssInput.value = val;
    });

    // Enter 키로 검색
    [this.mmInput, this.ssInput].forEach((input) => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSearch();
      });
    });

    // Search 버튼
    const searchBtn = this.el.querySelector<HTMLElement>('#modal-search-btn');
    searchBtn?.addEventListener('click', () => this.handleSearch());
  }

  // ── 검색 실행 ─────────────────────────────────────────────

  private handleSearch(): void {
    const targetSeconds = this.parseInputSeconds();
    if (targetSeconds === null) return;
    this.onSearch(targetSeconds, this.rangeValue);
    this.close();
  }

  // ── i18n 적용 ─────────────────────────────────────────────

  applyI18n(): void {
    const titleEl = this.el.querySelector<HTMLElement>('#modal-title');
    const searchBtn = this.el.querySelector<HTMLElement>('#modal-search-btn');
    if (titleEl) titleEl.textContent = t('modal', 'title');
    if (searchBtn) searchBtn.textContent = t('modal', 'searchButton');
  }
}
