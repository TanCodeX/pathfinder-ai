"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children, initialSettings }) {
  const [settings, setSettings] = useState({
    largeButtonsMode: initialSettings?.largeButtonsMode ?? false,
    highContrastMode: initialSettings?.highContrastMode ?? false,
    speechSpeed: initialSettings?.speechSpeed ?? 1.0,
    preferredLanguage: initialSettings?.preferredLanguage ?? "en",
    preferredVoiceLanguage: initialSettings?.preferredVoiceLanguage ?? "en",
    oneTapCameraMode: initialSettings?.oneTapCameraMode ?? false,
  });

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (settings.highContrastMode) {
      htmlElement.classList.add("high-contrast");
    } else {
      htmlElement.classList.remove("high-contrast");
    }

    if (settings.largeButtonsMode) {
      htmlElement.classList.add("large-buttons");
    } else {
      htmlElement.classList.remove("large-buttons");
    }
  }, [settings.highContrastMode, settings.largeButtonsMode]);

  return (
    <AccessibilityContext.Provider value={{ ...settings, updateSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
