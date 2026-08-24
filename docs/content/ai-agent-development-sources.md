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

### 第1章 エージェントとは何か（`what-is-an-agent.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| **ツールがなければテキストを返すことしかできない**／エージェントループ（コンテキストを集める→行動する→結果を確かめる）／ツールの5分類／「失敗テストを直して」の6ステップ例／**エージェンティック・ハーネス**という位置づけ／いつでも割り込める | [How Claude Code works（公式）](https://code.claude.com/docs/en/how-claude-code-works) | 2026-08-24 | ツール分類は増減しうる。**ループとハーネスの概念自体は安定** |
| ワークフローとエージェントの区別 | [Building Effective Agents（Anthropic, 2024-12-19）](https://www.anthropic.com/engineering/building-effective-agents) | 2026-08-24 | 12章と共通の依存 |
| AIツール84% vs エージェント31% | [AI｜2025 Stack Overflow Developer Survey](https://survey.stackoverflow.co/2025/ai) | 2026-08-24 | 2章と共通の依存 |

### 第2章 データで見る導入状況（`adoption-data.mdx`）— **要更新**

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| エージェント業務利用31%（毎日14.1%）／導入予定なし37.9%／不信46%・信頼33%・強く信頼3.1%／AI設問回答 33,662人 | [AI｜2025 Stack Overflow Developer Survey](https://survey.stackoverflow.co/2025/ai) | 2026-08-24 | **年次更新。次版が出たら全面差し替え** |
| 回答者49,000超・177カ国・62設問・314技術／AIツール84%／肯定的な感情60%（従来70%超から低下） | [2025 Stack Overflow Developer Survey](https://survey.stackoverflow.co/2025/) | 2026-08-24 | **調査年の確認はこのページで行う** |
| **2026-08-24時点で公式サイトの調査年は2011〜2025。2026年版は未公開** | 同上（一覧を直接確認） | 2026-08-24 | **本章の「年号詐称」の節はこの事実に依存している。2026年版が公開されたら節を書き換える**（実例としては残せるが、時点表記を更新すること） |
| 日常利用90%（+14pt）・中央値1日2時間・約5,000人 | [DORA 2025](https://dora.dev/dora-report-2025/) | 2026-08-24 | 年次更新 |
| AI日常利用85%・いずれか62%・24,534人/194カ国 | [JetBrains DevEco 2025](https://blog.jetbrains.com/research/2025/10/state-of-developer-ecosystem-2025/) | 2026-08-24 | 年次更新 |
| コーディングエージェントが5か月で100万超のPR | [Octoverse 2025（GitHub）](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/) | 2026-08-24 | 年次更新。**唯一の行動ログ系なので枠は必ず維持** |

### 第3章 体感と実測（`perception-vs-measurement.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| 16人・246タスク・2025年2〜6月／**予測+24%・体感+20%・実測-19%** | [METR, 2025-07-10](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) | 2026-08-24 | 発表済み研究なので数値は不変 |
| **著者自身による実験デザインの見直し**／選択バイアス（30〜50%がタスクを提出しない・辞退増・時給150→50ドル）／後期推定 -18%（CI -38%〜+9%）と -4%（CI -15%〜+9%）／「非常に弱い証拠」 | [METR, 2026-02-24](https://metr.org/blog/2026-02-24-uplift-update/) | 2026-08-24 | **METRが再設計後の結果を出したら差し替え。**本章の主張の要なので必ず追う |
| AIは増幅器 | [Announcing the 2025 DORA Report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) | 2026-08-24 | 18章と共通の依存 |

### 第4章 実行環境（`execution-environment.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| **クラウドVMはローカルのチェックアウトではなくGitHubのリモートをクローンする**／バンドル送信の制約（100MB未満・untracked除外・push不可）／往復は片方向／teleportの4条件／隔離VM・ネットワーク既定制限・監査ログ・VM回収／**ネットワーク無効でもAnthropic APIとは通信できるためデータが出る可能性がある**／IP許可リストで認証エラー／GitHub以外はpush不可 | [Use Claude Code on the web（公式）](https://code.claude.com/docs/en/claude-code-on-the-web) | 2026-08-24 | **リサーチプレビュー段階の機能。**フラグ名・制約とも変わりやすい |
| 環境設定（ネットワーク・環境変数・セットアップスクリプト） | [Configure cloud environments（公式）](https://code.claude.com/docs/en/cloud-environments) | 2026-08-24 | 設定項目の増減 |
| クラウド実行時の隔離と認証情報の保護 | [Security（Claude Code 公式）](https://code.claude.com/docs/en/security) | 2026-08-24 | 6章と共通の依存 |
| 日本語圏では並列化の主流がローカルworktreeであること | 2026-08-23 時点の調査（Qiita/Zenn の worktree 記事群） | 2026-08-23 | **本文でColumnとして「現時点では先行した話」と明記済み。**クラウド事例が増えたら書き換える |

### 第6章 シークレット（`secrets.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| **本物の認証情報をサンドボックスに置かず、スコープ付きの資格情報をプロキシが実トークンに変換する**／pushは現在の作業ブランチに限定／全操作を監査記録／認証情報の保存場所 | [Security（Claude Code 公式）](https://code.claude.com/docs/en/security) | 2026-08-24 | 設計自体は安定。実装の詳細は変わりうる |
| **セッションにはコードと認証情報が含まれうるので共有前に確認**／個人向けプランの公開範囲とアクセス権検証の既定値 | [Use Claude Code on the web（公式）](https://code.claude.com/docs/en/claude-code-on-the-web) | 2026-08-24 | **既定値は変わりやすい。**公開範囲の記述は毎回確認 |
| 読み取りに対する禁止ルール | [Configure permissions（Claude Code 公式）](https://code.claude.com/docs/en/permissions) | 2026-08-24 | 5章・10章と共通の依存 |
| Git管理外ファイルをworktreeへコピーする仕組み | [Run parallel sessions with worktrees（公式）](https://code.claude.com/docs/en/worktrees) | 2026-08-24 | 7章と共通の依存 |

### 第7章 並列実行（`parallel-agents.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| worktreeの定義／**共有されるもの（`.git`・プロジェクトスコープのプラグイン・権限の承認）**／権限承認はメインチェックアウトに保存されリポジトリ全体に効く／**新しいチェックアウトなのでGit管理外ファイルと依存が無い**／後片付けの挙動と**非対話実行では片付かない** | [Run parallel sessions with worktrees（Claude Code 公式）](https://code.claude.com/docs/en/worktrees) | 2026-08-24 | **共有物の一覧が増減しうる。**権限承認の保存先は過去に変更履歴あり |
| worktreeのコマンド | [git worktree（Git 公式）](https://git-scm.com/docs/git-worktree) | 2026-08-24 | ほぼ不変 |
| 並列作業の増加による認知負荷 | [Claude Code導入3ヶ月後の社内アンケート（2025-10-23）](https://zenn.dev/readyfor_blog/articles/a1cfd81a562e07) | 2026-08-24 | 15章・18章と共通の依存 |
| **共有生成物の破壊の実例** | 本リポジトリの `AGENTS.md`（Veliteが `.velite/` を直接書き込むため並行実行でJSONが壊れる） | 2026-08-24 | **自前の事例。**リポジトリ側の構成が変わったら書き換える |

### 第8章 待たない設計（`async-and-notification.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| フックのイベント一覧／`Notification` の種類（権限確認待ち・アイドル・入力要求・完了）／`Stop`・`SubagentStop` の挙動／非同期フックの指定／端末通知の出力 | [Hooks reference（Claude Code 公式）](https://code.claude.com/docs/en/hooks) | 2026-08-24 | **イベント名と種類名は増減する。**本文で挙げた3イベントは中核なので比較的安定 |
| セッションがブラウザを閉じても継続／モバイルから確認／**PR自動修正の3分岐**／**自動応答は自分のGitHubアカウントで投稿され、コメント起動の自動化を誘発しうる**／**ベースブランチ前進によるコンフリクトはwebhookが出ないので反応できない** | [Use Claude Code on the web（公式）](https://code.claude.com/docs/en/claude-code-on-the-web) | 2026-08-24 | 4章と共通の依存。**副作用の警告は特に重要なので削らない** |
| スケジュール実行・イベント起点の自動実行 | [Routines（Claude Code 公式）](https://code.claude.com/docs/en/routines) | 2026-08-24 | 機能名が変わりうる |

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

### 第14章 検証ループ（`verification-loop.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| エージェントは終わったように見えたら止まる／検証手段の種類／指示の弱い例と強い例／停止を縛る4段階／**停止フックは連続8回ブロックで上書きされる**／証拠を出させる／レビュー役は指摘を出しすぎる | [Best practices for Claude Code（公式）](https://code.claude.com/docs/en/best-practices) | 2026-08-24 | **本章の依存が集中している。**8回という数値は実装依存で変わりうる |
| フックは決定的、指示ファイルは助言 | [Get started with hooks（Claude Code 公式）](https://code.claude.com/docs/en/hooks-guide) | 2026-08-24 | フックのイベント名が変わったとき |
| フックでツール入力を加工し出力を絞る実例 | [Manage costs effectively（Claude Code 公式）](https://code.claude.com/docs/en/costs) | 2026-08-24 | 17章と共通の依存 |

### 第16章 評価とリグレッション（`evaluation.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| エージェント評価が通常のテストと違う理由／**結果と記録の区別**／経路ではなく結果を採点／**20〜50件から始める**／完璧なスイートを待つな／モデル採点の4つの注意／採点器のバグを疑う（42%→95%の例）／飽和の監視／評価駆動開発／体制 | [Demystifying evals for AI agents（Anthropic, 2026-01-09）](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | 2026-08-24 | **本章はほぼこの1本に依存。**Anthropicが改訂・撤回したら全面見直し |
| 成功基準の立て方 | [Define success criteria and build evaluations（Claude 公式）](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) | 2026-08-24 | ドキュメント構成の変更 |

### 第17章 モデル選択とコスト（`model-and-cost.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| 毎リクエストで会話全体を送る／ツール利用ごとに追加のリクエスト／キャッシュ失効（1時間・5分）／**1人あたり稼働日13ドル・月150〜250ドル・90%が稼働日30ドル未満**／モデル階層の使い分け／思考は出力トークン課金／削減レバー7つ／**並列構成は約7倍**／使用量の内訳と10%フラグ | [Manage costs effectively（Claude Code 公式）](https://code.claude.com/docs/en/costs) | 2026-08-24 | **金額は最優先で再確認。**本文に「2026年8月時点」と明記済み。7倍という数値も実装依存 |
| キャッシュは前方一致／1バイト変わると以降が無効 | [Prompt caching（Claude 公式）](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) | 2026-08-24 | 挙動自体は安定。有効期間の数値は変わりうる |
| 単価そのもの | [Pricing（Claude 公式）](https://platform.claude.com/docs/en/about-claude/pricing) | 2026-08-24 | **本書には転記していない。**読者を誘導するリンクとしてのみ使用。`/docs/en/pricing` は404なのでこのパスを使う |

### 第18章 チーム導入（`team-adoption.mdx`）

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| AIは増幅器／約5,000人＋100時間超の定性データ／内部プラットフォームの品質・ワークフローの明確さ・足並みが価値の源／**90%が少なくとも1つのプラットフォームを採用**／7つのチーム類型の存在 | [Announcing the 2025 DORA Report（2025-09-24）](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) | 2026-08-24 | **DORAは年次更新。**次版が出たら差し替え |
| AIの効果を増幅する7つの能力が特定されている | [DORA AI Capabilities Model](https://dora.dev/research/ai/ai-capabilities-model/) | 2026-08-24 | **7つの名称はレポート本体（PDF）内にあり、Webページからは取得できなかった。**本文では名称を列挙していない。名称を載せるならPDFを取得して確認すること |
| 検証段階での目減り | [ROI of AI-assisted Software Development（DORA）](https://dora.dev/ai/) | 2026-08-24 | 15章と共通の依存 |
| 12名での生産性83%と負荷（並列66.7%・疲労42%・ストレス25%・品質ばらつき66.7%） | [Claude Code導入3ヶ月後の社内アンケート（2025-10-23）](https://zenn.dev/readyfor_blog/articles/a1cfd81a562e07) | 2026-08-24 | 15章と共通の依存 |

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

### 第19章 ツールの分類（`tool-landscape.mdx`）— **要更新**

| 主張 | 出典 | 確認日 | 何が変わったら見直すか |
| --- | --- | --- | --- |
| **AGENTS.md 対応ツール23件の一覧**／6万超のプロジェクトで採用 | [agents.md](https://agents.md/) | 2026-08-24 | **半年ごとに一覧を取り直す。**掲載ツールは増減する |
| 実行場所（ローカル／クラウド／リモート操作）と操作面の分離 | [How Claude Code works（公式）](https://code.claude.com/docs/en/how-claude-code-works) | 2026-08-24 | 概念は安定 |
| MCPがツール接続の共通規約になっていること | [modelcontextprotocol.io](https://modelcontextprotocol.io/docs/getting-started/intro) | 2026-08-24 | 13章と共通の依存 |

**方針** — この章では**製品の優劣・ランキングを書かない**。比較記事由来の順位付けは根拠が不透明なため一切採用していない。書いてあるのは「評価すべき7項目」という軸と、規約対応ツールの一覧のみ。

### 第20章 チートシート（`cheatsheet.mdx`）— **要更新**

本書各章の要約なので、**独自の出典はない**。参照しているのは以下で、いずれも該当章と共通の依存。

- [How Claude remembers your project](https://code.claude.com/docs/en/memory)（200行の目安・具体性の指針）
- [Configure permissions](https://code.claude.com/docs/en/permissions)（評価順）
- [Hooks reference](https://code.claude.com/docs/en/hooks)（イベント）
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)（検証手段）
- [agents.md](https://agents.md/)

**更新のしかた** — 各章を直したら、この章の該当箇所も直す。**この章だけ単独で更新しない**（本文と食い違うと最も害が大きい）。

---

## 公開作業の記録（2026-08-24 完了）

`docs/books.md` の「デプロイ後の作業」1〜6の実施状況。

| # | 項目 | 状態 |
| --- | --- | --- |
| 1 | テーマカラー（`src/lib/book-theme.ts`） | ✅ `stone` ＋ アイコン `Bot`。**`Bot` は `BookCard.tsx` と `HeaderNav.tsx` の両方の `iconMap` にも追加が必要だった**（片方だけだとフォールバックして別アイコンになる） |
| 2 | 表示順（`BOOK_ORDER`） | ✅ 先頭に追加 |
| 3 | NEWバッジ（`NEW_BOOK_SLUGS`） | ✅ 追加。一定期間後に外す |
| 4 | クイズカテゴリ連携（`categoryToBookMap`） | ⏭️ **未実施**。対応するクイズカテゴリが存在しないため。カテゴリを作ったら追加する |
| 5 | 検索サジェスト（`searchSuggestions.ts`） | ✅ 15語 |
| 6 | トップページのお知らせ（`src/app/page.tsx` の `NEWS`） | ✅ 2026/08/24 で先頭に追加 |

色の選定について: 既存23冊で未使用だったのは `gray` / `neutral` / `stone` のみだった（`sky`・`zinc`・`orange`・`blue`・`indigo` はすでに2冊ずつ使用）。表紙画像のテラコッタ系と馴染む `stone` を選択。

**検証** — `npx tsc --noEmit` は通過。**表示確認は未実施**（AGENTS.md の方針により devサーバーを起動していない）。

---

## 使わないと決めたもの

同じ調査を繰り返さないための記録。

| 除外したもの | 理由 |
| --- | --- |
| いいね1件のZenn記事（ガバナンス5判断軸） | 反応が乏しく、個人の設計案1本。内容の筋は通っていたが根拠として弱い |
| DORA 2025の7つのチーム類型の**構成比**（Harmonious high-achievers 20%、Constrained by process 17% など） | 二次記事には割合が出ているが、一次ページからは類型名2つしか確認できず、割合は裏が取れなかった。18章では「類型が複数ある」という事実だけを使い、数値は載せていない。載せるならレポート本体を取得すること |
| DORA AI Capabilities Model の7つの能力の**名称** | モデルのWebページには名称が載っておらず、レポート本体（PDF）内にある。18章では「7つの能力が特定されている」とだけ書いている |
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
