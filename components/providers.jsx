"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AccessibilityProvider } from "@/components/accessibility-provider";

export function Providers({ children, initialAccessibilitySettings }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AccessibilityProvider initialSettings={initialAccessibilitySettings}>
        {children}
      </AccessibilityProvider>
    </NextThemesProvider>
  );
}
