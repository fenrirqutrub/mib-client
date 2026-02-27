import { useState, useMemo, useEffect } from "react";
import { useArticles } from "../../hooks/useArticles";
import { useCategories } from "../../hooks/useCategories";
import { ArticleCard } from "../../components/Article/ArticleCard";
import Loader from "../../components/ui/Loader";
import ErrorState from "../../components/ui/Errorstate";
import CategorySelect from "./Categoryselect";
import { SearchBar } from "../common/Searchbar";
import type { Category } from "../../types/Article.types";
import { Pagination } from "../common/Pagination";
import { SearchX } from "lucide-react";
import { stripHtml } from "../../utility/Formatters";

const ITEMS_PER_PAGE = 9;

const Articles = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { articles, isLoading, isError, error, refetch } = useArticles();
  const { categories } = useCategories();

  useEffect(() => {
    refetch();
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, refetch]);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const filteredArticles = useMemo(() => {
    if (!articles) return [];

    let filtered = articles;

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((article) => {
        const categoryId =
          typeof article.category === "object"
            ? (article.category as Category)._id
            : article.category;
        return categoryId === selectedCategory.id;
      });
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(search) ||
          stripHtml(article.description || "")
            .toLowerCase()
            .includes(search),
      );
    }

    return filtered;
  }, [articles, selectedCategory, searchTerm]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    <div className="container mx-auto px-5 md:px-0">
      <div className="text-center pt-24">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-3 md:mb-4">
          All Articles
        </h1>
      </div>

      {/* Search & Filter */}
      <div className="mb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
          <div className="flex-1 min-w-0">
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search articles by title or description..."
              value={searchTerm}
            />
          </div>

          <div className="w-full sm:w-[200px] shrink-0">
            <CategorySelect
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-center md:text-left text-gray-600 dark:text-gray-400 mb-4">
        <p>
          {filteredArticles.length === 0 ? (
            "No articles match your criteria"
          ) : (
            <>
              Showing{" "}
              <strong>
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredArticles.length,
                )}
              </strong>{" "}
              of <strong>{filteredArticles.length}</strong>{" "}
              {filteredArticles.length === 1 ? "article" : "articles"}
              {selectedCategory && ` in ${selectedCategory.name}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </>
          )}
        </p>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-6 mx-auto">
            <SearchX
              className="w-10 h-10 text-gray-400 dark:text-gray-500"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            No Articles Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Try changing your search term or category filter
          </p>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
            {paginatedArticles.map((article) => {
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

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Articles;
