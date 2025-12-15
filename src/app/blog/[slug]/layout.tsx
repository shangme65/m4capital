import { Metadata } from "next";

// Blog posts data for metadata
const blogPostsMetadata: Record<
  string,
  { title: string; excerpt: string; category: string }
> = {
  "mastering-technical-analysis-complete-guide": {
    title: "Mastering Technical Analysis: A Complete Guide for Traders",
    excerpt:
      "Learn the essential techniques of technical analysis that professional traders use to identify market trends and make informed trading decisions.",
    category: "Education",
  },
  "understanding-forex-market-basics": {
    title: "Understanding Forex Market Basics: Your First Steps",
    excerpt:
      "Discover the fundamentals of forex trading, including currency pairs, pips, and how the foreign exchange market operates 24/5.",
    category: "Trading",
  },
  "candlestick-patterns-every-trader-needs": {
    title: "15 Candlestick Patterns Every Trader Needs to Know",
    excerpt:
      "Master the art of reading candlestick patterns to identify potential market reversals and continuations.",
    category: "Trading",
  },
  "risk-management-strategies-beginners": {
    title: "Risk Management Strategies for Beginners",
    excerpt:
      "Essential risk management techniques every new trader should implement to protect their capital.",
    category: "Education",
  },
  "cryptocurrency-market-analysis-2024": {
    title: "Cryptocurrency Market Analysis 2024",
    excerpt:
      "In-depth analysis of the cryptocurrency market trends and predictions for 2024.",
    category: "Market Analysis",
  },
};

/**
 * Next.js 16 - generateMetadata for dynamic SEO
 * Generates unique metadata for each blog post
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPostsMetadata[slug];

  if (!post) {
    // Default metadata for unknown posts
    const formattedTitle = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      title: `${formattedTitle} | M4Capital Blog`,
      description: "Trading insights and education from M4Capital.",
      openGraph: {
        title: formattedTitle,
        description: "Trading insights and education from M4Capital.",
        type: "article",
        siteName: "M4Capital",
      },
      twitter: {
        card: "summary_large_image",
        title: formattedTitle,
      },
    };
  }

  return {
    title: `${post.title} | M4Capital Blog`,
    description: post.excerpt,
    keywords: `${post.category}, forex trading, trading education, m4capital`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      siteName: "M4Capital",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

/**
 * Layout for blog post pages
 * Provides metadata and wraps the page content
 */
export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
