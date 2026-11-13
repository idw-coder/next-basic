import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next 16 で react-hooks プラグインが v7 になり、React Compiler 向けのルールが error で加わった。
    // 既存コードの書き換えは挙動確認が要るため、いったん warn に下げて段階的に直す。
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // 他セッションの git worktree とそのビルド成果物が入る
    '.claude/**',
  ]),
]);

export default eslintConfig;
