// chrome.storage.local 래퍼 유틸리티

import type { StorageData, StorageKey } from '../types/storage.types';

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
