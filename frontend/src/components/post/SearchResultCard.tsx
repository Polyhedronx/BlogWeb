import { Link } from "react-router-dom";
import { formatDate, postUrl } from "@/lib/utils";
import { Calendar, Folder } from "lucide-react";
import type { SearchResultItem } from "@/types";

/** Convert 「…」 markers from backend to <mark> tags for keyword highlighting */
function renderSnippet(snippet: string): React.ReactNode {
  const parts = snippet.split(/[「」]/);
  return parts.map((part, i) =>
    i % 2 === 1 ? <mark key={i}>{part}</mark> : part
  );
}

interface SearchResultCardProps {
  item: SearchResultItem;
}

export default function SearchResultCard({ item }: SearchResultCardProps) {
  const url = postUrl(item);

  return (
    <article className="pb-5 border-b border-[var(--color-border)] last:border-b-0">
      {/* Title */}
      <h3 className="text-lg font-semibold mb-1.5 leading-snug">
        <Link
          to={url}
          className="text-[var(--color-accent)] hover:underline decoration-[var(--color-accent)]/60 underline-offset-2 no-underline"
        >
          {item.title}
        </Link>
      </h3>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)] mb-2">
        {item.category && (
          <span className="flex items-center gap-1">
            <Folder className="h-3 w-3" />
            {item.category}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(item.date)}
        </span>
      </div>

      {/* Content snippet with highlighted keywords */}
      <p className="search-snippet text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">
        {renderSnippet(item.snippet)}
      </p>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {item.tags.map((tag) => (
            <Link
              key={tag}
              to={`/?tag=${encodeURIComponent(tag)}`}
              className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors no-underline"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
