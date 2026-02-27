import { Link } from "react-router";
import { useMemo } from "react";
import { Eye, MessageCircle, Clock, Folder, Calendar } from "lucide-react";
import type { BaseArticle } from "../../types/Article.types";
import {
  formatDate,
  formatTimeAgo,
  truncateText,
} from "../../utility/Formatters";
import { ShareButton } from "../common/ShareButton";

const MATH_PATTERNS: [RegExp, string][] = [
  [/\[math\][\s\S]*?\[\/math\]/g, ""],
  [/\$\$[\s\S]*?\$\$/g, ""],
  [/\$[^$\n]{1,300}\$/g, ""],
  [/\\\[[\s\S]*?\\\]/g, ""],
  [/\\\([\s\S]*?\\\)/g, ""],
  [/\\[a-zA-Z]+(?:\{[^}]*\})+/g, ""],
  [/\\[a-zA-Z]+/g, ""],
  [/\u200B/g, ""],
  [/\s+/g, " "],
];

const REMOVE_SELECTORS =
  ".ce-math-inline, .ce-math-display, .katex, .katex-display, " +
  ".katex-html, .katex-mathml, [data-math], [data-katex-pending], " +
  ".ce-code-block, script, style";

function extractPlainText(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.body.querySelectorAll(REMOVE_SELECTORS).forEach((el) => el.remove());
  let text = doc.body.textContent ?? "";
  for (const [pattern, replacement] of MATH_PATTERNS) {
    text = text.replace(pattern, replacement);
  }
  return text.trim();
}

const calcReadTime = (text: string): number =>
  Math.max(1, Math.ceil(text.split(/\s+/).length / 200));

export interface ArticleCardProps {
  article: BaseArticle;
  categoryPath: string;
}

export const ArticleCard = ({ article, categoryPath }: ArticleCardProps) => {
  const plainDesc = useMemo(
    () => extractPlainText(article.description),
    [article.description],
  );

  const readTime = useMemo(() => calcReadTime(plainDesc), [plainDesc]);

  const categoryName =
    article.category &&
    typeof article.category === "object" &&
    "name" in article.category
      ? (article.category as { name: string }).name
      : null;

  return (
    <Link
      to={`/articles/${categoryPath}/${article.slug}`}
      state={{ article }}
      className="group block h-full"
    >
      <article
        className="h-full flex flex-col rounded-xl overflow-hidden
          border border-[var(--color-active-border)]
          bg-[var(--color-bg)] transition-all duration-300 ease-out
         hover:shadow-[0_16px_40px_var(--color-shadow-md)]
          active:scale-[0.985]"
      >
        {/* ── Thumbnail ───────────────────────────────────────── */}
        <div className="relative overflow-hidden h-48 flex-shrink-0">
          <img
            src={article.imgUrl}
            alt={article.title}
            className="w-full h-full object-cover
              transition-transform duration-500 ease-out
              group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className="flex flex-col px-5 pb-4.5 pt-2">
          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold leading-snug mb-2 line-clamp-2 bangla transition-colors duration-200 text-[var(--color-gray)] group-hover:text-[var(--color-text)]">
            {article.title}
          </h3>

          {/* Author + date + category */}
          <div className="flex justify-between items-center gap-2 mb-3 text-xs flex-wrap">
            <div className="flex items-center gap-1 text-[var(--color-gray)]">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">
                {formatDate(article.createdAt, "long")}
              </span>
              <span className="sm:hidden">
                {formatDate(article.createdAt, "short")}
              </span>
            </div>

            <span className="text-[var(--color-gray)]">·</span>

            <span className="text-[var(--color-gray)]">
              {formatTimeAgo(article.createdAt)}
            </span>

            {categoryName && (
              <>
                <span className="text-[var(--color-gray)]">·</span>
                <span className="flex items-center gap-1 text-[var(--color-gray)]">
                  <Folder className="w-4 h-4 flex-shrink-0" />
                  {categoryName}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-md md:text-lg leading-relaxed line-clamp-3 flex-1 mb-4 text-[var(--color-gray)] group-hover:text-[var(--color-text)] bangla">
            {truncateText(plainDesc, 150)}
          </p>

          {/* Read time + Read more */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-gray)]">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{readTime} min read</span>
            </div>

            <span
              className="text-xs font-semibold uppercase tracking-wider
               text-[var(--color-gray)] transition-[letter-spacing] duration-300"
            >
              Read More →
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--color-active-border)] mb-4" />

          {/* Stats row */}
          <div className="flex items-center justify-around text-sm text-[var(--color-gray)]">
            <div className="flex items-center gap-1.5 transition-colors duration-200 hover:text-[var(--color-text)] hover:animate-bounce">
              <Eye className="w-4 h-4" />
              <span>{article.views ?? 0}</span>
            </div>

            <div className="flex items-center gap-1.5 transition-colors duration-200 hover:text-[var(--color-text)] hover:animate-bounce">
              <MessageCircle className="w-4 h-4" />
              <span>{article.comments ?? 0}</span>
            </div>

            <ShareButton
              title={article.title}
              categorySlug={categoryPath}
              articleSlug={article.slug}
              variant="icon"
            />
          </div>
        </div>
      </article>
    </Link>
  );
};
