# AIエージェント開発の実務 — 出典台帳と更新運用

この本は変化の速い分野を扱う。**どの主張がどの出典に依存していて、いつ確認したか**を1か所に集め、半年後に見直す範囲が即座に決まる状態を保つ。

- 本体: `content/books/ai-agent-development/`
- 検査: `npm run check:content -- ai-agent-development --links`

---

## 更新の設計方針

本は「原則」と「手札」を章で分けている。**更新が必要なのは3章だけ**で、残りは数年もつ想定。

| 層 | 章 | 更新頻度 |
| --- | --- | --- |
| 原理層 | 1, 3〜18（下記3章を除く） | 数年に一度。研究や公式見解が覆ったときのみ |
| 事実層 | 2（調査データ） | **半年ごと** |
| 手札層 | 19（ツール分類）, 20（チートシート） | **半年ごと**。冒頭に「YYYY年MM月時点」を明記する |

数字を本文に書くときは、必ず **調査年・母集団・規模** を添える。「83%が生産性向上を実感」ではなく「12名のチームで83%」と書く。

---

## 章ごとの依存出典

`確認日` は URL の実在と内容の一致を最後に確かめた日。

### 第5章 権限設計とサンドボックス（`permissions-and-sandbox.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| 致命的な三要素（プライベートデータ／信頼できないコンテンツ／外部通信）／LLMは指示の出所を区別できない／確率的防御は境界の代わりにならない | [The lethal trifecta（Simon Willison, 2025-06-16）](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) | 2026-08-23 | **概念としては極めて安定。**個人ブログなのでURL消失だけ注意 |
| 権限モードの一覧／`bypassPermissions` は隔離環境限定という警告／deny → ask → allow の評価順／広いdenyは狭いallowの例外を持てない／管理設定はCLI引数でも上書き不可／フックは権限ルールを迂回しない | [Configure permissions（Claude Code 公式）](https://code.claude.com/docs/en/permissions) | 2026-08-23 | **モード名は改版で変わりうる。**評価順の原則自体は変わりにくい |
| 権限とサンドボックスは別の層／サンドボックスはプロンプトインジェクションが判断を回避しても効く | [Sandboxing（Claude Code 公式）](https://code.claude.com/docs/en/sandboxing) | 2026-08-23 | 設定キー名が変わったとき |
| プロンプトインジェクションの位置づけ | [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/) | 2026-08-23 | **版が上がると順位と項目名が変わる** |

### 第9章 コンテキスト設計（`context-design.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| コンテキストは有限資源／注意の予算／最小の高シグナルなトークン集合／ハイブリッド戦略／圧縮・記録・分離 | [Effective context engineering for AI agents（Anthropic, 2025-09-29）](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | 2026-08-23 | Anthropicが記事を改訂 or 撤回したとき |
| 長さそのものによる劣化（18モデル・最大131,072トークン） | [Context Rot（Chroma, 2025-07-14）](https://www.trychroma.com/research/context-rot) | 2026-08-23 | 後続研究が長文脈での劣化を否定したとき。**モデル世代が変われば数値の妥当性は要再確認** |
| 位置による性能差は情報検索型タスクで観測 | [Lost in the Middle（Liu ら, 2023）](https://arxiv.org/abs/2307.03172) | 2026-08-23 | ほぼ不変（発表済み論文） |
| `/context` での内訳確認、圧縮の挙動 | [Manage the context window（Claude Code 公式）](https://code.claude.com/docs/en/context-window) | 2026-08-23 | **コマンド名や機能名が変わったとき。ここは最も壊れやすい** |

### 第10章 設定スコープ（`settings-scope.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| 5階層の優先順位（管理 > CLI > プロジェクト個人 > プロジェクト共有 > ユーザー）／**プロジェクト個人が共有より強い**／local はツールが作ればグローバルGit除外に自動追加、手作りなら自分でgitignore／「今後は聞かない」はlocalに保存されリポジトリルートに書かれる／共有設定は起動フォルダからしか読まれない／リストは合成される | [Claude Code settings（公式）](https://code.claude.com/docs/en/settings) | 2026-08-23 | **ファイル名とパスは改版で変わりうる。**階層の考え方自体は安定 |
| 許可ルールのスコープをまたいだ評価 | [Configure permissions（Claude Code 公式）](https://code.claude.com/docs/en/permissions) | 2026-08-23 | 5章と共通の依存 |
| プロジェクト / ユーザー / チームという同種のスコープ分け | [Rules（Cursor 公式）](https://cursor.com/docs/context/rules) | 2026-08-23 | 11章と共通の依存 |

### 第11章 指示ファイル（`instruction-files.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| 推奨セクション、6万超のプロジェクトで採用、20以上のツールが対応、READMEとの分離理由 | [AGENTS.md](https://agents.md/) | 2026-08-23 | **採用数はサイト表示が更新される。数字は毎回取り直す** |
| **200行未満**の目安／遵守率との関係／具体性の対比例／importでコンテキストは減らない／4ホップ／`/doctor` のトリム基準／フックへの誘導／`@AGENTS.md` インポート推奨／4階層のスコープ／`/context`・`/memory`・`/init` | [How Claude remembers your project（Claude Code 公式）](https://code.claude.com/docs/en/memory) | 2026-08-23 | **本章の依存が最も集中している。ツール改版のたびに全項目を確認** |
| ルールは**500行以内**／大きくなったら分割／AGENTS.md対応 | [Rules（Cursor 公式）](https://cursor.com/docs/context/rules) | 2026-08-23 | 数字が変わることがある。URL構成の変更も過去にあり |
| 指示数の増加で追従率が低下／位置との一貫した関係は未確認 | [Boosting Instruction Following at Scale（2025-10）](https://arxiv.org/abs/2510.14842) | 2026-08-23 | ほぼ不変。ただし**位置に関する反証が出たら本文のColumnを要修正** |

### 第12章 タスクの切り方（`task-decomposition.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| 50%タスク完了時間ホライズン／**4分未満はほぼ100%、約4時間以上は10%未満**／約7か月で倍増 | [Measuring AI Ability to Complete Long Software Tasks（METR, 2025-03-19）](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)、[arXiv:2503.14499](https://arxiv.org/abs/2503.14499) | 2026-08-23 | **数値は最も早く古びる。**本文にその旨をColumnで明記済みで、「長さで成功率が急落する」という構造のほうを主張にしてある。METRが更新版を出したら数値を差し替える |
| ワークフローとエージェントの区別／5つのパターン／シンプルに始める原則 | [Building Effective Agents（Anthropic, 2024-12-19）](https://www.anthropic.com/engineering/building-effective-agents) | 2026-08-23 | 2024年末の記事だが原則は安定。**Anthropicが後継記事を出したら統合を検討** |

### 第13章 ツールとMCP（`tools-and-mcp.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| ツールはAPIのラッパーではない／少数のツール／ページング・絞り込み・切り詰め／**応答は既定25,000トークン上限**／説明文はプロンプト／引数名を明確に／エラー応答に回復の手がかり／評価で回す | [Writing effective tools for AI agents（Anthropic, 2025-09-11）](https://www.anthropic.com/engineering/writing-tools-for-agents) | 2026-08-23 | **25,000という数値は実装依存で変わりうる。**原則は安定 |
| MCPの定義、USB-Cのたとえ、対応クライアントの広がり | [What is the Model Context Protocol?（公式）](https://modelcontextprotocol.io/docs/getting-started/intro) | 2026-08-23 | **仕様バージョンが上がるとURLパスが変わる**（`/docs/YYYY-MM-DD/` 形式のページがある） |
| ツールポイズニングの定義と攻撃の流れ | [MCP Tool Poisoning（OWASP）](https://owasp.org/www-community/attacks/MCP_Tool_Poisoning) | 2026-08-23 | OWASPの分類が変わったとき |
| クライアントによって耐性に差がある／静的検証とパラメータ可視性が不十分 | [arXiv:2603.22489（2026-03）](https://arxiv.org/abs/2603.22489) | 2026-08-23 | クライアント側の防御が改善されたら記述を弱める |

### 第15章 コードレビュー（`code-review.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| 検証段階でのボトルネック化／AIは増幅器 | [ROI of AI-assisted Software Development（DORA）](https://dora.dev/ai/) | 2026-08-23 | **DORAは毎年更新される。年次版が出たら数値と論旨を差し替え** |
| 重複+81%／コピペ9.4%→15.7%／リファクタ21%→3.8%／churn+15% | [The Maintainability Gap（GitClear, 2026-01）](https://www.gitclear.com/the_ai_code_quality_maintainability_gap) | 2026-08-23 | **ベンダー自社データ。本文で利害関係を明記済み。年次更新のたびに数値差し替え** |
| 1回400行・60分・時速500行 | [Best Practices for Peer Code Review（SmartBear）](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/) | 2026-08-23 | ほぼ不変（AI以前の古典調査であることを本文で明記済み） |
| 機械レビューのループ運用（2〜3周で収束）／人間は戦略的判断を保持 | [ハーネスエンジニアリング（2026-03-24）](https://zenn.dev/theaktky/articles/1c6c3b9333117c) | 2026-08-23 | 個人の実践報告。**同種の報告が増えたら差し替え候補** |
| 12名で品質ばらつき66.7%／並列増66.7%／疲労42%／生産性実感83% | [Claude Code導入3ヶ月後の社内アンケート（2025-10-23）](https://zenn.dev/readyfor_blog/articles/a1cfd81a562e07) | 2026-08-23 | 個社の1回限りの調査。**より大規模な調査が出たら格上げ** |

### 第2章 データで見る導入状況（未執筆）

執筆時に使う候補。いずれも**年次で更新される**ため、書く直前に取り直す。

| 出典 | 現時点で拾える内容 | 注意 |
| --- | --- | --- |
| Stack Overflow Developer Survey 2025 | エージェント業務利用31%／毎日14.1%／導入予定なし37.9%／AIツール全般84%／不信46%（AI設問回答 33,662人） | **2026年版は2026-08時点で未公開。** 「2026年調査」を名乗る二次記事は2025年の数字の年号詐称。本文でこの実例を扱う |
| DORA 2025 State of AI-assisted Software Development | 90%が日常利用（前年比+14pt）／中央値1日2時間（約5,000人） | 詳細数値はPDF内。書く前に本体を取得すること |
| JetBrains State of Developer Ecosystem 2025 | 85%が日常利用／62%がアシスタント・エージェント・AIエディタのいずれか（24,534人・194カ国） | エージェント単体の切り出しはPDF確認が必要 |
| GitHub Octoverse 2025 | Copilot coding agent が5か月で100万超のPR作成 | **唯一のアンケートでない行動ログ。**アンケートと対比させる材料 |
| METR RCT（2025-07）と続報（2026-02） | 経験者が19%遅くなった／体感は20%高速。**2026年2月に実験デザイン見直しを公表** | **19%だけの引用は古い。**続報とセットでのみ使う |

---

## 使わないと決めたもの

同じ調査を繰り返さないための記録。

| 除外したもの | 理由 |
| --- | --- |
| いいね1件のZenn記事（ガバナンス5判断軸） | 反応が乏しく、個人の設計案1本。内容の筋は通っていたが根拠として弱い |
| 「1,899個のMCPサーバーのうち7.2%に脆弱性、5.5%にツールポイズニング」 | 二次記事で広く引用されているが**分母が食い違う**。ツールポイズニングの割合は1,899ではなく73サーバーを対象にしたスキャンの結果らしく、一次情報を特定できなかった。13章では数値を使わず、OWASPの定義とarXivの定性的知見だけを引いている |
| 「Stack Overflow 2026調査」を名乗る二次記事 | 2026-08時点で2026年版は未公開。2025年の数字の年号詐称 |
| 製品名の優劣（「今はAが最強」） | 数か月で覆る。19章で分類軸として扱う |
| プラン名と価格 | 17章では価格を載せず判断軸のみを書く方針 |
| UI操作の手順・スクリーンショット | 陳腐化が最速 |

---

## 半年ごとの見直し手順

1. `npm run check:content -- ai-agent-development --links` — リンク切れとMDX規約違反を検出
2. 上の表で「何が変わったら見直すか」に該当する出典を開き、数値と論旨を確認
3. 変わっていたら本文を直し、**確認日を更新**する
4. 2章・19章・20章は、変化の有無にかかわらず全面的に取り直す
5. 冒頭の「YYYY年MM月時点」表記を更新する

## 執筆時のルール

- 断定を書くときは、出典を示すか「筆者の解釈」と明示する。決めつけに見せない
- 数字には調査年・母集団・規模を必ず添える
- 外部リンクは節末か章末に寄せ、章末に「## 参考リンク」を置く
- 挿入した外部URLは全件、実際にアクセスして200を確認する（上のコマンドで一括確認できる）
