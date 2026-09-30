import { RecentItem, TaskType } from '../types/index.ts';

const STORAGE_KEY = 'edugenie_recent_activities_v1';

export function getRecentActivities(): RecentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRecentActivity(item: {
  type: TaskType;
  title: string;
  preview: string;
  data: any;
}): RecentItem {
  const current = getRecentActivities();
  const newItem: RecentItem = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type: item.type,
    title: item.title,
    preview: item.preview.substring(0, 140),
    timestamp: Date.now(),
    data: item.data,
  };

  // Keep up to 25 items, prepend newest
  const updated = [newItem, ...current.filter((x) => x.title !== item.title || x.type !== item.type)].slice(0, 25);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }

  return newItem;
}

export function clearRecentActivities(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
