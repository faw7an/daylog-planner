import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider } from './hooks/useAuth';
import { getRouter } from './router';
import './styles.css';

const queryClient = new QueryClient();
const router = getRouter();
const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
