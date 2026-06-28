export interface SectionBookLink {
  bookSlug: string;
  chapterSlug: string;
  title: string;
}

export interface SectionTagConfig {
  slug: string;
  label: string;
  aliases?: string[];
  bookLinks?: SectionBookLink[];
}

const sectionTagMap: Record<string, SectionTagConfig[]> = {
  'aws-basic': [
    {
      slug: 'ec2',
      label: 'EC2（仮想サーバー）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'compute-selection',
          title: 'コンピューティング選択 — EC2・Lambda・ECS・Fargate・EKS',
        },
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'scalability-and-ha',
          title: 'スケーラビリティと高可用性 — ELB・Auto Scaling・Multi-AZ',
        },
      ],
    },
    {
      slug: 's3',
      label: 'S3（ストレージ）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'storage-selection',
          title: 'ストレージ選択 — S3・EBS・EFS・FSxを使い分ける',
        },
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'cost-optimized-storage',
          title: 'ストレージのコスト最適化 — S3 Lifecycle・Glacier・EBS gp3',
        },
      ],
    },
    {
      slug: 'amazon-vpc',
      label: 'VPC（ネットワーク）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'vpc-network-security',
          title: 'VPCネットワークセキュリティ — Subnet・SG・NACL・NAT Gateway',
        },
      ],
    },
    {
      slug: 'iam',
      label: 'IAM（認証・認可）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'iam-and-least-privilege',
          title: 'IAMと最小権限 — ユーザー・グループ・ロール・ポリシー',
        },
      ],
    },
    {
      slug: 'lambda',
      label: 'Lambda（サーバーレス）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'compute-selection',
          title: 'コンピューティング選択 — EC2・Lambda・ECS・Fargate・EKS',
        },
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'decoupled-architecture',
          title: '疎結合アーキテクチャ — SQS・SNS・EventBridge・Step Functions',
        },
      ],
    },
    {
      slug: 'rds',
      label: 'RDS（リレーショナルDB）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'database-selection',
          title: 'データベース選択 — RDS・Aurora・DynamoDB・ElastiCache・Redshift',
        },
      ],
    },
    {
      slug: 'dynamodb',
      label: 'DynamoDB（NoSQL）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'database-selection',
          title: 'データベース選択 — RDS・Aurora・DynamoDB・ElastiCache・Redshift',
        },
      ],
    },
    {
      slug: 'ecs',
      label: 'ECS（コンテナ）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'compute-selection',
          title: 'コンピューティング選択 — EC2・Lambda・ECS・Fargate・EKS',
        },
      ],
    },
    {
      slug: 'eks',
      label: 'EKS（Kubernetes）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'compute-selection',
          title: 'コンピューティング選択 — EC2・Lambda・ECS・Fargate・EKS',
        },
      ],
    },
    {
      slug: 'ebs',
      label: 'EBS（ブロックストレージ）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'storage-selection',
          title: 'ストレージ選択 — S3・EBS・EFS・FSxを使い分ける',
        },
      ],
    },
    {
      slug: 'efs',
      label: 'EFS（ファイルストレージ）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'storage-selection',
          title: 'ストレージ選択 — S3・EBS・EFS・FSxを使い分ける',
        },
      ],
    },
    {
      slug: 'cloudwatch',
      label: 'CloudWatch（監視）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'monitoring-and-cloudwatch',
          title: '監視と運用 — CloudWatch Metrics・Logs・EventBridge',
        },
      ],
    },
    { slug: 'aws-cloudformation', label: 'CloudFormation（IaC）' },
    { slug: 'aws-cloudtrail', label: 'CloudTrail（監査）' },
    {
      slug: 'amazon-elb',
      label: 'ELB（ロードバランサー）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'scalability-and-ha',
          title: 'スケーラビリティと高可用性 — ELB・Auto Scaling・Multi-AZ',
        },
      ],
    },
    {
      slug: 'amazon-elasticache',
      label: 'ElastiCache（キャッシュ）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'database-selection',
          title: 'データベース選択 — RDS・Aurora・DynamoDB・ElastiCache・Redshift',
        },
      ],
    },
    {
      slug: 'aurora',
      label: 'Aurora（高性能DB）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'database-selection',
          title: 'データベース選択 — RDS・Aurora・DynamoDB・ElastiCache・Redshift',
        },
      ],
    },
    {
      slug: 'aws-waf',
      label: 'WAF（Webファイアウォール）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'application-security',
          title: 'アプリケーション保護 — WAF・Shield・Cognito・Secrets Manager',
        },
      ],
    },
    {
      slug: 'aws-shield',
      label: 'Shield（DDoS対策）',
      bookLinks: [
        {
          bookSlug: 'aws-saa-c03',
          chapterSlug: 'application-security',
          title: 'アプリケーション保護 — WAF・Shield・Cognito・Secrets Manager',
        },
      ],
    },
    { slug: 'terraform', label: 'Terraform（IaC）' },
    { slug: 'amazon-ivs', label: 'IVS（ライブ配信）' },
    { slug: 'service-quotas', label: 'Service Quotas（制限）' },
  ],
  'react-basic': [
    {
      slug: 'react-use-state',
      label: 'useState',
      bookLinks: [
        {
          bookSlug: 'react-learning',
          chapterSlug: '04-use-state',
          title: 'useState — stateの仕組みと参照の罠',
        },
        {
          bookSlug: 'react-learning',
          chapterSlug: '10-hooks-comparison',
          title: 'Hooksの使い分け — 判断フローと横断比較',
        },
      ],
    },
    {
      slug: 'react-use-effect',
      label: 'useEffect',
      bookLinks: [
        {
          bookSlug: 'react-learning',
          chapterSlug: '06-use-effect',
          title: 'useEffect — 副作用と外部同期',
        },
        {
          bookSlug: 'react-learning',
          chapterSlug: '07-dependency-array',
          title: '依存配列を正しく書く — exhaustive-depsの読み方',
        },
        {
          bookSlug: 'react-learning',
          chapterSlug: '10-hooks-comparison',
          title: 'Hooksの使い分け — 判断フローと横断比較',
        },
      ],
    },
    {
      slug: 'react-use-ref',
      label: 'useRef',
      bookLinks: [
        {
          bookSlug: 'react-learning',
          chapterSlug: '05-use-ref',
          title: 'useRef — 再レンダーの外で値を持つ',
        },
        {
          bookSlug: 'react-learning',
          chapterSlug: '10-hooks-comparison',
          title: 'Hooksの使い分け — 判断フローと横断比較',
        },
      ],
    },
    {
      slug: 'react-use-memo',
      label: 'useMemo',
      bookLinks: [
        {
          bookSlug: 'react-learning',
          chapterSlug: '08-use-memo',
          title: 'useMemo — 計算結果のメモ化',
        },
        {
          bookSlug: 'react-learning',
          chapterSlug: '10-hooks-comparison',
          title: 'Hooksの使い分け — 判断フローと横断比較',
        },
      ],
    },
    {
      slug: 'react-use-callback',
      label: 'useCallback',
      bookLinks: [
        {
          bookSlug: 'react-learning',
          chapterSlug: '09-use-callback',
          title: 'useCallback — 関数のメモ化と子コンポーネント最適化',
        },
        {
          bookSlug: 'react-learning',
          chapterSlug: '10-hooks-comparison',
          title: 'Hooksの使い分け — 判断フローと横断比較',
        },
      ],
    },
    {
      slug: 'react-hooks-comparison',
      label: 'Hooksの使い分け',
      bookLinks: [
        {
          bookSlug: 'react-learning',
          chapterSlug: '10-hooks-comparison',
          title: 'Hooksの使い分け — 判断フローと横断比較',
        },
      ],
    },
    {
      slug: 'react-state',
      label: '状態管理',
      bookLinks: [
        {
          bookSlug: 'react-learning',
          chapterSlug: '04-use-state',
          title: 'useState — stateの仕組みと参照の罠',
        },
      ],
    },
    {
      slug: 'react-component',
      label: 'コンポーネント設計',
      bookLinks: [
        {
          bookSlug: 'react-learning',
          chapterSlug: '02-jsx-and-components',
          title: 'JSXとコンポーネント — 描画の仕組みからpropsまで',
        },
      ],
    },
    {
      slug: 'react-rendering',
      label: 'レンダリング・パフォーマンス',
      bookLinks: [
        {
          bookSlug: 'react-learning',
          chapterSlug: '03-react-lifecycle',
          title: 'レンダー・マウント・再レンダー・アンマウントの違い',
        },
        {
          bookSlug: 'react-learning',
          chapterSlug: '08-use-memo',
          title: 'useMemo — 計算結果のメモ化',
        },
        {
          bookSlug: 'react-learning',
          chapterSlug: '09-use-callback',
          title: 'useCallback — 関数のメモ化と子コンポーネント最適化',
        },
      ],
    },
    {
      slug: 'react-jsx',
      label: 'JSX',
      bookLinks: [
        {
          bookSlug: 'react-learning',
          chapterSlug: '02-jsx-and-components',
          title: 'JSXとコンポーネント — 描画の仕組みからpropsまで',
        },
      ],
    },
    {
      slug: 'react-router',
      label: 'React Router',
      bookLinks: [
        {
          bookSlug: 'react-learning',
          chapterSlug: '11-react-router',
          title: 'React Router — ルーティングとナビゲーション',
        },
      ],
    },
  ],
  'html-basic': [
    { slug: 'html-element-attribute', label: 'HTML要素・属性' },
    { slug: 'html-semantics', label: 'セマンティック要素・セクション' },
    { slug: 'html-forms', label: 'フォーム' },
    { slug: 'html-images', label: '画像・レスポンシブ画像' },
    { slug: 'html-media', label: '音声・動画・字幕' },
    { slug: 'html-metadata', label: 'メタ情報・SEO' },
  ],
  'css-basic': [
    { slug: 'css-display-position', label: 'display・position' },
    {
      slug: 'css-pseudo',
      label: 'CSSの疑似クラスと擬似要素',
      aliases: ['pseudo-class', 'pseudo-element'],
      bookLinks: [
        {
          bookSlug: 'css-basics',
          chapterSlug: '02-selectors',
          title: 'CSSセレクタの種類と使い分け — 擬似クラス・擬似要素',
        },
      ],
    },
    {
      slug: 'css-flexbox',
      label: 'Flexbox',
      aliases: ['flexbox'],
      bookLinks: [
        {
          bookSlug: 'css-basics',
          chapterSlug: '04-flexbox',
          title: 'Flexboxで横並びレイアウトを作る',
        },
      ],
    },
    {
      slug: 'css-grid',
      label: 'Grid',
      aliases: ['grid'],
      bookLinks: [
        {
          bookSlug: 'css-basics',
          chapterSlug: '05-grid',
          title: 'CSS Gridで2次元レイアウトを組む',
        },
      ],
    },
    { slug: 'css-centering', label: '中央寄せ' },
    {
      slug: 'css-layout',
      label: 'レイアウト',
      bookLinks: [
        {
          bookSlug: 'css-basics',
          chapterSlug: '03-box-model',
          title: 'ボックスモデル — margin・padding・borderの仕組み',
        },
      ],
    },
    {
      slug: 'css-responsive',
      label: 'レスポンシブ',
      bookLinks: [
        {
          bookSlug: 'css-basics',
          chapterSlug: '06-responsive',
          title: 'レスポンシブデザイン入門 — メディアクエリ・モバイルファースト',
        },
      ],
    },
    {
      slug: 'css-animation',
      label: 'アニメーション',
      bookLinks: [
        {
          bookSlug: 'css-basics',
          chapterSlug: '09-transitions-animations',
          title: 'CSS transitionとanimation — hover・フェードイン・スライド',
        },
      ],
    },
    {
      slug: 'css-text',
      label: 'テキスト',
    },
  ],
  'javascript-basic': [
    {
      slug: 'arrow-function',
      label: 'アロー関数',
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '05-functions',
          title: '関数とアロー関数 — 定義方法・this・デフォルト引数',
        },
      ],
    },
    {
      slug: 'js-this',
      label: 'this',
      aliases: ['this'],
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '11-this-keyword',
          title: 'thisの正体 — 呼び出しパターンごとの挙動を整理する',
        },
      ],
    },
    {
      slug: 'js-objects',
      label: 'オブジェクト',
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '06-objects',
          title: 'オブジェクト — プロパティ・メソッド・参照の基本',
        },
      ],
    },
    {
      slug: 'js-arrays',
      label: '配列',
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '07-arrays',
          title: '配列 — map・filter・reduceを使いこなす',
        },
      ],
    },
    {
      slug: 'js-prototype-class',
      label: 'prototype・class',
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '10-prototype-and-class',
          title: 'prototypeとclass — 継承の仕組みを理解する',
        },
      ],
    },
    {
      slug: 'js-closure',
      label: 'クロージャ',
      aliases: ['closure'],
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '12-closures',
          title: 'クロージャ — スコープチェーンとデータの隠蔽',
        },
      ],
    },
    {
      slug: 'js-promise',
      label: 'Promise',
      aliases: ['promise', 'pending', 'fulfilled'],
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '13-async-callback-promise',
          title: '非同期処理の基本 — コールバック・Promise・async/await',
        },
      ],
    },
    {
      slug: 'js-async-await',
      label: 'async/await',
      aliases: ['async', 'async-await', 'asynchronous'],
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '13-async-callback-promise',
          title: '非同期処理の基本 — コールバック・Promise・async/await',
        },
      ],
    },
    { slug: 'js-event-loop', label: 'イベントループ', aliases: ['event-loop', 'microtask'] },
    {
      slug: 'js-modules',
      label: 'ES Modules',
      aliases: ['es-modules'],
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '15-modules',
          title: 'モジュールシステム — import/exportとCommonJSの違い',
        },
      ],
    },
    {
      slug: 'js-dom',
      label: 'DOM操作',
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '16-dom-manipulation',
          title: 'DOM操作 — 要素取得・イベント・更新の基本',
        },
      ],
    },
    {
      slug: 'js-web-apis',
      label: 'Web APIs',
      aliases: ['web-apis'],
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '20-web-apis',
          title: '知っておきたいWeb API — fetch・Storage・IntersectionObserver',
        },
      ],
    },
    {
      slug: 'js-error-handling',
      label: 'エラー処理',
      bookLinks: [
        {
          bookSlug: 'javascript',
          chapterSlug: '14-error-handling',
          title: 'エラー処理 — try/catchと例外設計',
        },
      ],
    },
  ],
  'vue-basic': [
    { slug: 'vue-directives', label: 'ディレクティブ' },
    { slug: 'vue-v-if-v-show', label: '条件表示', aliases: ['v-if', 'v-show'] },
    { slug: 'vue-v-bind', label: '属性バインディング', aliases: ['v-bind'] },
    { slug: 'vue-v-model', label: '双方向バインディング', aliases: ['v-model'] },
    { slug: 'vue-components', label: 'コンポーネント' },
    { slug: 'vue-props-emits', label: 'props・emits' },
    { slug: 'vue-composition-api', label: 'Composition API', aliases: ['composition-api'] },
    { slug: 'vue-reactivity', label: 'リアクティビティ' },
    { slug: 'vue-router', label: 'Vue Router' },
    { slug: 'vue-pinia', label: 'Pinia', aliases: ['pinia'] },
    { slug: 'vue-slot', label: 'スロット', aliases: ['v-slot'] },
    { slug: 'vuetify', label: 'Vuetify' },
  ],
  'ts-general': [
    {
      slug: 'ts-union-literal',
      label: 'Union・Literal型',
      bookLinks: [
        {
          bookSlug: 'typescript',
          chapterSlug: '04-union-and-literal',
          title: 'Union型とLiteral型',
        },
      ],
    },
    {
      slug: 'ts-interface-type-alias',
      label: 'interface・type',
      bookLinks: [
        {
          bookSlug: 'typescript',
          chapterSlug: '03-type-alias-and-interface',
          title: '型エイリアスとインターフェース',
        },
      ],
    },
    {
      slug: 'ts-narrowing',
      label: '型ガード・narrowing',
      bookLinks: [
        {
          bookSlug: 'typescript',
          chapterSlug: '05-narrowing',
          title: '型の絞り込み — typeof・in・判別可能Union',
        },
      ],
    },
    {
      slug: 'ts-functions',
      label: '関数型',
      bookLinks: [
        {
          bookSlug: 'typescript',
          chapterSlug: '06-functions',
          title: '関数の型 — 引数・戻り値・オーバーロード',
        },
      ],
    },
    {
      slug: 'ts-generics',
      label: 'ジェネリクス',
      aliases: ['generics'],
      bookLinks: [
        {
          bookSlug: 'typescript',
          chapterSlug: '07-generics',
          title: 'ジェネリクス — 型を引数にする',
        },
      ],
    },
    {
      slug: 'ts-utility-types',
      label: 'Utility Types',
      aliases: ['utility-types'],
      bookLinks: [
        {
          bookSlug: 'typescript',
          chapterSlug: '09-utility-types',
          title: 'ユーティリティ型 — Partial・Pick・Omit・Record',
        },
      ],
    },
    {
      slug: 'ts-modules',
      label: 'モジュール',
      aliases: ['es-modules'],
      bookLinks: [
        {
          bookSlug: 'typescript',
          chapterSlug: '10-modules',
          title: 'モジュール — import/exportと型の公開範囲',
        },
      ],
    },
    {
      slug: 'ts-tsconfig',
      label: 'tsconfig',
      bookLinks: [
        {
          bookSlug: 'typescript',
          chapterSlug: '11-tsconfig',
          title: 'tsconfig — strict・target・moduleを理解する',
        },
      ],
    },
    {
      slug: 'ts-type-assertion',
      label: '型アサーション',
      bookLinks: [
        {
          bookSlug: 'typescript',
          chapterSlug: '08-assertion-and-guard',
          title: '型アサーションと型ガード',
        },
      ],
    },
    {
      slug: 'ts-react',
      label: 'ReactとTypeScript',
      bookLinks: [
        {
          bookSlug: 'typescript',
          chapterSlug: '13-react-and-typescript',
          title: 'ReactとTypeScript — props・event・childrenの型',
        },
      ],
    },
    {
      slug: 'type-system',
      label: '型システム',
      aliases: ['javascript'],
      bookLinks: [
        {
          bookSlug: 'typescript',
          chapterSlug: '02-basic-types',
          title: '基本の型 — プリミティブ・配列・オブジェクト',
        },
        {
          bookSlug: 'typescript',
          chapterSlug: '03-type-alias-and-interface',
          title: '型エイリアスとインターフェース',
        },
      ],
    },
    { slug: 'zod', label: 'Zod（バリデーション）' },
    { slug: 'typeorm', label: 'TypeORM' },
  ],
  'git-basic': [
    {
      slug: 'git-branch',
      label: 'ブランチ',
      aliases: ['branch', 'git-checkout', 'git-switch'],
      bookLinks: [
        {
          bookSlug: 'git-basic',
          chapterSlug: '04-branches',
          title: 'ブランチを理解する — checkoutとswitchの使い分け',
        },
      ],
    },
    {
      slug: 'git-merge',
      label: 'merge',
      bookLinks: [
        {
          bookSlug: 'git-basic',
          chapterSlug: '05-merge-vs-rebase',
          title: 'mergeとrebaseの違いと使い分け',
        },
      ],
    },
    {
      slug: 'git-rebase',
      label: 'rebase',
      aliases: ['rebase'],
      bookLinks: [
        {
          bookSlug: 'git-basic',
          chapterSlug: '05-merge-vs-rebase',
          title: 'mergeとrebaseの違いと使い分け',
        },
      ],
    },
    {
      slug: 'git-conflict',
      label: 'コンフリクト',
      bookLinks: [
        {
          bookSlug: 'git-basic',
          chapterSlug: '06-conflict',
          title: 'コンフリクトを恐れない — 発生原因と解決手順',
        },
      ],
    },
    {
      slug: 'git-reset-revert',
      label: 'reset・revert',
      aliases: ['reset-revert'],
      bookLinks: [
        {
          bookSlug: 'git-basic',
          chapterSlug: '07-undo',
          title: '取り消し操作の完全ガイド — reset・revert・restore',
        },
      ],
    },
    {
      slug: 'git-stash',
      label: 'stash',
      aliases: ['stash'],
      bookLinks: [
        { bookSlug: 'git-basic', chapterSlug: '09-stash', title: 'stashで作業を一時退避する' },
      ],
    },
    {
      slug: 'git-remote',
      label: 'remote',
      bookLinks: [
        {
          bookSlug: 'git-basic',
          chapterSlug: '08-remote-sync',
          title: 'リモート同期 — fetch・pull・pushを理解する',
        },
      ],
    },
    {
      slug: 'github',
      label: 'GitHub',
      bookLinks: [
        {
          bookSlug: 'git-basic',
          chapterSlug: '10-team-development',
          title: 'GitHubでのチーム開発 — Pull Requestとマージ戦略',
        },
      ],
    },
    { slug: 'github-actions', label: 'GitHub Actions' },
    {
      slug: 'git-pull-request',
      label: 'Pull Request',
      bookLinks: [
        {
          bookSlug: 'git-basic',
          chapterSlug: '10-team-development',
          title: 'GitHubでのチーム開発 — Pull Requestとマージ戦略',
        },
      ],
    },
  ],
  nextjs: [
    {
      slug: 'nextjs-app-router',
      label: 'App Router',
      aliases: ['app-router'],
      bookLinks: [
        {
          bookSlug: 'next-js',
          chapterSlug: '04-routing',
          title: 'ルーティングとページ — App Routerのファイルベースルーティング入門',
        },
      ],
    },
    {
      slug: 'nextjs-routing',
      label: 'ルーティング',
      bookLinks: [
        {
          bookSlug: 'next-js',
          chapterSlug: '04-routing',
          title: 'ルーティングとページ — App Routerのファイルベースルーティング入門',
        },
      ],
    },
    {
      slug: 'nextjs-server-components',
      label: 'Server Components',
      aliases: ['server-components'],
      bookLinks: [
        {
          bookSlug: 'next-js',
          chapterSlug: '07-data-fetching',
          title: 'データ取得とキャッシュ — Server Componentのfetch',
        },
      ],
    },
    {
      slug: 'nextjs-client-components',
      label: 'Client Components',
      bookLinks: [
        {
          bookSlug: 'next-js',
          chapterSlug: '03-components',
          title: 'コンポーネント — Server ComponentとClient Component',
        },
      ],
    },
    {
      slug: 'nextjs-data-fetching',
      label: 'データ取得',
      bookLinks: [
        {
          bookSlug: 'next-js',
          chapterSlug: '07-data-fetching',
          title: 'データ取得とキャッシュ — Server Componentのfetch',
        },
      ],
    },
    {
      slug: 'nextjs-cache',
      label: 'キャッシュ',
      bookLinks: [
        {
          bookSlug: 'next-js',
          chapterSlug: '07-data-fetching',
          title: 'データ取得とキャッシュ — Server Componentのfetch',
        },
      ],
    },
    {
      slug: 'nextjs-route-handlers',
      label: 'Route Handlers',
      aliases: ['api-routes'],
      bookLinks: [
        {
          bookSlug: 'next-js',
          chapterSlug: 'route-handlers',
          title: 'Route HandlersとAPI Route — route.tsでAPIエンドポイントを作る',
        },
      ],
    },
    {
      slug: 'nextjs-server-actions',
      label: 'Server Actions',
      bookLinks: [
        {
          bookSlug: 'next-js',
          chapterSlug: '10-server-actions',
          title: 'Server Actions — フォーム送信とサーバー更新',
        },
      ],
    },
    {
      slug: 'nextjs-middleware',
      label: 'Middleware',
      bookLinks: [
        {
          bookSlug: 'next-js',
          chapterSlug: 'proxy-and-middleware',
          title: 'ProxyとMiddleware — リクエストを入口で制御する',
        },
      ],
    },
    {
      slug: 'nextjs-metadata-seo',
      label: 'Metadata・SEO',
      bookLinks: [
        {
          bookSlug: 'next-js',
          chapterSlug: '09-metadata-and-seo',
          title: 'Metadata APIとSEO — title・OGP・構造化データ',
        },
      ],
    },
    {
      slug: 'nextjs-deploy',
      label: 'デプロイ',
      aliases: ['vercel'],
      bookLinks: [
        {
          bookSlug: 'next-js',
          chapterSlug: 'deploy-vercel-cloudflare',
          title: 'Next.jsのデプロイ — VercelとCloudflare Workersの違い',
        },
      ],
    },
    { slug: 'webpack', label: 'webpack' },
  ],
  'nodejs-basic': [
    { slug: 'node-npm', label: 'npm', aliases: ['npm', 'yarn'] },
    { slug: 'node-async-io', label: '非同期I/O' },
    { slug: 'node-file-system', label: 'fs' },
    { slug: 'node-http-server', label: 'HTTPサーバー' },
    { slug: 'node-env', label: '環境変数' },
    { slug: 'node-security', label: 'セキュリティ', aliases: ['security', 'proxy'] },
    { slug: 'express', label: 'Express' },
  ],
  docker: [
    { slug: 'docker-image', label: 'イメージ' },
    { slug: 'docker-container', label: 'コンテナ' },
    { slug: 'dockerfile', label: 'Dockerfile' },
    { slug: 'docker-compose', label: 'Docker Compose' },
    { slug: 'docker-volume', label: 'ボリューム' },
    { slug: 'docker-network', label: 'ネットワーク' },
    { slug: 'docker-build', label: 'build' },
  ],
  linux: [
    { slug: 'linux-commands', label: 'Linuxコマンド', aliases: ['unix'] },
    { slug: 'linux-filesystem', label: 'Linuxファイルシステム' },
    { slug: 'linux-permissions', label: 'Linux権限' },
    { slug: 'linux-process', label: 'プロセス' },
    { slug: 'linux-shell', label: 'シェル' },
    { slug: 'linux-package-manager', label: 'パッケージ管理', aliases: ['wsl'] },
  ],
  'sql-basic': [
    { slug: 'sql-select', label: 'SELECT' },
    { slug: 'sql-where-order-limit', label: 'WHERE・ORDER BY・LIMIT' },
    { slug: 'sql-join', label: 'JOIN' },
    { slug: 'sql-aggregate', label: '集計' },
    { slug: 'sql-group-by', label: 'GROUP BY' },
    { slug: 'sql-subquery', label: 'サブクエリ' },
    { slug: 'sql-index', label: 'インデックス' },
    { slug: 'sql-transaction', label: 'トランザクション' },
    { slug: 'sql-normalization', label: '正規化' },
    { slug: 'sql-table-design', label: 'テーブル設計' },
  ],
  'cs-basic': [
    {
      slug: 'cs-computer-basic',
      label: 'コンピュータ基礎',
      bookLinks: [
        { bookSlug: 'cs-basics', chapterSlug: '01-computer-basics', title: 'コンピュータ基礎' },
      ],
    },
    {
      slug: 'cs-data-structures',
      label: 'データ構造',
      bookLinks: [
        { bookSlug: 'cs-basics', chapterSlug: '02-data-structures', title: 'データ構造' },
      ],
    },
    {
      slug: 'cs-algorithms',
      label: 'アルゴリズム',
      bookLinks: [{ bookSlug: 'cs-basics', chapterSlug: '03-algorithms', title: 'アルゴリズム' }],
    },
    {
      slug: 'cs-network',
      label: 'ネットワーク',
      bookLinks: [
        { bookSlug: 'cs-basics', chapterSlug: '04-network', title: 'ネットワークの全体像' },
        {
          bookSlug: 'cs-basics',
          chapterSlug: 'network-ip-routing',
          title: 'IPアドレスとルーティング',
        },
        {
          bookSlug: 'cs-basics',
          chapterSlug: 'network-dns-domain',
          title: 'DNS・ドメイン・ネームサーバー',
        },
        { bookSlug: 'cs-basics', chapterSlug: 'network-tcp-udp-port', title: 'TCP/UDPとポート' },
        {
          bookSlug: 'cs-basics',
          chapterSlug: 'network-http-https',
          title: 'HTTP/HTTPSとWeb APIへの接続',
        },
        {
          bookSlug: 'cs-basics',
          chapterSlug: 'network-troubleshooting',
          title: 'ネットワークの切り分け',
        },
      ],
    },
    { slug: 'cs-os', label: 'OS' },
    { slug: 'cs-memory', label: 'メモリ' },
    { slug: 'cs-database-basic', label: 'DB基礎' },
    {
      slug: 'cs-error-debugging',
      label: 'エラー・デバッグ',
      bookLinks: [
        { bookSlug: 'cs-basics', chapterSlug: '05-errors', title: 'エラーとの向き合い方' },
      ],
    },
  ],
};

export function getSectionTags(categorySlug: string): SectionTagConfig[] {
  return sectionTagMap[categorySlug] ?? [];
}
