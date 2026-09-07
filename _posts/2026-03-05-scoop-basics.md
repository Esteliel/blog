---
title: "scoop使用"
date: 2026-03-05 11:50:40
author: moea
layout: post
slug: scoop-basics
categories: [开发工具]
tags: [scoop]
description: "scoop使用 # scoop安装应用"
---

# 安装scoop
打开Windows自带的powershell，输入如下命令自定义安装位置(D:\Scoop更改为你需要安装的目录)
![Scoop 安装示意图](https://cdn.jsdelivr.net/gh/nudoo/nudoo.github.io@master/gallery/imgs/5.jpg)
```bash
$env:SCOOP='D:\Scoop'
[Environment]::SetEnvironmentVariable('SCOOP', $env:SCOOP, 'User')
```
设置允许 PowerShell 执行本地脚本
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
安装 Scoop(需要开代理工具)
```bash
iwr -useb get.scoop.sh | iex
```
设置代理
```bash
scoop config proxy 127.0.0.1:7890
```

# 常用命令
scoop + 命令 + 参数

search——搜索仓库中是否有相应软件
install——安装相应软件，注意：在安装完软件后，有的软件（如vscode、python等）可能会弹出一些提示，让你执行命令后可以关联文件类型、允许其他程序调用等，根据自身需求执行命令即可，但一般都推荐执行提示中的命令
uninstall——卸载相应软件
update——更新软件，可通过scoop update -a更新所有已安装软件
hold——锁定软件阻止其更新 更多命令使用帮助可使用scoop -h来查看

scoop list —— 查看使用scoop安装的软件

# 迁移：

```bash
# 先在旧电脑导出
scoop export > D:\Download\installed_apps.txt
# 复制文件到新电脑
scoop import < D:\Download\installed_apps.txt
```

添加常用仓库
```bash
scoop bucket add extras versions
```
软件推荐
