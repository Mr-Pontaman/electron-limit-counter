# electron

- renderer (React側):
  - ブラウザはNode.jsが触れないので、preloadの窓口（`window.electronapi.savefile()`）経由で叩く
    - 経由のapiは補完の為に型定義をする。
- preload (窓口):
  - ブラウザから来た命令をnodeに送る（`ipcrenderer.send`）
- main (Node.js側):
  - `fs.writefilesync`等でNode環境にアクセスできる。

Next.jsでいうなら

- renderer ＝ コンポーネント（ブラウザで動く純粋なフロントエンド）
- preload ＝ フロントとバックを安全に繋ぐ通信レイヤー
- main ＝ api routesやserver actions（サーバー/Node.js側で動くバックエンド）

---

Chromeのdevtool --> f12キー
