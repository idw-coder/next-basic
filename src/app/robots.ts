import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://study.ntorelabo.com";

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
