# Simple Hope Blog - 部署指南

## 环境要求

- Node.js 18+
- PostgreSQL 14+
- PM2
- Nginx

## 部署步骤

### 1. 安装依赖

```bash
cd /home/ubuntu/simple-hope-blog
pnpm install
```

### 2. 配置环境变量

```bash
cp server/.env.example server/.env
# 编辑 .env 配置数据库连接、JWT 密钥等
```

### 3. 初始化数据库

```bash
cd server
pnpm prisma generate
pnpm prisma migrate deploy
pnpm prisma:seed
```

### 4. 构建项目

```bash
# 后端
cd server && pnpm build

# 用户端
cd web && pnpm build

# 管理端
cd admin && pnpm build
```

### 5. 使用 PM2 启动

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. 配置 Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/simple-hope-blog
sudo ln -s /etc/nginx/sites-available/simple-hope-blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. 配置 SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d climberzbm.cn -d www.climberzbm.cn
```

## 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all
```

## 数据库备份

```bash
# 手动备份
pg_dump -U blog_user simple_hope_blog > backup_$(date +%Y%m%d).sql

# 定时备份 (crontab)
0 2 * * * pg_dump -U blog_user simple_hope_blog > /home/ubuntu/backups/blog_$(date +\%Y\%m\%d).sql
```