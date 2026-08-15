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

  'html-basics': {
    overview:
      'HTMLはWebページの構造と意味を表すマークアップ言語で、すべてのWeb制作・フロントエンド開発の土台です。本書では、doctype・head・bodyの基本構造から、見出し、段落、リンク、画像、リスト、テーブル、フォーム、セマンティックHTML、meta情報、アクセシビリティ、バリデーションまでを体系的に解説します。終盤にはタグ・属性を素早く確認できるチートシート章も用意しています。',
    whyLearn:
      'HTMLを正しく理解すると、SEO、アクセシビリティ、フォーム設計、React/Next.jsでのコンポーネント設計まで品質が上がります。CSSやJavaScriptを学ぶ前にHTMLの構造を押さえることで、「見た目のためにタグを選ぶ」「divだけで画面を作る」といった初学者に多い失敗を避けられます。HTML5プロフェッショナル認定試験やWebクリエイター能力認定試験でも、HTMLの基本構造とセマンティックなマークアップは重要な範囲です。',
    prerequisites:
      'プログラミング経験は不要です。ブラウザでWebページを見たことがあれば読み始められます。CSS入門、JavaScript入門、React入門へ進む前の最初の教科書として使えます。',
    topics: [
      {
        title: 'HTML文書の基本構造',
        description:
          'doctype、html、head、body、charset、viewport、titleなど、すべてのHTMLページに共通する土台を学びます。',
      },
      {
        title: 'テキスト・リンク・画像',
        description:
          '見出し、段落、強調、a要素、img要素、alt属性、figureなど、Webページで頻出する基本要素を整理します。',
      },
      {
        title: 'リスト・テーブル・フォーム',
        description:
          'ul/ol/dl、table、form、input、label、buttonなど、情報整理とユーザー入力に必要な要素を学びます。',
      },
      {
        title: 'セマンティックHTMLとアクセシビリティ',
        description:
          'header、main、section、article、nav、button、aria-labelなどを使い、意味が伝わるHTMLを書く判断基準を身につけます。',
      },
      {
        title: 'head・meta・SEO',
        description:
          'title、description、viewport、OGP、CSS/JavaScriptの読み込みなど、ページのメタ情報を実務目線で整理します。',
      },
      {
        title: 'HTMLチートシート',
        description:
          'よく使うタグ、属性、使い分け、避けたい使い方を一覧化し、クイズ前後の復習に使える形でまとめます。',
      },
    ],
    faqs: [
      {
        question: 'HTML初心者でも読めますか？',
        answer:
          'はい。HTMLを初めて学ぶ方を想定し、文書の最小構造から順番に解説しています。各章にタグ・属性の表とコード例を入れているため、チートシートとしても使えます。',
      },
      {
        question: 'CSSやJavaScriptより先にHTMLを学ぶべきですか？',
        answer:
          '基本的にはHTMLを先に学ぶのがおすすめです。HTMLでページの構造を作り、CSSで見た目を整え、JavaScriptで動きを加える、という役割分担が理解しやすくなります。',
      },
      {
        question: '資格対策にも使えますか？',
        answer:
          'HTML5プロフェッショナル認定試験レベル1やWebクリエイター能力認定試験HTML5対応で重視される、基本構造、フォーム、セマンティックHTML、アクセシビリティの理解に役立つ構成です。ただし、特定試験の完全な対策問題集ではありません。',
      },
      {
        question: 'ReactやNext.jsを使う人にも必要ですか？',
        answer:
          '必要です。JSXはHTMLに似た構文でUIを表現するため、見出し、フォーム、button/aの使い分け、アクセシビリティを理解しているほど、ReactやNext.jsのコンポーネント品質も上がります。',
      },
    ],
    targetAudience: [
      'Web制作をこれから始める方',
      'HTMLクイズの前後に基礎を復習したい方',
      'CSS・JavaScript・Reactへ進む前に土台を固めたい方',
      'セマンティックHTMLやアクセシビリティを学び直したい方',
    ],
    relatedQuizSlug: 'html-basic',
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

  sqlite: {
    overview:
      '本書は、サーバー不要で動くデータベース「SQLite」を実務で使うための教科書です。SQLiteが1ファイルで完結する仕組みから始まり、sqlite3コマンドの操作、SQLite特有の型親和性とSTRICTテーブル、rowid、UPSERTやRETURNINGといった方言、WALモードとSQLITE_BUSY、インデックスとEXPLAIN QUERY PLANまでを解説します。さらにNode.js標準のnode:sqliteモジュールによる実装、FTS5の全文検索、sqlite-vecによるベクトル検索、Turso・libSQL・Cloudflare D1を使ったエッジ環境での運用まで扱います。',
    whyLearn:
      'SQLiteは「学習用の簡易DB」という位置づけから変わりつつあります。Node.jsに標準モジュールとして組み込まれたことで導入コストがほぼゼロになり、TursoやCloudflare D1といったサービスによってエッジ環境や本番環境での採用例も増えました。テスト用のDB、CLIツール、デスクトップアプリ、local-firstなWebアプリ、AIエージェントのローカルメモリなど、活躍する場面は広がっています。SQLiteの得意・不得意を理解しておくと、「ここはPostgreSQLを立てるまでもない」という判断が自信を持ってできるようになります。',
    prerequisites:
      'SELECT・WHERE・JOINなど基本的なSQLがわかっていると読み進めやすくなります。不安がある場合は先に「SQLとデータベースの基礎」を読んでください。本書はSQL文法そのものではなく、SQLite固有の仕組みと運用に絞って解説します。',
    topics: [
      {
        title: 'SQLiteの仕組みと基本操作',
        description:
          'サーバーが不要な理由、1ファイルで完結する構造、sqlite3コマンドによるテーブル確認やCSVインポートを学びます。',
      },
      {
        title: '型親和性・rowid・SQL方言',
        description:
          'SQLiteに厳密な型がない理由とSTRICTテーブル、rowidとAUTOINCREMENT、UPSERT・RETURNING・JSON関数といった固有の書き方を理解します。',
      },
      {
        title: 'WALモード・トランザクション・インデックス',
        description:
          'WALモードとロールバックジャーナルの違い、SQLITE_BUSYが出る理由と対策、EXPLAIN QUERY PLANの読み方を押さえます。',
      },
      {
        title: 'Node.js連携・全文検索・ベクトル検索',
        description:
          'node:sqliteによる実装、better-sqlite3やPrisma・Drizzleとの使い分け、FTS5の全文検索、sqlite-vecによるローカルRAGを扱います。',
      },
      {
        title: '運用とエッジ・local-first',
        description:
          'バックアップ・VACUUM・PRAGMA設定に加え、Turso・libSQLの埋め込みレプリカやCloudflare D1での本番採用の判断基準を学びます。',
      },
    ],
    faqs: [
      {
        question: 'SQLiteは本番環境で使ってもいいのですか？',
        answer:
          '読み取りが中心のアプリ、テナントごとにDBを分ける構成、エッジ環境などでは十分に実用的です。一方で書き込みが同時多発するワークロードは苦手で、SQLiteは書き込みを1つずつ処理する設計になっています。本書の最終章で、採用してよい場面と避けるべき場面を具体的に整理します。',
      },
      {
        question: 'MySQLやPostgreSQLとの違いは何ですか？',
        answer:
          '最大の違いは「サーバープロセスが存在しない」点です。MySQLやPostgreSQLはDBサーバーに接続して使いますが、SQLiteはアプリケーションに組み込まれたライブラリがファイルを直接読み書きします。そのため接続設定や運用作業が大幅に減る一方、同時書き込みやユーザー権限管理には制約があります。',
      },
      {
        question: 'SQLの基本を知らなくても読めますか？',
        answer:
          '本書はSQLite固有の話題に絞っているため、SELECTやJOINの書き方は別途「SQLとデータベースの基礎」で学ぶことをおすすめします。逆にSQLの基本を知っている方は、本書だけでSQLiteの実務知識を補完できます。',
      },
      {
        question: 'Node.jsからSQLiteを使うには何をインストールすればいいですか？',
        answer:
          '近年のNode.jsには標準でnode:sqliteモジュールが同梱されているため、多くの場合は追加インストールなしで使えます。本書では標準モジュールを主軸に解説しつつ、better-sqlite3やPrisma・Drizzleを選ぶべき場面も比較します。安定度はNode.jsのバージョンによって異なるため、利用前に公式ドキュメントで確認してください。',
      },
    ],
    targetAudience: [
      'SQLの基本は学んだが、実際にDBを動かして試したい方',
      'テストやCLIツール向けに手軽なデータベースを探している方',
      'Node.jsアプリでSQLiteを使いたいバックエンドエンジニア',
      'Turso・Cloudflare D1などエッジDBの選択肢を検討している方',
      'ローカルRAGやAIエージェントのデータ保存先を検討している方',
    ],
    relatedQuizSlug: null,
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

  'azure-az-900': {
    overview:
      'AZ-900 (Microsoft Azure Fundamentals) は、Microsoftのクラウド「Azure」の基礎知識を証明する入門資格です。本書では、公式の出題範囲(クラウドの概念/Azureのアーキテクチャとサービス/管理とガバナンス)に沿って、共同責任モデル、IaaS・PaaS・SaaS、リージョンと可用性ゾーン、仮想マシン、VNet、Microsoft Entra ID、RBAC、コスト管理、Azure Policyまでを14章で体系的に解説します。実装スキルではなく「説明できること」が問われる試験なので、概念を噛み砕いた図解中心の構成にしています。',
    whyLearn:
      'Azureは日本のエンタープライズ市場で高いシェアを持ち、Microsoft 365を導入している企業ではクラウド基盤の第一候補になります。AZ-900はエンジニアだけでなく営業・PM・情シスにも人気で、前提条件なし・資格の有効期限なしという受けやすさも魅力です。ここで学ぶクラウドの概念(従量課金、高可用性、スケーラビリティなど)はAWSやGoogle Cloudにも通じる普遍的な知識で、上位資格(AZ-104/AZ-204)への出発点にもなります。',
    prerequisites:
      'IT実務経験は不要です。「サーバー」「ネットワーク」という言葉を聞いたことがあるレベルで読み始められます。クラウドの利用経験があれば、より速く読み進められます。',
    topics: [
      {
        title: 'クラウドの概念',
        description:
          'クラウドコンピューティングの定義、共同責任モデル、パブリック・プライベート・ハイブリッド、従量課金、高可用性とスケーラビリティ、IaaS・PaaS・SaaSの違いを学びます。',
      },
      {
        title: 'Azureのコアアーキテクチャ',
        description:
          'リージョン・リージョンペア・可用性ゾーンの物理構造と、リソースグループ・サブスクリプション・管理グループの論理階層を図解で整理します。',
      },
      {
        title: 'コンピューティングとネットワーク',
        description:
          '仮想マシン・VMSS・App Service・Azure Functionsの使い分け、VNet・ピアリング・VPN Gateway・ExpressRouteによる接続を学びます。',
      },
      {
        title: 'ストレージとデータ移行',
        description:
          'Azure Storageのストレージ層(ホット/クール/アーカイブ)、LRS/ZRS/GRSなどの冗長性オプション、AzCopyやAzure Data Boxによる移行を整理します。',
      },
      {
        title: 'IDとセキュリティ',
        description:
          'Microsoft Entra ID(旧Azure AD)、SSO・MFA・パスワードレス認証、条件付きアクセス、RBAC、ゼロトラストと多層防御を学びます。',
      },
      {
        title: '管理とガバナンス',
        description:
          'コスト管理と料金計算ツール、Azure Policy・リソースロック、Azure Portal・CLI・ARMテンプレート、Azure Monitorなどの監視ツールを押さえます。',
      },
    ],
    faqs: [
      {
        question: 'IT未経験でもAZ-900に合格できますか？',
        answer:
          'はい。AZ-900は前提条件のない入門資格で、実装スキルではなく概念の理解が問われます。未経験者の学習期間の目安は3〜4週間、IT経験者なら1〜2週間程度です。本書で概念を固め、Microsoft公式の無料練習問題で仕上げる流れがおすすめです。',
      },
      {
        question: 'AWSの資格(SAA)とどちらを取るべきですか？',
        answer:
          '所属組織や志望先が使っているクラウドに合わせるのが基本です。Microsoft 365を導入している企業やエンタープライズ系ならAzure、Web系スタートアップならAWSが多い傾向があります。クラウドの概念部分は共通なので、片方を学べばもう片方の学習コストは大きく下がります。',
      },
      {
        question: 'AZ-900に有効期限はありますか？',
        answer:
          'ありません。Fundamentalsレベルの資格は一度取得すれば失効しません(AZ-104などの上位資格は毎年の更新が必要です)。',
      },
      {
        question: 'AZ-900の次はどの資格に進むべきですか？',
        answer:
          'インフラ運用ならAZ-104 (Azure Administrator)、開発者ならAZ-204 (Azure Developer)が定番です。セキュリティのSC-900、データのDP-900、AIのAI-900など、同じFundamentalsレベルに横展開する選択肢もあります。',
      },
    ],
    targetAudience: [
      'クラウドを初めて学ぶ方・IT未経験の方',
      'AzureやMicrosoft 365を使う企業で働くエンジニア・情シス・営業・PM',
      'AWSは知っているがAzureの全体像を短時間で掴みたい方',
      'AZ-104やAZ-204など上位資格の土台を固めたい方',
    ],
    relatedQuizSlug: null,
  },

  'coding-test': {
    overview:
      '本書は、paizaスキルチェック・AtCoder・採用コーディング面接で出題されるアルゴリズム問題を、TypeScriptで解けるようになるための実践ドリルです。計算量（Big-O）の見積もりから、配列・ハッシュマップ・スタック・木とグラフのデータ構造、全探索・二分探索・貪欲法・動的計画法（DP）・ダイクストラ法・Union-Findといった解法パターン、「問題文からパターンを見抜く」訓練、実戦形式の模擬テストまでを16章で体系的に学びます。',
    whyLearn:
      'コーディングテストは中途採用・新卒採用の選考で標準化が進んでおり、paizaのランクやAtCoderの色はスキルの客観的な証明として通用します。また、計算量を意識したコードが書ける力は、テスト対策にとどまらず実務のパフォーマンス問題の予防にも直結します。頻出パターンは限られているため、体系的に学べば効率よく得点力を伸ばせます。',
    prerequisites:
      'JavaScript/TypeScriptの基本文法（変数、関数、配列操作、ループ）を理解していることが前提です。不安がある方は先に『JavaScript入門』を読むことをおすすめします。数学は高校数学の初歩程度で十分です。',
    topics: [
      {
        title: '計算量とデータ構造',
        description:
          'Big-O記法と「10^8回ルール」による見積もり、配列・文字列の頻出パターン、Map/Set・スタック・キュー・木とグラフの使い分けを学びます。',
      },
      {
        title: '解法パターン',
        description:
          '全探索・bit全探索、ソートと二分探索、貪欲法、動的計画法（ナップサック・LIS）、ダイクストラ法、Union-Findを実例で習得します。',
      },
      {
        title: 'パターン認識と実戦演習',
        description:
          '「問題文のシグナル→解法」の対応20選と5ステップの思考手順で、初見の問題を分解する力を鍛えます。',
      },
      {
        title: '模擬テストと環境構築',
        description:
          'paiza B〜S相当・AtCoder ABC相当の模擬10問、TypeScriptでの標準入力処理、コピペで使えるスニペット集を収録します。',
      },
    ],
    faqs: [
      {
        question: 'アルゴリズムの学習が初めてでも読めますか？',
        answer:
          'はい。計算量の考え方から順に解説しているので、アルゴリズムを体系的に学ぶのが初めての方でも読み進められます。JavaScript/TypeScriptの基本文法だけが前提です。',
      },
      {
        question: 'なぜTypeScriptなのですか？C++やPythonでなくても大丈夫？',
        answer:
          '本書が対象とするレベル（paiza S・AtCoder緑まで）では、TypeScriptの実行速度がネックになる場面はほとんどありません。Web開発でJavaScript/TypeScriptを使っている方が新しい言語を覚えずに始められることを優先しています。paiza・AtCoderともNode.jsでの提出に対応しています。',
      },
      {
        question: 'paizaのランクやAtCoderの色はどこまで目指せますか？',
        answer:
          '本書の範囲でpaiza B〜Sランク、AtCoder灰〜緑（上位10%前後）までをカバーしています。その先（水色以降）に必要な発展アルゴリズムは付録Cでロードマップとして案内しています。',
      },
    ],
    targetAudience: [
      '転職・就活でコーディングテストを受ける予定のエンジニア',
      'paizaのランクを上げたい方（Bランク〜Sランク）',
      'AtCoderで入茶・入緑を目指す方',
      'Web開発の経験はあるがアルゴリズム問題に苦手意識のある方',
    ],
    relatedQuizSlug: 'cs-basic',
  },

  'github-actions': {
    overview:
      '本書は、Gitの基本操作を身につけたエンジニアがCI/CD（継続的インテグレーション/継続的デリバリー）を実践できるようになるための入門書です。GitHub Actionsのワークフロー構文、イベントトリガー、コンテキストと変数、ランナーの仕組みといった基礎から、Node.js/Next.jsプロジェクトのテスト・lint自動化、キャッシュによる高速化、Reusable Workflowによる再利用、デプロイ自動化、シークレット管理とOIDCによるセキュアなクラウド連携までを12章で体系的に学びます。',
    whyLearn:
      'テスト・ビルド・デプロイの自動化は、現代のチーム開発では標準的なプラクティスです。CIがあることで壊れたコードの混入を即座に検知でき、デプロイの属人化も解消されます。GitHub ActionsはGitHubに組み込まれており追加契約なしで使えるため、CI/CDを学び始める場所として最適です。実務のリポジトリでワークフローを読み書きできるスキルは、フロントエンド・バックエンドを問わず求められます。',
    prerequisites:
      'Gitの基本操作（add/commit/push、ブランチ、Pull Request）を理解していることが前提です。不安がある方は先に『Gitをちゃんと使う』を読むことをおすすめします。YAMLの知識は不要です（本書内で必要な範囲を解説します）。',
    topics: [
      {
        title: 'ワークフロー構文の基礎',
        description:
          'ワークフロー・ジョブ・ステップ・アクションの階層構造、イベントトリガー、YAMLの書き方を基礎から学びます。',
      },
      {
        title: 'コンテキスト・変数・ランナー',
        description:
          '式と${{ }}構文、env/secrets/varsの使い分け、GitHubホステッドランナーの仕組み、マトリックスビルドを理解します。',
      },
      {
        title: 'Node.js/Next.jsプロジェクトのCI',
        description:
          'テスト・lint・型チェックの自動化、npmキャッシュとアーティファクト、複合アクションとReusable Workflowによる再利用を実践します。',
      },
      {
        title: 'デプロイとセキュリティ',
        description:
          'environmentsとデプロイ保護ルール、GITHUB_TOKENの権限最小化、script injection対策、OIDCによるキーレスなクラウド連携を学びます。',
      },
    ],
    faqs: [
      {
        question: 'CI/CDの知識が全くなくても読めますか？',
        answer:
          'はい。第1章でCI/CDの概念そのものから解説しているので、「テスト自動化やデプロイ自動化をやったことがない」方でも読み進められます。Gitの基本操作だけが前提です。',
      },
      {
        question: 'GitHub Actionsの利用は有料ですか？',
        answer:
          'パブリックリポジトリでは無料で利用できます。プライベートリポジトリでも毎月の無料枠（Freeプランで2,000分/月）があり、個人の学習用途で枠を超えることはほとんどありません。',
      },
      {
        question: 'CircleCIやJenkinsとはどう違いますか？',
        answer:
          '大きな違いはGitHubへの組み込みの深さです。別サービスの契約や連携設定なしに、リポジトリにYAMLを置くだけで動き始めます。push以外にもIssueやリリースなどGitHub上のあらゆるイベントをトリガーにできる点も強みです。',
      },
    ],
    targetAudience: [
      'Gitの基本は身につけたが、CI/CDは未経験の方',
      'テストやlintの実行を手作業で行っていて自動化したい方',
      '実務のリポジトリにあるワークフローYAMLを読めるようになりたい方',
      'Next.js/Node.jsプロジェクトにテスト自動化と自動デプロイを導入したい方',
    ],
    relatedQuizSlug: null,
  },
};

export function getBookSeoContent(bookSlug: string): BookSeoContent | null {
  return bookSeoContentMap[bookSlug] ?? null;
}
