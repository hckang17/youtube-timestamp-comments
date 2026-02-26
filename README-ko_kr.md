![](./docs/resources/og.png)

<div align="center">

# YouTube Timestamp Comments ![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

[English](https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README.md) | 한국어 | [日本語](https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README.ja_jp.md) | [简体中文](https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README-zh_hans.md)

</div>

---

특정 타임스탬프 구간에 대한 댓글 반응들을 찾기 위해 반복적으로 스크롤하는 점이 번거로웠습니다.

이 불편함을 해결하기 위해 간단한 YouTube 타임스탬프 기반 댓글 탐색 Chrome 확장 프로그램을 제작했습니다.

이를 통해 다른 사용자들의 다양한 반응을 빠르게 확인하고, 더욱 몰입감 있게 YouTube를 즐길 수 있습니다.

주요 기능
- 타임스탬프 기반의 댓글 리스트 조회
- 최신순/인기순으로 타임스탬프 정렬
- 특정 타임스탬프로 영상 이동
- 특정 타임스탬프에 대한 댓글 상세 조회

## Highlights

---

<table>
	<tr>
		<th width="33%">
			<p><a title="view-comment-list"></a> 타임스탬프 기반의 댓글 리스트 조회
			<p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/comment-list-kor.gif">
		<th width="33%">
			<p><a title="view-detailed-comments"></a> 특정 타임스탬프에 대한 댓글 상세 조회
			<p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/comment-search-detail-kor.gif">
		<th width="33%">
			<p><a title="jump-to-a-specific-timestamp"></a> 특정 타임스탬프로 영상 이동
			<p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/move-timestamp-kor.gif">

</table>


## API Key Setup

---

이 확장 프로그램을 사용하려면 YouTube Data API용 API 키가 필요합니다. 아래 단계를 따라 생성 및 설정하세요. API 키는 무료로 생성하고 사용할 수 있습니다.

> [각 API key는 하루에 최대 1,000,000개의 유튜브 영상 댓글을 조회할 수 있습니다.](https://developers.google.com/youtube/v3/determine_quota_cost?hl=ko)

### 1. 프로젝트 생성
1. https://console.cloud.google.com/projectcreate 로 이동

   - 프로젝트를 만들려면 Google 계정이 필요합니다.
   - 위 링크를 클릭할 때 로그인 페이지가 나타나면 구글 계정으로 로그인합니다.


2. `프로젝트 이름`, `상위 리소스`를 설정하여 `만들기` 클릭

    <img width="400px" src="docs/resources/create-project-kr.png">

### 2. YouTube Data API 사용

1. https://console.cloud.google.com/apis/library/youtube.googleapis.com 로 이동


2. YouTube Data API `사용` 클릭

    <img width="400px" src="docs/resources/youtube-timestamp-comments-enable-kr.png">


### 3. API Key 생성

1. https://console.cloud.google.com/apis/credentials 로 이동


2. `사용자 인증 정보 만들기` 클릭, `API 키` 클릭

    <img width="500px" src="docs/resources/create-api-key1-kr.png">


3. `API 제한사항`에서 `키 제한` 클릭, 필터에서 `YouTube Data API v3` 선택 후 `만들기` 클릭

    | API 제한사항 1                                                      | API 제한사항 2                                                      |
    |-----------------------------------------------------------------|-----------------------------------------------------------------|
    | <img width="400px" src="docs/resources/create-api-key2-kr.png"> | <img width="400px" src="docs/resources/create-api-key3-kr.png"> |


### 4. API Key 복사 및 크롬 확장 프로그램에 붙여넣기

1. API Key를 복사

    <img width="350px" src="docs/resources/copy-api-key-kr.png">


2. 크롬 브라우저를 열어서 YouTube 사이트에 접속 후, 크롬 확장 프로그램을 켜서 API Key를 붙여넣기

    <img width="350px" src="docs/resources/paste-api-key-kr.png">