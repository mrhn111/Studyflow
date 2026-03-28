import { useState } from 'react';
import { useApp } from '../store/AppContext';
import SubjectChips from '../components/sanctuary/SubjectChips';
import OverviewTab from '../components/sanctuary/OverviewTab';
import HomeworkTab from '../components/sanctuary/HomeworkTab';
import ExamsTab from '../components/sanctuary/ExamsTab';
import GoalsTab from '../components/sanctuary/GoalsTab';

type Tab = 'overview' | 'homework' | 'exams' | 'goals';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'homework', label: 'Homework' },
  { id: 'exams', label: 'Exams' },
  { id: 'goals', label: 'Goals' },
];

export default function Sanctuary() {
  const { subjects } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-5">
      {/* Subject chips — visible on non-overview tabs */}
      {activeTab !== 'overview' && (
        <SubjectChips subjects={subjects} selected={subjectFilter} onSelect={setSubjectFilter} />
      )}

      {/* Tab bar — segmented control */}
      <div className="flex gap-1 bg-surface-container border border-outline-variant/20 rounded-2xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-sm transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm border border-outline-variant/15'
                : 'text-on-surface-variant font-medium hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'homework' && <HomeworkTab subjectFilter={subjectFilter} />}
      {activeTab === 'exams' && <ExamsTab subjectFilter={subjectFilter} />}
      {activeTab === 'goals' && <GoalsTab subjectFilter={subjectFilter} />}
    </div>
  );
}
