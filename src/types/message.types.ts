// Background <-> Popup 메시지 타입 정의

import type { CommentOrder, CommentThread, Comment } from './youtube.types';

export enum MessageType {
export enum MessageType {
  FETCH_COMMENTS = 'FETCH_COMMENTS',
  FETCH_REPLIES = 'FETCH_REPLIES',
  GET_VIDEO_ID = 'GET_VIDEO_ID',
  ERROR = 'ERROR',
}

// ── 요청 타입 ──────────────────────────────────────────────

export interface FetchCommentsRequest {
  type: MessageType.FETCH_COMMENTS;
  payload: {
    videoId: string;
    order: CommentOrder;
    pageToken?: string;
  };
}

export interface FetchRepliesRequest {
  type: MessageType.FETCH_REPLIES;
  payload: {
    parentId: string;
  };
}

export interface GetVideoIdRequest {
  type: MessageType.GET_VIDEO_ID;
}

export type RequestMessage =
  | FetchCommentsRequest
  | FetchRepliesRequest
  | GetVideoIdRequest;

// ── 응답 타입 ──────────────────────────────────────────────

export interface FetchCommentsResponse {
  type: MessageType.FETCH_COMMENTS;
  payload: {
    items: CommentThread[];
    nextPageToken?: string;
  };
}

export interface FetchRepliesResponse {
  type: MessageType.FETCH_REPLIES;
  payload: {
    items: Comment[];
  };
}

export interface GetVideoIdResponse {
  type: MessageType.GET_VIDEO_ID;
  payload: {
    videoId: string | null;
  };
}

export interface ErrorResponse {
  type: MessageType.ERROR;
  error: string;
  code?: number;
}

export type ResponseMessage =
  | FetchCommentsResponse
  | FetchRepliesResponse
  | GetVideoIdResponse
  | ErrorResponse;
