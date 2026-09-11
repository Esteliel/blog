# Esteliel Blog

基于 Jekyll 的 Markdown 博客，部署到 GitHub Pages 的 `/blog/` 路径。

## 公共视觉

`assets/css/brand.css` 与主站、提示词仓库中的同名文件保持一致，统一配色、字体、
品牌和全站导航；各仓库保留本地副本以支持独立部署。博客的文章、分类、标签和
RSS 入口位于第二行。本站资源和链接使用 `relative_url`，跨站入口使用 `_config.yml`
中的 `url` 作为主站域名，不能将博客的 `/blog` 前缀重复加到跨站地址上。

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
