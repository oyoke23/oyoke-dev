import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { site } from "../../lib/site";

export async function GET(context: APIContext) {
  const posts = await getCollection("blog", ({ data }) => !data.draft && data.lang === "es");
  return rss({
    title: site.title,
    description: site.description,
    site: context.site!,
    items: posts
      .sort((a, b) => +new Date(b.data.date) - +new Date(a.data.date))
      .map((p) => ({
        title: p.data.title,
        pubDate: new Date(p.data.date),
        description: p.data.summary,
        link: `/es/blog/${p.data.slug}/`,
      })),
  });
}
