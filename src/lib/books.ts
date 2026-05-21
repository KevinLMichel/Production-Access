import { getCollection, type CollectionEntry } from "astro:content";

export type Book = CollectionEntry<"books">;

export async function getBooks() {
  const books = await getCollection("books");

  return books.sort((a, b) => {
    const rankA = a.data.featuredRank ?? 9999;
    const rankB = b.data.featuredRank ?? 9999;

    if (rankA !== rankB) return rankA - rankB;
    return a.data.title.localeCompare(b.data.title);
  });
}

export async function getFeaturedBook() {
  const books = await getBooks();
  return books.find((book) => book.data.featuredRank === 1) ?? books[0];
}

export function getBooksByShelf(books: Book[], shelf: string) {
  return books.filter((book) => book.data.shelves.includes(shelf));
}

export function getAllTopics(books: Book[]) {
  return Array.from(new Set(books.flatMap((book) => book.data.topics))).sort((a, b) => a.localeCompare(b));
}

export function bookHref(book: Book) {
  return `/books/${book.id}/`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
