import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Layout from './components/layout/Layout';
import Onboarding from './components/onboarding/Onboarding';
import Sanctuary from './pages/Sanctuary';
import Focus from './pages/Focus';
import Library from './pages/Library';
import Settings from './pages/Settings';

function AppRoutes() {
  const { hasCompletedOnboarding } = useApp();
  if (!hasCompletedOnboarding) return <Onboarding />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"         element={<Sanctuary />} />
        <Route path="/focus"    element={<Focus />} />
        <Route path="/library"  element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/schedule" element={<Navigate to="/focus" replace />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
