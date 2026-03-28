import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import ProgressBar from '../ui/ProgressBar';
import MaterialIcon from '../ui/MaterialIcon';
import Modal from '../ui/Modal';

// ── Preset data for Add Subject modal ──────────────────────────────────────
const PRESET_SUBJECTS = [
  { name: 'Mathematics',      color: '#476550' },
  { name: 'Physics',          color: '#3d5c72' },
  { name: 'Chemistry',        color: '#72435c' },
  { name: 'Biology',          color: '#3d7245' },
  { name: 'English',          color: '#6b5c3d' },
  { name: 'History',          color: '#3d4b6b' },
  { name: 'Geography',        color: '#5c7243' },
  { name: 'Computer Science', color: '#3d6b63' },
  { name: 'Economics',        color: '#6b3d5c' },
  { name: 'Psychology',       color: '#5c3d6b' },
];
const PRESET_COLORS = ['#476550', '#3d5c72', '#72435c', '#3d7245', '#6b5c3d', '#3d4b6b'];

// ── Helpers ────────────────────────────────────────────────────────────────
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date(); now.setHours(0,0,0,0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function greeting(username: string) {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return username ? `${g}, ${username}` : g;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function OverviewTab() {
  const { username, homework, exams, weeklyGoals, subjects, addSubject } = useApp();
  const todayStr = today();

  // Add Subject modal state
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customName, setCustomName] = useState('');
  const [customColor, setCustomColor] = useState(PRESET_COLORS[0]);

  const existingNames = new Set(subjects.map(s => s.name.toLowerCase()));
  const isExisting = (name: string) => existingNames.has(name.toLowerCase());

  function togglePreset(name: string) {
    if (isExisting(name)) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function handleAddSelected() {
    selected.forEach(name => {
      const preset = PRESET_SUBJECTS.find(p => p.name === name)!;
      addSubject({ id: crypto.randomUUID(), name: preset.name, color: preset.color });
    });
    setSelected(new Set());
    setAddSubjectOpen(false);
  }

  function handleAddCustom() {
    if (!customName.trim()) return;
    addSubject({ id: crypto.randomUUID(), name: customName.trim(), color: customColor });
    setCustomName('');
  }

  function openModal() {
    setSelected(new Set());
    setCustomName('');
    setCustomColor(PRESET_COLORS[0]);
    setAddSubjectOpen(true);
  }

  // Overview data
  const todayHw = homework.filter(h => !h.completed && h.dueDate === todayStr);
  const upcomingHw = homework
    .filter(h => !h.completed && h.dueDate >= todayStr)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);
  const upcomingExams = exams
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 2);

  function subjectColor(id: string) {
    return subjects.find(s => s.id === id)?.color ?? '#adb3ae';
  }
  function subjectName(id: string) {
    return subjects.find(s => s.id === id)?.name ?? 'Unknown';
  }

  const priorityLabel = { low: 'Low', medium: 'Med', high: 'High' } as const;
  const priorityColor = { low: 'text-primary', medium: 'text-yellow-600', high: 'text-error' } as const;

  const isEmpty = weeklyGoals.length === 0 && upcomingExams.length === 0 && upcomingHw.length === 0 && todayHw.length === 0;

  return (
    <div className="flex flex-col gap-8 stagger-children">
      {/* Greeting + Add Subject button */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-4xl md:text-5xl leading-tight tracking-tight text-on-surface">
            {greeting(username)}
          </h1>
          <p className="text-on-surface-variant text-sm mt-2 font-medium">Here's what's on your plate today.</p>
        </div>
        <button
          onClick={openModal}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 mt-1 rounded-full text-sm font-semibold border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:border-outline-variant/50 transition-all duration-150"
        >
          <MaterialIcon name="add" size={16} />
          Add Subject
        </button>
      </div>

      {/* Today's homework */}
      <section>
        <h2 className="text-[10px] font-bold text-on-surface-variant/55 uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
          <span className="w-3 h-px bg-on-surface-variant/30" />
          Due Today
          <span className="flex-1 h-px bg-on-surface-variant/10" />
        </h2>
        {todayHw.length === 0 ? (
          <div className="bg-surface-container-low border border-outline-variant/25 rounded-2xl p-5 flex items-center gap-3 text-on-surface-variant text-sm shadow-card">
            <MaterialIcon name="check_circle" className="text-primary/70" size={20} />
            Nothing due today — nice work!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todayHw.map(h => (
              <div key={h.id} className="bg-surface-container-low border border-outline-variant/30 shadow-card rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subjectColor(h.subjectId) }} />
                <span className="flex-1 font-semibold text-on-surface text-sm">{h.title}</span>
                {h.priority && (
                  <span className={`text-xs font-bold ${priorityColor[h.priority]}`}>
                    {priorityLabel[h.priority]}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming homework */}
      {upcomingHw.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold text-on-surface-variant/55 uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
            <span className="w-3 h-px bg-on-surface-variant/30" />
            Coming Up
            <span className="flex-1 h-px bg-on-surface-variant/10" />
          </h2>
          <div className="flex flex-col gap-2">
            {upcomingHw.map(h => (
              <div key={h.id} className="bg-surface-container-low border border-outline-variant/30 shadow-card rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subjectColor(h.subjectId) }} />
                <div className="flex-1">
                  <p className="font-semibold text-on-surface text-sm">{h.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{subjectName(h.subjectId)}</p>
                </div>
                <span className="text-xs font-semibold text-on-surface-variant bg-surface-container border border-outline-variant/20 px-3 py-1 rounded-full">
                  {fmtDate(h.dueDate)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Exam countdowns */}
      {upcomingExams.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold text-on-surface-variant/55 uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
            <span className="w-3 h-px bg-on-surface-variant/30" />
            Exam Countdown
            <span className="flex-1 h-px bg-on-surface-variant/10" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingExams.map(e => {
              const days = daysUntil(e.date);
              return (
                <div key={e.id} className="bg-surface-container-low border border-outline-variant/30 shadow-card rounded-2xl p-5 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ backgroundColor: subjectColor(e.subjectId) }}
                  />
                  <div className="flex items-end gap-4 pl-3">
                    <div className="font-display font-black leading-none" style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', color: `rgb(var(--c-primary))` }}>
                      {days === 0 ? '!' : days}
                    </div>
                    <div className="mb-1">
                      <p className="text-[9px] font-bold text-on-surface-variant/55 uppercase tracking-[0.15em]">{days === 0 ? 'today' : 'days left'}</p>
                      <p className="font-bold text-on-surface text-sm mt-1 leading-tight">{e.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{subjectName(e.subjectId)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Weekly goals */}
      {weeklyGoals.length > 0 && (
        <section>
          <h2 className="text-[10px] font-bold text-on-surface-variant/55 uppercase tracking-[0.18em] mb-3 flex items-center gap-2">
            <span className="w-3 h-px bg-on-surface-variant/30" />
            Weekly Goals
            <span className="flex-1 h-px bg-on-surface-variant/10" />
          </h2>
          <div className="flex flex-col gap-2.5">
            {weeklyGoals.map(g => {
              const sub = subjects.find(s => s.id === g.subjectId);
              if (!sub) return null;
              return (
                <div key={g.id} className="bg-surface-container-low border border-outline-variant/30 shadow-card rounded-2xl p-4 flex items-center gap-4 hover:shadow-card-hover transition-all duration-200">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between mb-2.5">
                      <span className="text-sm font-semibold text-on-surface">{sub.name}</span>
                      <span className="font-display font-black text-lg text-primary leading-none">{g.progress}<span className="text-sm text-on-surface-variant/50 font-normal">/{g.target}</span></span>
                    </div>
                    <ProgressBar value={g.progress} total={g.target} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center animate-float">
            <MaterialIcon name="auto_awesome" className="text-primary/50" size={36} />
          </div>
          <div>
            <p className="font-display font-bold text-lg text-on-surface">Your sanctuary is calm.</p>
            <p className="text-on-surface-variant text-sm mt-1 max-w-xs">Add homework, exams, or goals to see your overview here.</p>
          </div>
        </div>
      )}

      {/* ── Add Subject Modal ─────────────────────────────────────────────── */}
      <Modal open={addSubjectOpen} onClose={() => setAddSubjectOpen(false)} title="Add Subject">
        <div className="flex flex-col gap-5">
          {/* Preset subjects */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-[0.15em] mb-3">Choose from presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_SUBJECTS.map(({ name, color }) => {
                const existing = isExisting(name);
                const isSelected = selected.has(name);
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={existing}
                    onClick={() => togglePreset(name)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-150 ${
                      existing
                        ? 'opacity-35 cursor-not-allowed border-outline-variant/20 text-on-surface-variant bg-transparent'
                        : isSelected
                        ? 'border-transparent text-white shadow-sm scale-[1.03]'
                        : 'border-outline-variant/30 text-on-surface-variant bg-transparent hover:border-outline-variant/60 hover:text-on-surface'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: color, borderColor: color }
                        : undefined
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: existing || isSelected ? 'white' : color, opacity: existing ? 0.5 : 1 }}
                    />
                    {name}
                    {existing && (
                      <MaterialIcon name="check" size={14} className="text-on-surface-variant/50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-outline-variant/20" />
            <span className="text-xs text-on-surface-variant/50 font-medium">or add a custom subject</span>
            <div className="flex-1 h-px bg-outline-variant/20" />
          </div>

          {/* Custom subject */}
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
              placeholder="Subject name…"
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex items-center gap-3">
              <p className="text-xs text-on-surface-variant/60 font-medium">Color:</p>
              <div className="flex gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCustomColor(c)}
                    className="w-7 h-7 rounded-full transition-all duration-150 flex items-center justify-center"
                    style={{ backgroundColor: c, boxShadow: customColor === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none' }}
                  />
                ))}
              </div>
              <button
                onClick={handleAddCustom}
                disabled={!customName.trim()}
                className="ml-auto px-4 py-2 bg-surface-container-high text-on-surface text-sm font-semibold rounded-xl hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Add Selected CTA */}
          <button
            onClick={handleAddSelected}
            disabled={selected.size === 0}
            className="w-full py-3 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-btn hover:shadow-btn-hover hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
          >
            {selected.size === 0
              ? 'Select subjects above'
              : `Add ${selected.size} Subject${selected.size > 1 ? 's' : ''}`}
          </button>
        </div>
      </Modal>
    </div>
  );
}
