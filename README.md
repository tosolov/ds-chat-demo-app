# DeepSeek API 手机端（Android APK + PWA）

简体中文 | [English](README.en.md)

基于 DeepSeek 官方开源静态前端 [`deepseek-ai/chat-demo`](https://github.com/deepseek-ai/chat-demo)（MIT 协议）封装改造的移动端客户端。无需自建后端，手机端直接调用 DeepSeek 官方 API（`https://api.deepseek.com`），按 API 账户余额计费使用，不受官方 App 免费对话限额限制。

## 在线体验与下载

### 1. 网页版 / PWA（iPhone 与 Android 通用，免安装）

- **在线地址**：https://tosolov.github.io/ds-chat-demo-app/
- **添加到手机桌面像独立 App 一样使用**：
  - **iPhone（Safari）**：打开上述网址 → 点击底部「分享」按钮 → **添加到主屏幕**。
  - **Android（Chrome / Edge）**：打开上述网址 → 右上角菜单 → **安装应用 / 添加到主屏幕**。

### 2. Android APK 安装包

1. 打开本仓库的 [GitHub Actions](https://github.com/tosolov/ds-chat-demo-app/actions) 页面。
2. 点击最近一次绿色通过的 **Build Android APK** 构建记录。
3. 滑到页面底部 **Artifacts**，下载 **`DeepSeek-API-android-apk`**，解压即可获得 `DeepSeek-API-debug.apk` 安装到安卓手机。

---

## 上手使用

1. 前往 [DeepSeek 开放平台](https://platform.deepseek.com/) 注册账号、充值并创建一个 API Key。
2. 打开 App（或 PWA），在 **设置 → 数据管理** 中粘贴 API Key 并确认校验。
3. 校验通过后即可开始对话；侧边栏底部与「设置 → 数据管理」均可实时查看和刷新 API 账户余额。

---

## 功能特性

- **直连官方 API**：前端直连 `https://api.deepseek.com`，不经过任何第三方中转服务器。
- **官方 API 余额查询**：接入 `GET /user/balance`（不产生费用），在侧边栏底部和设置页展示总余额、赠金与充值明细，支持手动刷新并在对话完成后自动同步。
- **完整对话体验**：流式输出、深度思考、智能联网搜索、链接阅读与来源引用、多会话与消息分支切换、停止与继续生成。
- **多模态与语音**：支持图片/文档附件上传、语音输入与回复朗读（Android 端已配置录音权限与键盘自适应 `adjustResize`）。
- **富文本渲染**：Markdown、代码高亮、KaTeX 数学公式、Mermaid 流程图。
- **移动端与 PWA 适配**：支持浅色/深色主题、中英文切换、全面屏安全区适配（`viewport-fit=cover` + `env(safe-area-inset-*)`）与 Service Worker 静态壳缓存。

---

## 数据与隐私说明

- 你的 **API Key 与偏好设置** 仅保存在本机 `localStorage` 中；**对话记录与附件原件** 保存在本机 `IndexedDB` 中，不上传至任何第三方服务器。
- 只有发送对话、上传附件、查询余额及使用语音识别/朗读时，浏览器或 App 才会直接向 `https://api.deepseek.com` 发起请求。
- 设置 → 数据管理支持 **导出/导入历史对话（ZIP）**（导出不包含 API Key）及 **删除所有对话**。格式细节见 [历史导入导出说明](src/services/chat/history/README.md)。

---

## 本地开发与构建

环境要求：Node.js 22.12+（推荐 24）与 pnpm 10。

```sh
git clone https://github.com/tosolov/ds-chat-demo-app.git
cd ds-chat-demo-app
pnpm install
pnpm dev
```

开发服务器默认运行在 `http://localhost:8090`。

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动 Rspack 本地开发服务器 |
| `pnpm build` | 构建静态网页与 PWA 产物至 `dist/` |
| `pnpm cap:sync` | 构建 `dist/` 并同步资源到 `android/` |
| `pnpm type` | TypeScript 类型检查（`tsc`） |
| `pnpm lint` | 代码静态检查（`oxlint`） |
| `pnpm format` | 代码格式化（`oxfmt`） |

### 目录结构

```text
.github/workflows/
  build-android.yml    GitHub Actions 自动编译 Android APK
  pages.yml            GitHub Actions 自动部署 GitHub Pages (PWA)
android/               Capacitor 生成的 Android 原生工程
public/                PWA 清单 (manifest.webmanifest)、Service Worker (sw.js) 与图标
src/
  app/                 应用布局、主题与移动端视口适配
  components/          聊天、设置、侧边栏余额卡片、Markdown 等组件
  i18n/                中英文文案
  services/
    api/               API 请求、SSE 流式解析、余额查询与协议类型
    chat/              会话、消息分支、IndexedDB 存储与导入导出
    markdown/          Markdown 解析、代码高亮、KaTeX 与 Mermaid
    speech/            录音转写与语音朗读
  utils/               通用工具函数
```

### 云端自动化构建

- **Android APK**：推送到 `main` 分支或推送 `v*` 标签后，[build-android.yml](.github/workflows/build-android.yml) 会自动编译生成可安装的调试签名 APK。
- **GitHub Pages**：推送到 `main` 分支后，[pages.yml](.github/workflows/pages.yml) 会自动检查类型、Lint 并部署到 GitHub Pages。

---

## 许可证

本项目基于上游 [`deepseek-ai/chat-demo`](https://github.com/deepseek-ai/chat-demo) 二次封装，采用 [MIT](LICENSE) 许可证开源。构建时会自动将 `LICENSE` 复制到 `dist/LICENSE`，分发时请一并保留；第三方依赖遵循各自的许可证。
