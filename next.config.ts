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
  // 本番の Docker イメージ用。ビルド時に、実行に要るファイルだけを .next/standalone に集める。
  // 起動は `node server.js` で、node_modules の npm ci も typescript も要らない（Dockerfile 参照）
  output: 'standalone',
  serverExternalPackages: ['mysql2'],
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
};

export default nextConfig;
