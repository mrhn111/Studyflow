import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useSync } from '../hooks/useSync';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import MaterialIcon from '../components/ui/MaterialIcon';
import type { Subject } from '../types';

function formatLastSynced(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
}

const PRESET_COLORS = ['#476550', '#5b7fa6', '#a64e4e', '#8a6b2e', '#6b4ea6', '#2e7a6b'];

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="font-display italic text-sm text-on-surface-variant/70 mb-3">
      {children}
    </h2>
  );
}

export default function Settings() {
  const {
    username, setUsername,
    subjects, addSubject, removeSubject,
    darkMode, setDarkMode,
    resetAllData,
  } = useApp();

  // Profile
  const [nameInput, setNameInput] = useState(username);

  // Subjects
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [removeSubjectTarget, setRemoveSubjectTarget] = useState<string | null>(null);

  // Data reset
  const [resetOpen, setResetOpen] = useState(false);

  // Sync & auth
  const { user, isSyncing, lastSynced, syncNow, signUp, signIn, signOut } = useSync();
  const [authMode, setAuthMode] = useState<'signup' | 'login' | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  async function handleAuth() {
    setAuthLoading(true);
    setAuthError('');
    const err = authMode === 'signup'
      ? await signUp(authEmail, authPassword)
      : await signIn(authEmail, authPassword);
    setAuthLoading(false);
    if (err) {
      setAuthError(err);
    } else {
      setAuthMode(null);
      setAuthEmail('');
      setAuthPassword('');
    }
  }

  function handleAddSubject() {
    const name = newSubjectName.trim();
    if (!name) return;
    const subject: Subject = { id: crypto.randomUUID(), name, color: selectedColor };
    addSubject(subject);
    setNewSubjectName('');
    setSelectedColor(PRESET_COLORS[0]);
  }

  function handleUsernameBlur() {
    setUsername(nameInput.trim());
  }

  return (
    <div className="max-w-lg mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-3xl tracking-tight text-on-surface">Settings</h1>
      </div>

      {/* Sync & Account */}
      <section>
        <SectionHeading>Sync & Account</SectionHeading>
        <div className="bg-surface-container-low border border-outline-variant/25 rounded-2xl p-4 shadow-card flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MaterialIcon name="person" className="text-primary" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{user.email}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {lastSynced ? `Last synced: ${formatLastSynced(lastSynced)}` : 'Not synced yet'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={syncNow}
                  disabled={isSyncing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-btn hover:shadow-btn-hover hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <MaterialIcon name={isSyncing ? 'sync' : 'cloud_upload'} size={16} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Syncing…' : 'Sync Now'}
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant/30 text-error rounded-xl text-sm font-semibold hover:bg-error/10 transition-all"
                >
                  <MaterialIcon name="logout" size={16} />
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-semibold text-on-surface">Sync across devices</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Sign up or log in to save your data to the cloud.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthEmail(''); setAuthPassword(''); }}
                  className="flex-1 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-btn hover:shadow-btn-hover hover:opacity-95 transition-all"
                >
                  Sign up
                </button>
                <button
                  onClick={() => { setAuthMode('login'); setAuthError(''); setAuthEmail(''); setAuthPassword(''); }}
                  className="flex-1 py-2 border border-outline-variant/30 text-on-surface-variant rounded-xl text-sm font-semibold hover:bg-surface-container transition-all"
                >
                  Log in
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Profile */}
      <section>
        <SectionHeading>Profile</SectionHeading>
        <div className="bg-surface-container-low border border-outline-variant/25 rounded-2xl p-4 shadow-card">
          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Your name</label>
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={handleUsernameBlur}
            onKeyDown={e => e.key === 'Enter' && handleUsernameBlur()}
            placeholder="e.g. Alex"
            className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="text-xs text-on-surface-variant mt-1.5">Shown in the Sanctuary greeting.</p>
        </div>
      </section>

      {/* Subjects */}
      <section>
        <SectionHeading>Subjects</SectionHeading>
        <div className="bg-surface-container-low border border-outline-variant/25 rounded-2xl p-4 flex flex-col gap-3 shadow-card">
          {subjects.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-2">No subjects yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {subjects.map(s => (
                <div key={s.id} className="flex items-center gap-3 py-1">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="flex-1 text-sm font-medium text-on-surface">{s.name}</span>
                  <button
                    onClick={() => setRemoveSubjectTarget(s.id)}
                    className="text-outline hover:text-error transition-colors p-1"
                    aria-label={`Remove ${s.name}`}
                  >
                    <MaterialIcon name="close" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add subject */}
          <div className="border-t border-outline-variant/25 pt-3 flex flex-col gap-2">
            <input
              type="text"
              value={newSubjectName}
              onChange={e => setNewSubjectName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
              placeholder="Subject name"
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-all duration-150 ${selectedColor === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
              <button
                onClick={handleAddSubject}
                disabled={!newSubjectName.trim()}
                className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-btn hover:shadow-btn-hover hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
              >
                <MaterialIcon name="add" size={16} />
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section>
        <SectionHeading>Appearance</SectionHeading>
        <div className="bg-surface-container-low border border-outline-variant/25 rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">Dark Mode</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Easier on the eyes at night.</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 border ${darkMode ? 'bg-primary border-primary' : 'bg-surface-container-highest border-outline-variant/30'}`}
              aria-label="Toggle dark mode"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Data */}
      <section>
        <SectionHeading>Data</SectionHeading>
        <div className="bg-surface-container-low border border-outline-variant/25 rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">Reset All Data</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Clears everything and restarts onboarding.</p>
            </div>
            <button
              onClick={() => setResetOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-error/10 text-error rounded-xl text-sm font-bold hover:bg-error/20 transition-all"
            >
              <MaterialIcon name="delete_forever" size={16} />
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Auth modal */}
      <Modal
        open={authMode !== null}
        onClose={() => setAuthMode(null)}
        title={authMode === 'signup' ? 'Create Account' : 'Log In'}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Email</label>
            <input
              type="email"
              value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              placeholder="you@example.com"
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Password</label>
            <input
              type="password"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              placeholder="••••••••"
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {authError && (
            <p className="text-sm text-error bg-error/10 rounded-xl px-3 py-2">{authError}</p>
          )}
          <button
            onClick={handleAuth}
            disabled={authLoading || !authEmail.trim() || !authPassword}
            className="w-full py-3 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-btn hover:shadow-btn-hover hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
          >
            {authLoading ? 'Please wait…' : authMode === 'signup' ? 'Create Account' : 'Log In'}
          </button>
          <button
            onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
            className="text-xs text-on-surface-variant text-center hover:text-primary transition-colors"
          >
            {authMode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </Modal>

      {/* Confirm remove subject */}
      <ConfirmDialog
        open={removeSubjectTarget !== null}
        onClose={() => setRemoveSubjectTarget(null)}
        onConfirm={() => {
          removeSubjectTarget && removeSubject(removeSubjectTarget);
          setRemoveSubjectTarget(null);
        }}
        title="Remove Subject"
        message="This will also delete all homework, exams, goals, and notes for this subject."
        destructive
      />

      {/* Confirm reset all */}
      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => { resetAllData(); setResetOpen(false); }}
        title="Reset All Data"
        message="All your data will be permanently deleted and you'll be taken back to onboarding. This cannot be undone."
        destructive
      />
    </div>
  );
}
