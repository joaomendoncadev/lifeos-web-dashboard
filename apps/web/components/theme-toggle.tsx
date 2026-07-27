"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("lifeos-theme");
    const shouldUseDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(shouldUseDark);
    document.documentElement.dataset.theme = shouldUseDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("lifeos-theme", next ? "dark" : "light");
  }

  return (
    <button className="icon-button" onClick={toggleTheme} aria-label="Alternar tema">
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
