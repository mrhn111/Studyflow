import { useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from '../ui/MaterialIcon';

const navItems = [
  { path: '/',        icon: 'local_florist', label: 'Sanctuary' },
  { path: '/focus',   icon: 'timer',         label: 'Focus'     },
  { path: '/library', icon: 'menu_book',     label: 'Library'   },
  { path: '/settings',icon: 'settings',      label: 'Settings'  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  function isActive(path: string) {
    return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  }

  return (
    <aside className="hidden md:flex flex-col py-8 gap-1 h-[calc(100vh-57px)] w-64 fixed left-0 top-[57px] bg-surface-container-low/90 border-r border-outline-variant/25 backdrop-blur-sm">
      {/* Brand */}
      <div className="px-6 mb-7">
        <h2 className="font-display font-black italic text-[22px] text-on-surface leading-none tracking-tight">Studyflow</h2>
        <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/45 font-bold mt-1.5">
          Deep Focus Mode
        </p>
        {/* Decorative rule */}
        <div className="mt-5 h-px bg-gradient-to-r from-primary/20 via-outline-variant/20 to-transparent" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1 px-3">
        {navItems.map(({ path, icon, label }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                active
                  ? 'bg-primary/12 text-primary font-bold shadow-card'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />
              )}
              <MaterialIcon name={icon} filled={active} size={20} />
              <span className="text-sm">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* CTA */}
      <div className="px-4 mt-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent mb-5" />
        <button
          onClick={() => navigate('/focus')}
          className="w-full py-3.5 bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-2xl font-bold shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 text-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <MaterialIcon name="timer" size={18} />
          Start Focus Session
        </button>
      </div>
    </aside>
  );
}
