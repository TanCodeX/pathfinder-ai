"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  LayoutDashboard,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Command,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const BREADCRUMB_MAP = {
  "/dashboard": "Overview",
  "/dashboard/salary": "Salary Intelligence",
  "/dashboard/trends": "Industry Trends",
  "/dashboard/skills": "Skills Gap",
  "/dashboard/recommendations": "Recommendations",
  "/dashboard/settings": "Settings",
};

const QUICK_ACTIONS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resume", label: "Resume Builder" },
  { href: "/interview", label: "Interview Prep" },
  { href: "/settings", label: "Settings" },
];

export default function DashboardNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((p) => !p);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
        setHelpOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const breadcrumb = Object.entries(BREADCRUMB_MAP).find(([path]) =>
    pathname.startsWith(path)
  );
  const currentPage = breadcrumb?.[1] ?? "Dashboard";

  const recentNotifications = [
    { id: 1, title: "New industry insight available", time: "2m ago", unread: true },
    { id: 2, title: "Salary data refreshed", time: "1h ago", unread: false },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-4 z-40 w-full transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-soft"
            : "bg-background/50 backdrop-blur-sm border-b border-border/30"
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left: Logo + Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden h-8 w-8 rounded-lg border border-border/40 bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-all shrink-0"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="h-3.5 w-3.5 text-foreground" />
                ) : (
                  <Menu className="h-3.5 w-3.5 text-foreground" />
                )}
              </button>

              <Link href="/dashboard" className="flex items-center gap-2 shrink-0 group">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md shadow-primary/20">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-extrabold tracking-tight text-foreground hidden sm:block">
                  PathFinder
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                <ChevronRight className="h-3 w-3" />
                <span className="font-semibold text-foreground">{currentPage}</span>
              </div>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-8">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-2.5 h-9 px-3.5 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/50 hover:border-border/60 transition-all duration-200 group"
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground/60 font-medium flex-1 text-left">
                  Quick search...
                </span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-border/40 bg-muted/50 text-[9px] font-bold text-muted-foreground/50">
                  <Command className="h-2.5 w-2.5" />K
                </kbd>
              </button>
            </div>

            {/* Right: Icons + User */}
            <div className="flex items-center gap-1.5">
              <ThemeToggle />

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="h-8 w-8 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-all duration-200 relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary border-2 border-background" />
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-border/50 bg-card shadow-glass-lg backdrop-blur-xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-border/30">
                          <p className="text-xs font-bold text-foreground">Notifications</p>
                        </div>
                        {recentNotifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <p className="text-xs text-muted-foreground">No notifications yet</p>
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-auto">
                            {recentNotifications.map((n) => (
                              <button
                                key={n.id}
                                className="w-full flex items-start gap-3 px-3.5 py-3 hover:bg-muted/30 transition-colors text-left"
                              >
                                <span
                                  className={cn(
                                    "h-2 w-2 rounded-full mt-1 shrink-0",
                                    n.unread ? "bg-primary" : "bg-muted-foreground/30"
                                  )}
                                />
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={cn(
                                      "text-xs",
                                      n.unread ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                                    )}
                                  >
                                    {n.title}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">{n.time}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Help */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setHelpOpen(!helpOpen)}
                  className="h-8 w-8 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-all duration-200"
                  aria-label="Help"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {helpOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setHelpOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-xl border border-border/50 bg-card shadow-glass-lg backdrop-blur-xl overflow-hidden"
                      >
                        {[
                          { label: "Documentation", href: "/help" },
                          { label: "Shortcuts", href: "/help/shortcuts" },
                          { label: "Support", href: "/help/support" },
                        ].map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setHelpOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 h-8 pl-1.5 pr-2 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/50 hover:border-border/60 transition-all duration-200"
                >
                  <div className="h-6 w-6 rounded-lg overflow-hidden">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                  <span className="hidden lg:block text-xs font-semibold text-foreground max-w-[80px] truncate">
                    {user?.firstName || "User"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground hidden lg:block" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-xl border border-border/50 bg-card shadow-glass-lg backdrop-blur-xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-border/30">
                          <p className="text-xs font-bold text-foreground truncate">
                            {user?.fullName || "User"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {user?.primaryEmailAddress?.emailAddress || ""}
                          </p>
                        </div>
                        <div className="p-1">
                          {[
                            { label: "Profile", href: "/dashboard/settings", icon: Settings },
                            { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {item.label}
                              </Link>
                            );
                          })}
                          <div className="border-t border-border/30 mt-1 pt-1">
                            <SignOutButton signOutUrl="/">
                              <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full">
                                <LogOut className="h-3.5 w-3.5" />
                                Logout
                              </button>
                            </SignOutButton>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-14 left-0 bottom-0 z-30 w-64 bg-background border-r border-border/50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setSearchOpen(true);
                    }}
                    className="text-xs text-muted-foreground/60 font-medium"
                  >
                    Quick search...
                  </button>
                </div>

                <nav className="space-y-1">
                  {QUICK_ACTIONS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
            >
              <div className="rounded-2xl border border-border/50 bg-card shadow-glass-xl backdrop-blur-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 h-12 border-b border-border/30">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pages, tools, and settings..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none font-medium"
                  />
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md border border-border/40 bg-muted/50 text-[9px] font-bold text-muted-foreground/50">
                    ESC
                  </kbd>
                </div>
                <div className="p-2 max-h-80 overflow-y-auto">
                  {QUICK_ACTIONS.filter(
                    (a) =>
                      !searchQuery ||
                      a.label.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  ))}
                  {QUICK_ACTIONS.filter(
                    (a) =>
                      !searchQuery ||
                      a.label.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-xs text-muted-foreground">No results found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
