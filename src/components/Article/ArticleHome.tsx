import { useEffect, useMemo } from "react";
import { useArticles } from "../../hooks/useArticles";
import { ArticleCard } from "../../components/Article/ArticleCard";
import Loader from "../../components/ui/Loader";
import ErrorState from "../../components/ui/Errorstate";
import { Link } from "react-router";
import type { Category } from "../../types/Article.types";
import { ArrowRight } from "lucide-react";

const HOME_ARTICLES_LIMIT = 3;

const ArticleHome = () => {
  const { articles, isLoading, isError, error } = useArticles();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const latestArticles = useMemo(() => {
    if (!articles) return [];
    return articles.slice(0, HOME_ARTICLES_LIMIT);
  }, [articles]);

  if (isLoading) return <Loader fullScreen />;

  if (isError) {
    return (
      <ErrorState
        message={error?.message || "Failed to load articles"}
        title="Error Loading Articles"
        showBackButton
        backButtonText="Back to Home"
        backButtonPath="/"
        fullScreen
      />
    );
  }

  return (
    <div className="container mx-auto px-5 md:px-0 py-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-textPrimary mb-2">
            Latest Articles
          </h2>
          <p className="text-textGray">Explore our most recent posts</p>
        </div>

        <Link
          to="/articles"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Articles Grid */}
      {latestArticles.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">
          No articles available right now.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {latestArticles.map((article) => {
              const categorySlug =
                typeof article.category === "object"
                  ? (article.category as Category).slug
                  : "";

              return (
                <ArticleCard
                  key={article._id}
                  article={article}
                  categoryPath={categorySlug}
                />
              );
            })}
          </div>

          {/* Mobile View All Button */}
          <div className="mt-10 text-center sm:hidden">
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleHome;
