#!/bin/bash
# クラウドセッション（Claude Code on the web）の開始時だけ依存をインストールする。
#
# セットアップスクリプト（環境設定側）ではなくここに置く理由:
#   セットアップスクリプトはリポジトリがクローンされる前に走り、環境ごとにキャッシュされる。
#   package-lock.json がまだ無いので npm ci が失敗する。
#   SessionStart フックは Claude Code 起動後・リポジトリのある状態で走るため、こちらが正しい置き場所。
#
# ローカルでは CLAUDE_CODE_REMOTE が true にならないので、何もせず終了する。

if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" || exit 0

# resume のたびに走るので、すでに入っていれば何もしない
if [ -d node_modules/next ]; then
  exit 0
fi

npm ci

# インストールに失敗してもセッションの開始自体は妨げない
exit 0
