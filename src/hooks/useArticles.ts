import { useQuery } from "@tanstack/react-query";
import axiosPublic from "./axiosPublic";
import type { BaseArticle, ApiResponse } from "../types/Article.types";
import { QUERY_KEYS, STALE_TIME } from "../utility/constants";
import axios, { AxiosError } from "axios";

interface UseArticlesParams {
  categorySlug?: string; // ✅ Optional - না দিলে সব articles আসবে
}

export const useArticles = ({ categorySlug }: UseArticlesParams = {}) => {
  const {
    data: articles = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<BaseArticle[], Error>({
    // ✅ Dynamic query key
    queryKey: categorySlug
      ? QUERY_KEYS.ARTICLES(categorySlug)
      : ["articles", "all"],

    queryFn: async () => {
      try {
        // ✅ Conditional URL - categorySlug থাকলে filter, না থাকলে সব
        const url = categorySlug
          ? `/api/articles?categorySlug=${categorySlug}`
          : `/api/articles`; // সব articles

        const res = await axiosPublic.get<ApiResponse<BaseArticle[]>>(url);

        if (res.data.success === false) {
          throw new Error(res.data.message || "Failed to fetch articles");
        }

        return res.data.data ?? [];
      } catch (err: unknown) {
        console.error("Error fetching articles:", err);

        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<{ message?: string }>;
          throw new Error(
            axiosError.response?.data?.message ||
              axiosError.message ||
              "Failed to fetch articles",
          );
        }

        if (err instanceof Error) {
          throw err;
        }

        throw new Error("Failed to fetch articles");
      }
    },
    // ✅ categorySlug না থাকলেও run হবে
    enabled: true,
    staleTime: STALE_TIME,
    refetchOnMount: "always",
    retry: 2,
  });

  return {
    articles,
    isLoading,
    isError,
    error,
    refetch,
  };
};
