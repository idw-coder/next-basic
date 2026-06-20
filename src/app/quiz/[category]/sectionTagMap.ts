export interface SectionTagConfig {
  slug: string;
  label: string;
}

const sectionTagMap: Record<string, SectionTagConfig[]> = {
  'aws-basic': [
    { slug: 'ec2', label: 'EC2（仮想サーバー）' },
    { slug: 's3', label: 'S3（ストレージ）' },
    { slug: 'amazon-vpc', label: 'VPC（ネットワーク）' },
    { slug: 'iam', label: 'IAM（認証・認可）' },
    { slug: 'lambda', label: 'Lambda（サーバーレス）' },
    { slug: 'rds', label: 'RDS（リレーショナルDB）' },
    { slug: 'dynamodb', label: 'DynamoDB（NoSQL）' },
    { slug: 'ecs', label: 'ECS（コンテナ）' },
    { slug: 'eks', label: 'EKS（Kubernetes）' },
    { slug: 'ebs', label: 'EBS（ブロックストレージ）' },
    { slug: 'efs', label: 'EFS（ファイルストレージ）' },
    { slug: 'cloudwatch', label: 'CloudWatch（監視）' },
    { slug: 'aws-cloudformation', label: 'CloudFormation（IaC）' },
    { slug: 'aws-cloudtrail', label: 'CloudTrail（監査）' },
    { slug: 'amazon-elb', label: 'ELB（ロードバランサー）' },
    { slug: 'amazon-elasticache', label: 'ElastiCache（キャッシュ）' },
    { slug: 'aurora', label: 'Aurora（高性能DB）' },
    { slug: 'aws-waf', label: 'WAF（Webファイアウォール）' },
    { slug: 'aws-shield', label: 'Shield（DDoS対策）' },
    { slug: 'terraform', label: 'Terraform（IaC）' },
    { slug: 'amazon-ivs', label: 'IVS（ライブ配信）' },
    { slug: 'service-quotas', label: 'Service Quotas（制限）' },
  ],
  'react-basic': [
    { slug: 'react-hooks', label: 'React Hooks' },
    { slug: 'state', label: '状態管理' },
    { slug: 'component', label: 'コンポーネント設計' },
    { slug: 'rendering', label: 'レンダリング・パフォーマンス' },
    { slug: 'jsx', label: 'JSX' },
  ],
  'html-basic': [
    { slug: 'form', label: 'フォーム' },
    { slug: 'semantic', label: 'セマンティクスHTML' },
    { slug: 'accessibility', label: 'アクセシビリティ' },
    { slug: 'meta', label: 'メタ情報・SEO' },
  ],
  'css-basic': [
    { slug: 'flexbox', label: 'Flexbox' },
    { slug: 'grid', label: 'Grid' },
    { slug: 'centering', label: '中央寄せ' },
    { slug: 'layout', label: 'レイアウト' },
    { slug: 'responsive', label: 'レスポンシブ' },
    { slug: 'animation', label: 'アニメーション' },
  ],
  'javascript-basic': [
    { slug: 'scope', label: 'スコープ' },
    { slug: 'closure', label: 'クロージャ' },
    { slug: 'promise', label: 'Promise' },
    { slug: 'async-await', label: 'async/await' },
    { slug: 'event-loop', label: 'イベントループ' },
    { slug: 'es6', label: 'ES6+' },
    { slug: 'this', label: 'this' },
    { slug: 'arrow-function', label: 'アロー関数' },
    { slug: 'es-modules', label: 'ES Modules' },
    { slug: 'web-apis', label: 'Web APIs' },
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
    { slug: 'type-system', label: '型システム' },
    { slug: 'utility-types', label: 'Utility Types' },
    { slug: 'generics', label: 'ジェネリクス' },
    { slug: 'zod', label: 'Zod（バリデーション）' },
    { slug: 'typeorm', label: 'TypeORM' },
  ],
  'git-basic': [
    { slug: 'rebase', label: 'rebase' },
    { slug: 'github', label: 'GitHub' },
    { slug: 'github-actions', label: 'GitHub Actions' },
    { slug: 'branch', label: 'ブランチ・マージ' },
    { slug: 'reset-revert', label: 'reset / revert（取り消し）' },
    { slug: 'stash', label: 'stash' },
  ],
  nextjs: [
    { slug: 'app-router', label: 'App Router' },
    { slug: 'server-components', label: 'Server Components' },
    { slug: 'vercel', label: 'Vercel' },
    { slug: 'webpack', label: 'webpack' },
    { slug: 'api-routes', label: 'API Routes' },
  ],
};

export function getSectionTags(categorySlug: string): SectionTagConfig[] {
  return sectionTagMap[categorySlug] ?? [];
}
