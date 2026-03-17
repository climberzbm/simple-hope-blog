# simple-hope-blog

个人技术博客系统

## 项目结构

```
simple-hope-blog/
├── web/          # 用户端 - Next.js
├── admin/        # 管理后台 - React + Vite
├── server/       # 后端 API - Koa
├── shared/       # 共享类型定义
└── pnpm-workspace.yaml
```

## 技术栈

- 用户端：Next.js 14 + TypeScript + Tailwind CSS
- 管理端：React 18 + Vite + Ant Design
- 后端：Koa 2 + TypeScript + Prisma
- 数据库：PostgreSQL

## 开发

```bash
# 安装依赖
pnpm install

# 启动后端
pnpm --filter server dev

# 启动用户端
pnpm --filter web dev

# 启动管理端
pnpm --filter admin dev
```

## License

MIT