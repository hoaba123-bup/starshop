import React, { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};

const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem(STORAGE_KEY, "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem(STORAGE_KEY, "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center gap-1 rounded-lg border border-slate-300/70 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-700 ${className ?? ""}`}
    >
      {theme === "dark" ? "🌞" : "⚫"}
      <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
    </button>
  );
};

export default ThemeToggle;
