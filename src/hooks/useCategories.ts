// hooks/useCategories.ts
import { useQuery } from "@tanstack/react-query";
import { axiosPublic } from "./axiosPublic";
import type { Category, ApiResponse } from "../types/Article.types";
import { QUERY_KEYS, STALE_TIME } from "../utility/constants";
import axios, { AxiosError } from "axios";

export const useCategories = () => {
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery<Category[], Error>({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: async () => {
      try {
        const res =
          await axiosPublic.get<ApiResponse<Category[]>>("/api/categories");

        if (res.data.success === false) {
          throw new Error(res.data.message || "Failed to fetch categories");
        }

        return res.data.data ?? [];
      } catch (err: unknown) {
        console.error("Error fetching categories:", err);

        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<{ message?: string }>;
          throw new Error(
            axiosError.response?.data?.message ||
              axiosError.message ||
              "Failed to fetch categories",
          );
        }

        if (err instanceof Error) {
          throw err;
        }

        throw new Error("Failed to fetch categories");
      }
    },
    staleTime: STALE_TIME,
    refetchOnMount: "always",
    retry: 2,
  });

  return {
    categories,
    isLoading,
    error,
  };
};
