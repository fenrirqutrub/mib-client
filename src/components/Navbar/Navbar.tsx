import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router";
import ThemeToggle from "./ThemeToggle";

type MenuItem = { readonly name: string; readonly path: string };

const MENU_CONFIG: MenuItem[] = [
  { name: "home", path: "/" },
  { name: "articles", path: "/articles" },
  { name: "photography", path: "/photography" },
];

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.75,
} as const;

const DRAWER_VARIANTS = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
} as const;

const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

const ICON_VARIANTS = {
  hidden: { opacity: 0, rotate: -90, scale: 0.7 },
  visible: { opacity: 1, rotate: 0, scale: 1.0 },
  exit: { opacity: 0, rotate: 90, scale: 0.7 },
} as const;

const ICON_TRANSITION = { duration: 0.15, ease: "easeInOut" } as const;
const DRAWER_TRANSITION = {
  type: "spring",
  damping: 30,
  stiffness: 300,
} as const;
const BACKDROP_TRANSITION = { duration: 0.2 } as const;

const NAV_BASE_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-bg)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  willChange: "transform",
};

const DRAWER_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-bg)",
  willChange: "transform",
};

const BACKDROP_STYLE: React.CSSProperties = { willChange: "opacity" };

const HAMBURGER_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-active-bg)",
  color: "var(--color-text)",
};

const ACTIVE_TAB_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-active-bg)",
  borderColor: "var(--color-active-border)",
};

const MOBILE_ACTIVE_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-active-bg)",
};

const HEADER_BORDER_STYLE: React.CSSProperties = {
  borderColor: "var(--color-active-border)",
};

const CLOSE_BTN_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-active-bg)",
  color: "var(--color-text)",
};

const ICON_SPAN_STYLE: React.CSSProperties = {
  willChange: "transform, opacity",
};

/* ─── NavItem (desktop) ──────────────────────────────────────────────────── */
interface NavItemProps {
  item: MenuItem;
  isActive: boolean;
  onClick: (path: string) => void;
}

const NavItem = memo<NavItemProps>(({ item, isActive, onClick }) => {
  const handleClick = useCallback(
    () => onClick(item.path),
    [item.path, onClick],
  );

  return (
    <li className="relative">
      <button
        onClick={handleClick}
        className="px-5 py-2.5 rounded-lg font-medium capitalize transition-colors cursor-pointer relative z-10 outline-none"
        style={{
          color: isActive ? "var(--color-active-text)" : "var(--color-gray)",
        }}
      >
        {item.name}
      </button>

      {isActive && (
        <motion.div
          layoutId="desktopActiveTab"
          className="absolute inset-0 rounded-lg border pointer-events-none"
          style={ACTIVE_TAB_STYLE}
          transition={SPRING_TRANSITION}
        />
      )}
    </li>
  );
});
NavItem.displayName = "NavItem";

/* ─── MobileNavItem ──────────────────────────────────────────────────────── */
const MobileNavItem = memo<NavItemProps>(({ item, isActive, onClick }) => {
  const handleClick = useCallback(
    () => onClick(item.path),
    [item.path, onClick],
  );

  return (
    <li>
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors relative overflow-hidden outline-none"
        style={{
          color: isActive ? "var(--color-active-text)" : "var(--color-gray)",
        }}
      >
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            layoutId="mobileActiveBg"
            style={MOBILE_ACTIVE_STYLE}
            transition={SPRING_TRANSITION}
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
});
MobileNavItem.displayName = "MobileNavItem";

const Navbar = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef<number | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const activeItem = useMemo(() => {
    const path = location.pathname;
    if (path === "/") return "home";
    return (
      MENU_CONFIG.find((m) => m.path !== "/" && path.startsWith(m.path))
        ?.name ?? "home"
    );
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        rafRef.current = null;
      });
    };

    setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((p) => !p), []);

  const handleNavigation = useCallback(
    (path: string) => {
      setMobileMenuOpen(false);
      navigate(path);
    },
    [navigate],
  );

  const handleLogo = useCallback(() => {
    navigate("/");
    const scrollTop = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    let target = 0;
    if (scrollTop <= 50) target = maxScroll;
    else if (maxScroll - scrollTop <= 50) target = 0;
    else target = scrollTop < maxScroll / 2 ? maxScroll : 0;
    window.scrollTo({ top: target, behavior: "smooth" });
  }, [navigate]);

  const navStyle = useMemo<React.CSSProperties>(
    () => ({
      ...NAV_BASE_STYLE,
      borderColor: scrolled ? "var(--color-active-border)" : "transparent",
    }),
    [scrolled],
  );

  return (
    <>
      <nav
        className={`fixed z-50 left-0 right-0 top-0 transition-[padding,border-color,box-shadow] duration-300 ${
          scrolled ? "py-3 border-b shadow-lg" : "py-4"
        }`}
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <button
              className="relative text-2xl md:text-3xl pacifico leading-none cursor-pointer outline-none select-none"
              aria-label="Go home"
              onClick={handleLogo}
              style={{ color: "var(--color-text)" }}
            >
              <span className="hidden md:inline-block">MiB</span>

              <span
                className="md:hidden block relative"
                style={{ lineHeight: 1 }}
              >
                {(
                  [
                    { x: 0.6, y: 0.6 },
                    { x: -0.6, y: -0.6 },
                    { x: 0, y: 0.9 },
                  ] as const
                ).map((o, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="absolute inset-0"
                    style={{ transform: `translate(${o.x}px,${o.y}px)` }}
                  >
                    MiB
                  </span>
                ))}
                <span className="relative z-10">MiB</span>
              </span>
            </button>

            <ul className="hidden md:flex items-center space-x-1 relative">
              {MENU_CONFIG.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={activeItem === item.name}
                  onClick={handleNavigation}
                />
              ))}
            </ul>

            <div className="flex items-center space-x-3">
              <div className="hidden md:block">
                <ThemeToggle size={35} animationSpeed={0.5} />
              </div>

              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2.5 rounded-lg z-[60] relative outline-none"
                style={HAMBURGER_STYLE}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={String(mobileMenuOpen)}
                    variants={ICON_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={ICON_TRANSITION}
                    className="flex"
                    style={ICON_SPAN_STYLE}
                  >
                    {mobileMenuOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[55] md:hidden bg-[var(--color-bg)] backdrop-blur-sm"
              variants={BACKDROP_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={BACKDROP_TRANSITION}
              onClick={closeMobileMenu}
              style={BACKDROP_STYLE}
            />

            <motion.div
              className="fixed inset-y-0 right-0 w-full max-w-md z-[56] md:hidden shadow-2xl overflow-hidden"
              variants={DRAWER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={DRAWER_TRANSITION}
              style={DRAWER_STYLE}
            >
              <div className="flex flex-col h-full">
                <div
                  className="flex items-center justify-between p-6 border-b"
                  style={HEADER_BORDER_STYLE}
                >
                  <h2
                    className="text-2xl font-bold pacifico"
                    style={{ color: "var(--color-text)" }}
                  >
                    MiB
                  </h2>
                  <motion.button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-full outline-none"
                    style={CLOSE_BTN_STYLE}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                <nav className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="space-y-1">
                    {MENU_CONFIG.map((item) => (
                      <MobileNavItem
                        key={item.name}
                        item={item}
                        isActive={activeItem === item.name}
                        onClick={handleNavigation}
                      />
                    ))}
                  </ul>
                </nav>

                <div className="p-6 border-t" style={HEADER_BORDER_STYLE}>
                  <div className="flex flex-col items-center space-y-4">
                    <ThemeToggle
                      size={42}
                      animationSpeed={0.6}
                      onClick={closeMobileMenu}
                    />
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
});

Navbar.displayName = "Navbar";

export default Navbar;
