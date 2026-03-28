import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import MaterialIcon from '../ui/MaterialIcon';

interface Props {
  subjectFilter: string | null;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ExamsTab({ subjectFilter }: Props) {
  const { exams, subjects, addExam, deleteExam } = useApp();

  const [addOpen, setAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const todayStr = today();

  const filtered = exams.filter(e => !subjectFilter || e.subjectId === subjectFilter);
  const upcoming = filtered.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
  const past = filtered.filter(e => e.date < todayStr).sort((a, b) => b.date.localeCompare(a.date));
  const sorted = [...upcoming, ...past];

  function subjectColor(id: string) {
    return subjects.find(s => s.id === id)?.color ?? '#adb3ae';
  }
  function subjectName(id: string) {
    return subjects.find(s => s.id === id)?.name ?? 'Unknown';
  }

  function openAdd() {
    setTitle(''); setSubjectId(subjectFilter ?? subjects[0]?.id ?? '');
    setDate(''); setNotes('');
    setAddOpen(true);
  }

  function handleAdd() {
    if (!title.trim() || !subjectId || !date) return;
    addExam({ title: title.trim(), subjectId, date, notes: notes.trim() || undefined });
    setAddOpen(false);
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <MaterialIcon name="inbox" className="text-outline" size={40} />
        <p className="text-on-surface-variant text-sm">Add subjects in Settings to track exams.</p>
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
          Add Exam
        </button>
      </div>

      {/* Exam list */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <MaterialIcon name="event_available" className="text-outline" size={40} />
          <p className="text-on-surface-variant text-sm">No exams scheduled. Fingers crossed it stays that way!</p>
        </div>
      ) : (
        sorted.map(exam => {
          const days = daysUntil(exam.date);
          const isPast = days < 0;
          const isExpanded = expandedId === exam.id;

          return (
            <div
              key={exam.id}
              className={`bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 ${isPast ? 'opacity-35' : ''}`}
            >
              {/* Row */}
              <button
                className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                onClick={() => setExpandedId(isExpanded ? null : exam.id)}
              >
                {/* Days countdown */}
                <div className="w-16 flex-shrink-0 text-center">
                  {isPast ? (
                    <span className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-wide">Past</span>
                  ) : days === 0 ? (
                    <span className="font-display font-black text-xl text-error leading-none">Today!</span>
                  ) : (
                    <>
                      <span className="font-display font-black text-4xl text-primary leading-none block">{days}</span>
                      <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-[0.15em]">days</span>
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-on-surface truncate">{exam.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subjectColor(exam.subjectId) }} />
                    <span className="text-xs text-on-surface-variant">{subjectName(exam.subjectId)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-on-surface-variant">{fmtDate(exam.date)}</span>
                  <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={18} className="text-outline" />
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-outline-variant/15">
                  {exam.notes ? (
                    <p className="text-sm text-on-surface-variant pt-2 whitespace-pre-wrap">{exam.notes}</p>
                  ) : (
                    <p className="text-sm text-outline pt-2 italic">No notes added.</p>
                  )}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setDeleteTarget(exam.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-error hover:bg-error/10 transition-all"
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

      {/* Add exam modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Exam">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Midterm Calculus"
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
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Date *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Topics covered, room number, etc."
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!title.trim() || !subjectId || !date}
            className="w-full py-3 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-btn hover:shadow-btn-hover hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
          >
            Add Exam
          </button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteTarget && deleteExam(deleteTarget); setDeleteTarget(null); }}
        title="Delete Exam"
        message="This exam will be permanently deleted."
        destructive
      />
    </div>
  );
}
