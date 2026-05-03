// src/pages/Admin/AddNewItem/AddPhotography.tsx

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { axiosPublic } from "../../../hooks/axiosPublic";
import toast from "react-hot-toast";
import ImageUploadWithEditor, {
  type EditedImage,
} from "../../../components/ImageEditor/ImageUploadWithEditor";

export default function AddPhotography() {
  const [images, setImages] = useState<EditedImage[]>([]);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      images.forEach((img) => {
        const file = new File([img.blob], img.originalName || "photo.webp", {
          type: img.blob.type || "image/webp",
        });
        formData.append("images", file);
      });

      const response = await axiosPublic.post("/api/photography", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      const summary = data.summary;
      if (summary) {
        if (summary.failed > 0) {
          toast.success(
            `Uploaded ${summary.successful}/${summary.total} photos successfully`,
            { duration: 4000 },
          );
        } else {
          toast.success(
            `All ${summary.successful} photos uploaded successfully!`,
          );
        }
      } else {
        toast.success("Photos uploaded successfully!");
      }

      qc.invalidateQueries({ queryKey: ["photos"] });
      qc.invalidateQueries({ queryKey: ["photos-admin"] });

      setTimeout(() => setImages([]), 1500);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Upload failed");
    },
  });

  const handleSubmit = () => {
    if (images.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Upload Photos</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Share your beautiful moments - Upload up to 10 photos at once
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 space-y-8"
        >
          {/* Editor */}
          <ImageUploadWithEditor
            images={images}
            onChange={setImages}
            maxImages={10}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <motion.button
              onClick={handleSubmit}
              disabled={mutation.isPending || images.length === 0}
              whileHover={{
                scale: images.length > 0 && !mutation.isPending ? 1.02 : 1,
              }}
              whileTap={{
                scale: images.length > 0 && !mutation.isPending ? 0.98 : 1,
              }}
              className={`flex-1 py-4 px-8 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                mutation.isPending || images.length === 0
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:shadow-2xl"
              }`}
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading {images.length} photo{images.length > 1 ? "s" : ""}
                  ...
                </span>
              ) : (
                `Upload ${images.length} Photo${images.length !== 1 ? "s" : ""}`
              )}
            </motion.button>

            {images.length > 0 && (
              <motion.button
                onClick={() => setImages([])}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold shadow-lg transition-all duration-300"
              >
                Clear All
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-purple-200 dark:border-gray-600"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
            📸 Upload Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• Upload multiple photos at once (up to 10 photos)</li>
            <li>• Edit, crop, rotate or flip each photo before uploading</li>
            <li>• All photos are auto-converted to WebP for best quality</li>
            <li>• Supported input formats: JPG, PNG, WebP, GIF, and more</li>
            <li>
              • Photos are automatically optimized and added to the gallery
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
