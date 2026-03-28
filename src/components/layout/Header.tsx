import { NavLink } from 'react-router-dom';
import MaterialIcon from '../ui/MaterialIcon';

const navLinks = [
  { to: '/',         label: 'Sanctuary', end: true  },
  { to: '/focus',    label: 'Focus',     end: false },
  { to: '/library',  label: 'Library',   end: false },
  { to: '/settings', label: 'Settings',  end: false },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-outline-variant/25">
      <div className="flex justify-between items-center px-6 py-[14px] w-full max-w-7xl mx-auto">
        <div className="font-display font-black italic text-[24px] tracking-tight text-on-surface select-none">
          Studyflow
        </div>

        <nav className="hidden md:flex gap-7 items-center">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative text-sm font-semibold transition-colors pb-0.5 ${
                  isActive
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  <span
                    className={`absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-primary transition-transform duration-300 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all duration-150">
            <MaterialIcon name="notifications" size={20} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-center">
            <MaterialIcon name="person" className="text-on-surface-variant" size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
