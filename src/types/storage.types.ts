// Chrome Storage 타입 정의

export type Theme = 'light' | 'dark';

export type Language = 'en' | 'ko' | 'zh' | 'ja';

export interface StorageData {
  apiKey?: string;
  theme?: Theme;
  language?: Language;
}

export type StorageKey = keyof StorageData;
