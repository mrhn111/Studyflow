import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/AppContext';
import { useAmbientSound } from '../hooks/useAmbientSound';
import MaterialIcon from '../components/ui/MaterialIcon';
import type { AmbientSound } from '../types';

const POMODORO_SECONDS = 25 * 60;

const soundOptions: { id: AmbientSound; label: string; icon: string }[] = [
  { id: 'none', label: 'None', icon: 'volume_off' },
  { id: 'rain', label: 'Rain', icon: 'water_drop' },
  { id: 'whitenoise', label: 'White Noise', icon: 'waves' },
  { id: 'lofi', label: 'Lofi', icon: 'music_note' },
  { id: 'forest', label: 'Forest', icon: 'forest' },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function Focus() {
  const { homework } = useApp();
  const { selectedSound, setSelectedSound } = useAmbientSound();

  const [secondsLeft, setSecondsLeft] = useState(POMODORO_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsDone, setSessionsDone] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // First incomplete homework task, sorted by due date
  const todayStr = today();
  const nextTask = homework
    .filter(h => !h.completed)
    .sort((a, b) => {
      if (a.dueDate === todayStr && b.dueDate !== todayStr) return -1;
      if (b.dueDate === todayStr && a.dueDate !== todayStr) return 1;
      return a.dueDate.localeCompare(b.dueDate);
    })[0] ?? null;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setSessionsDone((d) => d + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(POMODORO_SECONDS);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((POMODORO_SECONDS - secondsLeft) / POMODORO_SECONDS) * 100;
  const circumference = 2 * Math.PI * 44;

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-12 py-10 flex flex-col items-center gap-8">
      {/* Title */}
      <div className="w-full">
        <h1 className="font-display font-black text-4xl tracking-tight text-on-surface">Focus Session</h1>
        <p className="text-sm text-on-surface-variant mt-1.5 font-medium">
          {sessionsDone > 0 ? `${sessionsDone} session${sessionsDone > 1 ? 's' : ''} completed today` : "Stay focused, you've got this."}
        </p>
      </div>

      {/* Current Task Pill */}
      <div className="w-full bg-tertiary-container/80 border border-outline-variant/25 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-card">
        <MaterialIcon name="spa" className="text-on-tertiary-container" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-on-tertiary-container/60 font-bold uppercase tracking-[0.14em]">Now Studying</p>
          <p className="text-on-tertiary-container font-bold text-base truncate mt-0.5">
            {nextTask?.title ?? 'Nothing due — enjoy the peace!'}
          </p>
        </div>
      </div>

      {/* Timer Circle */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Glow ring when running */}
        {isRunning && (
          <div
            className="absolute inset-4 rounded-full transition-opacity duration-700"
            style={{ boxShadow: '0 0 48px rgba(71,101,80,0.22), 0 0 96px rgba(71,101,80,0.10)' }}
          />
        )}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Outer halo */}
          <circle
            cx="50" cy="50" r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-outline-variant/20"
          />
          {/* Track */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-surface-container-highest"
          />
          {/* Progress */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-primary"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${circumference * (1 - progress / 100)}`}
            style={{
              transition: 'stroke-dashoffset 1s linear',
              filter: isRunning ? 'drop-shadow(0 0 6px rgba(71,101,80,0.6))' : 'none',
            }}
          />
        </svg>

        <div className="relative flex flex-col items-center">
          <span className="font-display font-black text-6xl text-on-surface tabular-nums leading-none">
            {pad(minutes)}:{pad(seconds)}
          </span>
          <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-[0.20em] mt-3 font-bold">
            {isRunning ? 'Focusing…' : secondsLeft === 0 ? 'Complete!' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={() => setIsRunning((r) => !r)}
          className="flex items-center gap-2 px-9 py-4 bg-gradient-to-br from-primary to-primary-dim text-on-primary rounded-full font-bold shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 text-base"
        >
          <MaterialIcon name={isRunning ? 'pause' : 'play_arrow'} size={22} />
          {isRunning ? 'Pause' : secondsLeft === 0 ? 'Restart' : 'Start'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-4 border border-outline-variant/30 bg-transparent text-on-surface-variant rounded-full font-semibold hover:bg-surface-container-low hover:border-outline-variant/50 active:scale-[0.97] transition-all duration-150 text-base"
        >
          <MaterialIcon name="restart_alt" size={20} />
          Reset
        </button>
      </div>

      {/* Ambient Sound Selector */}
      <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-[2rem] p-6 shadow-card">
        <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
          <MaterialIcon name="volume_up" className="text-primary" size={20} />
          Ambient Sound
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {soundOptions.map(({ id, label, icon }) => {
            const active = selectedSound === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedSound(id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-150 active:scale-[0.97] border ${
                  active
                    ? 'bg-primary-container text-on-secondary-container shadow-card border-primary/30'
                    : 'bg-transparent text-on-surface-variant border-outline-variant/25 hover:bg-surface-container hover:border-outline-variant/45'
                }`}
              >
                <MaterialIcon name={icon} size={20} filled={active} />
                <span>{label}</span>
                {active && <MaterialIcon name="graphic_eq" size={16} className="ml-auto text-primary" />}
              </button>
            );
          })}
        </div>
        {selectedSound !== 'none' && (
          <p className="text-xs text-on-surface-variant mt-3 text-center">
            Playing: <span className="font-bold text-primary capitalize">{selectedSound === 'whitenoise' ? 'White Noise' : selectedSound}</span>
          </p>
        )}
      </div>
    </div>
  );
}
