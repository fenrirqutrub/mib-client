import { useForm, type SubmitHandler } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosPublic } from "../../../hooks/axiosPublic";
import Editor from "../Editor/Editor";
import type { EditedImage } from "../../../components/ImageEditor/ImageUploadWithEditor";
import ImageUploadWithEditor from "../../../components/ImageEditor/ImageUploadWithEditor";

interface ArticleFormData {
  category: string;
  title: string;
  author: string;
  description: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const AddArticle = () => {
  const [images, setImages] = useState<EditedImage[]>([]);
  const [dropdownOpen, setDropdown] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<ArticleFormData>({
      defaultValues: { category: "", title: "", author: "", description: "" },
    });

  const catId = watch("category");
  const description = watch("description");

  const { data: cats = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () =>
      (await axiosPublic.get("/api/categories")).data.data ?? [],
  });

  const mutation = useMutation({
    mutationFn: (fd: FormData) => axiosPublic.post("/api/articles", fd),
    onSuccess: () => {
      toast.success("Article created");
      qc.invalidateQueries({ queryKey: ["articles"] });
      reset();
      setImages([]);
      setEditorKey((k) => k + 1);
    },
    onError: (err: unknown) => {
      type AxiosErr = {
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
        };
        message?: string;
      };
      const axErr = err as AxiosErr;
      const status = axErr?.response?.status;
      const msg =
        axErr?.response?.data?.message ||
        axErr?.response?.data?.error ||
        axErr?.message ||
        "Failed to create article";
      toast.error(status ? `${status}: ${msg}` : msg);
    },
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getTextLength = (html: string) =>
    html
      .replace(/<[^>]*>/g, "")
      .replace(/\u200B/g, "")
      .trim().length;

  const canSubmit = Boolean(
    catId &&
    images.length > 0 &&
    getTextLength(description) >= 20 &&
    !mutation.isPending,
  );

  const onSubmit: SubmitHandler<ArticleFormData> = (data) => {
    if (images.length === 0) return toast.error("Image required");
    if (!data.category) return toast.error("Category required");
    if (!data.description.trim()) return toast.error("Description required");
    if (getTextLength(data.description) < 20)
      return toast.error("Description must be at least 20 characters");

    const fd = new FormData();
    fd.append("title", data.title.trim());
    fd.append("description", data.description.trim());
    if (data.author?.trim()) fd.append("author", data.author.trim());
    fd.append("categoryId", data.category);

    const img = images[0];
    fd.append(
      "img",
      new File([img.blob], img.originalName || "article.webp", {
        type: img.blob.type || "image/webp",
      }),
    );

    mutation.mutate(fd);
  };

  return (
    <div className="min-h-screen">
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Add New Article</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category */}
          <div className="relative" ref={ref}>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Category <span className="text-red-500">*</span>
            </label>
            <input type="hidden" {...register("category")} />
            <button
              type="button"
              onClick={() => setDropdown((v) => !v)}
              disabled={mutation.isPending || isLoading}
              className="w-full px-4 py-3 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-between items-center disabled:opacity-60"
            >
              <span
                className={
                  catId ? "text-gray-900 dark:text-white" : "text-gray-500"
                }
              >
                {catId
                  ? (cats.find((c) => c._id === catId)?.name ?? "…")
                  : "Select category"}
              </span>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <IoChevronDown
                  className={`transition ${dropdownOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>
            {dropdownOpen && cats.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-64 overflow-auto">
                {cats.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => {
                      setValue("category", c._id);
                      setDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${catId === c._id ? "bg-blue-50 dark:bg-gray-600" : ""}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Title *
            </label>
            <input
              {...register("title", { required: true, minLength: 5 })}
              placeholder="Title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Author{" "}
              <span className="text-gray-400 text-xs font-normal">
                (optional)
              </span>
            </label>
            <input
              {...register("author")}
              placeholder="Author name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Description *
            </label>
            <Editor
              key={editorKey}
              value={description}
              onChange={(val) => setValue("description", val)}
              placeholder="Write your description..."
              rows={6}
              disabled={mutation.isPending}
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Image *{" "}
              <span className="text-gray-400 text-xs font-normal">
                (১টি, landscape)
              </span>
            </label>
            <ImageUploadWithEditor
              images={images}
              onChange={setImages}
              maxImages={1}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                canSubmit
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating…
                </>
              ) : (
                "Add Article"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                reset();
                setImages([]);
              }}
              disabled={mutation.isPending}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded-lg transition disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddArticle;
