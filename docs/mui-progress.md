# MUI 導入メモ

## 方針

MUI はまず管理画面の閉じた範囲で試す。公開ページや共通ヘッダーには広げず、既存の shadcn / Tailwind / Mantine と混在する範囲を限定する。

## 現在の進捗

- `@mui/material`, `@emotion/react`, `@emotion/styled` を追加済み。
- `/admin/users` を MUI ベースに変更済み。
- ユーザー一覧の表示を MUI `Paper`, `Table`, `Chip`, `IconButton`, `Tooltip`, `LinearProgress` に変更。
- 編集ダイアログを MUI `Dialog`, `TextField`, `MenuItem`, `Button`, `Alert` に変更。

## 次に確認すること

- `/admin/users` でユーザー一覧が表示できること。
- 編集ダイアログを開閉できること。
- 名前、メールアドレス、ロールを更新できること。
- 自分自身の削除ボタンが disabled のままになっていること。

## 保留

- `@mui/x-data-grid` は未導入。必要性が出るまで追加しない。
- 共通テーマや `ThemeProvider` は未導入。MUI の利用範囲が広がるまではページ単位の `sx` で調整する。
