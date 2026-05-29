"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Mail,
  Mic,
  Copy,
  ScanSearch,
  Briefcase,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Diamond,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MENU_GROUPS = [
  {
    title: "Intelligence",
    items: [
      { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: "/ai-assistant", label: "AI Assistant", icon: <Bot className="h-4 w-4" /> },
      { href: "/ats-analyzer", label: "ATS Analyzer", icon: <ScanSearch className="h-4 w-4" /> },
    ]
  },
  {
    title: "Career Tools",
    items: [
      { href: "/resume", label: "Resumes", icon: <FileText className="h-4 w-4" /> },
      { href: "/ai-cover-letter", label: "Cover Letters", icon: <Mail className="h-4 w-4" /> },
      { href: "/interview", label: "Mock Interviews", icon: <Mic className="h-4 w-4" /> },
      { href: "/dashboard?tab=templates", label: "Templates", icon: <Copy className="h-4 w-4" /> },
    ]
  },
  {
    title: "System",
    items: [
      { href: "/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
    ]
  }
];

export default function AppSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border relative text-sidebar-foreground font-sans">
      {/* Brand Header */}
      <div className={cn(
        "pt-8 pb-6 px-6 flex items-center mb-4 transition-all duration-300",
        isOpen || isMobile ? "gap-3" : "justify-center"
      )}>
        <div className="relative group shrink-0">
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary to-purple-500 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-500" />
          <div className="relative h-9 w-9 bg-sidebar-primary rounded-xl flex items-center justify-center shadow-2xl">
            <Diamond className="h-5 w-5 text-sidebar-primary-foreground fill-current" />
          </div>
        </div>
        
        {(isOpen || isMobile) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col flex-1 min-w-0"
          >
            <span className="font-black text-lg tracking-tighter text-foreground leading-none">PathFinder <span className="text-primary">AI</span></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Enterprise Core</span>
          </motion.div>
        )}

        {!isMobile && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground hidden lg:block"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-8 custom-scrollbar">
        {MENU_GROUPS.map((group, idx) => (
          <div key={idx} className="space-y-3">
            {group.title && (isOpen || isMobile) && (
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]"
              >
                {group.title}
              </motion.h3>
            )}
            
            <div className="space-y-1">
              {group.items.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                return (
                  <Link 
                    key={`${link.href}-${link.label}`} 
                    href={link.href} 
                    onClick={() => isMobile && setIsOpen(false)}
                    title={!isOpen && !isMobile ? link.label : undefined}
                  >
                    <div className={cn(
                      "flex items-center rounded-2xl transition-all duration-300 relative group",
                      isOpen || isMobile ? "gap-3 px-4 py-3" : "justify-center p-3.5",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}>
                      {isActive && (
                        <motion.div 
                          layoutId="active-nav"
                          className="absolute left-0 w-1 h-6 bg-primary rounded-full" 
                        />
                      )}
                      
                      <div className={cn(
                        "shrink-0 transition-transform duration-300 group-hover:scale-110",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {link.icon}
                      </div>
                      
                      {(isOpen || isMobile) && (
                        <span className="text-sm font-bold tracking-tight">{link.label}</span>
                      )}
                      
                      {isActive && (isOpen || isMobile) && (
                        <Sparkles className="h-3 w-3 ml-auto text-primary opacity-50" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50 backdrop-blur-md">
        <div className={cn(
          "flex items-center rounded-2xl transition-all duration-300 border border-transparent hover:border-sidebar-border hover:bg-muted/50 cursor-pointer overflow-hidden",
          isOpen || isMobile ? "gap-3 p-3" : "justify-center p-2"
        )}>
          <div className="relative shrink-0">
            <UserButton 
              appearance={{ 
                elements: { 
                  avatarBox: "w-9 h-9 rounded-xl ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all shadow-lg" 
                } 
              }} 
            />
          </div>
          
          {(isOpen || isMobile) && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col flex-1 min-w-0"
            >
              <span className="text-xs font-black text-foreground truncate leading-tight">{user?.firstName || 'User Account'}</span>
              <span className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-widest mt-0.5">Pro Member</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMobile && !isOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-[70] rounded-2xl h-14 w-14 shadow-2xl bg-primary text-primary-foreground border-none hover:scale-110 transition-all"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ 
          width: isMobile ? (isOpen ? "85vw" : 0) : (isOpen ? 280 : 100), 
          x: isMobile ? (isOpen ? 0 : -320) : 0 
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={cn(
          "fixed lg:sticky top-0 left-0 z-[70] h-[100dvh] flex-shrink-0 overflow-visible shadow-2xl lg:shadow-none bg-sidebar transition-shadow duration-300",
          isOpen ? "shadow-2xl" : "shadow-none"
        )}
      >
        <div className="h-full w-full overflow-hidden">
          {sidebarContent}
        </div>
      </motion.div>
    </>
  );
}
