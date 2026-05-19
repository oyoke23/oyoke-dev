import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const LOCALES = ["en", "es"] as const;

// Use the full relative path as the ID so the same slug can exist
// in both /en/ and /es/ subfolders without collision.
const idFromPath = (entry: { entry: string }) => entry.entry.replace(/\.(md|mdx)$/, "");

const projects = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/projects",
    generateId: idFromPath,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      lang: z.enum(LOCALES).default("en"),
      slug: z.string(),
      stack: z.array(z.string()).default([]),
      repo: z.string().optional(),
      url: z.string().url().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      showReadme: z.boolean().default(true),
      post: z.string().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/blog",
    generateId: idFromPath,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      lang: z.enum(LOCALES).default("en"),
      slug: z.string(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      repo: z.string().optional(),
      project: z.string().optional(),
      readingTime: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects, blog };
