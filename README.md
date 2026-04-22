# face_recognition_forward

面向 **单板嵌入式人脸门禁 / 考勤** 的本地 Web 管理前端：浏览器直连设备 HTTP API，用于状态总览、实时事件、人脸库与远程控制。**非**多设备云平台，无账号体系。

## 技术栈

- Vue 3、Vite、Vue Router（Hash 路由，便于静态文件任意路径部署）
- Element Plus、Axios
- 实时数据：`EventSource`（`/api/stream`）优先，失败则轮询 `/api/state`、`/api/events`

## 功能模块

| 模块 | 说明 |
|------|------|
| 总览 | 设备状态、健康检查、最近事件摘要 |
| 实时事件 | 事件时间线（SSE / 轮询自动刷新） |
| 日志查看 | 按条数请求 `/api/events`，手动刷新 |
| 人脸库 | 列表、注册、删除（确认）、清空库（危险确认） |
| 控制 | 远程开锁（`duration_ms`）、报警测试、状态 JSON |

## 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`

## 快速开始

```sh
npm install
npm run dev
```

浏览器访问终端提示的本地地址（一般为 `http://localhost:5173/`），路由为 Hash 形式，例如 `http://localhost:5173/#/`。

生产构建与本地预览：

```sh
npm run build
npm run preview
```

## 环境变量

仓库中 **`.env.development` / `.env.production` 默认被 `.gitignore` 忽略**，请在本地自行创建。

### 开发（`.env.development`）

| 变量 | 说明 |
|------|------|
| `VITE_DEV_PROXY_TARGET` | `npm run dev` 时，将浏览器请求 `/api/*` 代理到该地址（如 `http://127.0.0.1:8080`） |
| `VITE_BOARD_API_BASE` | 开发环境通常留空，使 Axios 走当前页面源，由 Vite 代理转发 |
| `VITE_BOARD_API_TIMEOUT` | 请求超时（毫秒），默认 `15000` |
| `VITE_BOARD_POLL_MS` | 无 SSE 时轮询间隔（毫秒），默认 `2000` |

### 生产（`.env.production`）

| 变量 | 说明 |
|------|------|
| `VITE_BOARD_API_BASE` | 构建时写入。静态页面与 API **同源**时留空；跨域访问设备时填 `http://设备IP:端口`（需设备开启 CORS） |
| `VITE_BOARD_API_TIMEOUT` | 同上 |
| `VITE_BOARD_POLL_MS` | 同上 |

### 可选校验（固件形态特殊时）

| 变量 | 说明 |
|------|------|
| `VITE_STRICT_HEALTH=1` | 要求 `GET /api/health` 返回 JSON 中 `ok === true` |
| `VITE_RELAX_STATE=1` | 允许 `/api/state` 为空对象 `{}`（默认会判为非法，避免误连其它服务） |

前端在 `src/utils/boardGuards.js` 中会对 health / state 做基本形态校验，避免本机其它端口返回「空 JSON」却被当成设备在线。

## 设备端 HTTP 接口约定

前端按下列路径调用（与具体固件字段名可通过 `deviceState` 映射扩展）：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/state` | 设备状态（建议含 IP、Wi‑Fi、门锁、注册人数等） |
| GET | `/api/events?limit=` | 事件列表 |
| GET | `/api/faces` | 人脸列表 |
| POST | `/api/register` | body: `{"name":"..."}` |
| POST | `/api/faces/delete` | body: `{"name":"..."}` 或 `{"face_id":n}` |
| POST | `/api/faces/reset` | 清空人脸库 |
| POST | `/api/door/unlock` | body: `{"duration_ms":3000}` |
| POST | `/api/alarm/test` | 报警测试 |
| GET | `/api/stream` | （可选）SSE，事件类型如 `recognized`、`stranger`、`register_success` 等 |

## 工程结构（摘要）

```text
src/
  api/           # Axios 实例与板端 API 封装
  components/    # 通用业务组件（状态卡片、事件时间线、人脸表等）
  composables/   # useBoardConsole：连接、SSE/轮询、共享状态
  layouts/       # 管理台布局
  router/        # 路由
  utils/         # 错误文案、事件类型映射、health/state 校验
  views/         # 各页面
```

## 开发说明

- **跨域**：开发时优先用 Vite 代理；生产跨机访问需在设备 HTTP 服务配置 CORS。
- **离线**：请求失败或 health/state 不符合校验时，顶部横幅提示离线并清空列表数据（避免误显示旧数据）。
- **调试 Vue**：可使用浏览器 [Vue DevTools 扩展](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)；本项目未内置页面内 Vue 调试浮层。

## 推荐 IDE

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（勿与 Vetur 同时启用）。

## 参考

- [Vite 配置](https://vite.dev/config/)
- [Vue 3 文档](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
