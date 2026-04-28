import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getBookBySlug } from "@/lib/actions/book.actions";
import VapiControls from "@/components/VapiControls";

export default async function BookDetailsPage(
  props: PageProps<"/books/[slug]">
) {
  const { slug } = await props.params;
  const result = await getBookBySlug(slug);
  const book = result.success ? result.data : null;

  if (!book) {
    notFound();
  }

  return (
    <main className="book-page-container">
      <Link href="/" className="back-btn-floating" aria-label="Go back">
        <ArrowLeft className="size-5 text-[var(--text-primary)]" />
      </Link>

      <VapiControls book={book} />
    </main>
  );
}
