"use client";

import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      try {
        const raw = localStorage.getItem("fos_user");
        if (raw) {
          const user = JSON.parse(raw);
          const theme = (user as Record<string, unknown>)?.theme as string | undefined;
          if (theme === "light") {
            document.documentElement.classList.remove("dark");
          } else if (theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);
          }
        } else {
          document.documentElement.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);
        }
      } catch {
        document.documentElement.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    };

    applyTheme();
    queueMicrotask(() => setMounted(true));

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", applyTheme);
    window.addEventListener("storage", applyTheme);

    return () => {
      mq.removeEventListener("change", applyTheme);
      window.removeEventListener("storage", applyTheme);
    };
  }, []);

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <>{children}</>;
}
