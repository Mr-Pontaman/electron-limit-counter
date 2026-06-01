renderer (React側):
「ファイルを保存したいな。でも俺は一般市民（ブラウザ）だから直接PCは触れない。preloadの窓口（window.electronAPI.saveFile()）を叩こう！」

preload (窓口):
「よし、Reactからリクエストが来たな。内容をチェックして、裏方のボス（main）に『ファイル保存してあげて』とメッセージを送るよ（ipcRenderer.send）」

main (Node.js側):
「メッセージを受け取ったぞ。俺はボスだから fs.writeFileSync で本当にPCにファイルを書き込むぜ！」

Next.jsでいうなら、

renderer ＝ コンポーネント（ブラウザで動く純粋なフロントエンド）

main ＝ API RoutesやServer Actions（サーバー/Node.js側で動くバックエンド）

preload ＝ フロントとバックを安全に繋ぐ通信レイヤー

DevTools -> F12
