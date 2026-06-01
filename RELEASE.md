## Electron-vite 配布方法

- A : ローカルで各OSに対応したものをビルド -> Releaseにdistのをドロップ
  - *build:win -> wine64 をPCにインストールする必要あり。これを避ける為に以下 B を利用
- B : Github ActionsでTag or Releaseをトリガーにして配布
  - *SnapのuploadをActionsで行う際に stable としてuploadする方法がわからず。
  - そのため stable へのupdateはsnapcraft.ioかターミナルから行う。

### 流れ

1. ローカルでコード変更 -> push / merge
2. `git tag v1.1.0` & `git push origin v1.1.0`　<- タグの作成（Github Actionsが走る）
3. snapcraft.ioかターミナルからsnapをstableへpromote