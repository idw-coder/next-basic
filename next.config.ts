import type { NextConfig } from "next";

class VeliteWebpackPlugin {
  static started = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapPromise(
      "VeliteWebpackPlugin",
      async () => {
        if (VeliteWebpackPlugin.started) return;
        VeliteWebpackPlugin.started = true;
        const dev = compiler.options.mode === "development";
        const { build } = await import("velite");
        await build({ watch: dev, clean: !dev });
      }
    );
  }
}

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
};

export default nextConfig;
