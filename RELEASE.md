Electron-vite 配布方法

- A : ローカルで各OSに対応したものをビルド
- B : Github ActionsでTag/Releaseをトリガーにして配布

今回はB
- snap : snap-storeにCLIからリリース
- 他 : Github ActionsでReleaseに配布

snapを分ける理由
- Github Actionsでsnap-store関係のエラーが出てわからず