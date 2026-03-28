import { useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from '../ui/MaterialIcon';

const tabs = [
  { path: '/',        icon: 'local_florist', label: 'Sanctuary', end: true  },
  { path: '/focus',   icon: 'timer',         label: 'Focus',     end: false },
  { path: '/library', icon: 'menu_book',     label: 'Library',   end: false },
  { path: '/settings',icon: 'settings',      label: 'Settings',  end: false },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  function isActive(path: string, end: boolean) {
    return end ? location.pathname === path : location.pathname.startsWith(path);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-around items-center px-3 pb-7 pt-2.5 bg-background/92 backdrop-blur-3xl border-t border-outline-variant/10 rounded-t-[28px] shadow-[0_-2px_20px_rgba(0,0,0,0.07)]">
      {tabs.map(({ path, icon, label, end }) => {
        const active = isActive(path, end);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center rounded-2xl px-5 py-2 transition-all duration-150 ${
              active
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <MaterialIcon name={icon} filled={active} size={22} />
            <span className="text-[10px] font-semibold tracking-wide mt-1">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
