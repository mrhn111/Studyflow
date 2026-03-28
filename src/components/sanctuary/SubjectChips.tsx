import type { Subject } from '../../types';

interface SubjectChipsProps {
  subjects: Subject[];
  selected: string | null; // null = "All"
  onSelect: (id: string | null) => void;
}

export default function SubjectChips({ subjects, selected, onSelect }: SubjectChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-150 ${
          selected === null
            ? 'bg-primary text-on-primary border-primary shadow-sm'
            : 'bg-transparent text-on-surface-variant border-surface-container-high hover:border-outline-variant/40 hover:text-on-surface'
        }`}
      >
        All
      </button>
      {subjects.map(s => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-150"
          style={
            selected === s.id
              ? { backgroundColor: s.color + '18', color: s.color, borderColor: s.color + '60' }
              : {
                  backgroundColor: 'transparent',
                  color: 'rgb(var(--c-on-surface-variant))',
                  borderColor: 'rgb(var(--c-surface-container-high))',
                }
          }
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
          {s.name}
        </button>
      ))}
    </div>
  );
}
