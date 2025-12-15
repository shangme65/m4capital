import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://m4capital.online";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/staff-admin/",
          "/setup-admin/",
          "/dashboard/",
          "/settings/",
          "/traderoom/",
          "/deposit/",
          "/finance/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
