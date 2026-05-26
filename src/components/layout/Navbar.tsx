"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FiBook, FiCode, FiHome, FiLogIn, FiLogOut, FiMenu, FiUser, FiX } from "react-icons/fi";

const navItems = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/topics", label: "Topics", icon: FiBook },
  { href: "/problems", label: "Problems", icon: FiCode },
  { href: "/profile", label: "Profile", icon: FiUser },
];

const slideInFromRight = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 320, damping: 32 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  const renderAuthButton = (mobile = false) => {
    const sharedClasses = mobile
      ? "w-full justify-center px-4 py-3 rounded-2xl text-sm font-medium"
      : "px-4 py-2 rounded-xl text-sm font-medium";

    if (session) {
      return (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setMobileOpen(false);
            signOut();
          }}
          className={`inline-flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all ${sharedClasses}`}
        >
          <FiLogOut size={16} />
          <span>Sign Out</span>
        </motion.button>
      );
    }

    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          setMobileOpen(false);
          signIn("google");
        }}
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all ${sharedClasses}`}
      >
        <FiLogIn size={16} />
        <span>Sign In</span>
      </motion.button>
    );
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="safe-area-top fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl"
      >
        <div className="responsive-container">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link href="/" className="group flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-purple-500/20"
              >
                D
              </motion.div>
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold tracking-[0.24em] text-purple-300/80 uppercase">
                  Learn by seeing
                </span>
                <span className="block truncate text-base font-bold text-white transition-colors group-hover:text-purple-300 sm:text-lg">
                  DSA Visualizer
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/10"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <item.icon size={16} />
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-purple-500"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex">{renderAuthButton()}</div>

              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-200 shadow-lg shadow-black/20 transition-colors hover:border-purple-400/40 hover:text-white lg:hidden"
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
              >
                {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-gray-950/70 backdrop-blur-md lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close mobile navigation"
            />

            <motion.aside
              id="mobile-navigation"
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="safe-area-top safe-area-bottom fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-gray-950/95 px-5 py-6 shadow-2xl shadow-black/50 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-300/80">Navigation</p>
                  <p className="mt-1 text-sm text-gray-400">Explore topics, problems, and your progress.</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-200 transition-colors hover:border-purple-400/40 hover:text-white"
                  aria-label="Close drawer"
                >
                  <FiX size={18} />
                </motion.button>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <Link href={item.href} onClick={() => setMobileOpen(false)}>
                        <div
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 transition-all ${
                            isActive
                              ? "border-purple-500/30 bg-purple-500/15 text-purple-200"
                              : "border-white/5 bg-white/5 text-gray-300 hover:border-white/10 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-3 text-sm font-medium">
                            <item.icon size={18} />
                            {item.label}
                          </span>
                          <span className="text-lg" aria-hidden="true">→</span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 border-t border-white/10 pt-5"
              >
                {renderAuthButton(true)}
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div style={{ height: "calc(4rem + env(safe-area-inset-top, 0px))" }} />
    </>
  );
}
