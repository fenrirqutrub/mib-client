import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle, XCircle } from "lucide-react";
import axiosPublic, { multipartConfig } from "../../../hooks/axiosPublic";
import type { EditedImage } from "../../../components/ImageEditor/ImageUploadWithEditor";
import ImageUploadWithEditor from "../../../components/ImageEditor/ImageUploadWithEditor";

interface HeroFormData {
  title: string;
}

interface ApiError {
  response?: { data?: { message?: string } };
}

const AddHero = () => {
  const [images, setImages] = useState<EditedImage[]>([]);
  const [imgError, setImgError] = useState("");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HeroFormData>();

  const createHeroMutation = useMutation({
    mutationFn: async (data: HeroFormData) => {
      const formData = new FormData();
      formData.append("title", data.title);
      // blob-কে File বানিয়ে পাঠাও — field name "img"
      const file = new File(
        [images[0].blob],
        images[0].originalName || "hero.webp",
        { type: images[0].blob.type || "image/webp" },
      );
      formData.append("img", file);

      const response = await axiosPublic.post(
        "/api/heroes",
        formData,
        multipartConfig,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroes"] });
      reset();
      setImages([]);
      setImgError("");
    },
  });

  const onSubmit = (data: HeroFormData) => {
    if (images.length === 0) {
      setImgError("একটি ছবি যোগ করুন");
      return;
    }
    setImgError("");
    createHeroMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full container"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-3">Create Hero</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Upload your hero image to Cloudinary
          </p>
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {createHeroMutation.isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-green-800 dark:text-green-300 font-medium">
                Hero created successfully!
              </p>
            </motion.div>
          )}
          {createHeroMutation.isError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3"
            >
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-300 font-medium">
                {(createHeroMutation.error as ApiError)?.response?.data
                  ?.message || "Error creating hero"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Hero Title
            </label>
            <input
              type="text"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
              })}
              placeholder="Enter hero title"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 outline-none"
            />
            {errors.title && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 dark:text-red-400"
              >
                {errors.title.message}
              </motion.p>
            )}
          </motion.div>

          {/* Image — editor integrated */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Hero Image
            </label>

            {/* maxImages=1 — একটাই ছবি দরকার */}
            <ImageUploadWithEditor
              images={images}
              onChange={(imgs) => {
                setImages(imgs);
                if (imgs.length > 0) setImgError("");
              }}
              maxImages={1}
            />

            {imgError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 dark:text-red-400"
              >
                {imgError}
              </motion.p>
            )}
          </motion.div>

          {/* Submit */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            type="submit"
            disabled={createHeroMutation.isPending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {createHeroMutation.isPending ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Create Hero
              </>
            )}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400"
        >
          Images will be uploaded to Cloudinary • ID auto-generated
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AddHero;
