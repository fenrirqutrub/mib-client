import Marquee from "react-fast-marquee";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../../hooks/axiosPublic";
import { Quote as QuoteIcon } from "lucide-react";
import Loader from "../ui/Loader";
import { ImQuotesRight } from "react-icons/im";

interface Quote {
  _id: string;
  content: string;
  author?: string;
  uniqueId: string;
}

const fetchQuotes = async (): Promise<Quote[]> => {
  const res = await axiosPublic.get("/api/quotes");
  return res.data.data ?? [];
};

const Quotes = () => {
  const {
    data: quotes = [],
    isLoading,
    isError,
  } = useQuery<Quote[]>({
    queryKey: ["quotes"],
    queryFn: fetchQuotes,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="py-12 bg-bgPrimary">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p className="text-lg">
              Failed to load quotes. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!quotes.length) {
    return (
      <div className="py-12 bg-bgPrimary">
        <div className="container mx-auto px-4">
          <div className="text-center text-textPrimary">
            <QuoteIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No quotes available yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 bg-bgPrimary overflow-hidden">
      <div className="container mx-auto px-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-2 pacifico">
          Quotes Today
        </h2>
        <p className="text-[var(--color-gray)] text-lg pacifico">
          That will make your day
        </p>
      </div>

      <Marquee
        speed={40}
        gradient={false}
        pauseOnHover={false}
        pauseOnClick={true}
        direction="left"
        className="py-4 flex items-center"
      >
        {quotes.map((quote) => (
          <div
            key={quote.uniqueId || quote._id}
            className="mx-4 sm:mx-6 md:mx-8 inline-flex items-center"
          >
            {/* Paper Card with Lines */}
            <div
              className="paper-card group relative w-72 sm:w-80 md:w-96 min-h-[200px] p-6 pb-12
    rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing select-none overflow-hidden bg-[var(--color-bg)] flex items-center"
            >
              {/* Watermark Quote Icon - top left */}
              <ImQuotesRight className="absolute top-3 right-3 text-7xl text-[var(--color-gray)]/15 dark:text-white/10 pointer-events-none z-0 select-none" />

              {/* Horizontal Lines - Light Mode */}
              <div
                className="absolute inset-0 pointer-events-none dark:hidden"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                  transparent, 
                  transparent 19px,
                  rgba(12, 13, 18, 0.08) 19px,
                  rgba(12, 13, 18, 0.08) 20px
      )`,
                }}
              />

              {/* Horizontal Lines - Dark Mode */}
              <div
                className="absolute inset-0 pointer-events-none hidden dark:block"
                style={{
                  backgroundImage: `repeating-linear-gradient(
        transparent,
        transparent 19px,
        rgba(248, 249, 250, 0.2) 19px,
        rgba(248, 249, 250, 0.2) 20px
      )`,
                }}
              />

              {/* Red Margin Line */}
              <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-red-400/60 dark:bg-red-400/40" />

              {/* Quote Content */}
              <div className="relative z-10 pl-6 w-full">
                <p
                  className="text-xl md:text-2xl whitespace-pre-wrap break-words text-[var(--color-text)] bangla mt-2"
                  style={{ lineHeight: "20px" }}
                >
                  "{quote.content}"
                </p>

                {quote.author && quote.author !== "Anonymous" && (
                  <p
                    className="mt-4 text-right text-lg md:text-xl font-medium text-[var(--color-gray)] bangla"
                    style={{ lineHeight: "20px" }}
                  >
                    —— {quote.author}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default Quotes;
