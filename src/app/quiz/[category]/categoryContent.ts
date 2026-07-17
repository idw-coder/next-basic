export interface CategoryFaq {
  question: string;
  answer: string;
}

export interface CategoryTopic {
  title: string;
  description: string;
}

export interface CategorySeoContent {
  overview: string;
  whyLearn: string;
  topics: CategoryTopic[];
  faqs: CategoryFaq[];
  targetAudience: string[];
  relatedCategories: { slug: string; name: string }[];
}

const categoryContentMap: Record<string, CategorySeoContent> = {
  "react-basic": {
    overview:
      "Reactは、Meta（旧Facebook）が開発したJavaScriptライブラリで、ユーザーインターフェースを構築するために広く利用されています。このReact基礎クイズでは、JSX、props、state、useState、useEffect、useRef、再レンダー、依存配列など、初学者がつまずきやすい重要テーマを4択問題で確認できます。コンポーネントベースの考え方を押さえながら、実務で必要になるReact Hooksの判断力も身につけられます。",
    whyLearn:
      "Reactは世界中のフロントエンド開発現場で最も採用されているライブラリの一つです。Next.js、Gatsby、Remixなどのフレームワークの基盤でもあり、Reactを習得することでモダンなWebアプリケーション開発のスキルを身につけられます。特にuseStateの更新、useEffectのクリーンアップ、useRefとstateの違い、React.memoやuseCallbackの使いどころは、面接や実装レビューでも問われやすい知識です。",
    topics: [
      {
        title: "JSXとコンポーネント",
        description:
          "ReactのUI記述言語であるJSXの文法、関数コンポーネント、props、children、リストのkey、条件付きレンダリングの落とし穴を学びます。",
      },
      {
        title: "React Hooksと依存配列",
        description:
          "useState、useEffect、useRef、useMemo、useCallbackの使い方に加えて、依存配列、stale closure、クリーンアップ関数、不要なEffectについて出題します。",
      },
      {
        title: "状態管理とフォーム",
        description:
          "コンポーネントのローカル状態管理、オブジェクトstateのイミュータブル更新、controlled component、Context APIの基本的な考え方を扱います。",
      },
      {
        title: "ライフサイクルと再レンダー",
        description:
          "レンダーとマウントの違い、再レンダーの発生条件、StrictModeでEffectが2回実行される理由、hydration mismatch、メモ化の判断基準について理解を深めます。",
      },
    ],
    faqs: [
      {
        question: "Reactの学習にはどのくらい時間がかかりますか？",
        answer:
          "JavaScript の基礎知識がある方であれば、基本的なコンポーネント作成やHooksの使い方は2〜4週間ほどで習得できます。より実践的なアプリケーション開発を行うには3〜6ヶ月程度の継続的な学習をおすすめします。",
      },
      {
        question: "ReactとVue.jsはどちらを先に学ぶべきですか？",
        answer:
          "どちらも優れたフレームワークですが、求人数やエコシステムの規模を考慮すると、Reactを先に学ぶことが多いです。Vue.jsは学習コストが低いため、Web開発初心者にはVue.jsから始めるのも良い選択肢です。",
      },
      {
        question: "このクイズはReact初心者でも解けますか？",
        answer:
          "はい、JSXやコンポーネントの基礎から、useState、useEffect、useRef、再レンダー、依存配列のようなReact Hooksの重要テーマまで段階的に出題しています。わからない問題があっても解説と関連教材リンクを読みながら学習できます。",
      },
    ],
    targetAudience: [
      "フロントエンド開発を学び始めたエンジニア",
      "Vue.jsやAngularからReactへの移行を検討している方",
      "React Hooksの理解を深めたい方",
      "転職・就職面接のためにReactの知識を確認したい方",
    ],
    relatedCategories: [
      { slug: "javascript-basic", name: "JavaScript基礎" },
      { slug: "ts-general", name: "TypeScript" },
      { slug: "html-basic", name: "HTML基礎" },
    ],
  },

  "html-basic": {
    overview:
      "HTMLはWebページの構造を定義するマークアップ言語であり、すべてのWeb開発の基盤です。HTML5では、セマンティックタグ（header、nav、article、section等）やマルチメディア対応（video、audio）、フォームの新しい入力タイプなど、Webアプリケーション開発に欠かせない機能が追加されました。アクセシビリティやSEOにおいても、正しいHTMLの記述は極めて重要です。",
    whyLearn:
      "HTMLはWeb開発者にとって最も基本的かつ重要なスキルです。正しいセマンティックHTMLを書けることは、SEO対策、アクセシビリティ向上、保守性の高いコードを実現する基盤となります。フロントエンドフレームワークを使う場合でも、HTMLの深い理解が開発品質に直結します。",
    topics: [
      {
        title: "セマンティックHTML",
        description:
          "header、main、footer、article、section、nav などのセマンティックタグの正しい使い分けについて出題します。",
      },
      {
        title: "フォームと入力要素",
        description:
          "input要素のtype属性、バリデーション属性（required、pattern等）、フォームのアクセシビリティ対応を扱います。",
      },
      {
        title: "メタデータとSEO",
        description:
          "head要素内のmeta、title、link、OGP（Open Graph Protocol）タグなど、SEOに関わるHTML要素について学びます。",
      },
      {
        title: "アクセシビリティ（a11y）",
        description:
          "WAI-ARIA属性、alt属性、ランドマーク、フォーカス管理など、Webアクセシビリティに関する問題を出題します。",
      },
    ],
    faqs: [
      {
        question: "HTMLだけでWebサイトは作れますか？",
        answer:
          "HTMLだけで構造を持つWebページは作成できますが、見た目を整えるにはCSS、動的な機能を追加するにはJavaScriptが必要です。HTMLはWebサイトの土台となる最初のステップです。",
      },
      {
        question: "HTML5の主な新機能は何ですか？",
        answer:
          "HTML5ではセマンティックタグ（header、footer、article等）、video/audio要素、Canvas、localStorage/sessionStorage、新しいフォーム入力タイプ（email、date、range等）などが追加されました。",
      },
      {
        question: "セマンティックHTMLを使うメリットは？",
        answer:
          "検索エンジンがページの構造を正しく理解でき、SEO効果が向上します。また、スクリーンリーダーなどの支援技術がコンテンツを適切に読み上げられるため、アクセシビリティも改善されます。",
      },
    ],
    targetAudience: [
      "Web開発を始めたばかりの初学者",
      "SEOに強いWebページを作りたい方",
      "アクセシビリティへの理解を深めたい方",
      "フロントエンド開発の基礎を固めたいエンジニア",
    ],
    relatedCategories: [
      { slug: "javascript-basic", name: "JavaScript基礎" },
      { slug: "react-basic", name: "React基礎" },
      { slug: "security-general", name: "セキュリティ" },
    ],
  },

  "javascript-basic": {
    overview:
      "JavaScriptはWeb開発において不可欠なプログラミング言語です。ブラウザ上で動的なインタラクションを実現するクライアントサイドから、Node.jsを利用したサーバーサイド開発まで、幅広い領域で使用されています。ES6以降の仕様で大幅に改善され、アロー関数、分割代入、Promise/async-await、モジュールシステムなどのモダンな文法が標準となりました。",
    whyLearn:
      "JavaScriptはフロントエンドで唯一のプログラミング言語であり、React、Vue.js、Angularなど主要なフレームワークの基盤です。さらにNode.jsによりサーバーサイド開発も可能で、フルスタック開発を1つの言語で実現できます。npmエコシステムの豊富さも大きな強みです。",
    topics: [
      {
        title: "ES6+モダン構文",
        description:
          "const/let、アロー関数、テンプレートリテラル、分割代入、スプレッド構文、オプショナルチェイニングなどのモダンな構文を扱います。",
      },
      {
        title: "非同期処理",
        description:
          "コールバック、Promise、async/await、イベントループの仕組みなど、JavaScriptの非同期処理パターンを出題します。",
      },
      {
        title: "DOM操作とイベント",
        description:
          "DOM APIを使った要素の取得・操作、イベントリスナー、イベントバブリング/キャプチャなどを扱います。",
      },
      {
        title: "クロージャとスコープ",
        description:
          "レキシカルスコープ、クロージャ、this の挙動、変数のホイスティングなど、JavaScript特有の概念を問います。",
      },
    ],
    faqs: [
      {
        question: "JavaScriptとTypeScriptはどちらを学ぶべきですか？",
        answer:
          "まずJavaScriptの基礎をしっかり理解することをおすすめします。TypeScriptはJavaScriptの上位互換であるため、JavaScript の理解があればスムーズに移行できます。実務では TypeScript が主流になりつつあるため、基礎を固めた後にTypeScriptも学びましょう。",
      },
      {
        question: "ES6とは何ですか？",
        answer:
          "ES6（ECMAScript 2015）はJavaScriptの仕様の大幅なアップデートで、アロー関数、クラス構文、Promise、テンプレートリテラル、モジュールシステムなどが導入されました。現在のモダンJavaScript開発の基盤となっています。",
      },
      {
        question: "JavaScriptの学習順序はどうすればよいですか？",
        answer:
          "変数・型→制御構文→関数→配列・オブジェクト→DOM操作→非同期処理（Promise/async-await）→ES6+構文の順で学習するのが効率的です。基礎を固めてからReactやNode.jsなどのフレームワークに進みましょう。",
      },
    ],
    targetAudience: [
      "プログラミングを学び始めた初学者",
      "ES6以降のモダンな構文に慣れたい方",
      "フロントエンド・フルスタック開発を目指す方",
      "JavaScript面接対策をしたいエンジニア",
    ],
    relatedCategories: [
      { slug: "ts-general", name: "TypeScript" },
      { slug: "react-basic", name: "React基礎" },
      { slug: "nodejs-basic", name: "Node.js基礎" },
    ],
  },

  "vue-basic": {
    overview:
      "Vue.jsは、Evan You氏が開発したプログレッシブJavaScriptフレームワークです。段階的に導入できる設計思想が特徴で、小規模なプロジェクトから大規模なSPA（Single Page Application）まで幅広く対応できます。Vue 3ではComposition APIが導入され、TypeScriptとの親和性やロジックの再利用性が大幅に向上しました。",
    whyLearn:
      "Vue.jsは学習コストが低く、公式ドキュメントが充実しており、日本語ドキュメントも整備されています。日本の開発現場でも採用事例が多く、特にスタートアップや中小規模のプロジェクトで人気があります。ReactやAngularと並ぶ三大フレームワークの一つとして、求人市場でも需要があります。",
    topics: [
      {
        title: "Options API と Composition API",
        description:
          "Vue 2のOptions APIとVue 3のComposition API（setup関数、ref、reactive等）の違いと使い分けを出題します。",
      },
      {
        title: "テンプレート構文とディレクティブ",
        description:
          "v-bind、v-model、v-if/v-show、v-for、v-onなどのディレクティブとテンプレート構文について扱います。",
      },
      {
        title: "コンポーネント設計",
        description:
          "props、emit、slot、provide/injectを使ったコンポーネント間のデータ受け渡しパターンを問います。",
      },
      {
        title: "リアクティブシステム",
        description:
          "Vueのリアクティブシステムの仕組み、computed、watch、watchEffectの使い分けについて学びます。",
      },
    ],
    faqs: [
      {
        question: "Vue 2とVue 3のどちらを学ぶべきですか？",
        answer:
          "新規プロジェクトではVue 3が推奨されています。Vue 2は2023年末にサポートが終了したため、これから学ぶ方はVue 3のComposition APIを中心に学習しましょう。ただし、既存プロジェクトの保守のためにOptions APIの理解も重要です。",
      },
      {
        question: "NuxtとVue CLIの違いは何ですか？",
        answer:
          "Vue CLIはVue.jsのSPAを構築するためのツールです。NuxtはVue.jsベースのフルスタックフレームワークで、SSR（サーバーサイドレンダリング）、SSG（静的サイト生成）、ファイルベースルーティングなどの機能を提供します。SEOが重要なサイトにはNuxtが適しています。",
      },
      {
        question: "Vue.jsでの状態管理はどうすればよいですか？",
        answer:
          "小〜中規模ではComposition APIのcomposablesやprovide/injectで十分対応できます。大規模アプリケーションではPinia（Vue公式推奨の状態管理ライブラリ）を利用するのがベストプラクティスです。",
      },
    ],
    targetAudience: [
      "フロントエンド開発をこれから学び始める方",
      "Vue 2からVue 3への移行を検討しているエンジニア",
      "Composition APIの使い方を習得したい方",
      "NuxtやVuetifyなどのVueエコシステムを活用したい方",
    ],
    relatedCategories: [
      { slug: "javascript-basic", name: "JavaScript基礎" },
      { slug: "ts-general", name: "TypeScript" },
      { slug: "html-basic", name: "HTML基礎" },
    ],
  },

  "nodejs-basic": {
    overview:
      "Node.jsは、Chrome V8エンジン上に構築されたサーバーサイドJavaScriptランタイムです。非同期I/Oとイベント駆動アーキテクチャにより、高い並行処理性能を実現しています。Express、Fastify、NestJSなどのフレームワークを活用し、REST API、GraphQL、WebSocketを使ったリアルタイムアプリケーションなど、幅広いサーバーサイド開発が可能です。",
    whyLearn:
      "Node.jsを習得するとフロントエンドと同じJavaScriptでサーバーサイド開発ができ、フルスタック開発者としてのスキルセットが完成します。npmという世界最大のパッケージレジストリを活用でき、開発効率が大幅に向上します。スタートアップを中心に採用が広がっています。",
    topics: [
      {
        title: "非同期I/Oとイベントループ",
        description:
          "Node.jsの非同期I/Oモデル、イベントループの仕組み、コールバック、Promise、async/awaitの使い分けを出題します。",
      },
      {
        title: "Express / REST API",
        description:
          "Expressフレームワークを使ったルーティング、ミドルウェア、エラーハンドリング、RESTfulなAPI設計について扱います。",
      },
      {
        title: "モジュールシステム",
        description:
          "CommonJS（require/module.exports）とESM（import/export）の違い、パッケージ管理（npm/yarn）について問います。",
      },
      {
        title: "セキュリティとパフォーマンス",
        description:
          "環境変数の管理、CORS、レート制限、入力バリデーション、クラスタリングなど実務で重要なトピックを扱います。",
      },
    ],
    faqs: [
      {
        question: "Node.jsは何に向いていますか？",
        answer:
          "リアルタイム通信（チャット、通知等）、REST/GraphQL API、マイクロサービス、CLI ツールの開発に特に向いています。一方、CPU負荷の高い処理（画像処理、機械学習等）にはあまり適していません。",
      },
      {
        question: "ExpressとNestJSはどう違いますか？",
        answer:
          "Expressはミニマルで柔軟なNode.jsフレームワークで、自由度が高い反面、アーキテクチャは開発者次第です。NestJSはAngularにインスパイアされたフルフレームワークで、DI（依存性注入）やデコレータベースの構造化されたアーキテクチャを提供します。",
      },
      {
        question: "Node.jsのバージョン管理はどうすればよいですか？",
        answer:
          "nvm（Node Version Manager）やvolta、fnm を使ってプロジェクトごとにNode.jsのバージョンを切り替えるのがベストプラクティスです。LTS（Long Term Support）バージョンの使用が推奨されます。",
      },
    ],
    targetAudience: [
      "フロントエンド開発者でサーバーサイドにも挑戦したい方",
      "REST APIの設計・実装を学びたい方",
      "フルスタック開発者を目指す方",
      "Node.jsを使った実務経験を積みたいエンジニア",
    ],
    relatedCategories: [
      { slug: "javascript-basic", name: "JavaScript基礎" },
      { slug: "ts-general", name: "TypeScript" },
      { slug: "aws-basic", name: "AWS基礎" },
    ],
  },

  "aws-basic": {
    overview:
      "AWS（Amazon Web Services）は、Amazonが提供するクラウドコンピューティングプラットフォームで、200以上のサービスを展開しています。EC2（仮想サーバー）、S3（オブジェクトストレージ）、RDS（マネージドDB）、Lambda（サーバーレス）など、Webアプリケーションのインフラ構築に必要なサービスが揃っています。世界シェア1位のクラウドプラットフォームです。",
    whyLearn:
      "クラウドインフラの知識はモダンなWeb開発において必須スキルとなっています。AWSはクラウド市場で最大のシェアを持ち、多くの企業で採用されています。AWS認定資格も転職・キャリアアップにおいて高く評価されており、インフラエンジニアだけでなくアプリケーション開発者にも求められるスキルです。",
    topics: [
      {
        title: "EC2・VPC・ネットワーク",
        description:
          "EC2インスタンスの管理、VPCの設計、セキュリティグループ、サブネット構成など、基本的なインフラ構築を出題します。",
      },
      {
        title: "S3・CloudFront",
        description:
          "S3バケットの設定、静的ホスティング、CloudFrontによるCDN配信、アクセス制御（IAMポリシー、バケットポリシー）を扱います。",
      },
      {
        title: "RDS・DynamoDB",
        description:
          "RDSの基本操作、マルチAZ配置、リードレプリカ、DynamoDBのパーティションキー設計など、データベースサービスを問います。",
      },
      {
        title: "Lambda・サーバーレス",
        description:
          "AWS Lambda、API Gateway、SQS、SNSなどを組み合わせたサーバーレスアーキテクチャについて出題します。",
      },
    ],
    faqs: [
      {
        question: "AWSの学習は無料でできますか？",
        answer:
          "AWSには12ヶ月間の無料利用枠（Free Tier）があり、多くのサービスを無料で試すことができます。また、公式のトレーニング動画やハンズオンラボも一部無料で利用できます。",
      },
      {
        question: "AWS認定資格は取得すべきですか？",
        answer:
          "実務経験と併せてAWS認定資格を取得すると、スキルの客観的な証明になります。まずはクラウドプラクティショナー（CLF）やソリューションアーキテクト アソシエイト（SAA）から始めるのがおすすめです。",
      },
      {
        question: "AWSとGCP、Azureのどれを学ぶべきですか？",
        answer:
          "市場シェアと求人数の観点ではAWSが最も多いです。ただし、GCPはデータ分析・機械学習に、Azureはエンタープライズ（Microsoft製品連携）に強みがあります。まずはAWSで基礎を学び、必要に応じて他のクラウドに展開するのが効率的です。",
      },
    ],
    targetAudience: [
      "クラウドインフラを学び始めたいエンジニア",
      "AWS認定資格の取得を目指している方",
      "自分のWebアプリをAWSにデプロイしたい方",
      "オンプレミスからクラウドへの移行を担当する方",
    ],
    relatedCategories: [
      { slug: "nodejs-basic", name: "Node.js基礎" },
      { slug: "nginx-basic", name: "Nginx基礎" },
      { slug: "security-general", name: "セキュリティ" },
    ],
  },

  "git-basic": {
    overview:
      "Gitは、Linus Torvalds氏が開発した分散型バージョン管理システムです。ソースコードの変更履歴を追跡し、複数人での並行開発を可能にします。ブランチ、マージ、リベースなどの機能により、効率的なチーム開発ワークフロー（Git Flow、GitHub Flowなど）を実現できます。GitHub、GitLabと連携したモダンな開発プロセスに不可欠なツールです。",
    whyLearn:
      "Gitはほぼすべてのソフトウェア開発プロジェクトで使用されており、開発者にとって必須のスキルです。正しいGitの知識は、チーム開発での生産性向上、コンフリクト解消、コードレビューの効率化に直結します。GitHubを活用したOSS活動やポートフォリオ作成にも欠かせません。",
    topics: [
      {
        title: "基本コマンド",
        description:
          "git add、commit、push、pull、clone、status、log、diffなど日常的に使用するコマンドについて出題します。",
      },
      {
        title: "ブランチとマージ",
        description:
          "ブランチの作成・切り替え・削除、マージとリベースの違い、コンフリクト解消の方法を扱います。",
      },
      {
        title: "チーム開発ワークフロー",
        description:
          "Git Flow、GitHub Flow、プルリクエスト、コードレビューの進め方について問います。",
      },
      {
        title: "高度な操作",
        description:
          "cherry-pick、stash、reset（soft/mixed/hard）、reflog、.gitignoreの書き方など応用テクニックを出題します。",
      },
    ],
    faqs: [
      {
        question: "GitとGitHubは何が違いますか？",
        answer:
          "Gitはバージョン管理ツール（ソフトウェア）であり、ローカル環境で動作します。GitHubはGitリポジトリをホスティングするWebサービスで、プルリクエスト、Issue管理、CI/CDなどの協働開発機能を提供します。",
      },
      {
        question: "git mergeとgit rebaseはどう使い分けますか？",
        answer:
          "mergeはブランチの履歴を保持したまま統合し、マージコミットが作成されます。rebaseはコミット履歴を直線的に整理できますが、共有ブランチでの使用は注意が必要です。チームのコンベンションに従って使い分けましょう。",
      },
      {
        question: "コンフリクトが起きたらどうすればよいですか？",
        answer:
          "コンフリクトマーカー（<<<<<<<、=======、>>>>>>>）を確認し、手動で正しいコードを選択・編集します。その後 git add で解決済みとしてマークし、commit します。VSCodeなどのエディタにはコンフリクト解消の支援機能があります。",
      },
    ],
    targetAudience: [
      "バージョン管理をこれから学びたい初学者",
      "チーム開発でGitを効率的に使いたい方",
      "Git の高度な操作を習得したいエンジニア",
      "OSS活動やGitHubでのポートフォリオ作成を始めたい方",
    ],
    relatedCategories: [
      { slug: "javascript-basic", name: "JavaScript基礎" },
      { slug: "nodejs-basic", name: "Node.js基礎" },
      { slug: "security-general", name: "セキュリティ" },
    ],
  },

  "nginx-basic": {
    overview:
      "Nginxは、高性能なWebサーバー/リバースプロキシサーバーとして世界中で広く利用されています。イベント駆動の非同期アーキテクチャにより、少ないリソースで大量の同時接続を処理できます。静的ファイル配信、リバースプロキシ、ロードバランシング、SSL/TLS終端、キャッシュなど、Webインフラの中核を担う重要な技術です。",
    whyLearn:
      "NginxはApacheと並ぶ主要Webサーバーで、特に高トラフィックなサイトでの採用が増えています。Webアプリケーションのデプロイ、HTTPS化、パフォーマンスチューニングなどインフラ周りの知識は、DevOpsやSREを目指す方はもちろん、アプリケーション開発者にとっても重要なスキルです。",
    topics: [
      {
        title: "基本設定と構成",
        description:
          "nginx.confの構造、serverブロック、locationブロック、ディレクティブの優先順位について出題します。",
      },
      {
        title: "リバースプロキシ",
        description:
          "proxy_passディレクティブ、upstream設定、ヘッダーの付与、WebSocketプロキシの設定を扱います。",
      },
      {
        title: "SSL/TLSとHTTPS",
        description:
          "SSL証明書の設定、Let's Encryptでの自動更新、HTTP→HTTPSリダイレクト、セキュリティヘッダーについて問います。",
      },
      {
        title: "パフォーマンスチューニング",
        description:
          "gzip圧縮、静的ファイルのキャッシュ設定、worker_processesの最適化、レート制限の設定を出題します。",
      },
    ],
    faqs: [
      {
        question: "NginxとApacheはどう違いますか？",
        answer:
          "Nginxはイベント駆動型で、大量の同時接続処理に優れています。Apacheはプロセス/スレッドベースで、.htaccessによる柔軟なディレクトリ単位の設定が可能です。高トラフィック環境ではNginx、レガシーシステムや共有ホスティングではApacheが多く使われます。",
      },
      {
        question: "Nginxでリバースプロキシを設定するメリットは？",
        answer:
          "アプリケーションサーバー（Node.js、Django等）の前段にNginxを置くことで、SSL終端、静的ファイル配信、ロードバランシング、キャッシュ、セキュリティ保護を効率的に行えます。",
      },
      {
        question: "Nginxの設定変更後は何をすべきですか？",
        answer:
          "設定変更後は `nginx -t` で構文チェックを行い、問題なければ `nginx -s reload` で設定を再読み込みします。再起動（restart）と異なり、reloadはダウンタイムなしで設定を反映できます。",
      },
    ],
    targetAudience: [
      "Webアプリケーションのデプロイを学びたい方",
      "インフラ・DevOpsエンジニアを目指す方",
      "HTTPS化やパフォーマンスチューニングに取り組みたい方",
      "Docker環境でのWebサーバー構築を学びたい方",
    ],
    relatedCategories: [
      { slug: "aws-basic", name: "AWS基礎" },
      { slug: "nodejs-basic", name: "Node.js基礎" },
      { slug: "security-general", name: "セキュリティ" },
    ],
  },

  "security-general": {
    overview:
      "Webセキュリティは、Webアプリケーションやそのユーザーを脅威から保護するための技術と知識の総体です。XSS（クロスサイトスクリプティング）、CSRF（クロスサイトリクエストフォージェリ）、SQLインジェクション、認証・認可の脆弱性など、Webアプリケーション特有の攻撃手法とその対策を理解することは、安全なシステム開発の基盤となります。",
    whyLearn:
      "セキュリティインシデントは企業の信用と損害に直結するため、開発者全員がセキュリティの基礎知識を持つことが求められています。OWASP Top 10に代表される脆弱性の理解と対策は、セキュアなアプリケーション開発の第一歩です。セキュリティエンジニアでなくても、この知識は採用面接でも頻繁に問われます。",
    topics: [
      {
        title: "XSS・CSRFの攻撃と対策",
        description:
          "クロスサイトスクリプティング、クロスサイトリクエストフォージェリの仕組みと、エスケープ処理やCSRFトークンによる対策を出題します。",
      },
      {
        title: "認証・認可",
        description:
          "JWT、セッション管理、OAuth 2.0、パスワードハッシュ化（bcrypt等）、多要素認証などの認証・認可の仕組みを扱います。",
      },
      {
        title: "HTTPS・暗号化",
        description:
          "SSL/TLS、証明書、HSTS、暗号化アルゴリズム、公開鍵暗号方式などの通信セキュリティについて問います。",
      },
      {
        title: "SQLインジェクション・入力検証",
        description:
          "SQLインジェクションの仕組みと対策（プリペアドステートメント等）、入力バリデーション、サニタイズ処理を出題します。",
      },
    ],
    faqs: [
      {
        question: "OWASP Top 10とは何ですか？",
        answer:
          "OWASP（Open Web Application Security Project）が発表する、Webアプリケーションで最も危険な脆弱性のトップ10リストです。インジェクション、認証の不備、機密データの露出などが含まれ、セキュリティ対策の指針として広く参照されています。",
      },
      {
        question: "開発者はどの程度セキュリティを学ぶべきですか？",
        answer:
          "最低限、OWASP Top 10の各脆弱性の概要と基本的な対策は理解すべきです。特にXSS、CSRF、SQLインジェクションの対策、安全な認証の実装、HTTPS の必要性は必須知識です。",
      },
      {
        question: "JWTとセッション認証はどちらがよいですか？",
        answer:
          "それぞれ長所短所があります。JWTはステートレスでスケーラビリティに優れ、マイクロサービスに適しています。セッション認証はサーバー側で管理するためトークン無効化が容易です。要件に応じて選択しましょう。",
      },
    ],
    targetAudience: [
      "セキュアなWebアプリケーションを開発したい方",
      "セキュリティの基礎知識を身につけたいエンジニア",
      "脆弱性診断やペネトレーションテストに興味がある方",
      "OWASP Top 10を学びたい方",
    ],
    relatedCategories: [
      { slug: "nodejs-basic", name: "Node.js基礎" },
      { slug: "html-basic", name: "HTML基礎" },
      { slug: "nginx-basic", name: "Nginx基礎" },
    ],
  },

  "sql-basic": {
    overview:
      "SQLは、リレーショナルデータベースに対してデータの取得・追加・更新・削除を行うための標準的な言語です。SELECT、WHERE、JOIN、GROUP BYなどの基本構文から、制約、インデックス、トランザクション、正規化まで、Webアプリケーション開発で日常的に使う知識を幅広く扱います。",
    whyLearn:
      "多くのWebサービスはMySQLやPostgreSQLなどのデータベースを利用しており、SQLの理解はバックエンド開発やデータ分析の土台になります。適切なクエリを書けることは、機能実装だけでなく、パフォーマンス改善、データ整合性の維持、障害調査にも直結します。",
    topics: [
      {
        title: "基本構文とCRUD",
        description:
          "SELECT、INSERT、UPDATE、DELETE、WHERE、ORDER BY、LIMITなど、日常的に使うSQL文の基本を出題します。",
      },
      {
        title: "JOINと集計",
        description:
          "INNER JOIN、LEFT JOIN、GROUP BY、HAVING、COUNT、DISTINCTなど、複数テーブルや集計処理に関する知識を扱います。",
      },
      {
        title: "制約とテーブル設計",
        description:
          "PRIMARY KEY、FOREIGN KEY、UNIQUE制約、正規化、1対多・多対多の関係など、データ設計の基礎を問います。",
      },
      {
        title: "実践的な運用知識",
        description:
          "インデックス、トランザクション、COMMIT、ROLLBACK、EXPLAIN、SQLインジェクション対策など、実務で重要なトピックを扱います。",
      },
    ],
    faqs: [
      {
        question: "SQLは初心者でも学びやすいですか？",
        answer:
          "はい、SELECTやWHEREなどの基本構文は比較的短い文で試せるため、初学者でも始めやすい分野です。まずはデータを取得するクエリから学び、JOINや集計、トランザクションへ段階的に進むと理解しやすくなります。",
      },
      {
        question: "SQLとMySQLは何が違いますか？",
        answer:
          "SQLはデータベースを操作するための言語で、MySQLはSQLを使って操作するリレーショナルデータベース管理システムの一つです。PostgreSQL、SQLite、SQL ServerなどもSQLを利用しますが、細かな文法や機能には違いがあります。",
      },
      {
        question: "Web開発者にSQLの知識は必要ですか？",
        answer:
          "はい、必要です。ユーザー、注文、記事、ログなど多くのアプリケーションデータはデータベースに保存されます。SQLを理解していると、API実装、管理画面開発、パフォーマンス改善、障害調査をより正確に進められます。",
      },
    ],
    targetAudience: [
      "バックエンド開発やデータベース操作を学びたい方",
      "MySQLやPostgreSQLの基礎を確認したいエンジニア",
      "JOINや集計クエリに苦手意識がある方",
      "SQLインジェクションやトランザクションなど実務知識を押さえたい方",
    ],
    relatedCategories: [
      { slug: "nodejs-basic", name: "Node.js基礎" },
      { slug: "security-general", name: "セキュリティ" },
      { slug: "docker", name: "Docker" },
    ],
  },

  "cs-basic": {
    overview:
      "コンピュータサイエンス（CS）の基礎は、効率的なプログラムを書くための土台となる知識体系です。データ構造（配列、リスト、ツリー、ハッシュテーブル等）、アルゴリズム（ソート、探索、動的計画法等）、計算量（Big-O記法）、ネットワーク、OSの仕組みなど、技術の根幹となる概念を扱います。",
    whyLearn:
      "CS基礎の理解は、効率的なコードを書く能力やシステム設計力に直結します。特に大手テック企業の技術面接ではデータ構造とアルゴリズムが頻繁に出題されます。フレームワークやライブラリは変わっても、CS基礎の知識は長期的に価値を持つ普遍的なスキルです。",
    topics: [
      {
        title: "データ構造",
        description:
          "配列、連結リスト、スタック、キュー、ハッシュテーブル、ツリー、グラフなど基本的なデータ構造について出題します。",
      },
      {
        title: "アルゴリズムと計算量",
        description:
          "ソートアルゴリズム、探索アルゴリズム、Big-O記法による計算量の評価、再帰と動的計画法を扱います。",
      },
      {
        title: "ネットワーク基礎",
        description:
          "TCP/IP、HTTP/HTTPS、DNS、ポート番号、OSI参照モデルなど、ネットワークの基礎概念を問います。",
      },
      {
        title: "OS・メモリ管理",
        description:
          "プロセスとスレッド、メモリ管理（スタック/ヒープ）、デッドロック、ファイルシステムの基礎を出題します。",
      },
    ],
    faqs: [
      {
        question: "CS基礎は独学でも学べますか？",
        answer:
          "はい、多くの優れた無料リソースがあります。MITやスタンフォードのオンラインコース、書籍では『アルゴリズム図鑑』や『プログラミングコンテストチャレンジブック』などがおすすめです。LeetCodeやAtCoderで実践練習もできます。",
      },
      {
        question: "Web開発にCS基礎は必要ですか？",
        answer:
          "日常的なWeb開発では直接使う場面は限られますが、パフォーマンスの問題を解決する際やシステム設計時にCS基礎の知識が役立ちます。また技術面接ではほぼ必須の知識です。",
      },
      {
        question: "Big-O記法とは何ですか？",
        answer:
          "アルゴリズムの計算量（処理時間やメモリ使用量）の増加速度を表す記法です。O(1)は定数時間、O(n)は線形時間、O(n²)は二乗時間を意味します。入力サイズが大きくなった時の性能の目安となります。",
      },
    ],
    targetAudience: [
      "CS基礎をしっかり固めたいエンジニア",
      "技術面接の準備をしている方",
      "自己流の開発から一歩進みたい方",
      "アルゴリズムやデータ構造の理解を深めたい方",
    ],
    relatedCategories: [
      { slug: "javascript-basic", name: "JavaScript基礎" },
      { slug: "security-general", name: "セキュリティ" },
      { slug: "ts-general", name: "TypeScript" },
    ],
  },

  "ts-general": {
    overview:
      "TypeScriptはMicrosoftが開発したJavaScriptの上位互換言語で、静的型付けシステムを追加しています。型推論、ジェネリクス、ユニオン型、Utility Types（Partial、Pick、Omit等）、型ガードなど強力な型システムにより、大規模アプリケーションの開発生産性と保守性を大幅に向上させます。",
    whyLearn:
      "TypeScriptはモダンなフロントエンド・バックエンド開発で事実上の標準となりつつあります。React、Vue、Angular、Next.js、NestJSなど主要フレームワークがTypeScript対応を推奨しています。型安全性によりバグの早期発見が可能で、エディタの補完も強化されるため、開発体験（DX）が大幅に向上します。",
    topics: [
      {
        title: "型システムの基礎",
        description:
          "プリミティブ型、オブジェクト型、配列型、タプル型、ユニオン型、リテラル型、型エイリアスとインターフェースの使い分けを出題します。",
      },
      {
        title: "ジェネリクス",
        description:
          "ジェネリック関数、ジェネリッククラス、制約付きジェネリクス（extends）、条件型などの高度な型パターンを扱います。",
      },
      {
        title: "Utility Types",
        description:
          "Partial、Required、Pick、Omit、Record、Exclude、Extract、ReturnType、Parameters などの組み込みユーティリティ型を問います。",
      },
      {
        title: "型ガードと型の絞り込み",
        description:
          "typeof、instanceof、in演算子、ユーザー定義型ガード、Discriminated Unionによる型の絞り込みパターンを出題します。",
      },
    ],
    faqs: [
      {
        question: "TypeScriptはJavaScriptの知識がなくても学べますか？",
        answer:
          "TypeScriptはJavaScriptのスーパーセットであるため、JavaScriptの基礎知識が前提となります。まずJavaScriptの基本を理解してからTypeScriptに進むことをおすすめします。",
      },
      {
        question: "型定義が面倒に感じますが、本当にメリットがありますか？",
        answer:
          "初期の学習コストはありますが、TypeScriptの型推論は非常に強力で、多くの場合は明示的な型定義なしでも型安全になります。プロジェクトが大規模になるほど、バグの予防、リファクタリングの安全性、コード補完の恩恵が大きくなります。",
      },
      {
        question: "anyとunknownはどう使い分けますか？",
        answer:
          "anyはすべての型チェックを無効化するため、使用は極力避けるべきです。unknownは型安全な any で、使用前に型の絞り込み（型ガード）が必須です。外部データの受け取りにはunknownを使い、型ガードで安全に処理しましょう。",
      },
    ],
    targetAudience: [
      "JavaScriptからTypeScriptへの移行を考えている方",
      "型システムの理解を深めたいフロントエンド開発者",
      "大規模プロジェクトでの開発品質を向上させたい方",
      "React + TypeScript での開発を学びたい方",
    ],
    relatedCategories: [
      { slug: "javascript-basic", name: "JavaScript基礎" },
      { slug: "react-basic", name: "React基礎" },
      { slug: "nodejs-basic", name: "Node.js基礎" },
    ],
  },
  "docker": {
    overview:
      "Dockerは、コンテナ型仮想化技術を提供するオープンソースプラットフォームです。アプリケーションとその依存関係をコンテナとしてパッケージ化し、どの環境でも同一の動作を保証します。Dockerfile によるイメージのビルド、Docker Compose による複数コンテナの管理、ボリュームやネットワークの制御など、モダンな開発・デプロイワークフローに不可欠な技術です。",
    whyLearn:
      "Dockerはローカル開発環境の統一、CI/CDパイプライン、本番デプロイなど、ソフトウェア開発のあらゆる段階で活用されています。「自分の環境では動くのに…」という問題を解消し、チーム開発の効率を大幅に向上させます。Kubernetes などのコンテナオーケストレーションの前提知識としても必須です。",
    topics: [
      {
        title: "イメージとコンテナ",
        description:
          "Dockerイメージの仕組み、レイヤー構造、コンテナのライフサイクル（作成・起動・停止・削除）、docker run のオプションについて出題します。",
      },
      {
        title: "Dockerfile",
        description:
          "FROM・COPY・RUN・CMD・ENTRYPOINTなどの命令、マルチステージビルド、レイヤーキャッシュの最適化、.dockerignore の活用を扱います。",
      },
      {
        title: "Docker Compose",
        description:
          "docker-compose.yml の構成、サービス定義、依存関係（depends_on）、環境変数、ネットワーク設定など複数コンテナの管理を問います。",
      },
      {
        title: "ボリュームとネットワーク",
        description:
          "データの永続化（ボリュームマウント・バインドマウント）、コンテナ間通信、ブリッジネットワーク、ポートマッピングについて出題します。",
      },
    ],
    faqs: [
      {
        question: "DockerとVMはどう違いますか？",
        answer:
          "VMはハイパーバイザー上でゲストOSを丸ごと動かすのに対し、Dockerはホストカーネルを共有しプロセスレベルで隔離するため、起動が高速でリソース消費も少ないです。軽量かつポータブルな環境構築に適しています。",
      },
      {
        question: "Docker Composeはどのような場合に使いますか？",
        answer:
          "Webアプリ＋データベース＋キャッシュなど、複数のコンテナを連携させる開発環境で活用します。docker-compose.yml に全サービスを定義し、docker compose up 一つで環境全体を起動できます。",
      },
      {
        question: "Dockerイメージを小さくするコツは？",
        answer:
          "Alpine Linux などの軽量ベースイメージを使う、マルチステージビルドでビルド成果物のみを最終イメージにコピーする、不要ファイルを .dockerignore で除外する、RUN命令をまとめてレイヤー数を減らすなどが効果的です。",
      },
    ],
    targetAudience: [
      "コンテナ技術をこれから学びたい方",
      "開発環境の構築を効率化したいエンジニア",
      "CI/CDやクラウドデプロイの基礎を固めたい方",
      "Kubernetesの学習前にDocker基礎を押さえたい方",
    ],
    relatedCategories: [
      { slug: "nginx-basic", name: "Nginx基礎" },
      { slug: "aws-basic", name: "AWS基礎" },
      { slug: "nodejs-basic", name: "Node.js基礎" },
    ],
  },

  "linux": {
    overview:
      "Linuxは、サーバー運用やクラウド環境で圧倒的なシェアを持つオープンソースのオペレーティングシステムです。コマンドライン操作（bash/zsh）、ファイルパーミッション管理、プロセス制御、ネットワーク設定、シェルスクリプトなど、インフラエンジニアやバックエンド開発者にとって不可欠な基礎知識を幅広くカバーしています。Dockerコンテナやクラウドインスタンスの多くがLinux上で動作しており、モダンな開発環境における必須スキルです。",
    whyLearn:
      "Web開発やインフラ運用の現場では、Linux上でのサーバー管理・デプロイ作業が日常的に行われます。コマンドラインの基本操作、ファイルパーミッション、プロセス管理、ネットワーク設定の知識は、DevOpsやSREはもちろん、アプリケーション開発者にとっても必須です。AWS EC2やDockerコンテナもLinuxベースで動作するため、Linuxの理解がクラウド活用の土台となります。",
    topics: [
      {
        title: "コマンドライン操作",
        description:
          "grep、find、tar、パイプ、リダイレクトなど、日常的に使用するLinuxコマンドの使い方とオプションについて出題します。",
      },
      {
        title: "パーミッションとユーザー管理",
        description:
          "chmod、chown、ファイルパーミッションの数値表記、所有者・グループの概念、sudo・rootユーザーの適切な使い分けを扱います。",
      },
      {
        title: "プロセス管理とサービス",
        description:
          "ps、kill、top、systemctl、cronによるプロセスの監視・制御・定期実行タスクの設定について問います。",
      },
      {
        title: "シェルスクリプトとネットワーク",
        description:
          "シェルスクリプトの基本構文、SSH接続、シンボリックリンク、リダイレクトとパイプなど実務で頻出するトピックを出題します。",
      },
    ],
    faqs: [
      {
        question: "Linux初心者はどのディストリビューションから始めるべきですか？",
        answer:
          "UbuntuやLinux Mintが初心者に最も推奨されます。デスクトップ用途なら日本語環境が充実したUbuntu、サーバー用途ならUbuntu ServerやRocky Linux（CentOS後継）が人気です。WSL（Windows Subsystem for Linux）でWindows上からLinuxを試すこともできます。",
      },
      {
        question: "Web開発者にLinuxの知識は必要ですか？",
        answer:
          "はい、必要です。本番サーバーの多くはLinuxで運用されており、デプロイ・ログ確認・トラブルシューティングなどでコマンドライン操作が求められます。DockerやCI/CD環境もLinuxベースで動作するため、基本的なLinuxコマンドの知識は開発者の必須スキルです。",
      },
      {
        question: "このクイズはLinux未経験でも解けますか？",
        answer:
          "基礎的な問題から出題しているため、コマンドラインに触れたことがあれば挑戦できます。わからない問題があっても詳しい解説を読みながら学習できるので、実務で使うLinuxコマンドを効率的に身につけられます。",
      },
    ],
    targetAudience: [
      "サーバー管理やインフラ運用を学びたいエンジニア",
      "Docker・クラウド環境でLinuxコマンドを使いこなしたい方",
      "コマンドライン操作に不安がある開発者",
      "DevOps・SREを目指す方",
    ],
    relatedCategories: [
      { slug: "docker", name: "Docker" },
      { slug: "nginx-basic", name: "Nginx基礎" },
      { slug: "aws-basic", name: "AWS基礎" },
    ],
  },

  "nextjs": {
    overview:
      "Next.jsは、Vercelが開発するReactベースのフルスタックフレームワークです。App Router、Server Components、Server Actions、自動コード分割、画像最適化など、プロダクションに必要な機能が標準で揃っています。SSR・SSG・ISRを柔軟に組み合わせることで、パフォーマンスとSEOに優れたWebアプリケーションを構築できます。",
    whyLearn:
      "Next.jsはReactエコシステムで最も採用されているフレームワークの一つで、企業の採用実績も急速に増えています。App RouterやServer Componentsなど最新のReactアーキテクチャを実践的に学べるほか、デプロイ・キャッシュ戦略・ミドルウェアなどフルスタック開発のスキルが身につきます。",
    topics: [
      {
        title: "App Router と Server Components",
        description:
          "App Routerのファイルベースルーティング、Server ComponentとClient Componentの使い分け、\"use client\"ディレクティブの適切な配置を出題します。",
      },
      {
        title: "データフェッチとキャッシュ",
        description:
          "fetch()のキャッシュ戦略、revalidateによるISR、generateStaticParamsでの静的生成、動的レンダリングとの使い分けを扱います。",
      },
      {
        title: "Server Actions",
        description:
          "\"use server\"ディレクティブによるServer Actionsの定義、フォーム処理、Client Componentへの関数の受け渡しパターンを問います。",
      },
      {
        title: "実践的なエラー解決",
        description:
          "Hydrationエラー、Module not found、Dynamic server usage、next/imageの設定エラーなど、開発現場で頻出するエラーの原因と対処法を出題します。",
      },
    ],
    faqs: [
      {
        question: "Next.jsを学ぶ前にReactの知識は必要ですか？",
        answer:
          "はい、Next.jsはReactをベースにしたフレームワークのため、コンポーネント、Hooks、JSXなどReactの基本を理解していることが前提です。React の基礎を一通り学んでからNext.jsに進むとスムーズに習得できます。",
      },
      {
        question: "App RouterとPages Routerはどちらを学ぶべきですか？",
        answer:
          "Next.js 13以降はApp Routerが推奨されており、新規プロジェクトではApp Routerの使用が標準です。Server ComponentsやServer Actionsなど最新機能はApp Router専用のため、これから学ぶ方はApp Routerを中心に学習しましょう。",
      },
      {
        question: "Next.jsのHydrationエラーはなぜ起きるのですか？",
        answer:
          "サーバーで生成したHTMLとクライアントで描画されるHTMLが一致しない場合に発生します。Date.now()やMath.random()の使用、typeof windowによる条件分岐、ブラウザ拡張機能によるDOM変更などが主な原因です。useEffectで動的コンテンツをマウント後に描画する方法で対処できます。",
      },
    ],
    targetAudience: [
      "Reactを習得済みでフレームワークに挑戦したい方",
      "App RouterやServer Componentsを実践的に学びたい方",
      "SSR/SSG/ISRの使い分けを理解したいエンジニア",
      "Next.jsの頻出エラーの解決方法を身につけたい方",
    ],
    relatedCategories: [
      { slug: "react-basic", name: "React基礎" },
      { slug: "ts-general", name: "TypeScript" },
      { slug: "nodejs-basic", name: "Node.js基礎" },
    ],
  },
};

export function getCategorySeoContent(
  slug: string
): CategorySeoContent | null {
  return categoryContentMap[slug] ?? null;
}
