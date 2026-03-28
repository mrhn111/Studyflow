import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import supabase from '../lib/supabase';
import { syncToSupabase, fetchFromSupabase } from '../lib/sync';

const SYNC_INTERVAL_MS = 5 * 60 * 1000;

export function useSync() {
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Track auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const syncNow = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);
    await syncToSupabase();
    setLastSynced(new Date());
    setIsSyncing(false);
  }, [user]);

  // 5-minute background sync when logged in
  useEffect(() => {
    if (!user) return;
    const id = setInterval(syncNow, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [user, syncNow]);

  async function signUp(email: string, password: string): Promise<string | null> {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return error.message;
      await syncToSupabase();
      setLastSynced(new Date());
      return null;
    } catch {
      return 'Sign up failed. Please try again.';
    }
  }

  async function signIn(email: string, password: string): Promise<string | null> {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return error.message;
      const fetched = await fetchFromSupabase();
      setLastSynced(new Date());
      if (fetched) window.location.reload();
      return null;
    } catch {
      return 'Sign in failed. Please try again.';
    }
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut();
    setLastSynced(null);
  }

  return { user, isSyncing, lastSynced, syncNow, signUp, signIn, signOut };
}
