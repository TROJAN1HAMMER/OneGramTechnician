import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WaterPage } from './pages/WaterPage';
import { BinPage } from './pages/BinPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { AlertsPage } from './pages/AlertsPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { AccessSafetyPage } from './pages/AccessSafetyPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Guarded Layout component
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('jwt_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text-primary">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <DashboardPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/water"
            element={
              <ProtectedLayout>
                <WaterPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/bin"
            element={
              <ProtectedLayout>
                <BinPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/environment"
            element={
              <ProtectedLayout>
                <EnvironmentPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedLayout>
                <AlertsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/access-control"
            element={
              <ProtectedLayout>
                <AccessSafetyPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/devices/:id"
            element={
              <ProtectedLayout>
                <DeviceDetailPage />
              </ProtectedLayout>
            }
          />

          {/* Default Route Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
