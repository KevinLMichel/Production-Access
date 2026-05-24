import { getCollection, type CollectionEntry } from "astro:content";

export type BookChapter = CollectionEntry<"bookChapters">;

export async function getBookChapters(bookSlug: string) {
  const chapters = await getCollection("bookChapters", (chapter) => chapter.data.bookSlug === bookSlug);
  return chapters.sort((a, b) => a.data.order - b.data.order);
}

export function chapterSlug(chapter: BookChapter) {
  return chapter.id.split("/").pop() ?? chapter.id;
}

export function chapterHref(chapter: BookChapter) {
  return `/books/${chapter.data.bookSlug}/chapters/${chapterSlug(chapter)}/`;
}

export function groupChaptersByPart(chapters: BookChapter[]) {
  const parts = new Map<string, BookChapter[]>();

  for (const chapter of chapters) {
    const existing = parts.get(chapter.data.part) ?? [];
    existing.push(chapter);
    parts.set(chapter.data.part, existing);
  }

  return Array.from(parts.entries()).map(([part, items]) => ({ part, chapters: items }));
}

export function readingTimeFromWords(words: number) {
  return Math.max(1, Math.round(words / 225));
}

export function getChapterWordCount(chapter: BookChapter) {
  return (chapter.body ?? "").split(/\s+/).filter(Boolean).length;
}
