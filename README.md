![](./docs/resources/og.png)

<div align="center">

# YouTube Timestamp Comments ![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

English | [한국어](https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README-ko_kr.md) | [日本語](https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README-ja_jp.md) | [简体中文](https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README-zh_hans.md)

</div>

---

It was inconvenient to repeatedly scroll through comments to find reactions for a specific timestamp range.

To solve this inconvenience, I built a simple Chrome extension for browsing YouTube comments by timestamp.

Through this, you can quickly explore various reactions from other users and enjoy YouTube in a more immersive way.

Key Features
- View comment list based on timestamps
- Sort timestamps by latest or most popular
- Jump to a specific timestamp in the video
- View detailed comments for a specific timestamp

## Highlights

---

<table>
    <tr>
       <th width="33%">
          <p><a title="view-comment-list"></a> View comment list based on timestamps
          <p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/comment-list-en.gif">
       <th width="33%">
          <p><a title="view-detailed-comments"></a> View detailed comments for a specific timestamp
          <p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/comment-search-detail-en.gif">
       <th width="33%">
          <p><a title="jump-to-a-specific-timestamp"></a> Jump to a specific timestamp in the video
          <p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/move-timestamp-en.gif">

</table>


## API Key Setup

---

To use this extension, you need an API key for the YouTube Data API. Follow the steps below to create and configure one. The API key is free to create and use.

> [Each API key can retrieve up to 1,000,000 YouTube video comments per day.](https://developers.google.com/youtube/v3/determine_quota_cost)

### 1. Create a Project
1. Go to https://console.cloud.google.com/projectcreate

   - A Google account is required to create a project.
   - If a login page appears when clicking the link above, sign in with your Google account.


2. Set `Project name` and `Location`, then click `Create`

    <img width="400px" src="docs/resources/create-project-en.png">

### 2. Enable YouTube Data API

1. Go to https://console.cloud.google.com/apis/library/youtube.googleapis.com


2. Click `Enable` for the YouTube Data API

    <img width="400px" src="docs/resources/youtube-timestamp-comments-enable-en.png">


### 3. Create an API Key

1. Go to https://console.cloud.google.com/apis/credentials


2. Click `Create Credentials`, then click `API Key`

    <img width="500px" src="docs/resources/create-api-key1-en.png">


3. Under `API restrictions`, click `Restrict key`, select `YouTube Data API v3` from the filter, then click `Create`

   | API Restrictions 1                                                  | API Restrictions 2                                                  |
   |-----------------------------------------------------------------|-----------------------------------------------------------------|
   | <img width="400px" src="docs/resources/create-api-key2-en.png"> | <img width="400px" src="docs/resources/create-api-key3-en.png"> |


### 4. Copy the API Key and Paste it into the Chrome Extension

1. Copy the API Key

    <img width="350px" src="docs/resources/copy-api-key-en.png">


2. Open Chrome, go to YouTube, open the Chrome extension, and paste the API Key

    <img width="350px" src="docs/resources/paste-api-key-en.png">
