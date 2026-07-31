import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable
  }
  return null;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

const THEME_TRANSITION_CLASS = "theme-transition";
const THEME_TRANSITION_MS = 500;

let themeTransitionTimer: number | undefined;

function animateThemeChange() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.add(THEME_TRANSITION_CLASS);
  if (themeTransitionTimer !== undefined) {
    window.clearTimeout(themeTransitionTimer);
  }
  themeTransitionTimer = window.setTimeout(() => {
    root.classList.remove(THEME_TRANSITION_CLASS);
    themeTransitionTimer = undefined;
  }, THEME_TRANSITION_MS);
}

const THEME_CHANGE_EVENT = "themechange";

function dispatchThemeChange(theme: Theme) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }),
  );
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return getStoredTheme() ?? getSystemTheme();
  });

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    animateThemeChange();
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable
    }
    dispatchThemeChange(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next: Theme = current === "dark" ? "light" : "dark";
    setThemeState(next);
    applyTheme(next);
    animateThemeChange();
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable
    }
    dispatchThemeChange(next);
  }, []);

  // Sync theme on mount (in case the inline script hasn't run)
  useEffect(() => {
    const resolved = getStoredTheme() ?? getSystemTheme();
    applyTheme(resolved);
    setThemeState(resolved);
  }, []);

  // Listen for system theme changes when no stored preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const stored = getStoredTheme();
      if (!stored) {
        const sys = mq.matches ? "dark" : "light";
        setTheme(sys);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setTheme]);

  // Listen for theme changes from other components
  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent).detail as Theme;
      setThemeState(next);
    };
    window.addEventListener(THEME_CHANGE_EVENT, handler);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handler);
  }, []);

  return { theme, setTheme, toggleTheme };
}
