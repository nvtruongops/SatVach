import {
  createContext,
  createSignal,
  createEffect,
  useContext,
  JSX,
  onMount,
} from "solid-js";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: () => ThemeMode;
  resolvedTheme: () => "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>();

function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

export const ThemeProvider = (props: { children: JSX.Element }) => {
  const stored =
    typeof window !== "undefined"
      ? (localStorage.getItem("satvach-theme") as ThemeMode | null)
      : null;
  const [theme, setThemeSignal] = createSignal<ThemeMode>(stored || "system");
  const [resolvedTheme, setResolvedTheme] = createSignal<"light" | "dark">(
    stored === "light" || stored === "dark" ? stored : getSystemTheme(),
  );

  const applyTheme = (mode: ThemeMode) => {
    const resolved = mode === "system" ? getSystemTheme() : mode;
    setResolvedTheme(resolved);

    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeSignal(mode);
    localStorage.setItem("satvach-theme", mode);
    applyTheme(mode);
  };

  const toggleTheme = () => {
    const current = theme();
    if (current === "light") setTheme("dark");
    else if (current === "dark") setTheme("system");
    else setTheme("light");
  };

  // Apply on mount
  onMount(() => {
    applyTheme(theme());

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme() === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handler);
    // Cleanup not needed in SolidJS onMount, but good practice
  });

  // React to theme signal changes
  createEffect(() => {
    applyTheme(theme());
  });

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};
