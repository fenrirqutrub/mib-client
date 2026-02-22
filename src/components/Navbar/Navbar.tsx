import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router";
import ThemeToggle from "./ThemeToggle";

type MenuItem = {
  readonly name: string;
  readonly path: string;
};

/* ------------------------------------------------------------------ */
/*                         NAVBAR COMPONENT                           */
/* ------------------------------------------------------------------ */
const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const MENU_CONFIG = useMemo<MenuItem[]>(
    () => [
      { name: "home", path: "/" },
      { name: "articles", path: "/articles" },
      { name: "photography", path: "/photography" },
    ],
    [],
  );

  // Active item detection
  const activeItem = useMemo(() => {
    const path = location.pathname;
    if (path === "/") return "home";
    const match = MENU_CONFIG.find(
      (item) => item.path !== "/" && path.startsWith(item.path),
    );
    return match?.name ?? "home";
  }, [MENU_CONFIG, location.pathname]);

  /* -------------------------------------------------------------- */
  /*                     SIDE EFFECTS                               */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /* -------------------------------------------------------------- */
  /*                         HANDLERS                               */
  /* -------------------------------------------------------------- */
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleNavigation = useCallback(
    (path: string) => {
      setMobileMenuOpen(false);
      navigate(path);
    },
    [navigate],
  );

  const handleLogo = useCallback(() => {
    const scrollTop = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    if (scrollTop <= 50) {
      window.scrollTo({ top: maxScroll, behavior: "smooth" });
    } else if (maxScroll - scrollTop <= 50) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({
        top: scrollTop < maxScroll / 2 ? maxScroll : 0,
        behavior: "smooth",
      });
    }
  }, []);

  /* -------------------------------------------------------------- */
  /*                         RENDER                                 */
  /* -------------------------------------------------------------- */
  return (
    <>
      {/* ========== FIXED NAVBAR ========== */}
      <nav
        className={`fixed z-50 transition-all duration-300 ${
          scrolled
            ? "top-0 left-0 right-0 py-3 border-b shadow-lg"
            : "top-0 left-0 right-0 py-4"
        }`}
        style={{
          backgroundColor: "var(--color-bg)",
          backdropFilter: "blur(12px)",
          borderColor: scrolled ? "var(--color-active-border)" : "transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <button
              className="relative text-2xl md:text-3xl pacifico leading-none cursor-pointer outline-none"
              aria-label="MiB"
              onClick={() => {
                handleLogo();
                navigate("/");
              }}
            >
              <span className="hidden md:inline-block text-textPrimary">
                MiB
              </span>

              <span
                className="md:hidden block relative"
                style={{ lineHeight: 1 }}
              >
                {[
                  { x: 0.6, y: 0.6 },
                  { x: -0.6, y: -0.6 },
                  { x: 0, y: 0.9 },
                ].map((o, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="absolute inset-0 text-textPrimary"
                    style={{ transform: `translate(${o.x}px, ${o.y}px)` }}
                  >
                    MiB
                  </span>
                ))}
                <span className="relative text-textPrimary z-10">MiB</span>
              </span>
            </button>

            {/* DESKTOP MENU */}
            <ul className="hidden md:flex items-center space-x-1 relative">
              {MENU_CONFIG.map((item) => {
                const isActive = activeItem === item.name;
                return (
                  <li key={item.name} className="relative">
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="px-5 py-2.5 rounded-lg font-medium capitalize transition-all cursor-pointer relative z-10 outline-none"
                      style={{
                        color: isActive
                          ? "var(--color-active-text)"
                          : "var(--color-gray)",
                      }}
                    >
                      {item.name}
                    </button>

                    {isActive && (
                      <motion.div
                        layoutId="desktopActiveTab"
                        className="absolute inset-0 rounded-lg border pointer-events-none"
                        style={{
                          backgroundColor: "var(--color-active-bg)",
                          borderColor: "var(--color-active-border)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                          mass: 0.8,
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block">
                <ThemeToggle size={35} animationSpeed={0.5} />
              </div>

              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2.5 rounded-lg transition-all z-[60] relative outline-none"
                style={{
                  backgroundColor: "var(--color-active-bg)",
                  color: "var(--color-text)",
                }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========== MOBILE MENU ========== */}
      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[55] md:hidden bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
            />

            {/* Drawer */}
            <motion.div
              className="fixed inset-y-0 right-0 w-full max-w-md z-[56] md:hidden shadow-2xl overflow-hidden"
              style={{ backgroundColor: "var(--color-bg)" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div
                  className="flex items-center justify-between p-6 border-b"
                  style={{ borderColor: "var(--color-active-border)" }}
                >
                  <h2
                    className="text-2xl font-bold pacifico"
                    style={{ color: "var(--color-text)" }}
                  >
                    MiB
                  </h2>
                  <motion.button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-full transition-colors outline-none"
                    style={{
                      backgroundColor: "var(--color-active-bg)",
                      color: "var(--color-text)",
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Menu items */}
                <nav className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="space-y-1">
                    {MENU_CONFIG.map((item) => {
                      const isActive = activeItem === item.name;
                      return (
                        <li key={item.name}>
                          <button
                            onClick={() => handleNavigation(item.path)}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all relative overflow-hidden outline-none"
                            style={{
                              color: isActive
                                ? "var(--color-active-text)"
                                : "var(--color-gray)",
                            }}
                          >
                            {isActive && (
                              <motion.div
                                className="absolute inset-0 rounded-xl pointer-events-none"
                                layoutId="mobileActiveBg"
                                style={{
                                  backgroundColor: "var(--color-active-bg)",
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 30,
                                }}
                              />
                            )}
                            <span className="text-lg font-semibold capitalize relative z-10">
                              {item.name}
                            </span>
                            {isActive && (
                              <span
                                className="text-sm ml-2 relative z-10"
                                style={{ color: "var(--color-gray)" }}
                              >
                                Current
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Footer */}
                <div
                  className="p-6 border-t"
                  style={{ borderColor: "var(--color-active-border)" }}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <ThemeToggle size={42} animationSpeed={0.6} />
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-gray)" }}
                    >
                      &copy; 2025 Masud ibn Belat. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
