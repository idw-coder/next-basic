import type { NextConfig } from 'next';

class VeliteWebpackPlugin {
  static started = false;
  /**
   * Webpackがコンパイルを開始する前に実行される
   * Veliteのwebpackプラグインを組み込む
   */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return;
      VeliteWebpackPlugin.started = true;
      const dev = compiler.options.mode === 'development';
      const { build } = await import('velite');
      await build({ watch: dev, clean: !dev });
    });
  }
}

const nextConfig: NextConfig = {
  // Node.js専用パッケージをwebpackバンドルから除外し、require()で直接読み込む。
  // TypeORMは全DB/プラットフォーム用ドライバを内包しており、
  // webpackが不要なドライバ(expo-sqlite等)まで解決しようとしてエラーになるため除外する。
  serverExternalPackages: ['typeorm', 'mysql2'],
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
};

export default nextConfig;
