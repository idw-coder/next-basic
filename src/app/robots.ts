import { MetadataRoute } from "next";

import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/profile/", "/login/", "/register/", "/admin/", "/quiz/search"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
