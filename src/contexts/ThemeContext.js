import React, { createContext, useState, useContext, useEffect } from "react";
import { ConfigProvider, theme } from "antd";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Get system preference
  const getSystemTheme = () => {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  // Initialize theme mode from localStorage or default to 'system'
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem("themeMode");
    return saved || "system";
  });

  // Calculate actual isDark based on theme mode
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("themeMode");
    if (saved === "system" || !saved) {
      return getSystemTheme() === "dark";
    }
    return saved === "dark";
  });

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setIsDark(e.matches);
    };

    // Update initial state
    setIsDark(mediaQuery.matches);

    // Add listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  // Update isDark when themeMode changes
  useEffect(() => {
    if (themeMode === "system") {
      setIsDark(getSystemTheme() === "dark");
    } else {
      setIsDark(themeMode === "dark");
    }
  }, [themeMode]);

  // Save theme mode and update body attribute
  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
    // Update document body for global styling
    document.body.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [themeMode, isDark]);

  // Legacy toggleTheme for backward compatibility
  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      if (prevMode === "light") return "dark";
      if (prevMode === "dark") return "light";
      // If system, toggle to opposite of current system theme
      return getSystemTheme() === "dark" ? "light" : "dark";
    });
  };

  const themeConfig = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: isDark ? "#6366f1" : "#4f46e5",
      borderRadius: 12,
      fontSize: 14,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
      Layout: {
        headerBg: isDark ? "#0f172a" : "#ffffff",
        bodyBg: isDark ? "#0f172a" : "#f8fafc",
        siderBg: isDark ? "#1e293b" : "#ffffff",
      },
      Menu: {
        itemBg: "transparent",
        itemSelectedBg: isDark
          ? "rgba(99, 102, 241, 0.1)"
          : "rgba(79, 70, 229, 0.1)",
        itemSelectedColor: isDark ? "#818cf8" : "#4f46e5",
      },
      Button: {
        borderRadius: 10,
      },
      Input: {
        borderRadius: 10,
      },
      Select: {
        borderRadius: 10,
      },
    },
  };

  return (
    <ThemeContext.Provider
      value={{ isDark, themeMode, setThemeMode, toggleTheme }}
    >
      <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};
