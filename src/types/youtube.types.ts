// YouTube Data API v3 응답 타입 정의

export interface YouTubeListResponse<T> {
  kind: string;
  etag: string;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: T[];
}

export interface CommentSnippet {
  authorDisplayName: string;
  authorProfileImageUrl: string;
  authorChannelUrl: string;
  textDisplay: string;
  textOriginal: string;
  likeCount: number;
  publishedAt: string;
  updatedAt: string;
  parentId?: string;
}

export interface Comment {
  kind: 'youtube#comment';
  etag: string;
  id: string;
  snippet: CommentSnippet;
}

export interface CommentThreadSnippet {
  videoId: string;
  topLevelComment: Comment;
  canReply: boolean;
  totalReplyCount: number;
  isPublic: boolean;
}

export interface CommentThreadReplies {
  comments: Comment[];
}

export interface CommentThread {
  kind: 'youtube#commentThread';
  etag: string;
  id: string;
  snippet: CommentThreadSnippet;
  replies?: CommentThreadReplies;
}

export type CommentOrder = 'relevance' | 'time';
