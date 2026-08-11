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

const EXPRESS_PROXY_TARGET =
  process.env.INTERNAL_API_URL ||
  'http://localhost:8888';

const nextConfig: NextConfig = {
  serverExternalPackages: ['mysql2'],
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
  // Expressに残っているlegacy領域だけを同一オリジンでプロキシする。
  // 移行済みAPIは /next-api/* が担当し、/api/quiz や /api/users などへは戻さない。
  async rewrites() {
    return [
      {
        source: '/api/notes/:path*',
        destination: `${EXPRESS_PROXY_TARGET}/api/notes/:path*`,
      },
      {
        source: '/api/upload/:path*',
        destination: `${EXPRESS_PROXY_TARGET}/api/upload/:path*`,
      },
      {
        source: '/api/auth/test-mail',
        destination: `${EXPRESS_PROXY_TARGET}/api/auth/test-mail`,
      },
      {
        source: '/api-docs',
        destination: `${EXPRESS_PROXY_TARGET}/api-docs`,
      },
      {
        source: '/api-docs.json',
        destination: `${EXPRESS_PROXY_TARGET}/api-docs.json`,
      },
      {
        source: '/uploads/:path*',
        destination: `${EXPRESS_PROXY_TARGET}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
