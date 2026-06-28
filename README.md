# Learn Java via Minecraft

一个可以发行的 Minecraft 风格 Java 学习网页程序：从玩家血量、方块事件、服务器插件到 MOD 原理，帮助学习者循序渐进掌握 Java、Paper/Spigot 插件思想、Forge/Fabric MOD 原理，并通过 Docker 隔离沙箱运行 Java 练习。

## 功能总览

### 第一阶段：MVP 学习站点

- 首页：包含“开始基础课程”“查看学习路线”“进入插件开发路线”“进入 MOD 原理路线”“运行挑战沙箱”。
- 学习路线：阶段 1-5 卡片和 Minecraft 生存流程式课程节点。
- 课程阅读页：课程列表、学习目标、Minecraft 场景、Java 概念、讲解、代码拆解、常见错误、检查点和总结。
- 简单练习题：填空、选择和代码补全。
- 学习进度保存：使用 `localStorage` 保存课程、插件任务、挑战、沙箱通过状态。
- Minecraft 风格 UI：深色方块感 HUD、卡片、路线、控制台和响应式布局。
- 基础课程内容：变量、数据类型、if 判断、for 循环、方法、类和对象、List 集合、Map 集合、简单事件监听概念。

### 第二阶段：插件开发课程

- Spigot / Paper 插件结构讲解。
- `JavaPlugin` 生命周期。
- `plugin.yml` 配置。
- 命令系统。
- 事件系统。
- 权限系统。
- 配置文件。
- 小插件实战项目：欢迎插件和金币插件路线。

### 第三阶段：交互式代码挑战

- Monaco Editor：优先从 CDN 加载 Monaco，失败时自动降级为普通 `textarea`。
- 自动判题：挑战题支持 `acceptedAnswers` 和针对性 `hint`，沙箱题通过服务端题库测试。
- 代码补全：包含 `sendMessage` 等插件 API 补全题。
- 错误提示：错误时显示变量、方法、大小写和 API 方向提示。
- 任务积分：每题 XP 奖励，沙箱通过额外加分。
- 成就系统：基础课、插件路线、挑战、沙箱、MOD 浏览成就。

### 第四阶段：Java 代码沙箱

- 后端 Java 编译运行：`server.js` 提供 `POST /api/run-java`。
- Docker 隔离：使用 `docker run --rm --network none`，并启用 `--read-only`、`--cap-drop ALL`、`no-new-privileges`。
- 时间限制：`timeout 5s javac`、`timeout 3s java`，Node 侧 `timeout: 8000`。
- 内存限制：`--memory 128m`。
- CPU / 进程限制：`--cpus 0.5`、`--pids-limit 64`。
- 服务端题库：前端只提交 `taskId` 和代码，测试规则由后端控制。
- 自动测试用例：后端对代码和输出执行校验。
- 限流：默认每 IP 每分钟 30 次沙箱请求，可用 `RATE_LIMIT` 调整。
- 并发队列：默认最多 2 个并发沙箱，可用 `MAX_CONCURRENT_SANDBOXES` 调整。
- 审计日志：每次沙箱运行生成 `requestId`，后端记录任务、状态、IP、开始和结束时间。
- 健康检查：`GET /healthz`。
- 云端进度：`POST /api/users`、`GET/PUT /api/progress` 保存用户进度，保留未登录本地进度体验。
- 云端排行榜：`GET /api/leaderboard` 基于后端保存的用户分数生成排行榜。
- 前端健康状态板：沙箱页会主动请求 `/healthz`，把 Docker CLI、镜像预拉取和并发状态显示给学习者。
- 前端发行体验：学习路线有推荐下一课，课程页有目录和下一步提示，练习题有解释型反馈，成就解锁会弹出 Toast，沙箱显示独立测试结果列表和复制/重置/清空操作。

### 第五阶段：MOD 原理课程

- Forge / Fabric 基础。
- 方块注册。
- 物品注册。
- 事件总线。
- 资源文件。
- 数据包。
- 客户端与服务端区别。

## 本地运行

### 静态模式

静态模式可以阅读课程、做前端练习、使用本地进度，但不能使用真实后端 Java 沙箱：

```bash
python3 -m http.server 8000
```

访问 <http://localhost:8000>。

### 完整发行模式

需要 Node.js 20+、Docker，以及可拉取 `eclipse-temurin:21-jdk` 镜像：

```bash
docker pull eclipse-temurin:21-jdk
npm start
```

访问 <http://localhost:8000>。

### Docker Compose

> 注意：沙箱需要调用宿主机 Docker，因此 compose 示例会挂载 `/var/run/docker.sock`。生产部署前请确认隔离策略、限流和访问控制符合你的安全要求。

```bash
docker compose up --build
```

## API

### `GET /healthz`

返回服务健康状态、当前 Java 沙箱镜像、Docker CLI 可用性、镜像是否已预拉取、活跃沙箱数量和最大并发数。若 `image.present` 为 `false`，先执行 `docker pull eclipse-temurin:21-jdk`。

### `GET /api/tasks`

返回后端掌控的沙箱任务元数据。

### `POST /api/users`

创建云端学习用户。

### `GET /api/progress?userId=...` / `PUT /api/progress?userId=...`

读取或保存课程、练习、插件、沙箱和成就进度。

### `GET /api/leaderboard`

返回后端排行榜。

### `POST /api/run-java`

请求体：

```json
{
  "taskId": "health_check",
  "code": "public class Main { public static void main(String[] args) { System.out.println(\"玩家死亡\"); } }"
}
```

返回 `requestId`、状态、编译运行日志、测试结果和是否通过。

## 课程内容维护

课程主数据可放在 `data/content.json` 中维护；前端会优先加载该文件，加载失败时使用内置兜底内容。因此新增或修改课程不需要改核心渲染逻辑。课程支持 `id`、`level`、`minutes`、学习目标、场景、讲解、代码拆解、常见错误、本节练习、检查点和总结。

## Monaco Editor

当前发行版优先从 jsDelivr CDN 加载 Monaco Editor；如果 CDN 或网络不可用，页面会在编辑器区域显示明确提示，并自动使用内置 `textarea` 编辑器，沙箱仍可提交代码。静态模式下 Monaco 依赖网络，完整发行模式也保留无网络兜底编辑器。

## 前端发行体验

- 沙箱运行期间按钮会显示“沙箱运行中...”并进入禁用状态，避免重复提交。
- 沙箱运行完成后只刷新进度、成就、排行榜和任务勾选，不会清空编辑器和控制台。
- 除了切换沙箱题目，普通课程完成、插件任务完成、云端同步都不会重置当前沙箱代码。
- 课程页会显示下一步建议，帮助用户知道完成当前课后继续做什么。

## 开发与测试

```bash
npm run lint
npm test
npm run test:e2e
npm run check
```

`npm run check` 会执行：

- `node --check app.js`
- `node --check server.js`
- `node scripts/validate-content.js`
- `node --test test/server.test.js`
- `playwright test`

CI 配置位于 `.github/workflows/ci.yml`，会在 push 和 pull request 时运行检查。

## 安全说明

- 沙箱只允许运行包含 `public class Main` 的单文件 Java 练习。
- 后端会拒绝常见危险 API，例如 `System.exit`、`Runtime.getRuntime`、`ProcessBuilder`、文件和网络相关 API。
- Docker 容器关闭网络、只读挂载练习目录、限制 CPU / 内存 / 进程 / 时间。
- 后端将沙箱结果分类为 `success`、`tests_failed`、`compile_error`、`timeout`、`memory_limit`、`docker_unavailable` 或 `system_error`，并用不同 HTTP 状态码返回，前端会保留 requestId、日志和用户友好提示。
- 发行到公网时，仍建议放在独立机器或独立沙箱集群，并在反向代理层增加身份验证、HTTPS 和更严格限流。
