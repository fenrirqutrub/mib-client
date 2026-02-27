import { useShare } from "../../hooks/useShare";
import { Send, Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  title?: string;
  categorySlug?: string;
  articleSlug?: string;
  variant?: "icon" | "icon-label" | "pill";
  className?: string;
  stopPropagation?: boolean;
}

export const ShareButton = ({
  title,
  categorySlug,
  articleSlug,
  variant = "icon",
  className = "",
  stopPropagation = true,
}: ShareButtonProps) => {
  const { handleShare, copied } = useShare({
    title,
    categorySlug,
    articleSlug,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      //   e.preventDefault();
      e.stopPropagation();
    }
    handleShare();
  };

  // ── shared icon ──
  const Icon = copied ? (
    <Check className="w-4 h-4 text-green-500 transition-all duration-200" />
  ) : variant === "pill" ? (
    <Share2 className="w-4 h-4" />
  ) : (
    <Send className="w-4 h-4" />
  );

  // ── label text ──
  const label = copied ? "Copied!" : "Share";

  // ── base classes always applied ──
  const base =
    "inline-flex items-center justify-center gap-1.5 " +
    "text-[var(--color-gray)] hover:text-[var(--color-text)] " +
    "active:scale-90 transition-all duration-200 touch-manipulation " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 " +
    "focus-visible:ring-[var(--color-active-border)] rounded-md";

  // ── variant-specific classes ──
  const variantClass: Record<
    NonNullable<ShareButtonProps["variant"]>,
    string
  > = {
    icon: "p-1 hover:animate-bounce",
    "icon-label": "text-xs font-medium px-2 py-1 hover:animate-bounce",
    pill:
      "text-xs font-semibold px-3 py-1.5 rounded-full " +
      "border border-[var(--color-active-border)] " +
      "hover:bg-[var(--color-active-border)] hover:scale-105",
  };

  return (
    <button
      onClick={handleClick}
      className={`${base} ${variantClass[variant]} ${className}`}
      aria-label={copied ? "Link copied!" : "Share article"}
      title={copied ? "Link copied!" : "Share article"}
      type="button"
    >
      {Icon}
      {(variant === "icon-label" || variant === "pill") && <span>{label}</span>}
    </button>
  );
};
