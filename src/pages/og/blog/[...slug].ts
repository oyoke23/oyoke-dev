import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";

type BlogData = Awaited<ReturnType<typeof getCollection<"blog">>>[number]["data"];

const posts = await getCollection("blog", ({ data }) => !data.draft && data.lang === "en");
const pages = Object.fromEntries(posts.map((p) => [p.data.slug, { data: p.data }]));

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "slug",
  pages,
  getImageOptions: (_path, page: { data: BlogData }) => ({
    title: page.data.title,
    description: page.data.summary,
    bgGradient: [
      [10, 10, 10],
      [20, 15, 35],
    ],
    border: { color: [167, 139, 250], width: 4, side: "inline-start" },
    padding: 80,
    font: {
      title: { color: [245, 245, 245], size: 72, weight: "Normal" },
      description: { color: [163, 163, 163], size: 28, lineHeight: 1.4 },
    },
    format: "PNG",
  }),
});
