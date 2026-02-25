![](./docs/resources/og.png)

<div align="center">

# YouTube Timestamp Comments ![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

[English]((https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README.md)) | [한국어](https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README-ko_kr.md) | 日本語 | [简体中文](https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README-zh_hans.md)

</div>

---

特定のタイムスタンプ区間に対するコメントの反応を探すために、繰り返しスクロールするのが不便でした。

この不便さを解消するために、シンプルなYouTubeタイムスタンプベースのコメント閲覧Chrome拡張機能を制作しました。

主な機能
- タイムスタンプベースのコメント一覧表示
- 最新順／人気順でタイムスタンプを並べ替え
- 特定のタイムスタンプへ動画を移動
- 特定のタイムスタンプに対するコメントの詳細表示

## Highlights

---

<table>
    <tr>
       <th width="33%">
          <p><a title="show-whitespace"></a> タイムスタンプベースのコメント一覧表示
          <p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/comment-list-en.gif">
       <th width="33%">
          <p><a title="unreleased-commits"></a> 特定のタイムスタンプに対するコメントの詳細表示
          <p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/comment-search-detail-en.gif">
       <th width="33%">
          <p><a title="pr-base-commit"></a> 特定のタイムスタンプへ動画を移動
          <p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/move-timestamp-en.gif">

</table>


## API Key Setup

---

この拡張機能を使用するには、YouTube Data API用のAPIキーが必要です。以下の手順に従って作成・設定してください。APIキーは無料で作成・使用できます。

> [各APIキーは1日あたり最大1,000,000件のYouTube動画コメントを取得できます。](https://developers.google.com/youtube/v3/determine_quota_cost?hl=ja)

### 1. プロジェクトの作成
1. https://console.cloud.google.com/projectcreate へ移動

   - プロジェクトを作成するにはGoogleアカウントが必要です。
   - 上記リンクをクリックしてログインページが表示された場合は、Googleアカウントでログインしてください。


2. `プロジェクト名`, `親リソース`を設定して`作成`をクリック

    <img width="400px" src="docs/resources/create-project-jp.png">

### 2. YouTube Data APIの有効化

1. https://console.cloud.google.com/apis/library/youtube.googleapis.com へ移動


2. YouTube Data APIの`有効にする`をクリック

    <img width="400px" src="docs/resources/youtube-timestamp-comments-enable-jp.png">


### 3. APIキーの作成

1. https://console.cloud.google.com/apis/credentials へ移動


2. `認証情報を作成`をクリックし、`API キー`をクリック

    <img width="500px" src="docs/resources/create-api-key1-jp.png">


3. `API の制限`で`キーを制限`をクリックし、フィルターで`YouTube Data API v3`を選択して`作成`をクリック

   | API の制限 1                                                        | API の制限 2                                                        |
          |-----------------------------------------------------------------|-----------------------------------------------------------------|
   | <img width="400px" src="docs/resources/create-api-key2-jp.png"> | <img width="400px" src="docs/resources/create-api-key3-jp.png"> |


### 4. APIキーのコピーとChrome拡張機能への貼り付け

1. APIキーをコピー

    <img width="350px" src="docs/resources/copy-api-key-jp.png">


2. Chromeブラウザを開いてYouTubeにアクセスし、Chrome拡張機能を開いてAPIキーを貼り付け

    <img width="350px" src="docs/resources/paste-api-key-jp.png">
