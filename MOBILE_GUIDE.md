# DeepSeek API 手机端（Android APK + PWA）使用与打包指南

本项目基于 DeepSeek 官方开源静态前端 [`deepseek-ai/chat-demo`](https://github.com/deepseek-ai/chat-demo)（MIT 协议）封装改造，无需自建后端，手机端直接请求官方 `https://api.deepseek.com`，支持按量充值 API Key 使用，突破官方 App 限额。

## 新增特性

1. **API 账户余额查询**：
   - 接入官方 `GET /user/balance` 接口（不产生费用）。
   - 在**侧边栏底部**与**设置 → 数据管理**中实时展示总余额、赠金与充值余额明细，支持手动刷新并在对话完成后自动同步。
2. **PWA 双端支持（iOS + Android 浏览器）**：
   - 内置 `manifest.webmanifest`、桌面图标与 Service Worker（`sw.js`），部署到 HTTPS 站点后即可在 iOS Safari / Android Chrome 点击「添加到主屏幕」作为独立 App 使用。
   - 适配全面屏刘海与底部安全区（`viewport-fit=cover` + `env(safe-area-inset-*)`）。
3. **Android 原生外壳（Capacitor）+ 云端自动打包 APK**：
   - 已集成 `@capacitor/android`，配置 `https` 安全上下文与键盘自适应（`adjustResize`）、麦克风权限（支持语音输入）。
   - 内置 `.github/workflows/build-android.yml`，推送到 GitHub 后自动在云端编译生成 `.apk` 安装包。

---

## 一、如何获取 Android APK（推荐云端打包，免装 Android Studio）

1. 在 GitHub 上新建一个仓库（可设为 Private 私有仓库），将本目录代码推送到 `main` 分支：
   ```bash
   git remote set-url origin https://github.com/<你的用户名>/<你的仓库名>.git
   git add -A
   git commit -m "feat: add mobile app wrapper, PWA, and API balance"
   git push -u origin main
   ```
2. 打开 GitHub 仓库页面的 **Actions** 标签页，等待 **Build Android APK** 工作流运行完成（约 2~3 分钟）。
3. 进入本次运行详情页底部的 **Artifacts**，下载 `DeepSeek-API-android-apk`，解压即可得到 `DeepSeek-API-debug.apk`，直接发给安卓朋友安装。

> 若后续需要本地直接打包，也可安装 JDK 21 与 Android SDK 后运行 `pnpm cap:sync` 再进入 `android/` 执行 `./gradlew assembleDebug`。

---

## 二、如何让 iPhone / 浏览器用户使用（PWA）

- **方式 1（GitHub Pages）**：在 GitHub 仓库的 `Settings → Pages` 中将 Source 设为 **GitHub Actions**，推送 `main` 分支后仓库自带的 `Deploy GitHub Pages` 工作流会自动发布静态站点。
- **方式 2（Cloudflare Pages / Vercel / Netlify）**：直接上传 `pnpm build` 生成的 `dist/` 目录，或连接仓库构建命令 `pnpm build`、输出目录 `dist`。
- 手机端使用方式：
  - **iPhone（Safari）**：打开部署后的 HTTPS 网址 → 点击底部分享按钮 → **添加到主屏幕**。
  - **Android（Chrome / Edge）**：打开网址 → 菜单 → **安装应用 / 添加到主屏幕**。

---

## 三、朋友使用说明

1. 前往 [DeepSeek 开放平台](https://platform.deepseek.com/) 注册并充值，在 **API Keys** 页面创建一个 Key。
2. 打开手机 App（或 PWA），在 **设置 → 数据管理** 粘贴 API Key 并确认校验。
3. 校验通过后即可使用（对话记录和 Key 仅保存在用户各自手机本地，不经过任何第三方服务器）。
