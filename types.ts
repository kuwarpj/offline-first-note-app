export interface Note {
  id?: string;
  title: string;
  content: string;
  updatedAt?: string; // ISO timestamp
  syncStatus?: 'synced' | 'unsynced' | 'syncing' | 'error';
}
