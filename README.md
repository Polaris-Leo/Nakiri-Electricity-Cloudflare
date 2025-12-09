# Nakiri Electricity Cloudflare

这是一个基于 React 和 Cloudflare Workers 的全栈电量监测系统模板。<br>
特点：单体架构 (Monolith)，零成本，自动爬虫，美观图表。

### 🚀 快速开始
点击即可一键部署到Cloudflare上（需要Cloudflare账户）<br>
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Polaris-Leo/Nakiri-Electricity-Cloudflare)

### 🛠️ 手动部署
#### 1. 安装依赖
```
npm install
```

#### 2. 创建数据库
```
npx wrangler d1 create nakiri-db
```

复制终端输出的 database_id。

#### 3. 配置项目

打开 wrangler.toml：

填入上一步获取的 database_id。

在 [vars] 部分修改本地测试用的房间号。

#### 4. 初始化数据库表
```
npm run db:init
```

#### 5. 一键部署
```
npm run deploy
```

#### 6. 线上配置

部署完成后，去 Cloudflare Dashboard -> Workers & Pages -> Settings -> Variables 添加环境变量：

ROOM_ID: 房间号 (如 507)

PART_ID: 校区 (如 徐汇)

BUILD_ID: 楼号 (如 18)

#### 7.本地开发
```
npx wrangler dev
```
