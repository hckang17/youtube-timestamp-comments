![](./docs/resources/og.png)

<div align="center">

# YouTube Timestamp Comments ![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

[English](https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README.md) | [한국어](https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README-ko_kr.md) | [日本語](https://github.com/kjungw1025/youtube-timestamp-comments/tree/main/README.ja_jp.md) | 简体中文

</div>

---

为了找到特定时间戳区间的评论反应，反复滚动页面实在不方便。

为了解决这一不便，我制作了一个简单的基于YouTube时间戳的评论浏览Chrome扩展程序。

主要功能
- 基于时间戳的评论列表查看
- 按最新或最热对时间戳排序
- 跳转到特定时间戳
- 查看特定时间戳的评论详情

## Highlights

---

<table>
    <tr>
       <th width="33%">
          <p><a title="view-comment-list"></a> 基于时间戳的评论列表查看
          <p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/comment-list-en.gif">
       <th width="33%">
          <p><a title="view-detailed-comments"></a> 查看特定时间戳的评论详情
          <p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/comment-search-detail-en.gif">
       <th width="33%">
          <p><a title="jump-to-a-specific-timestamp"></a> 跳转到特定时间戳
          <p><img src="https://chrome-extension-youtube-timestamp-comments.s3.ap-northeast-2.amazonaws.com/move-timestamp-en.gif">

</table>


## API Key Setup

---

使用此扩展程序需要YouTube Data API的API密钥。请按照以下步骤创建并配置。API密钥可免费创建和使用。

> [每个API密钥每天最多可查询1,000,000条YouTube视频评论。](https://developers.google.com/youtube/v3/determine_quota_cost?hl=zh-cn)

### 1. 创建项目
1. 前往 https://console.cloud.google.com/projectcreate

   - 创建项目需要Google账号。
   - 点击上方链接时若出现登录页面，请使用Google账号登录。


2. 设置`项目名称`、`父级资源`后点击`创建`

    <img width="400px" src="docs/resources/create-project-zh_hans.png">

### 2. 启用YouTube Data API

1. 前往 https://console.cloud.google.com/apis/library/youtube.googleapis.com


2. 点击YouTube Data API的`管理`

    <img width="400px" src="docs/resources/youtube-timestamp-comments-enable-zh_hans.png">


### 3. 创建API密钥

1. 前往 https://console.cloud.google.com/apis/credentials


2. 点击`创建凭证`，再点击`API 密钥`

    <img width="500px" src="docs/resources/create-api-key1-zh_hans.png">


3. 在`API 限制`中点击`限制密钥`，在过滤器中选择`YouTube Data API v3`后点击`创建`

   | API 限制 1                                                              | API 限制 2                                                              |
   |-----------------------------------------------------------------|-----------------------------------------------------------------|
   | <img width="400px" src="docs/resources/create-api-key2-zh_hans.png"> | <img width="400px" src="docs/resources/create-api-key3-zh_hans.png"> |


### 4. 复制API密钥并粘贴到Chrome扩展程序

1. 复制API密钥

    <img width="350px" src="docs/resources/copy-api-key-zh_hans.png">


2. 打开Chrome浏览器，访问YouTube网站，打开Chrome扩展程序并粘贴API密钥

    <img width="350px" src="docs/resources/paste-api-key-zh_hans.png">
