---
layout: post
title: "Linux 部署 frps + Windows 部署 frpc：内网服务穿透教程"
date: 2026-09-08 12:00:00 +0800
author: moea
slug: frp-linux-frps-windows-frpc
description: "使用 Linux 公网服务器运行 frps，并在 Windows 内网机器运行 frpc，将本地服务安全地映射到公网。"
categories: [开发工具]
tags: [frp, linux, windows, 内网穿透]
---

frp（Fast Reverse Proxy）适合把没有公网 IP 的 Windows 机器上的服务，通过一台有公网 IP 的 Linux 服务器转发出去：

- Linux 公网服务器运行 **frps**，负责监听客户端连接和公网端口。
- Windows 内网机器运行 **frpc**，主动连接 Linux 服务器并转发本地服务。
- 本文用一个本地 HTTP 服务演示：`Windows 127.0.0.1:8080` → `Linux 公网服务器:18080`。

frp 官方目前推荐使用 TOML、YAML 或 JSON 配置文件，旧版 INI 已不再推荐。本文使用 TOML 配置。

## 一、准备工作

需要准备：

1. 一台有公网 IPv4 地址的 Linux 服务器，以下命令以 Debian/Ubuntu 为例。
2. 一台可以访问互联网的 Windows 电脑，电脑上的目标服务监听在本机端口。
3. Linux 防火墙和云服务器安全组放行 TCP `7000`、`18080`。
4. Linux 和 Windows 使用相同版本的 frp。下面的命令以 `v0.71.0` 为例，实际下载时请以 [frp Releases](https://github.com/fatedier/frp/releases) 中的版本为准。

端口用途如下：

| 端口 | 作用 |
| --- | --- |
| `7000/tcp` | frpc 与 frps 的控制连接 |
| `18080/tcp` | 示例服务的公网访问端口 |
| Windows `8080/tcp` | Windows 本地服务端口，只在本机监听 |

> 示例 token、IP 和端口都需要替换成自己的值。不要把真实 token 提交到公开仓库。

## 二、Linux 部署 frps

### 1. 下载并安装 frps

在 Linux 服务器上执行：

```bash
FRP_VERSION=0.71.0
cd /tmp
wget https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/frp_${FRP_VERSION}_linux_amd64.tar.gz
tar -xzf frp_${FRP_VERSION}_linux_amd64.tar.gz

sudo install -d -m 0755 /opt/frp /etc/frp
sudo install -m 0755 frp_${FRP_VERSION}_linux_amd64/frps /opt/frp/frps
sudo useradd --system --no-create-home --shell /usr/sbin/nologin frp 2>/dev/null || true
```

如果服务器是 ARM 或其他架构，请在 Releases 页面下载对应压缩包，不要直接使用 `linux_amd64` 文件。

### 2. 编写 frps.toml

创建 `/etc/frp/frps.toml`：

```bash
sudo tee /etc/frp/frps.toml > /dev/null <<'EOF'
bindAddr = "0.0.0.0"
bindPort = 7000

auth.method = "token"
auth.token = "replace-with-a-long-random-token"

# 只允许本教程用到的公网端口，减少误开放端口的风险
allowPorts = [{ single = 18080 }]
EOF

sudo chown root:frp /etc/frp/frps.toml
sudo chmod 0640 /etc/frp/frps.toml
```

生成随机 token 的一种方式：

```bash
openssl rand -hex 32
```

把输出结果同时填入 Linux 的 `auth.token` 和 Windows 的 `auth.token`。两端必须完全一致。

### 3. 配置 Linux 防火墙和云安全组

如果服务器使用 UFW：

```bash
sudo ufw allow 7000/tcp
sudo ufw allow 18080/tcp
sudo ufw status
```

如果使用 firewalld：

```bash
sudo firewall-cmd --permanent --add-port=7000/tcp
sudo firewall-cmd --permanent --add-port=18080/tcp
sudo firewall-cmd --reload
```

云厂商控制台中的安全组也要放行这两个 TCP 端口，否则系统防火墙配置正确也无法从公网访问。

### 4. 先校验并手动启动

```bash
sudo /opt/frp/frps verify -c /etc/frp/frps.toml
sudo /opt/frp/frps -c /etc/frp/frps.toml
```

看到服务开始监听后，可以按 `Ctrl+C` 停止。校验无误后再交给 systemd 管理。

### 5. 使用 systemd 常驻运行

创建 `/etc/systemd/system/frps.service`：

```ini
[Unit]
Description=frp server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=frp
Group=frp
ExecStart=/opt/frp/frps -c /etc/frp/frps.toml
Restart=on-failure
RestartSec=5s
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
```

加载并启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now frps
sudo systemctl status frps
```

查看实时日志：

```bash
sudo journalctl -u frps -f
```

## 三、Windows 部署 frpc

### 1. 下载并解压

从 [frp Releases](https://github.com/fatedier/frp/releases) 下载与 Linux 相同版本的 `windows_amd64` 压缩包，解压到例如：

```text
C:\frp
```

目录中至少需要有：

```text
C:\frp\frpc.exe
C:\frp\frpc.toml
```

### 2. 编写 frpc.toml

创建 `C:\frp\frpc.toml`，把 `serverAddr` 换成 Linux 服务器公网 IP，把 token 换成与 frps 相同的值：

```toml
serverAddr = "203.0.113.10"
serverPort = 7000

auth.method = "token"
auth.token = "replace-with-a-long-random-token"

[[proxies]]
name = "windows-http"
type = "tcp"
localIP = "127.0.0.1"
localPort = 8080
remotePort = 18080
```

配置含义：

- `serverAddr`：Linux 服务器公网 IP 或域名。
- `serverPort`：frps 的控制端口，必须与 `bindPort` 一致。
- `localIP`、`localPort`：Windows 上实际服务的监听地址和端口。
- `remotePort`：外部访问 Linux 服务器时使用的端口。

### 3. 校验并启动 frpc

在 PowerShell 中执行：

```powershell
Set-Location C:\frp
.\frpc.exe verify -c .\frpc.toml
.\frpc.exe -c .\frpc.toml
```

命令窗口保持运行时，frpc 会持续连接 frps。第一次配置建议先以前台方式运行，确认日志中出现连接成功、代理启动等信息后，再设置开机启动。

### 4. 设置 Windows 开机启动

可以使用任务计划程序，不需要额外安装服务管理器：

1. 按 `Win + R`，输入 `taskschd.msc`。
2. 选择“创建任务”，名称填写 `frpc`。
3. “触发器”选择“启动时”。
4. “操作”选择“启动程序”：
   - 程序：`C:\frp\frpc.exe`
   - 参数：`-c C:\frp\frpc.toml`
   - 起始于：`C:\frp`
5. 在“常规”中选择“无论用户是否登录都要运行”，保存后按需输入 Windows 凭据。

如果 Windows 上的本地服务只在用户登录后启动，任务计划程序和目标服务的启动顺序也要相应调整。

## 四、验证穿透是否成功

先在 Windows 上启动一个临时 HTTP 服务，确认它监听 `127.0.0.1:8080`：

```powershell
Set-Location C:\
py -m http.server 8080 --bind 127.0.0.1
```

然后在任意能访问 Linux 服务器的设备上打开：

```text
http://203.0.113.10:18080
```

如果能看到 Windows 当前目录的文件列表，说明链路已经打通：

```text
浏览器 → Linux:18080 → frps/frpc → Windows:8080
```

验证完成后可以把 `py -m http.server` 停掉，换成自己的 Web 服务，并同步修改 `localPort`。

## 五、常见问题排查

### 1. frpc 连接不上 frps

依次检查：

- `serverAddr` 是否填写了 Linux 公网 IP，而不是 `127.0.0.1`。
- Linux 云安全组和系统防火墙是否都放行 TCP `7000`。
- 两端 `serverPort`、token 是否完全一致。
- Linux 服务状态和日志：

  ```bash
  sudo systemctl status frps
  sudo journalctl -u frps -n 100 --no-pager
  ```

### 2. frpc 已连接，但公网端口访问失败

- 检查 Windows 本地服务是否真的监听 `127.0.0.1:8080`。
- 确认 `remotePort = 18080` 没有被其他程序占用。
- 确认 Linux 防火墙和云安全组放行 TCP `18080`。
- 查看 frpc 前台日志，确认代理没有因为端口或配置错误而退出。

### 3. 修改配置后没有生效

配置修改后先重新执行 `verify`，然后重启对应端：

```bash
sudo systemctl restart frps
```

Windows 端则停止当前 frpc 进程，再重新运行：

```powershell
Set-Location C:\frp
.\frpc.exe -c .\frpc.toml
```

### 4. 不要直接暴露高风险服务

不要把 Windows 的 SMB、数据库、远程桌面等服务直接映射到公网，除非已经配置了严格的访问控制、强认证和额外的安全措施。对管理类服务，优先使用 VPN、SSH 隧道或限制来源 IP；示例中的 `18080` 只用于演示 HTTP 服务。

## 六、配置修改清单

以后要映射其他 Windows 服务，通常只需要修改 `frpc.toml` 中的这几项：

```toml
[[proxies]]
name = "my-service"
type = "tcp"
localIP = "127.0.0.1"
localPort = 9000
remotePort = 19000
```

同时在 Linux 的 `frps.toml` 中把 `allowPorts` 改成允许的公网端口，例如：

```toml
allowPorts = [{ single = 19000 }]
```

修改后重新校验并重启服务即可。

## 参考资料

- [frp 官方安装与部署文档](https://gofrp.org/en/docs/setup/)
- [frp 官方配置文件说明](https://gofrp.org/en/docs/features/common/configure/)
- [frp 官方 systemd 示例](https://gofrp.org/en/docs/setup/systemd/)
- [frp GitHub Releases](https://github.com/fatedier/frp/releases)
