// TimestampSidebar 컴포넌트
// ALL 버튼 + 타임스탬프 버튼 목록, 선택 하이라이트, 접기/펼치기

import { secondsToTimestamp } from '../../utils/timestamp.util';

export type SidebarSelectCallback = (seconds: number | null) => void;

export class TimestampSidebar {
  private sidebar: HTMLElement;
  private expander: HTMLElement;
  private listEl: HTMLElement;
  private allBtn: HTMLElement;
  private observer: MutationObserver;
  private onSelect: SidebarSelectCallback;
  private selectedSeconds: number | null = null;

  constructor(
    sidebar: HTMLElement,
    expander: HTMLElement,
    onSelect: SidebarSelectCallback,
  ) {
    this.sidebar = sidebar;
    this.expander = expander;
    this.onSelect = onSelect;
    this.listEl = this.getEl('sidebar-list');
    this.allBtn = this.getEl('sidebar-all-btn');
    this.observer = this.createObserver();
    this.bindEvents();
  }

  private getEl(id: string): HTMLElement {
    const el = this.sidebar.querySelector<HTMLElement>(`#${id}`);
    if (!el) throw new Error(`TimestampSidebar: #${id} not found`);
    return el;
  }

  // ── 타임스탬프 목록 렌더링 ────────────────────────────────

  render(timestamps: number[]): void {
    // 기존 타임스탬프 버튼 제거 (ALL 버튼은 유지)
    this.listEl.querySelectorAll('.sidebar-ts-btn').forEach((el) => el.remove());

    const sorted = [...new Set(timestamps)].sort((a, b) => a - b);

    sorted.forEach((sec) => {
      const btn = document.createElement('button');
      btn.className = 'sidebar-ts-btn';
      btn.dataset.seconds = String(sec);
      btn.textContent = secondsToTimestamp(sec);
      btn.addEventListener('click', () => this.selectTimestamp(sec));
      this.listEl.appendChild(btn);
    });

    // 이전 선택 상태 복원
    this.updateHighlight();
  }

  // ── 타임스탬프 선택 ───────────────────────────────────────

  selectTimestamp(seconds: number | null): void {
    this.selectedSeconds = seconds;
    this.updateHighlight();
    this.onSelect(seconds);
  }

  private updateHighlight(): void {
    // ALL 버튼
    this.allBtn.classList.toggle('sidebar-btn-active', this.selectedSeconds === null);

    // 타임스탬프 버튼
    this.listEl.querySelectorAll<HTMLElement>('.sidebar-ts-btn').forEach((btn) => {
      const sec = Number(btn.dataset.seconds);
      btn.classList.toggle('sidebar-btn-active', sec === this.selectedSeconds);
    });
  }

  // ── 접기 / 펼치기 ─────────────────────────────────────────

  private toggle(): void {
    const isCollapsed = this.sidebar.classList.contains('sidebar-collapsed');
    if (isCollapsed) {
      this.sidebar.classList.remove('sidebar-collapsed');
    } else {
      this.sidebar.classList.add('sidebar-collapsed');
    }
  }

  private createObserver(): MutationObserver {
    return new MutationObserver(() => {
      const isCollapsed = this.sidebar.classList.contains('sidebar-collapsed');
      this.expander.style.display = isCollapsed ? 'flex' : 'none';
    });
  }

  // ── 이벤트 바인딩 ─────────────────────────────────────────

  private bindEvents(): void {
    // ALL 버튼
    this.allBtn.addEventListener('click', () => this.selectTimestamp(null));

    // 접기 버튼 (사이드바 내부)
    const collapseBtn = this.sidebar.querySelector<HTMLElement>('#sidebar-collapse-btn');
    collapseBtn?.addEventListener('click', () => this.toggle());

    // 펼치기 버튼 (사이드바 외부)
    this.expander.addEventListener('click', () => this.toggle());

    // MutationObserver 시작
    this.observer.observe(this.sidebar, { attributes: true, attributeFilter: ['class'] });
  }

  destroy(): void {
    this.observer.disconnect();
  }
}
