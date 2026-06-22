# Electron-vite 配布方法

- 方法A : ローカルで各OSに対応したものをビルド -> Releaseにdistの内容をドロップ
  - \*build:win -> wine64 をPCにインストールしないとビルドできない。
- 方法B : Github ActionsでTag or Releaseをトリガーにして配布
  - \*SnapのuploadをActionsで行う際に stable としてuploadする方法がわからず。
  - そのため stable へのupdateはsnapcraft.ioかターミナルで行う。

snapのupdateには snapcraft-store の認証が必要

```
snapcraft export-login credentials.txt
```

- 生成されたものはGithubリポジトリの設定から環境変数に追加
  - このリポジトリでは`SNAPCRAFT_STORE_CREDENTIALS`という名前

## Updateの流れ

俺が行う事

1. ローカルでコード変更 -> Githubへ push / merge
2. ローカルでコマンド実行 : `git tag v1.1.0` & `git push origin v1.1.0`　<- タグの作成（これによりGithub Actionsが走る）
3. snapcraft.io or ターミナルからsnapをstableへpromoteさせる。
