# DeepSeek API Mobile (Android APK + PWA)

[简体中文](README.md) | English

A mobile-ready chat client packaged from DeepSeek's official open-source static web client [`deepseek-ai/chat-demo`](https://github.com/deepseek-ai/chat-demo) (MIT License). No backend server is required: the app connects directly to `https://api.deepseek.com` using your own DeepSeek API key.

## Live Demo & Downloads

### 1. Web / PWA (iOS & Android, No Installation Needed)

- **Live URL**: https://tosolov.github.io/ds-chat-demo-app/
- **Install to Home Screen**:
  - **iPhone (Safari)**: Open the URL above → Tap **Share** → **Add to Home Screen**.
  - **Android (Chrome / Edge)**: Open the URL above → Browser menu → **Install app / Add to Home Screen**.

### 2. Android APK

1. Open [GitHub Actions](https://github.com/tosolov/ds-chat-demo-app/actions).
2. Select the latest successful **Build Android APK** run.
3. Download **`DeepSeek-API-android-apk`** under **Artifacts** and extract `DeepSeek-API-debug.apk`.

---

## Quick Start

1. Create and top up an API key at [DeepSeek Platform](https://platform.deepseek.com/).
2. Open the app, go to **Settings → Data**, and enter your API key.
3. Check and refresh your live API account balance anytime from the sidebar footer or **Settings → Data**.

---

## Key Additions Over Upstream

- **Official API Balance Query**: Calls `GET /user/balance` (zero cost) to display total, granted, and topped-up balance with manual refresh and automatic sync after replies.
- **PWA Support**: Includes `manifest.webmanifest`, app icons, safe-area inset support (`viewport-fit=cover`), and a static-shell Service Worker (`sw.js`) that never intercepts `api.deepseek.com` streaming requests.
- **Capacitor Android Wrapper & Cloud APK CI**: Includes `capacitor.config.ts`, `android/` project (`androidScheme: 'https'`, `adjustResize`, `RECORD_AUDIO` permission), and `.github/workflows/build-android.yml`.

---

## Development

Requires Node.js 22.12+ (24 recommended) and pnpm 10:

```sh
git clone https://github.com/tosolov/ds-chat-demo-app.git
cd ds-chat-demo-app
pnpm install
pnpm dev
```

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Rspack dev server (`http://localhost:8090`) |
| `pnpm build` | Build static web & PWA bundle into `dist/` |
| `pnpm cap:sync` | Build `dist/` and sync assets to `android/` |
| `pnpm type` | Run TypeScript type checking (`tsc`) |
| `pnpm lint` | Run `oxlint` |
| `pnpm format` | Format with `oxfmt` |

## License

[MIT](LICENSE), built upon [`deepseek-ai/chat-demo`](https://github.com/deepseek-ai/chat-demo). The build copies `LICENSE` to `dist/LICENSE`; include it when redistributing.
