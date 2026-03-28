import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import MaterialIcon from '../ui/MaterialIcon';
import type { Subject } from '../../types';

const PRESET_SUBJECTS = [
  { name: 'Math',             color: '#4A90D9' },
  { name: 'Physics',          color: '#7B68EE' },
  { name: 'Chemistry',        color: '#FF6B6B' },
  { name: 'Biology',          color: '#51CF66' },
  { name: 'History',          color: '#CC5DE8' },
  { name: 'Geography',        color: '#339AF0' },
  { name: 'English',          color: '#FF922B' },
  { name: 'Literature',       color: '#F06595' },
  { name: 'Computer Science', color: '#74C0FC' },
  { name: 'Economics',        color: '#A9E34B' },
];

const EXTRA_COLORS = ['#FF6B6B','#51CF66','#339AF0','#CC5DE8','#FF922B','#74C0FC','#A9E34B','#F06595','#FCC419','#20C997'];

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customs, setCustoms] = useState<{name:string;color:string}[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [goals, setGoals] = useState<Record<string, string>>({});

  const allOptions = [...PRESET_SUBJECTS, ...customs];
  const selectedDetails = allOptions.filter(s => selected.has(s.name));

  function toggle(name: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function addCustom() {
    const name = customInput.trim();
    if (!name || allOptions.some(s => s.name.toLowerCase() === name.toLowerCase())) return;
    const color = EXTRA_COLORS[customs.length % EXTRA_COLORS.length];
    setCustoms(prev => [...prev, { name, color }]);
    setSelected(prev => new Set([...prev, name]));
    setCustomInput('');
  }

  function finish() {
    const subjects: Subject[] = allOptions
      .filter(s => selected.has(s.name))
      .map(s => ({ id: crypto.randomUUID(), name: s.name, color: s.color }));

    const goalsList = subjects
      .filter(s => goals[s.name] && Number(goals[s.name]) > 0)
      .map(s => ({ subjectId: s.id, target: Number(goals[s.name]) }));

    completeOnboarding(subjects, goalsList);
  }

  // ── Step 1 ─────────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-2xl w-full py-12">
          {/* Step dots */}
          <div className="flex justify-center gap-2 mb-8">
            <span className="w-6 h-1.5 rounded-full bg-primary" />
            <span className="w-2 h-1.5 rounded-full bg-outline-variant/50" />
          </div>
          <div className="text-center mb-10">
            <div className="font-display font-black text-5xl md:text-7xl tracking-tight text-on-surface mb-3 leading-[1.05]">
              Welcome to <span className="text-primary italic">Studyflow</span>
            </div>
            <p className="text-on-surface-variant text-base">What subjects are you studying?</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {allOptions.map(({ name, color }) => {
              const on = selected.has(name);
              return (
                <button
                  key={name}
                  onClick={() => toggle(name)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-semibold text-sm text-left transition-all duration-150 active:scale-[0.97] ${
                    on ? 'scale-[0.97] shadow-card' : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:-translate-y-0.5 hover:shadow-card hover:border-outline-variant/50'
                  }`}
                  style={on ? { backgroundColor: color + '1a', borderColor: color, color } : {}}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="flex-1 leading-snug">{name}</span>
                  {on && <MaterialIcon name="check" size={16} />}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 mb-8">
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="Add a custom subject..."
              className="flex-1 bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
            <button
              onClick={addCustom}
              disabled={!customInput.trim()}
              className="px-5 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold text-sm disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
            >
              Add
            </button>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={selected.size === 0}
            className="w-full py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-2xl font-bold text-lg shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 active:scale-[0.98] transition-all duration-200"
          >
            Next — Set Goals
          </button>
          {selected.size === 0 && (
            <p className="text-center text-xs text-on-surface-variant mt-3">Select at least one subject to continue</p>
          )}
        </div>
      </div>
    );
  }

  // ── Step 2 ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-lg w-full py-12">
        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-8">
          <span className="w-2 h-1.5 rounded-full bg-outline-variant/50" />
          <span className="w-6 h-1.5 rounded-full bg-primary" />
        </div>
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-4xl tracking-tight text-on-surface mb-2">Set Weekly Goals</h1>
          <p className="text-on-surface-variant text-sm">How many questions per week? Leave blank to skip.</p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {selectedDetails.map(({ name, color }) => (
            <div key={name} className="flex items-center gap-4 bg-surface-container-low border border-outline-variant/15 rounded-2xl p-4 shadow-card">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="font-semibold text-on-surface flex-1">{name}</span>
              <input
                type="number"
                min="1"
                placeholder="—"
                value={goals[name] ?? ''}
                onChange={e => setGoals(prev => ({ ...prev, [name]: e.target.value }))}
                className="w-20 text-center bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 font-bold text-sm"
              />
              <span className="text-xs text-on-surface-variant w-14">/ week</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="flex-1 py-4 border border-outline-variant/30 bg-transparent text-on-surface-variant rounded-2xl font-semibold hover:bg-surface-container-low transition-all duration-150"
          >
            Back
          </button>
          <button
            onClick={finish}
            className="flex-[2] py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-2xl font-bold text-lg shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
          >
            Let's go!
          </button>
        </div>
      </div>
    </div>
  );
}
