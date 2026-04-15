import { defineConfig, defineCollection, s } from "velite";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

const books = defineCollection({
  name: "Book",
  pattern: "books/*/index.yaml",
  schema: s
    .object({
      title: s.string(),
      description: s.string(),
      slug: s.path(),
    })
    .transform((data) => ({
      ...data,
      bookSlug: data.slug.split("/")[1],
    })),
});

const chapters = defineCollection({
  name: "Chapter",
  pattern: "books/*/*.mdx",
  schema: s
    .object({
      title: s.string(),
      description: s.string().optional(),
      order: s.number(),
      slug: s.path(),
      body: s.mdx(),
    })
    .transform((data) => {
      const parts = data.slug.split("/");
      return {
        ...data,
        bookSlug: parts[1],
        chapterSlug: parts[2],
      };
    }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { books, chapters },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: "github-dark" }],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
    ],
    remarkPlugins: [],
  },
});
