# 服务器部署学习笔记

> 日期：2026-06-13

---

## 1. Docker Compose 端口机制

### 端口映射原理

`docker-compose.yml` 中 `ports` 的格式是 `"宿主机端口:容器内部端口"`：

```yaml
ports:
  - "8880:80"   # 外部访问 8880 → 容器内 80
```

- 容器之间通信走**容器内部端口**（Docker 内网）
- 外部访问走**宿主机端口**

### BlogWeb 项目的端口关系

```
用户 → 宿主机:FRONTEND_PORT → 容器 nginx:80 → 容器 backend:8080 → 容器 postgres:5432
```

- `FRONTEND_PORT`（默认 80）：对外 Web 入口，改 `.env` 即可
- `SERVER_PORT`（默认 8080）：Go 后端监听端口，**不建议改**，改它需要同步改 3 个文件
- `DB_PORT`（默认 5432）：只影响宿主机能否直连数据库，容器间不受影响

### 项目中发现的坑

`SERVER_PORT` 同时用于宿主机端口映射和容器内 Go 程序监听端口，导致改了之后 nginx 的 `proxy_pass` 仍然指向旧端口，服务会断。正确的做法是只改 `FRONTEND_PORT`，内部端口保持默认。

---

## 2. Docker 权限问题

```
permission denied while trying to connect to the docker API at unix:///var/run/docker.sock
```

当前用户不在 `docker` 组里：

```bash
sudo usermod -aG docker $USER
# 退出 SSH 重新登录后生效
```

---

## 3. Cloudflare Tunnel

### 解决了什么问题

服务器上多个 Docker 服务都想用 80 端口对外暴露 → 不可能。Cloudflare Tunnel 通过不同域名路由到不同本地端口，无需 nginx、无需操心端口冲突。

### 完整流程

**安装：**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
sudo install -m 755 cloudflared /usr/local/bin/cloudflared
```

**登录：**
```bash
cloudflared tunnel login
# 浏览器打开输出的链接，授权 Cloudflare
```

**创建隧道：**
```bash
cloudflared tunnel create blog
# 记住输出的隧道 ID，比如 6645991c-bde0-4209-9aff-44e1a141a0ee
```

**配置 config.yml：**
```yaml
tunnel: <隧道ID>
credentials-file: /home/用户名/.cloudflared/<隧道ID>.json
ingress:
  - hostname: blog.your-domain.com
    service: http://localhost:8880
  - hostname: app.your-domain.com
    service: http://localhost:80
  - service: http_status:404
```

**YAML 语法注意：**
- 顶层键（`tunnel`、`ingress`）要顶格写，不能有前导空格
- `hostname` 和 `service` 首字母要对齐在同一列
- 不要混入 Tab，用空格缩进
- 调试用 `cat -A file.yml` 检查隐藏字符，`python3 -c "import yaml; ..."` 验证语法

**DNS 路由：**
```bash
cloudflared tunnel route dns blog blog.your-domain.com
# 自动在 Cloudflare DNS 面板创建 CNAME 记录指向 <隧道ID>.cfargotunnel.com
```

**A 记录 vs CNAME 共存规则：**
- 同一个子域名不能同时有 A 和 CNAME
- 不同子域名互不影响（如 `blog.xxx.com` CNAME + `app.xxx.com` A 记录）

**装成系统服务：**
```bash
# sudo 下 ~ 指向 root 家目录，需要手动指定配置路径
sudo cloudflared --config /home/polyhedron/.cloudflared/config.yml service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared   # 开机自启
sudo systemctl status cloudflared   # 确认状态
```

### 最终架构

```
浏览器
  │
  ▼
Cloudflare (自动 HTTPS)
  │
  ├── blog.your-domain.com  → Tunnel → localhost:8880 (博客 Docker)
  └── app.your-domain.com   → Tunnel → localhost:80   (其他服务)
```

宿主机上不需要 nginx，不需要 SSL 证书，Cloudflare 全包。

---

## 4. 服务器快速排查命令

```bash
# 看谁在用 80 端口
sudo lsof -i :80
sudo ss -tlnp | grep :80

# 看所有 Docker 容器
docker ps

# nginx 配置在哪
ls /etc/nginx/
cat /etc/os-release   # 查看发行版

# 测试 nginx 配置
sudo nginx -t
sudo nginx -s reload
```

---

## 5. 其他小知识点

- `docker compose` 新版本中 `version: "3.8"` 字段已废弃，会输出 WARNING，直接删掉即可
- `docker compose down -v` 删除数据库卷（数据全清），用于彻底重置
- `docker compose up -d --build` 重新构建并启动，代码更新后的标准操作
- `docker compose restart backend` 只重启后端（如改文章内容后无需重新构建）
- Docker 多阶段构建（multi-stage build）：第一阶段编译，第二阶段只拷运行时文件，镜像体积小
