---
layout: post
title: "Windows 全新装机指南（Scoop 版）"
date: 2026-03-05 00:54:44 +0800
author: moea
slug: windows-setup-scoop
description: "Windows 全新装机指南"
categories: [开发工具]
tags: [scoop, git, clash]
---

# Windows 全新装机指南（Scoop 版）

![Windows 装机示意图](https://cdn.jsdelivr.net/gh/nudoo/nudoo.github.io@master/gallery/imgs/9.jpg)

> 目标：从零开始，搭建一套干净、可维护、可复现的 Windows 开发环境。

---

## 目录
- [第一阶段：安装系统与驱动](#第一阶段安装系统与驱动)
- [第二阶段：配置网络与代理](#第二阶段配置网络与代理)
- [第三阶段：安装与配置 Scoop](#第三阶段安装与配置-scoop)
- [第四阶段：使用 Scoop 批量安装软件](#第四阶段使用-scoop-批量安装软件)
- [第五阶段：个性化与环境验证](#第五阶段个性化与环境验证)

---

## 第一阶段：安装系统与驱动
> 基石步骤，务必保证系统纯净、驱动完备。

### 1. 安装系统
- 用微软官方 [Media Creation Tool](https://www.microsoft.com/software-download) 制作启动盘。
- 安装时直接选择 **Windows 11/10 专业版**，可省去后续升级步骤。
- 若已误装家庭版，可在 `设置 → 更新和安全 → 激活 → 更改产品密钥` 输入专业版密钥，在线升级无需重装。
- 使用管理员运行cmd:
```cmd
slmgr /ipk TPYNC-4J6KF-4B4GP-2HD89-7XMP6 
slmgr /ipk VK7JG-NPHTM-C97JM-9MPGT-3V66T
slmgr /ipk W269N-WFGWX-YVC9B-4J6C9-T83GX
slmgr /skms kms.03k.org
slmgr /ato
```

### 2. 安装硬件驱动
1. 先让 **Windows Update** 自动打完驱动补丁。
2. 再去品牌官网（Dell、联想、华硕、微星…）或主板官网，手动补齐关键驱动：
  - 芯片组
  - 显卡
  - 声卡
  - 网卡 / Wi‑Fi / 蓝牙
  - BIOS（如有必要）

---

## 第二阶段：配置网络与代理
> 保证后续能从 GitHub 等源顺畅拉取资源。

### 1. 安装 Clash
1. 下载 [Clash Verge Rev 最新 release](https://github.com/clash-verge-rev/clash-verge-rev/releases)，安装到任意目录。
2. 运行 Clash Verge Rev → 导入或订阅节点 → 点击 **启用系统代理**。
3. 验证：浏览器打开 <https://google.com>，能正常加载即成功。

### 2. 记录本地监听端口
- Clash 常见默认端口为 HTTP `127.0.0.1:7890`、SOCKS5 `127.0.0.1:7891`。本文后续 Scoop 使用 HTTP 端口 `7890`，如本地配置不同请按实际端口修改。

---

## 第三阶段：安装与配置 Scoop
> Scoop 是 Windows 下的「Homebrew」，轻量、无管理员权限、可装多版本。

### 1. 准备工作（以普通用户打开 PowerShell）

```powershell
# 可选：自定义安装目录（示例 D:\Scoop）
$env:SCOOP='D:\Scoop'
[Environment]::SetEnvironmentVariable('SCOOP', $env:SCOOP, 'User')

# 允许执行远程签名脚本
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. 安装 Scoop

```powershell
irm get.scoop.sh | iex
# 若因网络失败，可换国内源：
irm https://gitee.com/glsnames/scoop-installer/raw/master/bin/install.ps1 | iex
```

### 3. 配置代理（关键）
安装完成后立即执行（端口与 Clash 的 HTTP 端口保持一致）：

```powershell
scoop config proxy 127.0.0.1:7890
```

---

## 第四阶段：使用 Scoop 批量安装软件
一条命令可同时装多个包，Scoop 自动处理依赖。

### 1. 添加官方 buckets

```powershell
scoop bucket add extras        # 图形界面软件
scoop bucket add versions      # 多版本软件
scoop bucket add nerd-fonts    # 编程字体
```

### 2. 安装核心开发套件

```powershell
scoop install git python310 python312 vscode
```

多版本 Python 切换示例：

```powershell
scoop reset python310   # 切到 3.10
scoop reset python312   # 切到 3.12
```

### 3. 推荐额外工具（可选但强烈建议）

```powershell
scoop install 7zip gow everything sudo oh-my-posh
```

- `gow`：GNU on Windows，常用 Linux 命令行工具集。
- `everything`：秒级文件索引。
- `sudo`：在普通 PowerShell 临时提权。
- `oh-my-posh`：高颜值提示符主题，配合 Nerd Font 使用更佳。

---

## 第五阶段：个性化与环境验证

### 1. 验证安装
在新开的 PowerShell 中运行：

```powershell
git --version
python --version
code --version
```

如均返回版本号即成功。

### 2. VSCode 快捷入口
在任意目录下运行：

```powershell
code .
```

### 3. 配置 Git 身份（必须）

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```
# 配置 Git 代理
```bash
# socks5协议，Clash常见默认监听7891端口
$ git config --global http.proxy socks5://127.0.0.1:7891
$ git config --global https.proxy socks5://127.0.0.1:7891
# http协议，Clash常见默认监听7890端口
$ git config --global http.proxy http://127.0.0.1:7890
$ git config --global https.proxy http://127.0.0.1:7890
# 查看设置
$ git config -l
```


### 4. 可选：安装 Nerd Font

```powershell
  scoop install FiraCode-NF JetBrainsMono-NF
```

安装完成后，在终端设置中选择对应 Nerd Font，`oh-my-posh` 图标即可正常显示。

---

## 一键复盘（复制即用）

```powershell
# 0. 装好系统 → 驱动 → Clash 代理通畅

# 1. 安装 Scoop
Set-ExecutionPolicy RemoteSigned -CurrentUser -Force
irm get.scoop.sh | iex
scoop config proxy 127.0.0.1:7890

# 2. 加仓库 & 装软件
scoop bucket add extras versions nerd-fonts
scoop install git python310 python312 vscode 7zip gow everything sudo oh-my-posh

# 3. 配置 Git
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```

---

最后：如果你希望，我可以把上述脚本抽成一个可运行的 PowerShell 脚本文件，并提供一键执行说明。
