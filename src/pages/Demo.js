import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { useAuth } from "../contexts/AuthContext";
import { useStorage } from "../contexts/StorageContext";
import { useCategories } from "../contexts/CategoryContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../styles/theme";

// Demo credentials from environment variables
const DEMO_EMAIL = process.env.REACT_APP_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.REACT_APP_DEMO_PASSWORD;

const Demo = () => {
  const { login, isAuthenticated } = useAuth();
  const { refreshFromLocalStorage } = useStorage();
  const { refreshCategories } = useCategories();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const [error, setError] = useState(null);

  useEffect(() => {
    const autoLogin = async () => {
      // If already authenticated, just go to dashboard
      if (isAuthenticated) {
        navigate("/dashboard");
        return;
      }

      // Check if demo credentials are configured
      if (!DEMO_EMAIL || !DEMO_PASSWORD) {
        setError("Demo mode is not configured");
        message.error("Demo mode is not available");
        navigate("/login");
        return;
      }

      // Auto-login with demo credentials
      const result = await login(DEMO_EMAIL, DEMO_PASSWORD);

      if (result.success) {
        // Mark this session as demo mode
        sessionStorage.setItem("isDemoMode", "true");

        // Refresh contexts
        refreshFromLocalStorage();
        refreshCategories();

        navigate("/dashboard");
      } else {
        setError(result.error || "Failed to load demo");
        message.error("Failed to load demo. Please try again.");
        navigate("/login");
      }
    };

    autoLogin();
  }, [login, isAuthenticated, navigate, refreshFromLocalStorage, refreshCategories]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: theme.bg.primary,
        gap: 16,
      }}
    >
      {error ? (
        <div style={{ color: theme.text.secondary }}>{error}</div>
      ) : (
        <>
          <Spin size="large" />
          <div style={{ color: theme.text.secondary }}>Loading demo...</div>
        </>
      )}
    </div>
  );
};

export default Demo;
