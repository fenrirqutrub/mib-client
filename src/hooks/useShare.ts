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
  const [showModal, setShowModal] = useState(false);

  const finalUrl = useMemo(() => {
    if (categorySlug && articleSlug) {
      return `${window.location.origin}/articles/${categorySlug}/${articleSlug}`;
    }
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    return url.toString();
  }, [categorySlug, articleSlug]);

  const shareTitle = title || "একটি চমৎকার আর্টিকেল";

  const shareLinks = useMemo(
    () => ({
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${finalUrl}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(finalUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent(shareTitle)}`,
    }),
    [finalUrl, shareTitle],
  );

  const copyLink = useCallback(() => {
    navigator.clipboard
      ?.writeText(finalUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("লিঙ্ক কপি করা হয়েছে!");
      })
      .catch(() => {
        const el = document.createElement("input");
        el.value = finalUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("লিঙ্ক কপি করা হয়েছে!");
      });
  }, [finalUrl]);

  // 🔥 Mobile Native Share Support
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: finalUrl,
        });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      // Desktop fallback → show modal
      setShowModal(true);
    }
  }, [finalUrl, shareTitle]);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    handleShare,
    copied,
    showModal,
    closeModal,
    shareLinks,
    copyLink,
    finalUrl,
  };
};
