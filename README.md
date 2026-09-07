# Esteliel Blog

基于 Jekyll 的 Markdown 博客，部署到 GitHub Pages 的 `/blog/` 路径。

## 发布文章

在 `_posts/` 下创建 `YYYY-MM-DD-slug.md` 文件：

```yaml
---
layout: post
title: "文章标题"
date: 2026-09-07 20:00:00 +0800
categories: [生活]
tags: [随笔]
description: "文章摘要"
---

正文从这里开始。
```

`categories` 用于较少的主题分类，`tags` 用于更细的关键词。首页支持两者组合筛选，筛选条件会同步到 URL。

## 部署

推送到 `main` 后，`.github/workflows/pages.yml` 会自动构建并部署 GitHub Pages。
