// 경량 클라이언트 사이드 라우터
// React Router의 MemoryRouter와 동일한 개념을 Vanilla TS로 구현

type Route = '/' | '/settings';
type RouteHandler = (route: Route) => void;

class Router {
  private current: Route = '/';
  private listeners: RouteHandler[] = [];

  navigate(route: Route): void {
    if (this.current === route) return;
    this.current = route;
    this.listeners.forEach((fn) => fn(route));
  }

  onRouteChange(fn: RouteHandler): void {
    this.listeners.push(fn);
  }

  getCurrentRoute(): Route {
    return this.current;
  }
}

// 싱글톤 인스턴스 — 앱 전체에서 공유
export const router = new Router();
