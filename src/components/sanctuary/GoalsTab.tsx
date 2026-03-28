import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import ConfirmDialog from '../ui/ConfirmDialog';
import ProgressBar from '../ui/ProgressBar';
import MaterialIcon from '../ui/MaterialIcon';

interface Props {
  subjectFilter: string | null;
}

export default function GoalsTab({ subjectFilter }: Props) {
  const { subjects, weeklyGoals, setWeeklyGoal, logGoalProgress, resetGoalProgress } = useApp();

  const [logAmounts, setLogAmounts] = useState<Record<string, string>>({});
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [newGoalInputs, setNewGoalInputs] = useState<Record<string, string>>({});

  const filteredSubjects = subjectFilter ? subjects.filter(s => s.id === subjectFilter) : subjects;

  function getGoal(subjectId: string) {
    return weeklyGoals.find(g => g.subjectId === subjectId);
  }

  function handleLog(goalId: string) {
    const amt = parseInt(logAmounts[goalId] ?? '', 10);
    if (!amt || amt < 1) return;
    logGoalProgress(goalId, amt);
    setLogAmounts(prev => ({ ...prev, [goalId]: '' }));
  }

  function handleSetGoal(subjectId: string) {
    const amt = parseInt(newGoalInputs[subjectId] ?? '', 10);
    if (!amt || amt < 1) return;
    setWeeklyGoal(subjectId, amt);
    setNewGoalInputs(prev => ({ ...prev, [subjectId]: '' }));
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <MaterialIcon name="inbox" className="text-outline" size={40} />
        <p className="text-on-surface-variant text-sm">Add subjects in Settings to set weekly goals.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredSubjects.map(sub => {
        const goal = getGoal(sub.id);

        if (!goal) {
          // No goal set — show a "set goal" card
          return (
            <div key={sub.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
                <span className="font-semibold text-on-surface text-sm">{sub.name}</span>
                <span className="ml-auto text-xs text-on-surface-variant/60 italic font-display">No goal set</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={newGoalInputs[sub.id] ?? ''}
                  onChange={e => setNewGoalInputs(prev => ({ ...prev, [sub.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSetGoal(sub.id)}
                  placeholder="Questions/week"
                  className="flex-1 bg-surface-container rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={() => handleSetGoal(sub.id)}
                  disabled={!newGoalInputs[sub.id] || parseInt(newGoalInputs[sub.id], 10) < 1}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Set Goal
                </button>
              </div>
            </div>
          );
        }

        // Goal exists — show progress card
        const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100));

        return (
          <div key={sub.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex flex-col gap-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
              <span className="font-semibold text-on-surface text-sm flex-1">{sub.name}</span>
              <div className="text-right">
                <span className="font-display font-black text-3xl text-primary leading-none">
                  {goal.progress}
                </span>
                <span className="font-display text-base text-on-surface-variant/50 leading-none">/{goal.target}</span>
              </div>
            </div>

            {/* Progress bar */}
            <ProgressBar value={goal.progress} total={goal.target} />

            {pct >= 100 && (
              <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
                <MaterialIcon name="celebration" size={14} />
                <span className="font-display italic">Goal reached!</span>
              </div>
            )}

            {/* Log progress */}
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={logAmounts[goal.id] ?? ''}
                onChange={e => setLogAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleLog(goal.id)}
                placeholder="Add questions..."
                className="flex-1 bg-surface-container rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={() => handleLog(goal.id)}
                disabled={!logAmounts[goal.id] || parseInt(logAmounts[goal.id], 10) < 1}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Log
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={() => setResetTarget(goal.id)}
              className="self-end text-xs text-on-surface-variant hover:text-error transition-colors flex items-center gap-1"
            >
              <MaterialIcon name="restart_alt" size={14} />
              Reset progress
            </button>
          </div>
        );
      })}

      {filteredSubjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <MaterialIcon name="bar_chart" className="text-outline" size={40} />
          <p className="text-on-surface-variant text-sm">No subjects match the current filter.</p>
        </div>
      )}

      <ConfirmDialog
        open={resetTarget !== null}
        onClose={() => setResetTarget(null)}
        onConfirm={() => { resetTarget && resetGoalProgress(resetTarget); setResetTarget(null); }}
        title="Reset Progress"
        message="This will reset progress to 0 for this week. The goal target stays the same."
        destructive
      />
    </div>
  );
}
