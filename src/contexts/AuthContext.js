import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    // Don't clear IndexedDB on logout
    // Data is isolated by userId - each user only sees their own data
    // Just like cloud mode where we don't delete data from MongoDB on logout
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        // Token is invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  // Check if user is authenticated on mount
  useEffect(() => {
    if (token) {
      // Verify token and fetch user data
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && !data.error_status) {
        const { token, user } = data.data;

        // Fetch latest settings from backend to get correct storageMode
        try {
          const settingsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/v1/user/settings`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            if (!settingsData.error_status && settingsData.data?.settings) {
              // Update user object with correct settings from backend
              user.settings = settingsData.data.settings;

              // No need to clear IndexedDB on login
              // Data is isolated by userId, just like cloud mode
              // Each user only sees their own data through userId filtering
            }
          }
        } catch (error) {
          console.error('Failed to fetch settings after login:', error);
        }

        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const signup = async (name, email, password, storageMode = 'cloud') => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name || '', // Send empty string if not provided, backend will default it
          email,
          password,
          settings: {
            storageMode
          }
        })
      });

      const data = await response.json();

      if (response.ok && !data.error_status) {
        const { token, user } = data.data;

        // Ensure storage mode is set in user object
        if (!user.settings) {
          user.settings = {};
        }
        user.settings.storageMode = storageMode;

        // No need to clear IndexedDB on signup
        // Data is isolated by userId, just like cloud mode
        // New user will have no data yet, and won't see other users' data

        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Save storage mode to backend (in case signup didn't save it)
        try {
          const settingsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/v1/user/settings`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              storageMode: storageMode,
            }),
          });

          const settingsResult = await settingsResponse.json();
          console.log('Settings API response:', settingsResult);

          if (!settingsResponse.ok || settingsResult.error_status) {
            console.error('Backend failed to save storageMode:', settingsResult);
          }
        } catch (error) {
          console.error('Failed to save storage mode:', error);
          // Don't fail signup if this fails
        }

        return { success: true };
      } else {
        return { success: false, error: data.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
