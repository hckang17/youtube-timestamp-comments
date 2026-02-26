// chrome.storage 래퍼 유틸리티

import type { StorageData, StorageKey } from '../types/storage.types';

// ── chrome.storage.local ───────────────────────────────────

/**
 * chrome.storage.local에서 단일 키 값을 조회
 */
export function getStorage<K extends StorageKey>(
  key: K,
): Promise<StorageData[K]> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result[key] as StorageData[K]);
    });
  });
}

/**
 * chrome.storage.local에서 여러 키 값을 한 번에 조회
 */
export function getStorageMultiple<K extends StorageKey>(
  keys: K[],
): Promise<Pick<StorageData, K>> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result as Pick<StorageData, K>);
    });
  });
}

/**
 * chrome.storage.local에 값을 저장
 */
export function setStorage(data: Partial<StorageData>): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

/**
 * chrome.storage.local에서 단일 키 삭제
 */
export function removeStorage(key: StorageKey): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

// ── chrome.storage.session ────────────────────────────────
// 브라우저가 열려 있는 동안만 유지되는 세션 스토리지
// 팝업을 닫았다 열어도 데이터가 유지됨 (브라우저 종료 시 초기화)

/**
 * chrome.storage.session에서 값을 조회
 */
export async function getSessionStorage<T>(key: string): Promise<T | undefined> {
  const result = await chrome.storage.session.get(key);
  return result[key] as T | undefined;
}

/**
 * chrome.storage.session에 값을 저장
 */
export async function setSessionStorage(data: Record<string, unknown>): Promise<void> {
  await chrome.storage.session.set(data);
}

/**
 * chrome.storage.session에서 여러 키 값을 한 번에 조회
 */
export async function getSessionStorageMultiple<T extends Record<string, unknown>>(
  keys: string[],
): Promise<Partial<T>> {
  const result = await chrome.storage.session.get(keys);
  return result as Partial<T>;
}
