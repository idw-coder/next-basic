export interface SectionBookLink {
  bookSlug: string;
  chapterSlug: string;
  title: string;
}

export interface SectionTagConfig {
  slug: string;
  label: string;
  bookLinks?: SectionBookLink[];
}

const sectionTagMap: Record<string, SectionTagConfig[]> = {
  'aws-basic': [
    {
      slug: 'ec2',
      label: 'EC2（仮想サーバー）',
      bookLinks: [
        { bookSlug: 'aws-saa-c03', chapterSlug: 'compute-selection', title: 'コンピューティング選択 — EC2・Lambda・ECS・Fargate・EKS' },
        { bookSlug: 'aws-saa-c03', chapterSlug: 'scalability-and-ha', title: 'スケーラビリティと高可用性 — ELB・Auto Scaling・Multi-AZ' },
      ],
    },
    {
      slug: 's3',
      label: 'S3（ストレージ）',
      bookLinks: [
        { bookSlug: 'aws-saa-c03', chapterSlug: 'storage-selection', title: 'ストレージ選択 — S3・EBS・EFS・FSxを使い分ける' },
        { bookSlug: 'aws-saa-c03', chapterSlug: 'cost-optimized-storage', title: 'ストレージのコスト最適化 — S3 Lifecycle・Glacier・EBS gp3' },
      ],
    },
    {
      slug: 'amazon-vpc',
      label: 'VPC（ネットワーク）',
      bookLinks: [
        { bookSlug: 'aws-saa-c03', chapterSlug: 'vpc-network-security', title: 'VPCネットワークセキュリティ — Subnet・SG・NACL・NAT Gateway' },
      ],
    },
    {
      slug: 'iam',
      label: 'IAM（認証・認可）',
      bookLinks: [
        { bookSlug: 'aws-saa-c03', chapterSlug: 'iam-and-least-privilege', title: 'IAMと最小権限 — ユーザー・グループ・ロール・ポリシー' },
      ],
    },
    {
      slug: 'lambda',
      label: 'Lambda（サーバーレス）',
      bookLinks: [
        { bookSlug: 'aws-saa-c03', chapterSlug: 'compute-selection', title: 'コンピューティング選択 — EC2・Lambda・ECS・Fargate・EKS' },
        { bookSlug: 'aws-saa-c03', chapterSlug: 'decoupled-architecture', title: '疎結合アーキテクチャ — SQS・SNS・EventBridge・Step Functions' },
      ],
    },
    {
      slug: 'rds',
      label: 'RDS（リレーショナルDB）',
      bookLinks: [
        { bookSlug: 'aws-saa-c03', chapterSlug: 'database-selection', title: 'データベース選択 — RDS・Aurora・DynamoDB・ElastiCache・Redshift' },
      ],
    },
    {
      slug: 'dynamodb',
      label: 'DynamoDB（NoSQL）',
      bookLinks: [
        { bookSlug: 'aws-saa-c03', chapterSlug: 'database-selection', title: 'データベース選択 — RDS・Aurora・DynamoDB・ElastiCache・Redshift' },
      ],
    },
    { slug: 'ecs', label: 'ECS（コンテナ）', bookLinks: [
      { bookSlug: 'aws-saa-c03', chapterSlug: 'compute-selection', title: 'コンピューティング選択 — EC2・Lambda・ECS・Fargate・EKS' },
    ] },
    { slug: 'eks', label: 'EKS（Kubernetes）', bookLinks: [
      { bookSlug: 'aws-saa-c03', chapterSlug: 'compute-selection', title: 'コンピューティング選択 — EC2・Lambda・ECS・Fargate・EKS' },
    ] },
    { slug: 'ebs', label: 'EBS（ブロックストレージ）', bookLinks: [
      { bookSlug: 'aws-saa-c03', chapterSlug: 'storage-selection', title: 'ストレージ選択 — S3・EBS・EFS・FSxを使い分ける' },
    ] },
    { slug: 'efs', label: 'EFS（ファイルストレージ）', bookLinks: [
      { bookSlug: 'aws-saa-c03', chapterSlug: 'storage-selection', title: 'ストレージ選択 — S3・EBS・EFS・FSxを使い分ける' },
    ] },
    { slug: 'cloudwatch', label: 'CloudWatch（監視）', bookLinks: [
      { bookSlug: 'aws-saa-c03', chapterSlug: 'monitoring-and-cloudwatch', title: '監視と運用 — CloudWatch Metrics・Logs・EventBridge' },
    ] },
    { slug: 'aws-cloudformation', label: 'CloudFormation（IaC）' },
    { slug: 'aws-cloudtrail', label: 'CloudTrail（監査）' },
    { slug: 'amazon-elb', label: 'ELB（ロードバランサー）', bookLinks: [
      { bookSlug: 'aws-saa-c03', chapterSlug: 'scalability-and-ha', title: 'スケーラビリティと高可用性 — ELB・Auto Scaling・Multi-AZ' },
    ] },
    { slug: 'amazon-elasticache', label: 'ElastiCache（キャッシュ）', bookLinks: [
      { bookSlug: 'aws-saa-c03', chapterSlug: 'database-selection', title: 'データベース選択 — RDS・Aurora・DynamoDB・ElastiCache・Redshift' },
    ] },
    { slug: 'aurora', label: 'Aurora（高性能DB）', bookLinks: [
      { bookSlug: 'aws-saa-c03', chapterSlug: 'database-selection', title: 'データベース選択 — RDS・Aurora・DynamoDB・ElastiCache・Redshift' },
    ] },
    { slug: 'aws-waf', label: 'WAF（Webファイアウォール）', bookLinks: [
      { bookSlug: 'aws-saa-c03', chapterSlug: 'application-security', title: 'アプリケーション保護 — WAF・Shield・Cognito・Secrets Manager' },
    ] },
    { slug: 'aws-shield', label: 'Shield（DDoS対策）', bookLinks: [
      { bookSlug: 'aws-saa-c03', chapterSlug: 'application-security', title: 'アプリケーション保護 — WAF・Shield・Cognito・Secrets Manager' },
    ] },
    { slug: 'terraform', label: 'Terraform（IaC）' },
    { slug: 'amazon-ivs', label: 'IVS（ライブ配信）' },
    { slug: 'service-quotas', label: 'Service Quotas（制限）' },
  ],
  'react-basic': [
    {
      slug: 'react-hooks',
      label: 'React Hooks',
      bookLinks: [
        { bookSlug: 'react-learning', chapterSlug: '04-use-state', title: 'useState — stateの仕組みと参照の罠' },
        { bookSlug: 'react-learning', chapterSlug: '06-use-effect', title: 'useEffect — 副作用と外部同期' },
        { bookSlug: 'react-learning', chapterSlug: '10-hooks-comparison', title: 'Hooksの使い分け — 判断フローと横断比較' },
      ],
    },
    {
      slug: 'state',
      label: '状態管理',
      bookLinks: [
        { bookSlug: 'react-learning', chapterSlug: '04-use-state', title: 'useState — stateの仕組みと参照の罠' },
      ],
    },
    {
      slug: 'component',
      label: 'コンポーネント設計',
      bookLinks: [
        { bookSlug: 'react-learning', chapterSlug: '02-jsx-and-components', title: 'JSXとコンポーネント — 描画の仕組みからpropsまで' },
      ],
    },
    {
      slug: 'rendering',
      label: 'レンダリング・パフォーマンス',
      bookLinks: [
        { bookSlug: 'react-learning', chapterSlug: '03-react-lifecycle', title: 'レンダー・マウント・再レンダー・アンマウントの違い' },
        { bookSlug: 'react-learning', chapterSlug: '08-use-memo', title: 'useMemo — 計算結果のメモ化' },
        { bookSlug: 'react-learning', chapterSlug: '09-use-callback', title: 'useCallback — 関数のメモ化と子コンポーネント最適化' },
      ],
    },
    {
      slug: 'jsx',
      label: 'JSX',
      bookLinks: [
        { bookSlug: 'react-learning', chapterSlug: '02-jsx-and-components', title: 'JSXとコンポーネント — 描画の仕組みからpropsまで' },
      ],
    },
  ],
  'html-basic': [
    { slug: 'form', label: 'フォーム' },
    { slug: 'semantic', label: 'セマンティクスHTML' },
    { slug: 'accessibility', label: 'アクセシビリティ' },
    { slug: 'meta', label: 'メタ情報・SEO' },
  ],
  'css-basic': [
    { slug: 'flexbox', label: 'Flexbox', bookLinks: [
      { bookSlug: 'css-basics', chapterSlug: '04-flexbox', title: 'Flexboxで横並びレイアウトを作る' },
    ] },
    { slug: 'grid', label: 'Grid', bookLinks: [
      { bookSlug: 'css-basics', chapterSlug: '05-grid', title: 'CSS Gridで2次元レイアウトを組む' },
    ] },
    { slug: 'centering', label: '中央寄せ' },
    { slug: 'layout', label: 'レイアウト', bookLinks: [
      { bookSlug: 'css-basics', chapterSlug: '03-box-model', title: 'ボックスモデル — margin・padding・borderの仕組み' },
    ] },
    { slug: 'responsive', label: 'レスポンシブ', bookLinks: [
      { bookSlug: 'css-basics', chapterSlug: '06-responsive', title: 'レスポンシブデザイン入門 — メディアクエリ・モバイルファースト' },
    ] },
    { slug: 'animation', label: 'アニメーション', bookLinks: [
      { bookSlug: 'css-basics', chapterSlug: '09-transitions-animations', title: 'CSS transitionとanimation — hover・フェードイン・スライド' },
    ] },
  ],
  'javascript-basic': [
    { slug: 'scope', label: 'スコープ', bookLinks: [
      { bookSlug: 'javascript', chapterSlug: '01-variables-and-scope', title: '変数宣言とスコープ — var・let・constの違いと使い分け' },
    ] },
    { slug: 'closure', label: 'クロージャ', bookLinks: [
      { bookSlug: 'javascript', chapterSlug: '12-closures', title: 'クロージャ — スコープチェーンとデータの隠蔽' },
    ] },
    { slug: 'promise', label: 'Promise', bookLinks: [
      { bookSlug: 'javascript', chapterSlug: '13-async-callback-promise', title: '非同期処理の基本 — コールバック・Promise・async/await' },
    ] },
    { slug: 'async-await', label: 'async/await', bookLinks: [
      { bookSlug: 'javascript', chapterSlug: '13-async-callback-promise', title: '非同期処理の基本 — コールバック・Promise・async/await' },
    ] },
    { slug: 'event-loop', label: 'イベントループ' },
    { slug: 'es6', label: 'ES6+', bookLinks: [
      { bookSlug: 'javascript', chapterSlug: '09-destructuring-and-spread', title: '分割代入とスプレッド構文' },
    ] },
    { slug: 'this', label: 'this', bookLinks: [
      { bookSlug: 'javascript', chapterSlug: '11-this-keyword', title: 'thisの正体 — 呼び出しパターンごとの挙動を整理する' },
    ] },
    { slug: 'arrow-function', label: 'アロー関数', bookLinks: [
      { bookSlug: 'javascript', chapterSlug: '05-functions', title: '関数とアロー関数 — 定義方法・this・デフォルト引数' },
    ] },
    { slug: 'es-modules', label: 'ES Modules', bookLinks: [
      { bookSlug: 'javascript', chapterSlug: '15-modules', title: 'モジュールシステム — import/exportとCommonJSの違い' },
    ] },
    { slug: 'web-apis', label: 'Web APIs', bookLinks: [
      { bookSlug: 'javascript', chapterSlug: '20-web-apis', title: '知っておきたいWeb API — fetch・Storage・IntersectionObserver' },
    ] },
  ],
  'vue-basic': [
    { slug: 'v-if', label: 'v-if / v-show（条件付きレンダリング）' },
    { slug: 'v-bind', label: 'v-bind（属性バインディング）' },
    { slug: 'v-model', label: 'v-model（双方向バインディング）' },
    { slug: 'v-slot', label: 'v-slot（スロット）' },
    { slug: 'vuetify', label: 'Vuetify' },
    { slug: 'composition-api', label: 'Composition API' },
    { slug: 'pinia', label: 'Pinia（状態管理）' },
  ],
  'ts-general': [
    { slug: 'type-system', label: '型システム', bookLinks: [
      { bookSlug: 'typescript', chapterSlug: '02-basic-types', title: '基本の型 — プリミティブ・配列・オブジェクト' },
      { bookSlug: 'typescript', chapterSlug: '03-type-alias-and-interface', title: '型エイリアスとインターフェース' },
    ] },
    { slug: 'utility-types', label: 'Utility Types', bookLinks: [
      { bookSlug: 'typescript', chapterSlug: '09-utility-types', title: 'ユーティリティ型 — Partial・Pick・Omit・Record' },
    ] },
    { slug: 'generics', label: 'ジェネリクス', bookLinks: [
      { bookSlug: 'typescript', chapterSlug: '07-generics', title: 'ジェネリクス — 型を引数にする' },
    ] },
    { slug: 'zod', label: 'Zod（バリデーション）' },
    { slug: 'typeorm', label: 'TypeORM' },
  ],
  'git-basic': [
    { slug: 'rebase', label: 'rebase', bookLinks: [
      { bookSlug: 'git-basic', chapterSlug: '05-merge-vs-rebase', title: 'mergeとrebaseの違いと使い分け' },
    ] },
    { slug: 'github', label: 'GitHub', bookLinks: [
      { bookSlug: 'git-basic', chapterSlug: '10-team-development', title: 'GitHubでのチーム開発 — Pull Requestとマージ戦略' },
    ] },
    { slug: 'github-actions', label: 'GitHub Actions' },
    { slug: 'branch', label: 'ブランチ・マージ', bookLinks: [
      { bookSlug: 'git-basic', chapterSlug: '04-branches', title: 'ブランチを理解する — checkoutとswitchの使い分け' },
      { bookSlug: 'git-basic', chapterSlug: '06-conflict', title: 'コンフリクトを恐れない — 発生原因と解決手順' },
    ] },
    { slug: 'reset-revert', label: 'reset / revert（取り消し）', bookLinks: [
      { bookSlug: 'git-basic', chapterSlug: '07-undo', title: '取り消し操作の完全ガイド — reset・revert・restore' },
    ] },
    { slug: 'stash', label: 'stash', bookLinks: [
      { bookSlug: 'git-basic', chapterSlug: '09-stash', title: 'stashで作業を一時退避する' },
    ] },
  ],
  nextjs: [
    { slug: 'app-router', label: 'App Router', bookLinks: [
      { bookSlug: 'next-js', chapterSlug: '04-routing', title: 'ルーティングとページ — App Routerのファイルベースルーティング入門' },
    ] },
    { slug: 'server-components', label: 'Server Components', bookLinks: [
      { bookSlug: 'next-js', chapterSlug: '07-data-fetching', title: 'データ取得とキャッシュ — Server Componentのfetch' },
    ] },
    { slug: 'vercel', label: 'Vercel', bookLinks: [
      { bookSlug: 'next-js', chapterSlug: 'deploy-vercel-cloudflare', title: 'Next.jsのデプロイ — VercelとCloudflare Workersの違い' },
    ] },
    { slug: 'webpack', label: 'webpack' },
    { slug: 'api-routes', label: 'API Routes', bookLinks: [
      { bookSlug: 'next-js', chapterSlug: 'route-handlers', title: 'Route HandlersとAPI Route — route.tsでAPIエンドポイントを作る' },
    ] },
  ],
};

export function getSectionTags(categorySlug: string): SectionTagConfig[] {
  return sectionTagMap[categorySlug] ?? [];
}
