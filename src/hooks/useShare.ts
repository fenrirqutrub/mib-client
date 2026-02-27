import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

interface UseShareOptions {
  title?: string;
  categorySlug?: string;
  articleSlug?: string;
}

export const useShare = ({
  title,
  categorySlug,
  articleSlug,
}: UseShareOptions = {}) => {
  const [copied, setCopied] = useState(false);

  const finalUrl = useMemo(() => {
    if (categorySlug && articleSlug) {
      return `${window.location.origin}/articles/${categorySlug}/${articleSlug}`;
    }
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    return url.toString();
  }, [categorySlug, articleSlug]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "একটি চমৎকার আর্টিকেল",
          url: finalUrl,
        });
        toast.success("শেয়ার করা হয়েছে!");
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.warn("Native share ব্যর্থ:", err);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("লিঙ্ক কপি করা হয়েছে!");
    } catch (err) {
      console.error("কপি ব্যর্থ:", err);
      toast.error("লিঙ্ক কপি করা যায়নি");
    }
  }, [finalUrl, title]);

  return { handleShare, copied };
};
