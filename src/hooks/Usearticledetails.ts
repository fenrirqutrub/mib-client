import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosPublic } from "../hooks/axiosPublic";
import type { ApiResponse, BaseArticle } from "../types/Article.types";
import { QUERY_KEYS, STALE_TIME } from "../utility/constants";

// ────────────────────── CUSTOM HOOK: useArticleDetails ──────────────────────

interface UseArticleDetailsOptions {
  identifier: string | undefined;
  initialData?: BaseArticle;
}
export const useArticleDetails = ({
  identifier,
  initialData,
}: UseArticleDetailsOptions) => {
  const queryClient = useQueryClient();

  const query = useQuery<BaseArticle, Error>({
    queryKey: QUERY_KEYS.ARTICLE(identifier || ""),
    queryFn: async () => {
      if (!identifier) throw new Error("Invalid article identifier");
      const res = await axiosPublic.get<ApiResponse<BaseArticle>>(
        `/api/articles/${identifier}`,
      );
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message ?? "Article not found");
      }
      return res.data.data;
    },
    initialData,
    enabled: !!identifier,
    staleTime: STALE_TIME,
    refetchOnMount: "always",
    retry: 2,
  });

  useEffect(() => {
    if (!identifier) return;

    const incrementView = async () => {
      try {
        const { data } = await axiosPublic.post<ApiResponse<{ views: number }>>(
          `/api/articles/${identifier}/view`,
        );

        if (data.success && data.data?.views !== undefined) {
          queryClient.setQueryData(
            QUERY_KEYS.ARTICLE(identifier),
            (old: BaseArticle | undefined) =>
              old ? { ...old, views: data.data.views } : old,
          );
        }
      } catch (err) {
        console.error("View increment failed:", err);
      }
    };

    incrementView();
  }, [identifier, queryClient]);

  return {
    article: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
