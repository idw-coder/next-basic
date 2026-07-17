export interface BookFaq {
  question: string;
  answer: string;
}

export interface BookTopic {
  title: string;
  description: string;
}

export interface BookSeoContent {
  overview: string;
  whyLearn: string;
  prerequisites: string;
  topics: BookTopic[];
  faqs: BookFaq[];
  targetAudience: string[];
  relatedQuizSlug: string | null;
}

const bookSeoContentMap: Record<string, BookSeoContent> = {
  javascript: {
    overview:
      'JavaScriptはWebブラウザで動作するプログラミング言語で、フロントエンドからバックエンドまでWeb開発のあらゆる場面で使われています。本書では、変数宣言（var/let/const）やスコープの基礎から、関数・オブジェクト・配列の操作、非同期処理（Promise/async-await）、DOM操作、Web APIまでを23章にわたって体系的に解説します。実務で必要になる知識を「なぜそうなるのか」まで掘り下げて整理しているので、初学者はもちろん、曖昧だった基礎を固め直したい経験者にも最適です。',
    whyLearn:
      'JavaScriptはフロントエンド開発の必須言語であり、React・Vue・Next.jsなどのフレームワークもすべてJavaScriptの上に成り立っています。Node.jsによるバックエンド開発、ElectronによるデスクトップアプリなどJavaScriptの活用範囲は年々広がっており、1つの言語を深く理解することでWeb開発全体の生産性が大きく向上します。求人市場でも需要が最も高い言語の一つです。',
    prerequisites:
      'プログラミング未経験でも読み進められますが、HTMLの基本（タグの意味、ページの構造）を知っていると学習がスムーズです。',
    topics: [
      {
        title: '変数・スコープ・データ型',
        description:
          'var/let/constの違い、ブロックスコープと関数スコープ、プリミティブ型と参照型、型変換の仕組みを基礎から学びます。',
      },
      {
        title: '関数・クロージャ・this',
        description:
          '関数宣言とアロー関数の違い、クロージャの仕組み、thisの束縛ルールなど、JavaScript特有の挙動を理解します。',
      },
      {
        title: 'オブジェクト・配列・分割代入',
        description:
          'オブジェクトと配列の操作メソッド、スプレッド構文、分割代入、プロトタイプチェーンまでを実践的に学びます。',
      },
      {
        title: '非同期処理（Promise / async-await）',
        description:
          'コールバック、Promise、async/awaitの3つのパターンを段階的に理解し、実務で頻出する非同期処理を自信を持って書けるようになります。',
      },
      {
        title: 'DOM操作・Web API',
        description:
          'ブラウザのDOM操作、イベント処理、Fetch API、LocalStorageなど、ブラウザ環境で使えるAPIを学びます。',
      },
      {
        title: 'モジュール・エラーハンドリング',
        description:
          'ESModulesによるコード分割、try-catchによるエラー処理、デバッグのコツを身につけます。',
      },
    ],
    faqs: [
      {
        question: 'JavaScript初心者でも読めますか？',
        answer:
          'はい。プログラミング未経験者を想定して、変数や関数などの基礎概念から順番に解説しています。各章は独立しているため、わからない部分があれば飛ばして後から戻ることもできます。',
      },
      {
        question: 'TypeScriptとJavaScriptのどちらを先に学ぶべきですか？',
        answer:
          'まずJavaScriptの基礎を固めることをおすすめします。TypeScriptはJavaScriptに型を追加した言語なので、JavaScriptの仕組み（スコープ、非同期処理、プロトタイプなど）を理解していないとTypeScript固有の機能も十分に活かせません。',
      },
      {
        question: 'この本だけでWebアプリを作れるようになりますか？',
        answer:
          '本書でJavaScriptの基礎力は身につきますが、実際のアプリ開発にはReactやNext.jsなどのフレームワーク、HTML/CSS、そしてバックエンドの知識も必要です。本書を土台として、次のステップに進みやすくなります。',
      },
      {
        question: 'クイズと教科書はどう使い分ければいいですか？',
        answer:
          'まずクイズで自分の理解度をチェックし、間違えた問題や曖昧だったテーマを教科書で深掘りするのが効率的です。教科書を一通り読んでからクイズで腕試しする使い方もおすすめです。',
      },
    ],
    targetAudience: [
      'プログラミングをこれから始める方',
      'HTML/CSSは書けるがJavaScriptは苦手な方',
      'ReactやVue.jsに進む前に基礎を固めたい方',
      'JavaScriptの曖昧な理解を整理し直したい経験者',
    ],
    relatedQuizSlug: 'javascript-basic',
  },

  'react-learning': {
    overview:
      'ReactはMeta（旧Facebook）が開発したUIライブラリで、コンポーネントベースの設計思想により、再利用性の高いUI部品を組み合わせて効率的にアプリケーションを構築できます。本書では、Reactの考え方（宣言的UI・単方向データフロー）から、JSX・コンポーネント・Props・Hooks（useState, useEffect, useContext, useRef, useMemo, useCallback）までを、Next.jsなどのフレームワークに進む前の土台として整理します。',
    whyLearn:
      'Reactは世界中のフロントエンド開発現場で最も広く採用されているUIライブラリです。Next.js、Remix、Gatsby、React Nativeなど、Reactベースのエコシステムは非常に豊富で、Reactを習得することがモダンなWeb開発キャリアの出発点になります。コンポーネント指向の考え方は他のフレームワークにも応用でき、学習投資のリターンが大きい技術です。',
    prerequisites:
      'JavaScriptの基礎（変数、関数、配列操作、オブジェクト）を理解していることが前提です。ES6以降の文法（アロー関数、分割代入、スプレッド構文）に触れたことがあるとスムーズに読み進められます。',
    topics: [
      {
        title: 'Reactの考え方・JSX',
        description:
          '宣言的UIとは何か、なぜコンポーネント指向なのかという設計思想から、JSXの文法と表現力を学びます。',
      },
      {
        title: 'コンポーネントとProps',
        description:
          '関数コンポーネントの定義方法、Propsによるデータの受け渡し、childrenパターン、条件付きレンダリングを理解します。',
      },
      {
        title: 'Hooks（useState / useEffect）',
        description:
          'Reactの状態管理の基本であるuseStateと、副作用処理のuseEffectを使いこなすための基礎を固めます。',
      },
      {
        title: 'パフォーマンスとメモ化',
        description:
          'useMemo・useCallback・React.memoによるレンダリング最適化の考え方と、いつ使うべきかの判断基準を学びます。',
      },
    ],
    faqs: [
      {
        question: 'React初心者でも読めますか？',
        answer:
          'はい。JavaScriptの基礎知識があれば、Reactが初めてでも読み進められるように構成しています。コンポーネントの概念から段階的に解説するので、いきなりHooksでつまずくことなく学べます。',
      },
      {
        question: 'ReactとVue.jsはどちらを先に学ぶべきですか？',
        answer:
          'どちらも優れたライブラリですが、エコシステムの規模と求人数を考慮するとReactから始めるのが一般的です。Vue.jsはテンプレート構文が直感的で学習コストが低いため、初心者にはVue.jsから入る選択肢もあります。',
      },
      {
        question: 'Next.jsとReactの違いは何ですか？',
        answer:
          'ReactはUI構築のためのライブラリで、Next.jsはReactをベースにしたフルスタックフレームワークです。Next.jsはルーティング、サーバーサイドレンダリング、API Routesなどを提供します。本書でReactの基礎を固めてからNext.jsに進むのが効率的です。',
      },
    ],
    targetAudience: [
      'JavaScriptの基礎を終えてReactに入門したい方',
      'Next.jsを使う前にReactの基本を押さえたい方',
      'クラスコンポーネントからHooksへ移行したい方',
      'コンポーネント設計の基礎を体系的に学びたい方',
    ],
    relatedQuizSlug: 'react-basic',
  },

  typescript: {
    overview:
      'TypeScriptはMicrosoftが開発した、JavaScriptに静的型付けを追加したプログラミング言語です。本書では、基本的な型アノテーション（string, number, boolean）から、型エイリアス・インターフェース、ジェネリクス、ユーティリティ型（Partial, Pick, Omit等）、型ガード、ReactやNext.jsで頻出する型付けパターンまでを段階的に解説します。型があることで得られるメリット（自動補完、リファクタリング安全性、ドキュメント性）を実感しながら学べる構成です。',
    whyLearn:
      'TypeScriptは大規模なJavaScriptプロジェクトの品質と開発効率を大きく向上させます。VSCodeとの組み合わせによる強力な自動補完、コンパイル時のバグ検出、リファクタリング支援などの恩恵は非常に大きく、現在のフロントエンド開発ではTypeScriptが事実上の標準となっています。React、Next.js、Node.jsなどほぼすべてのモダンなJavaScriptエコシステムがTypeScriptをサポートしています。',
    prerequisites:
      'JavaScriptの基礎（変数、関数、オブジェクト、配列、非同期処理）を理解していることが前提です。JavaScript入門を先に読むか、同等の知識があればスムーズに読み進められます。',
    topics: [
      {
        title: '型の基礎・型アノテーション',
        description:
          'プリミティブ型、配列型、オブジェクト型、関数の型付け、型推論の仕組みを基礎から学びます。',
      },
      {
        title: '型エイリアスとインターフェース',
        description:
          'type aliasとinterfaceの違い、使い分け、extends/交差型による型の合成パターンを理解します。',
      },
      {
        title: 'ジェネリクス・ユーティリティ型',
        description:
          '型パラメータの基本、Partial/Required/Pick/Omit/Recordなどの組み込みユーティリティ型を実践的に学びます。',
      },
      {
        title: 'React/Next.jsでの型付け',
        description:
          'コンポーネントのProps型定義、イベントハンドラの型、Server Componentsでの型の扱いなど、実務で頻出するパターンを解説します。',
      },
    ],
    faqs: [
      {
        question: 'TypeScriptとJavaScriptのどちらを先に学ぶべきですか？',
        answer:
          'JavaScriptの基礎を先に固めることをおすすめします。TypeScriptはJavaScriptの上位互換なので、JavaScriptの仕組み（スコープ、クロージャ、プロトタイプなど）を理解していないとTypeScriptの恩恵を十分に受けられません。',
      },
      {
        question: 'TypeScriptは難しいですか？',
        answer:
          '基本的な型付け（string, number, booleanなど）は非常にシンプルです。ジェネリクスやMapped Typeなどの高度な型機能は複雑に感じることもありますが、本書では段階的に難易度を上げていくので、一つずつ理解を積み上げていけます。',
      },
      {
        question: 'この教科書を読み終わったら何ができるようになりますか？',
        answer:
          'TypeScriptで型安全なコードを書けるようになり、ReactやNext.jsのプロジェクトで型エラーに悩まされずに開発できるようになります。また、他の人が書いた型定義を読み解く力も身につきます。',
      },
    ],
    targetAudience: [
      'JavaScriptは書けるがTypeScriptは初めての方',
      'TypeScriptを使い始めたが型エラーに悩んでいる方',
      'ReactやNext.jsで型付けを正しく行いたい方',
      'コードの品質と保守性を上げたいフロントエンドエンジニア',
    ],
    relatedQuizSlug: 'ts-general',
  },

  'css-basics': {
    overview:
      'CSSはHTMLで作った構造に視覚的なデザインを与えるスタイルシート言語です。本書では、セレクタとプロパティの基本から、ボックスモデル、Flexbox、Gridレイアウト、レスポンシブデザイン、アニメーションまでを段階的に解説します。「なんとなく見た目が整う」レベルから、意図通りにレイアウトをコントロールできるレベルへ引き上げることを目指します。',
    whyLearn:
      'CSSはWebサイトの見た目を決定するすべての基盤です。FlexboxとGridを正しく理解すれば複雑なレイアウトも自在に組め、レスポンシブデザインの知識はスマートフォン対応が必須の現代では欠かせません。フロントエンド開発ではReactやNext.jsを使う場合でもCSS（またはTailwind CSS）の理解が不可欠です。',
    prerequisites:
      'HTMLの基本（タグ、属性、ページの構造）を理解していることが前提です。CSSの経験がなくても1章から順に読み進められます。',
    topics: [
      {
        title: 'セレクタとプロパティ',
        description:
          '要素セレクタ、クラスセレクタ、擬似クラス、詳細度（specificity）の仕組みを基礎から学びます。',
      },
      {
        title: 'ボックスモデルと配置',
        description:
          'margin、padding、borderの関係、box-sizing、positionプロパティによる要素配置を理解します。',
      },
      {
        title: 'Flexbox & Gridレイアウト',
        description:
          '1次元レイアウト（Flexbox）と2次元レイアウト（Grid）の使い分けと実践パターンを学びます。',
      },
      {
        title: 'レスポンシブデザイン・アニメーション',
        description:
          'メディアクエリ、レスポンシブ設計の考え方、transitionとkeyframesによるアニメーションを習得します。',
      },
    ],
    faqs: [
      {
        question: 'CSS初心者でも読めますか？',
        answer:
          'はい。HTMLの基本がわかっていれば、CSSが初めてでもセレクタの基礎から順に学べるように構成しています。',
      },
      {
        question: 'FlexboxとGridのどちらを先に学ぶべきですか？',
        answer:
          'Flexboxから学ぶことをおすすめします。1次元のレイアウト（横並び・縦並び）をFlexboxで理解してからGridに進むと、2次元レイアウトの利点がよくわかります。',
      },
      {
        question: 'Tailwind CSSとの関係は？',
        answer:
          'Tailwind CSSはCSSのユーティリティクラスを提供するフレームワークです。素のCSSの仕組み（ボックスモデル、Flexbox、Grid等）を理解していないとTailwindも使いこなせないため、まず本書でCSSの基礎を固めることをおすすめします。',
      },
    ],
    targetAudience: [
      'HTMLは書けるがCSSのレイアウトが苦手な方',
      'FlexboxやGridを体系的に学び直したい方',
      'レスポンシブデザインの基礎を身につけたい方',
      'Tailwind CSSを使う前にCSSの基礎を固めたい方',
    ],
    relatedQuizSlug: 'css-basic',
  },

  'tailwind-css': {
    overview:
      'Tailwind CSSはユーティリティファーストのCSSフレームワークで、HTMLに直接クラスを書くことで高速にUIを構築できます。本書では、ユーティリティクラスの基本的な考え方から、レイアウト、レスポンシブデザイン、ダークモード対応、テーマのカスタマイズまでを実践的に解説します。',
    whyLearn:
      'Tailwind CSSはNext.js、Vite、Remixなどのモダンなフレームワークで広く採用されており、フロントエンド開発の生産性を大幅に向上させます。クラス名を見ればスタイルがわかるため、チーム開発での可読性が高く、CSSファイルの肥大化も防げます。',
    prerequisites:
      'CSSの基礎（ボックスモデル、Flexbox、レスポンシブデザイン）を理解していることが前提です。CSS入門を先に読むか、同等の知識があればスムーズに進められます。',
    topics: [
      {
        title: 'ユーティリティファーストの考え方',
        description:
          '従来のCSS設計との違い、ユーティリティクラスの命名規則、コンポーネント設計との組み合わせ方を学びます。',
      },
      {
        title: 'レイアウトとレスポンシブ',
        description:
          'Flex、Grid、spacing、breakpointの使い方と、モバイルファーストのレスポンシブ設計パターンを理解します。',
      },
      {
        title: 'ダークモード・テーマカスタマイズ',
        description:
          'darkモードの切り替え、tailwind.config.jsでのカスタムカラー・フォント・breakpointの設定を学びます。',
      },
      {
        title: '実践パターンとプラグイン',
        description:
          'フォーム、アニメーション、タイポグラフィなど実務で頻出するパターンとプラグインの活用法を解説します。',
      },
    ],
    faqs: [
      {
        question: 'CSSを知らなくてもTailwind CSSを学べますか？',
        answer:
          'Tailwindのクラス名はCSSプロパティに対応しているため、CSSの基礎知識が必要です。FlexboxやGridの概念を知らないと、Tailwindのflex・gridクラスも使いこなせません。まずCSS入門で基礎を固めることをおすすめします。',
      },
      {
        question: 'Tailwind CSSとBootstrapの違いは何ですか？',
        answer:
          'BootstrapはコンポーネントベースのCSSフレームワークで、ボタンやカードなどの既成パーツを提供します。Tailwindはユーティリティクラスの集合で、自由度が高い代わりに自分でデザインを組み立てる必要があります。カスタマイズ性を重視するならTailwindが適しています。',
      },
      {
        question: 'この本を読み終わったら何ができるようになりますか？',
        answer:
          'Tailwind CSSを使ってレスポンシブ対応のUIを効率的に構築でき、ダークモード対応やテーマカスタマイズも行えるようになります。',
      },
    ],
    targetAudience: [
      'CSSの基礎はあるがTailwindは初めての方',
      'Tailwindを使い始めたがクラスの使い分けに迷う方',
      'Next.jsやReactプロジェクトでTailwindを導入したい方',
      'CSSファイルの管理に課題を感じているフロントエンドエンジニア',
    ],
    relatedQuizSlug: null,
  },

  'git-basic': {
    overview:
      '本書は、駆け出しエンジニアが実務でGitを正しく使えるようになるための入門書です。add・commit・pushの基本フローから、ブランチの概念、merge/rebaseの使い分け、コンフリクト解決、取り消し操作（reset/revert/restore）、リモートとの同期、チーム開発のワークフローまでを11章で体系的に学びます。',
    whyLearn:
      'Gitはソフトウェア開発におけるバージョン管理の事実上の標準ツールです。チーム開発ではGitの操作が日常業務の一部であり、ブランチ戦略やコンフリクト解決のスキルは開発効率に直結します。GitHubとの連携も含め、Gitを正しく使えることはエンジニアの必須スキルです。',
    prerequisites:
      'プログラミング経験は問いません。ターミナル（コマンドライン）の基本操作ができれば読み進められます。',
    topics: [
      {
        title: 'add・commit・pushの基本',
        description:
          'ステージング、コミット、プッシュの3ステップの意味と操作を基礎から学びます。',
      },
      {
        title: 'ブランチとmerge/rebase',
        description:
          'ブランチの作成・切り替え、mergeとrebaseの違いと使い分け、実務でのブランチ戦略を理解します。',
      },
      {
        title: 'コンフリクト解決・取り消し操作',
        description:
          'コンフリクトの発生原因と解決手順、reset/revert/restoreの違いと安全な取り消し方法を学びます。',
      },
      {
        title: 'チーム開発とGitHub',
        description:
          'Pull Requestベースの開発フロー、.gitignore、チームでのGit運用ルールを実践的に解説します。',
      },
    ],
    faqs: [
      {
        question: 'Git初心者でも読めますか？',
        answer:
          'はい。Gitを初めて使う方を想定して、バージョン管理の概念から順番に解説しています。ターミナルでコマンドを打てれば問題なく読み進められます。',
      },
      {
        question: 'GitとGitHubの違いは何ですか？',
        answer:
          'GitはローカルPCで動くバージョン管理ツール、GitHubはGitリポジトリをクラウドでホスティングするサービスです。本書ではGitの操作を中心に学び、GitHubとの連携も扱います。',
      },
      {
        question: 'mergeとrebaseのどちらを使うべきですか？',
        answer:
          'チームの方針によりますが、本書では両方の仕組みと使い分けの基準を詳しく解説しています。一般的に、フィーチャーブランチのマージにはmergeを使い、ローカルの整理にはrebaseを使うパターンが多いです。',
      },
    ],
    targetAudience: [
      'Gitを初めて使うプログラミング初学者',
      'add/commit/pushはできるがブランチ操作に不安がある方',
      'コンフリクト解決や取り消し操作に自信がない方',
      'チーム開発に参加する前にGitの基礎を固めたい方',
    ],
    relatedQuizSlug: 'git-basic',
  },

  'cs-basics': {
    overview:
      '本書は、エンジニアが押さえておくべきコンピュータサイエンス（CS）の基礎を初心者向けに解説する教科書です。データ構造（配列、連結リスト、スタック、キュー、ハッシュテーブル、木構造）、アルゴリズム（ソート、探索、再帰）、計算量（O記法）、OS、ネットワーク、セキュリティの基礎まで幅広くカバーします。',
    whyLearn:
      'CS基礎の理解は、コードの効率性やシステム設計の質に直結します。なぜその処理が遅いのか、どのデータ構造を選ぶべきか、といった判断はCS知識なしには的確にできません。技術面接でもCS基礎は頻出テーマであり、長期的なエンジニアとしての成長の土台になります。',
    prerequisites:
      '何らかのプログラミング言語（JavaScript、Python等）で簡単なプログラムを書いた経験があると理解が深まります。',
    topics: [
      {
        title: 'データ構造',
        description:
          '配列、連結リスト、スタック、キュー、ハッシュテーブル、木構造など、基本的なデータ構造の特徴と使いどころを学びます。',
      },
      {
        title: 'アルゴリズムと計算量',
        description:
          'ソート（バブル、マージ、クイック）、探索（線形、二分）、再帰の考え方、O記法による計算量の評価を理解します。',
      },
      {
        title: 'OS・ネットワークの基礎',
        description:
          'プロセスとスレッド、メモリ管理、TCP/IP、HTTP、DNSなど、システムの裏側で動く仕組みを学びます。',
      },
      {
        title: 'セキュリティの基礎',
        description:
          '暗号化、認証、ハッシュ関数、ネットワークセキュリティの基本概念を押さえます。',
      },
    ],
    faqs: [
      {
        question: 'CSの知識はWeb開発に必要ですか？',
        answer:
          'はい。直接コードに現れなくても、パフォーマンス問題の原因特定、適切なデータ構造の選択、システム設計の判断など、あらゆる場面でCS知識が活きます。',
      },
      {
        question: '文系出身でも理解できますか？',
        answer:
          '本書は数学的な厳密さよりも直感的な理解を重視しています。プログラミングの基本がわかっていれば、文系出身でも問題なく読み進められます。',
      },
      {
        question: 'この教科書はどのくらいの範囲をカバーしていますか？',
        answer:
          '大学のCS入門コース1学期分程度の範囲をカバーしています。Webエンジニアが実務で必要になるCS知識に焦点を当てています。',
      },
    ],
    targetAudience: [
      'CS基礎を体系的に学び直したいWebエンジニア',
      '独学でプログラミングを始めたがCS知識に不安がある方',
      '技術面接の準備をしたい方',
      'データ構造やアルゴリズムの基本を押さえたい方',
    ],
    relatedQuizSlug: 'cs-basic',
  },

  'next-js': {
    overview:
      'Next.jsはReactベースのフルスタックWebフレームワークで、サーバーサイドレンダリング（SSR）、静的サイト生成（SSG）、App Router、Server Componentsなどの機能を備えています。本書では、Next.jsのApp Routerを中心に、ルーティング、データ取得、Server Components、レンダリング戦略、API Routes、ミドルウェアなどを実践的なコード例とともにステップバイステップで解説します。',
    whyLearn:
      'Next.jsはReactエコシステムの中で最も広く採用されているフレームワークの一つです。Server ComponentsやStreamingなどの最新機能を活用することで、パフォーマンスの高いWebアプリケーションを構築できます。Vercelとの連携によるデプロイの容易さも大きな魅力です。',
    prerequisites:
      'Reactの基礎（コンポーネント、Props、Hooks）を理解していることが前提です。React入門を先に読むか、同等の知識があればスムーズに進められます。',
    topics: [
      {
        title: 'App Routerとルーティング',
        description:
          'ファイルベースのルーティング、動的ルート、レイアウト、ローディングUI、エラーハンドリングを学びます。',
      },
      {
        title: 'Server ComponentsとClient Components',
        description:
          'サーバーとクライアントの境界、"use client"ディレクティブ、データ取得パターンを理解します。',
      },
      {
        title: 'データ取得とキャッシュ',
        description:
          'fetchの拡張、revalidate戦略、Server Actionsによるデータ変更など実務で必要なパターンを解説します。',
      },
      {
        title: 'デプロイと最適化',
        description:
          '画像最適化、フォント最適化、メタデータ、ミドルウェア、本番環境へのデプロイを学びます。',
      },
    ],
    faqs: [
      {
        question: 'Reactを知らなくてもNext.jsを学べますか？',
        answer:
          'Next.jsはReactの上に構築されているため、コンポーネント・Props・Hooksなどの基礎知識が必要です。React入門を先に読むことをおすすめします。',
      },
      {
        question: 'App RouterとPages Routerの違いは何ですか？',
        answer:
          'App RouterはNext.js 13以降の新しいルーティングシステムで、Server Components、Streaming、レイアウトの入れ子などをサポートします。本書はApp Routerに焦点を当てています。',
      },
      {
        question: 'Next.jsは個人開発でも使うべきですか？',
        answer:
          'はい。SSR/SSG、画像最適化、ファイルベースルーティングなどの機能は個人開発でも生産性を大きく向上させます。Vercelへの無料デプロイも手軽です。',
      },
    ],
    targetAudience: [
      'Reactの基礎を終えてNext.jsに入門したい方',
      'Pages RouterからApp Routerに移行したい方',
      'Server Componentsの考え方を理解したい方',
      'フルスタックなWebアプリケーション開発を学びたい方',
    ],
    relatedQuizSlug: 'nextjs',
  },

  'node-js': {
    overview:
      'Node.jsはJavaScriptをサーバーサイドで実行するランタイム環境です。本書では、Node.jsの動く仕組み（イベントループ）から、npm、モジュールシステム（CommonJS/ESModules）、非同期処理、ファイル操作、Stream、HTTPサーバーの構築、Express.jsによるAPI開発、テスト、本番運用までを体系的に解説します。',
    whyLearn:
      'Node.jsを学ぶことで、フロントエンドと同じJavaScriptでバックエンド開発ができるようになります。Express.jsやNestJSなどのフレームワークによるREST API開発、リアルタイム通信、CLIツール作成など活用範囲は広く、フルスタックエンジニアへの道が開けます。',
    prerequisites:
      'JavaScriptの基礎（変数、関数、非同期処理、モジュール）を理解していることが前提です。ターミナルの基本操作ができるとスムーズです。',
    topics: [
      {
        title: 'Node.jsの仕組みとnpm',
        description:
          'イベントループ、ノンブロッキングI/O、npmによるパッケージ管理、package.jsonの構造を学びます。',
      },
      {
        title: 'モジュールと非同期処理',
        description:
          'CommonJSとESModulesの違い、コールバック・Promise・async/awaitパターン、fs/pathモジュールを理解します。',
      },
      {
        title: 'HTTPサーバーとExpress.js',
        description:
          '素のHTTPモジュールからExpress.jsまで、API開発の基礎とミドルウェアの仕組みを学びます。',
      },
      {
        title: 'テストと本番運用',
        description:
          'ユニットテスト、環境変数管理、ログ、プロセス管理、セキュリティの基本を押さえます。',
      },
    ],
    faqs: [
      {
        question: 'Node.jsはフロントエンドエンジニアにも必要ですか？',
        answer:
          'はい。npmやビルドツール（Vite, webpack）、Next.jsのサーバーサイド処理などはすべてNode.jsで動いています。フロントエンドエンジニアもNode.jsの基本を理解しておくと開発効率が上がります。',
      },
      {
        question: 'Express.jsは今でも使われていますか？',
        answer:
          'はい。Express.jsはNode.jsのWebフレームワークとして最も広く使われており、シンプルなAPIサーバーやプロトタイプ開発に最適です。より大規模なプロジェクトではNestJSなども使われます。',
      },
      {
        question: 'JavaScriptとNode.jsの違いは何ですか？',
        answer:
          'JavaScriptはプログラミング言語で、Node.jsはJavaScriptをブラウザの外（サーバーやCLI）で実行するためのランタイム環境です。本書ではサーバーサイドでのJavaScript実行に焦点を当てています。',
      },
    ],
    targetAudience: [
      'JavaScriptの基礎を終えてバックエンド開発に入門したい方',
      'フルスタックエンジニアを目指す方',
      'npmやビルドツールの裏側を理解したいフロントエンドエンジニア',
      'Express.jsでREST APIを作りたい方',
    ],
    relatedQuizSlug: 'nodejs-basic',
  },

  'sql-basics': {
    overview:
      '本書は、Web開発で必要なSQLとリレーショナルデータベースの基礎を体系的に学ぶ教科書です。SELECT文の基本からWHERE句、JOIN（内部結合・外部結合）、GROUP BYによる集計、サブクエリ、テーブル設計と正規化、インデックス、トランザクション、SQLインジェクション対策までを段階的に解説します。',
    whyLearn:
      'ほぼすべてのWebアプリケーションはデータベースを使います。SQLを正しく書けることは、バックエンド開発はもちろん、フロントエンドエンジニアがAPI設計を理解するうえでも重要です。パフォーマンスチューニングやデータ分析にもSQL知識は欠かせません。',
    prerequisites:
      'プログラミングの基本がわかっていれば読み進められます。特定の言語の知識は不要です。',
    topics: [
      {
        title: 'SELECT・WHERE・ORDER BY',
        description:
          'データの取得、条件指定、並び替え、LIMIT/OFFSETなどSQLの基本操作を学びます。',
      },
      {
        title: 'JOIN・集計・サブクエリ',
        description:
          '内部結合・外部結合の違い、GROUP BY・HAVING、サブクエリ、UNION/INTERSECTを理解します。',
      },
      {
        title: 'テーブル設計と正規化',
        description:
          'ER図の読み方、正規化（第1〜第3正規形）、主キー・外部キー、リレーションの設計を学びます。',
      },
      {
        title: 'インデックス・トランザクション・セキュリティ',
        description:
          'インデックスの仕組み、ACID特性、トランザクション制御、SQLインジェクション対策を押さえます。',
      },
    ],
    faqs: [
      {
        question: 'SQLは難しいですか？',
        answer:
          '基本的なSELECT文は英語に近い構文で直感的です。JOINやサブクエリは少し複雑ですが、本書では段階的に難易度を上げていくので一つずつ理解を積み上げていけます。',
      },
      {
        question: 'どのデータベースを使えばいいですか？',
        answer:
          '本書の内容は標準SQLに基づいているため、MySQL、PostgreSQL、SQLiteなどどのRDBMSでも通用します。学習にはSQLiteやMySQLが手軽でおすすめです。',
      },
      {
        question: 'フロントエンドエンジニアにもSQLは必要ですか？',
        answer:
          'バックエンドAPIがどのようにデータを取得しているかを理解するためにSQLの基礎は役立ちます。フルスタック開発やデータ分析にも直結するスキルです。',
      },
    ],
    targetAudience: [
      'データベースを初めて学ぶ方',
      'SQLの基本は知っているがJOINや設計に不安がある方',
      'バックエンド開発に必要なDB知識を身につけたい方',
      'Webアプリのデータ設計を理解したいフロントエンドエンジニア',
    ],
    relatedQuizSlug: 'sql-basic',
  },

  'system-design': {
    overview:
      '本書は、Webアプリ開発で必要な設計の考え方と実務パターンを整理する入門書です。要件定義から始まり、機能設計、DB設計（ER図・正規化）、API設計（RESTful設計）、詳細設計書の書き方、設計レビューの進め方までを体系的に解説します。「なんとなく動くコード」から「設計されたコード」へ進むための土台を作ります。',
    whyLearn:
      '設計力はコードの品質と保守性に直結します。設計なしに書いたコードは機能追加や仕様変更に弱く、チーム開発で負債になりがちです。設計の考え方を身につけることで、複雑な要件にも対応でき、チームで共通認識を持って開発を進められるようになります。',
    prerequisites:
      '何らかのプログラミング言語でWebアプリケーションを作った経験があると理解が深まります。SQL（テーブル設計）とHTTP/APIの基礎知識があるとスムーズです。',
    topics: [
      {
        title: '要件定義と機能設計',
        description:
          '要件の整理方法、機能一覧の作り方、ユースケースの洗い出し、MVPの考え方を学びます。',
      },
      {
        title: 'DB設計（ER図・正規化）',
        description:
          'ER図の書き方、テーブル設計、正規化、リレーションの定義など、データベース設計の基本を理解します。',
      },
      {
        title: 'API設計（RESTful設計）',
        description:
          'リソース設計、HTTPメソッドの使い分け、ステータスコード、エラーレスポンスの設計を学びます。',
      },
      {
        title: '設計レビューと設計書',
        description:
          '詳細設計書のフォーマット、設計レビューの観点、チームでの合意形成のプロセスを解説します。',
      },
    ],
    faqs: [
      {
        question: '設計の経験がなくても読めますか？',
        answer:
          'はい。設計の概念が初めての方を想定して、要件定義の基本から順に解説しています。何らかのWebアプリを作った経験があると、具体的なイメージが湧きやすくなります。',
      },
      {
        question: 'この本を読めばシステム設計面接に対応できますか？',
        answer:
          '本書はWebアプリ開発の実務設計に焦点を当てています。大規模分散システムの設計面接には別途の学習が必要ですが、設計の基本的な考え方は共通して活きます。',
      },
      {
        question: 'DB設計とAPI設計のどちらを先に学ぶべきですか？',
        answer:
          '本書の順番通り、DB設計（データモデル）を先に固めてからAPI設計に進むのがおすすめです。データ構造が決まらないとAPI設計もぶれやすくなります。',
      },
    ],
    targetAudience: [
      '「なんとなく動くコード」から設計力を上げたい方',
      '要件定義やDB設計の基礎を体系的に学びたい方',
      'チーム開発で設計レビューに参加する機会がある方',
      'API設計やDB設計を実務で行うバックエンドエンジニア',
    ],
    relatedQuizSlug: null,
  },

  'aws-saa-c03': {
    overview:
      '本書は、AWS Certified Solutions Architect - Associate (SAA-C03) の出題範囲に沿って、主要AWSサービスの設計判断を実務目線で学ぶ教科書です。IAM、VPC、EC2、S3、RDS、DynamoDB、CloudFront、SQS/SNS、Lambda、KMS、CloudFormationなど、試験と実務の両方で必要な知識を章ごとに整理します。',
    whyLearn:
      'AWSは世界シェアNo.1のクラウドプラットフォームであり、多くの企業でインフラ基盤として使われています。SAA-C03資格はAWS設計の基礎力を証明する認定であり、クラウドエンジニアやインフラエンジニアのキャリアを切り開きます。資格取得を通じて実務に直結する設計パターンを体系的に学べます。',
    prerequisites:
      'Web開発の基本（HTTP、サーバー、データベースの概念）を理解していることが前提です。AWSの操作経験がなくても読み進められますが、マネジメントコンソールを触りながら学ぶとより効果的です。',
    topics: [
      {
        title: 'IAM・VPC・ネットワーク',
        description:
          'IAMポリシー設計、VPCのサブネット構成、セキュリティグループ、ネットワークACLなどの基礎を学びます。',
      },
      {
        title: 'コンピュート・ストレージ',
        description:
          'EC2、Lambda、S3、EBSの選択基準、Auto Scaling、ELBによる高可用性設計を理解します。',
      },
      {
        title: 'データベース・分析',
        description:
          'RDS、Aurora、DynamoDB、ElastiCacheの使い分け、データ分析サービスの概要を学びます。',
      },
      {
        title: 'セキュリティ・コスト最適化',
        description:
          'KMS、CloudTrail、Config、Cost Explorerなど、セキュリティとコスト管理のベストプラクティスを押さえます。',
      },
    ],
    faqs: [
      {
        question: 'AWS未経験でも読めますか？',
        answer:
          'はい。各サービスの概念から丁寧に解説しています。ただし、AWSマネジメントコンソールで実際にサービスを触りながら読むと理解が深まります。無料利用枠で多くのサービスを試せます。',
      },
      {
        question: 'この教科書だけでSAA-C03に合格できますか？',
        answer:
          '本書で設計の考え方を体系的に学び、別途模擬試験で出題形式に慣れることをおすすめします。クイズカテゴリ「AWS」との併用で知識の定着が図れます。',
      },
      {
        question: 'AWSとGCPやAzureのどれを学ぶべきですか？',
        answer:
          '求人数とシェアを考慮するとAWSから始めるのが一般的です。クラウドの基本概念（VPC、IAM、マネージドサービスの考え方等）は他のクラウドにも応用できます。',
      },
    ],
    targetAudience: [
      'SAA-C03資格の取得を目指す方',
      'AWSの設計パターンを体系的に学びたいエンジニア',
      'オンプレミスからクラウド移行に関わる方',
      'インフラの基礎知識を身につけたいアプリケーションエンジニア',
    ],
    relatedQuizSlug: 'aws-basic',
  },

  'http-and-web-api': {
    overview:
      '本書は、ブラウザとサーバーの間で何が起きているのかを理解するための入門書です。HTTPプロトコルの仕組み（リクエスト/レスポンス、ヘッダー、ステータスコード）から、REST API設計、認証（JWT、OAuth）、CORS、キャッシュ戦略までを段階的に解説します。',
    whyLearn:
      'HTTPはWebのすべての通信の基盤です。API開発、フロントエンドのデータ取得、デバッグ、パフォーマンス最適化のいずれにおいてもHTTPの理解が不可欠です。「なんとなくfetchで取れる」から「なぜ403が返るのか理解できる」レベルに引き上げます。',
    prerequisites:
      'プログラミングの基礎があれば読み進められます。JavaScriptのfetchやaxiosを使ったことがあるとイメージが湧きやすいです。',
    topics: [
      {
        title: 'HTTPの基礎',
        description:
          'リクエスト/レスポンスの構造、HTTPメソッド（GET/POST/PUT/DELETE）、ステータスコード、ヘッダーを学びます。',
      },
      {
        title: 'REST API設計',
        description:
          'リソース設計、エンドポイントの命名規則、べき等性、HATEOAS、バージョニングなどの設計原則を理解します。',
      },
      {
        title: '認証・認可',
        description:
          'Cookie/Session、JWT、OAuth 2.0、APIキーなど、Web認証の仕組みと使い分けを学びます。',
      },
      {
        title: 'CORS・キャッシュ・セキュリティ',
        description:
          'CORSの仕組み、キャッシュ戦略（Cache-Control）、HTTPS、セキュリティヘッダーを押さえます。',
      },
    ],
    faqs: [
      {
        question: 'フロントエンドエンジニアにもHTTPの知識は必要ですか？',
        answer:
          'はい。API呼び出し、CORS対応、認証処理、キャッシュ制御など、フロントエンド開発でHTTPの知識が必要になる場面は非常に多いです。',
      },
      {
        question: 'RESTとGraphQLのどちらを学ぶべきですか？',
        answer:
          'まずRESTの基礎を固めることをおすすめします。RESTはWeb APIの標準的な設計スタイルであり、GraphQLもHTTPの上で動いているため、HTTPとRESTの理解が先に必要です。',
      },
      {
        question: 'APIの認証方式はどれを選べばいいですか？',
        answer:
          '本書で各方式（Session、JWT、OAuth）の特徴と適用場面を詳しく解説しています。一般的にWebアプリではSession認証、SPAやモバイルアプリではJWT認証がよく使われます。',
      },
    ],
    targetAudience: [
      'APIをなんとなく使っているが仕組みを理解したい方',
      'バックエンドAPI開発に入門したい方',
      'CORS・認証・キャッシュのトラブルに悩んでいる方',
      'フルスタック開発を目指すフロントエンドエンジニア',
    ],
    relatedQuizSlug: null,
  },

  'unit-testing': {
    overview:
      '本書は、ユニットテスト（単体テスト）の方針とベストプラクティスを学び、質の高いテストを書けるようになるための入門書です。テストの目的と価値、何をテストすべきか、テストダブル（モック/スタブ）の使いどころ、テストしやすい設計、カバレッジの読み方まで、実践的な知識を整理します。',
    whyLearn:
      'ユニットテストは、コードの品質を保ちリファクタリングを安全に行うための基盤です。テストを書く習慣があるとバグの早期発見、仕様変更への安全な対応、チーム開発でのコード品質維持が実現できます。CI/CDパイプラインでもユニットテストは中心的な役割を果たします。',
    prerequisites:
      'JavaScript/TypeScriptの基本がわかっていれば読み進められます。Jest、Vitestなどのテストランナーに触れたことがあるとスムーズです。',
    topics: [
      {
        title: 'テストの基本と方針',
        description:
          'なぜテストを書くのか、何をテストすべきか、テストの種類（単体・結合・E2E）の違いを理解します。',
      },
      {
        title: 'テストダブル（モック/スタブ）',
        description:
          'モック・スタブ・スパイの違い、外部依存の分離方法、過度なモックの弊害を学びます。',
      },
      {
        title: 'テストしやすい設計',
        description:
          '依存性注入、純粋関数、副作用の分離など、テスタビリティの高いコードの書き方を理解します。',
      },
      {
        title: 'カバレッジと運用',
        description:
          'カバレッジの読み方と目安、テストの保守コスト、CIへの組み込みを押さえます。',
      },
    ],
    faqs: [
      {
        question: 'テストを書いたことがなくても読めますか？',
        answer:
          'はい。テストの概念と目的から解説しているので、テスト未経験の方でも読み進められます。実際のコード例も交えて説明しています。',
      },
      {
        question: 'カバレッジは100%を目指すべきですか？',
        answer:
          'いいえ。カバレッジ100%はコストに見合わないことが多いです。本書では、どこに重点的にテストを書くべきか、カバレッジの数字にどう向き合うかを解説しています。',
      },
      {
        question: 'JestとVitestのどちらを使うべきですか？',
        answer:
          'どちらも優れたテストランナーです。Viteベースのプロジェクトにはvitest、既存のプロジェクトにはJestが定番です。本書の内容はどちらのランナーでも通用します。',
      },
    ],
    targetAudience: [
      'テストを書く習慣をつけたいエンジニア',
      '何をテストすべきか迷っている方',
      'モックの使い方に自信がない方',
      'テストしやすいコード設計を学びたい方',
    ],
    relatedQuizSlug: null,
  },

  'integration-and-e2e-testing': {
    overview:
      '本書は、結合テストとE2Eテストの違い、単体テストとの境界、コンポーネント結合テスト、API結合テスト、PlaywrightによるブラウザE2Eテスト、テストシナリオ設計、CIでの運用と保守までを体系的に整理する実践書です。ユニットテストの次のステップとして、システム全体の品質を保証するテスト戦略を学びます。',
    whyLearn:
      'ユニットテストだけでは、コンポーネント間の連携やブラウザ上での実際の動作を検証できません。結合テストとE2Eテストを適切に組み合わせることで、リグレッション（デグレ）を防ぎ、ユーザーに影響する不具合をリリース前に発見できます。',
    prerequisites:
      'ユニットテストの基本（テストの書き方、アサーション、モック）を理解していることが前提です。ユニットテストの教科書を先に読むか、同等の知識があればスムーズに進められます。',
    topics: [
      {
        title: 'テストの分類と戦略',
        description:
          '単体・結合・E2Eの違い、テストピラミッド、どのテストを書くべきかの判断基準を学びます。',
      },
      {
        title: 'コンポーネント結合テスト',
        description:
          'React Testing LibraryやVitestを使った、複数コンポーネント間の結合テストの書き方を理解します。',
      },
      {
        title: 'PlaywrightによるE2Eテスト',
        description:
          'ブラウザ自動操作、ページ遷移テスト、フォーム入力テスト、スクリーンショット比較を実践します。',
      },
      {
        title: 'CI運用と保守',
        description:
          'GitHub ActionsでのE2Eテスト実行、フレーキーテスト対策、テストの保守コスト管理を学びます。',
      },
    ],
    faqs: [
      {
        question: 'ユニットテストとE2Eテストの違いは何ですか？',
        answer:
          'ユニットテストは関数やクラス単位の小さなテスト、E2Eテストはブラウザ上でユーザー操作を再現するテストです。本書ではその間にある結合テストも含めて、テスト戦略全体を解説しています。',
      },
      {
        question: 'Playwrightは初めてでも使えますか？',
        answer:
          'はい。本書ではPlaywrightのセットアップから基本的なテストの書き方まで順に解説しているので、E2Eテストが初めてでも読み進められます。',
      },
      {
        question: 'E2Eテストはどのくらい書くべきですか？',
        answer:
          'E2Eテストは実行時間と保守コストが高いため、ユーザーにとって重要なフロー（ログイン、購入、主要機能）に絞るのが一般的です。テストピラミッドの考え方を本書で詳しく解説しています。',
      },
    ],
    targetAudience: [
      'ユニットテストの次のステップを学びたい方',
      'E2Eテストを導入したいが何から始めればいいかわからない方',
      'Playwrightを使ったテスト自動化に興味がある方',
      'テスト戦略を整理してCI/CDの品質を上げたい方',
    ],
    relatedQuizSlug: null,
  },
};

export function getBookSeoContent(bookSlug: string): BookSeoContent | null {
  return bookSeoContentMap[bookSlug] ?? null;
}
