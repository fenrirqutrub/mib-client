import { Calendar, MessageCircle, Eye, CircleUserRound } from "lucide-react";
import type { BaseArticle } from "../../types/Article.types";
import { formatDate, formatTimeAgo } from "../../utility/Formatters";
import { useEffect } from "react";
import {
  applyArticleTheme,
  injectArticleStyles,
  processArticleCodeBlocks,
  watchThemeChanges,
} from "../../pages/Admin/Editor/injectArticleStyles";
import {
  loadKaTeX,
  renderMathInContainer,
} from "../../pages/Admin/Editor/mathRenderer";
import { ShareButton } from "../common/ShareButton";

interface ArticleHeaderProps {
  article: BaseArticle;
  commentsCount: number;
  onShare: () => void;
  categoryPath: string;
}

export const ArticleHeader = ({
  article,
  commentsCount,
  categoryPath,
}: ArticleHeaderProps) => {
  useEffect(() => {
    loadKaTeX().catch(() => {});
  }, []);

  useEffect(() => {
    injectArticleStyles();
    applyArticleTheme();

    const stopWatching = watchThemeChanges();

    const processContent = async () => {
      const articleBody = document.querySelector<HTMLElement>(".article-body");
      if (!articleBody) return;

      processArticleCodeBlocks(articleBody);
      applyArticleTheme();

      try {
        await loadKaTeX();
      } catch (error) {
        console.error(error);
      }

      renderMathInContainer(articleBody);
    };

    const timer1 = setTimeout(processContent, 150);
    const timer2 = setTimeout(processContent, 800);
    const timer3 = setTimeout(processContent, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      stopWatching();
    };
  }, [article._id]);

  return (
    <>
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-xl">
        <img
          src={article.imgUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="mt-4 sm:mt-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg text-[var(--color-text)] bangla">
          {article.title}
        </h1>
      </div>

      <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--color-gray)]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <CircleUserRound className="w-6 h-6 " />

            <span className="font-medium rubik-bold">
              {article.author?.trim() || "Masud ibn Belat"}
            </span>
          </div>
          <span className="hidden sm:inline font-bold ">•</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {formatDate(article.createdAt, "long")}
            </span>
            <span className="sm:hidden">
              {formatDate(article.createdAt, "short")}
            </span>
          </div>
          <span className="hidden sm:inline font-bold ">•</span>
          <span className="">
            {article.timeAgo ?? formatTimeAgo(article.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 " />
            <span className="font-medium">{article.views ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 " />
            <span className="font-medium">{commentsCount}</span>
          </div>
          <ShareButton
            title={article.title}
            categorySlug={categoryPath}
            articleSlug={article.slug}
            variant="icon"
          />
        </div>
      </div>

      <div className="border-t border-gray-300 dark:border-slate-800 my-6 sm:my-8 w-full" />

      <article className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <div className="p-2 sm:p-3 text-[var(--color-text)] leading-relaxed article-body overflow-x-hidden">
          <div
            className="p-2 sm:p-3 leading-relaxed article-body overflow-x-hidden bangla text-xl md:text-2xl"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        </div>
      </article>

      <div className="border-t border-gray-300 dark:border-slate-800 mt-12 sm:mt-16 mb-6 sm:mb-8 w-full" />
    </>
  );
};
