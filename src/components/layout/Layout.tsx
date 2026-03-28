import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useApp } from '../../store/AppContext';

export default function Layout() {
  const { darkMode } = useApp();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className="md:ml-64 pt-[57px] pb-24 md:pb-0 min-h-screen animate-fade-up">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
