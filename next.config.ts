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

const API_PROXY_TARGET =
  process.env.INTERNAL_API_URL ||
  'http://localhost:8888';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
  // /api/* は常にExpressバックエンドが担当する。
  // 本番はリバースプロキシが /api/* をExpressへ流すためこのrewriteは発火しないが、
  // プロキシのないdevでも同一オリジンの /api/* が同じExpressに届くようにして
  // dev/本番の挙動を一致させる。Next自身のAPIルートは /next-api/* に置くこと。
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
