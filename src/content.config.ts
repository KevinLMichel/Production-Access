import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const bookStatus = z.enum(["available", "catalogued", "coming-soon", "revision", "production", "archived"]);
const formatStatus = z.enum(["available", "planned", "production", "external"]);

const books = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/books" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    dek: z.string(),
    description: z.string(),
    author: z.string().default("Kevin L. Michel"),
    status: bookStatus.default("catalogued"),
    statusLabel: z.string().default("Catalogue record"),
    editionLabel: z.string().optional(),
    updated: z.coerce.date(),
    cover: z.string().optional(),
    topics: z.array(z.string()).default([]),
    shelves: z.array(z.string()).default(["Catalogue"]),
    featuredRank: z.number().optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
          kind: z.enum(["read", "download", "buy", "details", "external"]).default("external")
        })
      )
      .default([]),
    formats: z
      .array(
        z.object({
          label: z.string(),
          href: z.string().optional(),
          status: formatStatus.default("planned")
        })
      )
      .default([])
  })
});

const bookChapters = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/book-chapters" }),
  schema: z.object({
    bookSlug: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    part: z.string(),
    order: z.number(),
    summary: z.string(),
    updated: z.coerce.date()
  })
});

export const collections = { books, bookChapters };
