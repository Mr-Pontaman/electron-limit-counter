# electron

- renderer (react側):
  - ブラウザはnodeは触れないので、preloadの窓口（`window.electronapi.savefile()`）経由で叩く
    - 経由のapiは補完の為に型定義をする。
- preload (窓口):
  - ブラウザから来た命令をnodeに送る（`ipcrenderer.send`）
- main (node.js側):
  - fs.writefilesync等でnode環境にアクセスできる。

next.jsでいうなら

- renderer ＝ コンポーネント（ブラウザで動く純粋なフロントエンド）
- preload ＝ フロントとバックを安全に繋ぐ通信レイヤー
- main ＝ api routesやserver actions（サーバー/node.js側で動くバックエンド）

devtools -> f12キー
