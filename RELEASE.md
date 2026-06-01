Electron-vite 配布方法

- A : ローカルで各OSに対応したものをビルド
- B : Github ActionsでTag/Releaseをトリガーにして配布

今回はB
- snap : snap-storeにCLIからリリース
- 他 : Github ActionsでReleaseに配布

snapを分ける理由
- Github Actionsでsnap-store関係のエラーが出てわからず

snapのupload

1. pnpm run build:linux
2. upload
```
snapcraft upload dist/test-counter-app-*.snap --release=stable

```