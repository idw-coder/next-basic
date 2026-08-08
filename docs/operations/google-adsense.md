# Google AdSense 広告設定メモ

最終確認日: 2026-08-08

## 現在の広告構成

### 自動広告（Auto Ads）— 有効

`src/app/layout.tsx` で `adsbygoogle.js` スクリプトを読み込んでおり、AdSense 管理画面側でオート広告が有効であれば Google が自動的にページを分析して広告を配置する。

```
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxx"
  crossOrigin="anonymous"
/>
```

### 手動広告（Manual Ads）— フッターで使用

`GoogleAdSense` コンポーネント（`<ins>` 要素による手動配置）は `src/app/layout.tsx` のフッターで描画している。

開発環境では `GoogleAdSense` が `null` を返すため表示されない。本番環境で `NEXT_PUBLIC_ADSENSE_CLIENT_ID` と `NEXT_PUBLIC_ADSENSE_SLOT` が設定されている場合に利用する。

## UI 変更時の自動広告への影響

自動広告はページの DOM 構造を解析して広告の配置位置を決定するため、UI を大幅に変更した場合は以下の影響が出る可能性がある。

- **広告が一時的に表示されなくなる**: Google のクローラーが新しいページ構造を再分析するまで数時間〜数日かかることがある。
- **配置位置が変わる**: 新しいレイアウトに合わせて Google が最適と判断した位置に再配置される。
- **広告密度が変わる**: ページ構成によって表示される広告数が増減する場合がある。

### 対処

基本的には数日待てば自動的に回復する。回復しない場合は以下を確認する。

1. AdSense 管理画面でオート広告が有効になっているか
2. サイトの `ads.txt` が正しく配信されているか
3. AdSense 管理画面にポリシー違反の通知が来ていないか

## 環境変数

| 変数名 | 説明 |
|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense パブリッシャー ID（`ca-pub-xxx`） |
| `NEXT_PUBLIC_ADSENSE_SLOT` | 広告スロット ID（フッターの手動広告用） |

## 広告の非表示制御

### entry モード

`?mode=entry` パラメータ付きでアクセスした場合、`sessionStorage` にフラグを保存し、そのタブが開いている間は広告を CSS で非表示にする仕組みがある（`HideAdsForEntry` コンポーネント）。タブを閉じると解除される。

### Stripe サブスクリプション（Pro プラン）— 実装予定

Pro プラン（月額 ¥980 / 年額 ¥7,980）の特典として「広告の非表示」を提供予定。`SubscriptionClient.tsx` のプラン定義に記載済み。

現在 Stripe 決済機能は準備中（ボタンは disabled）のため、サブスクリプションによる広告非表示制御は未実装。正式リリース時に、ログインユーザーの Pro プラン契約状態を判定して `adsbygoogle.js` の読み込みまたは広告要素の表示を制御する仕組みを実装する必要がある。
