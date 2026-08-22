import { MetadataRoute } from "next";

import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // APIの実体は /next-api/ 配下。以前ここにあった "/api/" は存在しないパスで、
      // 実APIがクロール対象のままになっていた。
      //
      // ここに載せるのはクロール自体が不要なパスだけにする。
      // meta robots で noindex にしているページ（/quiz/review・/quiz/bookmarks）は
      // ここに書いてはいけない。クロールを止めるとその noindex を読んでもらえず、
      // URLだけがインデックスに残る状態になる。
      disallow: [
        "/next-api/",
        "/profile/",
        "/login/",
        "/register/",
        "/admin/",
        "/quiz/search",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
