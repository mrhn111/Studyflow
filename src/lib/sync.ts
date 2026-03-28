import supabase from './supabase';

const STORAGE_KEY = 'studyflow-v1';

export async function syncToSupabase(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    await supabase
      .from('user_app_data')
      .upsert(
        { user_id: user.id, data: JSON.parse(raw), updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
  } catch { /* silent fail */ }
}

export async function fetchFromSupabase(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from('user_app_data')
      .select('data')
      .eq('user_id', user.id)
      .single();
    if (data?.data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
