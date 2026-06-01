Electron-vite 配布方法

- A : ローカルで各OSに対応したものをビルド
- B : Github ActionsでTag/Releaseをトリガーにして配布

snapのupload

1. pnpm run build:linux
2. upload
```
snapcraft upload dist/test-counter-app-*.snap --release=stable

```