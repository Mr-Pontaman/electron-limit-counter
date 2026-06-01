## Basic

- renderer (React側):
  - ブラウザはnodeは触れない。preloadの窓口（window.electronAPI.saveFile()）経由で叩く
  - 経由のapiは補完の為に型定義をする。
- preload (窓口):
  - ブラウザから来た命令をnodeに送る（ipcRenderer.send）
- main (Node.js側):
  - fs.writeFileSync等でnode環境にアクセス

Next.jsでいうなら

- renderer ＝ コンポーネント（ブラウザで動く純粋なフロントエンド）
- preload ＝ フロントとバックを安全に繋ぐ通信レイヤー
- main ＝ API RoutesやServer Actions（サーバー/Node.js側で動くバックエンド）

---

DevTools -> F12キー
