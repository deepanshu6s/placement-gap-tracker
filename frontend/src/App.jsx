import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { useAuthStore } from './store/authStore';
import { Spinner } from './components/ui/Spinner';
import axios from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export const App = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const refreshRes = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = refreshRes.data.data;

          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Fetch authenticated user info
          const meRes = await axios.get(`${baseURL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const userData = meRes.data.data;
          const user = {
            id: userData.userId || userData.id,
            email: userData.email,
            role: userData.role,
          };

          if (isMounted) {
            setAuth(user, accessToken);
          }
        } catch (error) {
          console.warn('Session restoration failed:', error?.message);
          localStorage.removeItem('refreshToken');
          if (isMounted) {
            clearAuth();
          }
        }
      }

      if (isMounted) {
        setIsInitializing(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [setAuth, clearAuth]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-[#A3978D] animate-pulse">Initializing PlacementTracker...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
