import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import MaterialIcon from '../ui/MaterialIcon';
import type { Priority, Subtask } from '../../types';

interface Props {
  subjectFilter: string | null;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const priorityStyles: Record<Priority, string> = {
  low: 'bg-primary/10 text-primary',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-error/10 text-error',
};
const priorityLabel: Record<Priority, string> = { low: 'Low', medium: 'Med', high: 'High' };

export default function HomeworkTab({ subjectFilter }: Props) {
  const { homework, subjects, addHomework, updateHomework, deleteHomework, toggleSubtask } = useApp();

  const [addOpen, setAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Add form state
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [description, setDescription] = useState('');
  const [subtaskInputs, setSubtaskInputs] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const todayStr = today();

  const filtered = homework.filter(h => !subjectFilter || h.subjectId === subjectFilter);
  const incomplete = filtered.filter(h => !h.completed).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const completed = filtered.filter(h => h.completed).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  const sorted = [...incomplete, ...completed];

  function subjectColor(id: string) {
    return subjects.find(s => s.id === id)?.color ?? '#adb3ae';
  }
  function subjectName(id: string) {
    return subjects.find(s => s.id === id)?.name ?? 'Unknown';
  }

  function openAdd() {
    setTitle(''); setSubjectId(subjectFilter ?? subjects[0]?.id ?? '');
    setDueDate(''); setPriority(''); setDescription('');
    setSubtaskInputs([]); setNewSubtask('');
    setAddOpen(true);
  }

  function addSubtaskLine() {
    if (!newSubtask.trim()) return;
    setSubtaskInputs(prev => [...prev, newSubtask.trim()]);
    setNewSubtask('');
  }

  function handleAdd() {
    if (!title.trim() || !subjectId || !dueDate) return;
    const subtasks: Subtask[] = subtaskInputs.map(t => ({
      id: crypto.randomUUID(), title: t, completed: false,
    }));
    addHomework({
      title: title.trim(), subjectId, dueDate,
      priority: priority || undefined,
      description: description.trim() || undefined,
      subtasks, completed: false,
    });
    setAddOpen(false);
  }

  function dueBadgeClass(dateStr: string, isDone: boolean) {
    if (isDone) return 'bg-surface-container text-on-surface-variant';
    if (dateStr < todayStr) return 'bg-error/10 text-error';
    if (dateStr === todayStr) return 'bg-yellow-100 text-yellow-700';
    return 'bg-surface-container text-on-surface-variant';
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <MaterialIcon name="inbox" className="text-outline" size={40} />
        <p className="text-on-surface-variant text-sm">Add subjects in Settings to track homework.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-full text-sm font-bold shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
        >
          <MaterialIcon name="add" size={18} />
          Add Homework
        </button>
      </div>

      {/* Task list */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <MaterialIcon name="check_circle" className="text-outline" size={40} />
          <p className="text-on-surface-variant text-sm">No homework here. Enjoy the peace!</p>
        </div>
      ) : (
        sorted.map(task => {
          const isExpanded = expandedId === task.id;
          return (
            <div
              key={task.id}
              className={`bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 ${task.completed ? 'opacity-40' : ''}`}
            >
              {/* Row */}
              <button
                className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                onClick={() => setExpandedId(isExpanded ? null : task.id)}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: subjectColor(task.subjectId) }} />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm text-on-surface truncate ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-on-surface-variant">{subjectName(task.subjectId)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.priority && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityStyles[task.priority]}`}>
                      {priorityLabel[task.priority]}
                    </span>
                  )}
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${dueBadgeClass(task.dueDate, task.completed)}`}>
                    {fmtDate(task.dueDate)}
                  </span>
                  <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={18} className="text-outline" />
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-outline-variant/15">
                  {task.description && (
                    <p className="text-sm text-on-surface-variant pt-2">{task.description}</p>
                  )}
                  {task.subtasks.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      {task.subtasks.map(st => (
                        <label key={st.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => toggleSubtask(task.id, st.id)}
                            className="accent-primary w-4 h-4 rounded"
                          />
                          <span className={`text-sm ${st.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                            {st.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => updateHomework(task.id, { completed: !task.completed })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                        task.completed
                          ? 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                          : 'bg-primary text-on-primary shadow-btn hover:shadow-btn-hover hover:opacity-95'
                      }`}
                    >
                      <MaterialIcon name={task.completed ? 'undo' : 'check'} size={14} />
                      {task.completed ? 'Undo' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(task.id)}
                      className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-error hover:bg-error/10 transition-all"
                    >
                      <MaterialIcon name="delete" size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Add homework modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Homework">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Chapter 5 exercises"
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Subject *</label>
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">— select —</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Due Date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(priority === p ? '' : p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    priority === p ? priorityStyles[p] + ' ring-2 ring-primary/30' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {priorityLabel[p]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional notes..."
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Subtasks</label>
            {subtaskInputs.map((st, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-outline flex-shrink-0" />
                <span className="text-sm text-on-surface flex-1">{st}</span>
                <button onClick={() => setSubtaskInputs(prev => prev.filter((_, j) => j !== i))} className="text-outline hover:text-error transition-colors">
                  <MaterialIcon name="close" size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubtaskLine()}
                placeholder="Add a subtask..."
                className="flex-1 bg-surface-container rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button onClick={addSubtaskLine} className="px-3 py-2 bg-surface-container-high rounded-xl text-on-surface-variant hover:bg-surface-container-highest transition-all">
                <MaterialIcon name="add" size={16} />
              </button>
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!title.trim() || !subjectId || !dueDate}
            className="w-full py-3 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-btn hover:shadow-btn-hover hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
          >
            Add Task
          </button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteTarget && deleteHomework(deleteTarget); setDeleteTarget(null); }}
        title="Delete Task"
        message="This task will be permanently deleted."
        destructive
      />
    </div>
  );
}
