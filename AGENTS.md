# Esteliel Blog 协作说明

## 适用范围

- 本文件适用于 `blog/` 仓库中的全部内容。
- 这是一个独立的 Git 仓库。只在本仓库内检查状态、构建和提交，不联动修改相邻仓库，除非用户明确要求。
- 开始修改前先阅读 `README.md`、`_config.yml` 和与任务直接相关的页面、布局或文章，并用 `git status --short` 检查现有改动。

## 技术栈与部署

- 本站是部署在 GitHub Pages 上的 Jekyll 博客，内容使用 Markdown，模板使用 Liquid/HTML。
- Markdown 引擎为 kramdown，代码高亮使用 Rouge，站点时区为 `Asia/Shanghai`。
- 站点地址由 `_config.yml` 中的 `url` 与 `baseurl` 共同决定；当前部署前缀是 `/blog`。
- 推送到 `main` 后，`.github/workflows/jekyll-gh-pages.yml` 负责构建 `_site/` 并部署。以实际工作流文件为准。
- 仓库当前没有 `Gemfile` 或本地依赖锁定。不要为了普通内容或样式修改擅自引入 Ruby、Node 或其他依赖。

## 目录职责

- `_posts/`：博客文章，文件名为 `YYYY-MM-DD-slug.md`。
- `_layouts/default.html`：全站 HTML 外壳、导航、元数据和公共资源入口。
- `_layouts/post.html`：文章页结构、分类标签、正文和目录容器。
- `index.html`：首页文章列表和筛选入口。
- `categories/`、`tags/`：分类与标签筛选页。
- `assets/css/`：品牌公共样式和博客专属样式。
- `assets/js/`：导航状态、分类标签筛选、文章目录、代码复制和装饰动画。
- `feed.xml`：Atom 订阅源，目前最多输出 20 篇文章。

## 文章约定

- 新文章放入 `_posts/`，文件名日期应与 front matter 中的发布日期一致，slug 使用稳定、可读的英文短横线格式。
- 沿用现有 front matter 结构：

```yaml
---
layout: post
title: "文章标题"
date: 2026-09-12 12:00:00 +0800
author: moea
slug: article-slug
description: "简洁、可独立展示的文章摘要。"
categories: [开发工具]
tags: [示例, 教程]
---
```

- `categories` 只放少量较宽的主题，`tags` 用于更细的关键词；避免仅因大小写或同义词产生重复项。
- 标题层级从正文的 `##` 开始，保持结构连续，以便 `assets/js/post.js` 正确生成 `h2`/`h3` 目录。
- 代码块标注准确的语言类型。命令、配置和版本号应能够从上下文判断适用平台与版本。
- 如需手工控制摘要，在合适位置使用 `_config.yml` 定义的 `<!--more-->`；否则确保开头内容适合作为自动摘要。
- 教程中的 token、密码、私有地址和其他凭据必须使用明显的占位值，不得提交真实秘密。

## 模板、链接与静态资源

- 本站资源和博客内部链接优先通过 Liquid 的 `relative_url` 过滤器生成，避免硬编码部署根路径。
- 指向主站等跨站入口时使用 `site.url`；不要重复拼接 `/blog`。
- 修改 canonical、Open Graph 或 RSS 地址时，同时核对 `url`、`baseurl` 和最终绝对地址。
- 分类和标签链接使用 `?name=` 查询参数；修改相关模板或脚本时保持首页、分类页和标签页行为一致。
- `assets/css/brand.css` 与主站、提示词仓库中的同名文件共享视觉规范。修改前先确认影响；本任务未包含其他仓库时，不要静默修改相邻仓库，只需在交付中说明同步需求。
- 保留动画对 `prefers-reduced-motion` 的支持，并避免破坏键盘操作、可读焦点和移动端布局。

## 验证

- 优先运行与改动直接相关的最小检查。若本机已安装 Jekyll，可执行：

```powershell
jekyll build --source . --destination _site
jekyll serve --source . --destination _site --baseurl /blog
```

- 仓库没有固定本地 Jekyll 版本；无法本地构建时，应明确说明，并以 GitHub Actions 的实际构建结果为最终依据。
- 修改 JavaScript 后至少运行对应文件的语法检查，例如：

```powershell
node --check assets/js/blog.js
node --check assets/js/fish.js
node --check assets/js/post.js
node --check assets/js/taxonomy.js
```

- 修改内容、模板或 URL 逻辑后，按影响范围人工检查：首页、文章页、分类页、标签页和 `feed.xml`。
- 预览时重点确认 `/blog/` 前缀、分类/标签筛选、文章目录、代码复制按钮、移动端导航以及 RSS/canonical 地址。
- `_site/`、`.jekyll-cache/`、`.sass-cache/`、`.bundle/`、`vendor/` 和 `Gemfile.lock` 是忽略项，不要作为站点源码提交。

## 交付约定

- 保持改动聚焦，保留用户已有的无关修改。
- 只有用户明确要求时才执行提交、推送或部署。
- 交付时简要说明修改内容、已运行的检查、无法执行的验证，以及 `brand.css` 等跨仓库资源是否需要后续同步。
