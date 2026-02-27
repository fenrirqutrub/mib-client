import { useParams, Link } from "react-router";
import { useLocation } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useComments } from "../../hooks/Usecomments";
import { useShare } from "../../hooks/useShare";
import type { BaseArticle } from "../../types/Article.types";
import Loader from "../ui/Loader";
import ErrorState from "../ui/Errorstate";
import { ArticleHeader } from "./Articleheader";
import { CommentSection } from "../comment/CommentSection";
import { useArticleDetails } from "../../hooks/Usearticledetails";
import { useEffect } from "react";

// ────────────────────── ARTICLE DETAIL PAGE ──────────────────────

const ArticleDetails = () => {
  const { categorySlug, articleSlug } = useParams<{
    categorySlug: string;
    articleSlug: string;
  }>();

  const location = useLocation();
  const stateArticle = location.state?.article as BaseArticle | undefined;

  const { article, isLoading, isError, error } = useArticleDetails({
    identifier: articleSlug,
    initialData: stateArticle,
  });

  // Comments count for header
  const { comments } = useComments(article?._id);

  // Share handler
  const { handleShare } = useShare({
    title: article?.title,
    categorySlug,
    articleSlug,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);
  // ── Guards ──

  if (isLoading) return <Loader fullScreen />;

  if (isError || !article) {
    return (
      <ErrorState
        message={
          error?.message ||
          "Article not found. It may have been removed or the link is incorrect."
        }
        title="Article Not Found"
        showBackButton
        backButtonText={`Back to Articles"}`}
        backButtonPath={`/articles`}
        fullScreen
      />
    );
  }

  // ── Render ──

  return (
    <div className="py-6 px-4 sm:py-8 sm:px-6 lg:px-8 rubik-regular">
      <div className="max-w-5xl mx-auto mt-12 sm:mt-16 lg:mt-20">
        {/* Back Button */}
        <Link
          to={`/articles`}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline mb-4 sm:mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Back to Articles</span>
          <span className="sm:hidden">Back</span>
        </Link>

        {/* Article Header */}
        <ArticleHeader
          article={article}
          commentsCount={comments.length}
          onShare={handleShare}
          categoryPath={categorySlug ?? ""}
        />

        {/* Comments */}
        <CommentSection articleId={article._id} />
      </div>
    </div>
  );
};

export default ArticleDetails;
