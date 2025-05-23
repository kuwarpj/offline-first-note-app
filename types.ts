export interface Note {
  id?: string;
  title: string;
  content: string;
  updatedAt?: string;
  syncStatus?: "synced" | "unsynced" | "syncing" | "error";
}
