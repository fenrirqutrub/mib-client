import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useHeroes } from "../../hooks/useHeroes";
import Loader from "../ui/Loader";
import ErrorState from "../ui/Errorstate";
import "swiper/css";
import "swiper/css/effect-fade";
import "./Hero.css";

const DELAY = 6000;
const pad = (n: number) => String(n).padStart(2, "0");

interface HeroItem {
  _id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const Hero: React.FC = () => {
  const { data, isLoading, isError, error } = useHeroes();
  const swiperRef = useRef<SwiperType | null>(null);
  const [active, setActive] = useState(0);
  const [pKey, setPKey] = useState(0);

  const heroes = useMemo(() => (data?.data ?? []) as HeroItem[], [data]);
  const total = heroes.length;

  // Preload first 2 images via <link rel="preload"> for fastest LCP
  useEffect(() => {
    heroes.slice(0, 2).forEach(({ imageUrl }, idx) => {
      if (idx === 0) {
        // First image: use <link rel="preload"> — highest browser priority
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = imageUrl;
        document.head.appendChild(link);
      } else {
        const img = new Image();
        img.src = imageUrl;
      }
    });
  }, [heroes]);

  const onSlideChange = useCallback((s: SwiperType) => {
    setActive(s.realIndex);
    setPKey((k) => k + 1);
  }, []);

  const prev = useCallback(() => swiperRef.current?.slidePrev(), []);
  const next = useCallback(() => swiperRef.current?.slideNext(), []);
  const goTo = useCallback(
    (i: number) => swiperRef.current?.slideToLoop(i),
    [],
  );

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <ErrorState
        message={(error as Error)?.message || "Failed to load heroes."}
        title="Failed to Load Heroes"
        fullScreen
      />
    );
  if (!total)
    return (
      <section className="min-h-screen flex items-center justify-center bg-bgPrimary">
        <p className="text-zinc-500 text-lg tracking-widest uppercase font-light">
          No heroes found
        </p>
      </section>
    );

  // Swiper config — avoid recreating object every render
  const swiperModules = total > 1 ? [Autoplay, EffectFade] : [];
  const swiperEffect = total > 1 ? "fade" : undefined;

  return (
    <section className="w-full bg-bgPrimary">
      <div className="w-full pt-14 sm:pt-16 lg:pt-20">
        <div className="relative">
          <Swiper
            effect={swiperEffect}
            modules={swiperModules}
            autoplay={
              total > 1 ? { delay: DELAY, disableOnInteraction: false } : false
            }
            loop={total > 1}
            speed={900}
            className="hs w-full"
            onSwiper={(s) => {
              swiperRef.current = s;
            }}
            onSlideChange={onSlideChange}
          >
            {heroes.map((h, i) => (
              <SwiperSlide key={h._id}>
                <div className="s-grain s-inner relative w-full overflow-hidden rounded-lg">
                  <img
                    src={h.imageUrl}
                    alt={h.title}
                    className="s-img absolute inset-0 w-full h-full object-cover object-center "
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding={i === 0 ? "sync" : "async"}
                    fetchPriority={i === 0 ? "high" : "low"}
                    width={1920}
                    height={700}
                  />

                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/5 z-[1]" />
                  <div className="absolute inset-0 s-vignette z-[2]" />
                  <div className="absolute inset-0 s-scan z-[3] opacity-40" />
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent z-20" />

                  <div className="ghost" aria-hidden="true">
                    {pad(i + 1)}
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 z-20 flex flex-col justify-end">
                    <div className="px-6 pb-8 sm:px-10 sm:pb-11 md:px-14 lg:px-20 lg:pb-13 xl:px-24 xl:pb-15 max-w-5xl">
                      {/* Eyebrow */}
                      <div className="s-eye mb-3 flex items-center gap-3">
                        <span className="text-white/35 text-[9px] sm:text-[11px] tracking-[.3em] uppercase font-dm">
                          Featured
                        </span>
                        <span className="block w-7 h-px bg-white/20" />
                        <span className="text-white/35 text-[9px] sm:text-[11px] tracking-[.3em] uppercase font-dm">
                          {pad(i + 1)} / {pad(total)}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-white font-black leading-[1.02] tracking-tight font-hero hero-title">
                        {h.title.split(" ").map((w, j) => (
                          <span
                            key={j}
                            className="s-w inline-block mr-[.22em]"
                            style={{
                              transformOrigin: "bottom center",
                              perspective: "400px",
                            }}
                          >
                            {w}
                          </span>
                        ))}
                      </h2>

                      <div
                        aria-hidden="true"
                        className="absolute inset-0 z-[1] flex items-start justify-start select-none pointer-events-none overflow-hidden bangla"
                      >
                        <span
                          className="font-black font-hero leading-none tracking-tighter text-white/[0.09] whitespace-nowrap"
                          style={{ fontSize: "clamp(6rem, 20vw, 16rem)" }}
                        >
                          {h.title}
                        </span>
                      </div>

                      <div className="s-div mt-4 h-px w-14 sm:w-20 bg-gradient-to-r from-white/65 to-transparent" />

                      {h.subtitle && (
                        <p className="s-sub mt-3 text-white/50 text-sm sm:text-base leading-relaxed max-w-md font-dm font-light">
                          {h.subtitle}
                        </p>
                      )}

                      {h.ctaLabel && (
                        <div className="s-cta mt-5 sm:mt-6">
                          <a
                            href={h.ctaHref ?? "#"}
                            className="s-cta-btn inline-flex items-center gap-3 border border-white/35 px-6 py-3 sm:px-8 sm:py-3.5 font-dm"
                          >
                            <span className="s-cl text-white text-xs sm:text-sm tracking-[.2em] uppercase font-medium">
                              {h.ctaLabel}
                            </span>
                            <ArrowRight className="s-cl w-4 h-4 text-white" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Corner accents */}
                  <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20 w-8 h-8 border-t border-r border-white/20" />
                  <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7 z-20 w-8 h-8 border-b border-l border-white/20" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {total > 1 && (
            <div className="absolute bottom-0 right-0 z-30 flex items-end">
              <div className="hero-controls flex flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-baseline gap-1">
                  <span className="s-num text-white text-2xl sm:text-3xl leading-none font-bold">
                    {pad(active + 1)}
                  </span>
                  <span className="text-white/30 text-xs font-dm">
                    /{pad(total)}
                  </span>
                </div>

                <div className="p-track w-full h-0.5" style={{ minWidth: 80 }}>
                  <div
                    key={pKey}
                    className="p-fill run"
                    style={{ "--dur": `${DELAY}ms` } as React.CSSProperties}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {heroes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`dot ${i === active ? "on" : "off"}`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="s-btn w-9 h-9 flex items-center justify-center border border-white/20 text-white/70"
                    onClick={prev}
                    aria-label="Previous"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    className="s-btn w-9 h-9 flex items-center justify-center border border-white/20 text-white/70"
                    onClick={next}
                    aria-label="Next"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
