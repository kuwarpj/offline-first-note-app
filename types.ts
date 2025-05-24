export interface Note {
  id?: string;
  title: string;
  content: string;
  updatedAt?: string;
  synced?: boolean | "synced" | "unsynced" | "syncing" | "error";
}

export type NoteStatus = "offline" | "deleted";

export interface NoteWithStatus extends Note {
  status: NoteStatus;
}


export interface DebouncedFunction {
  (...args: any[]): void;
  cancel: () => void;
}
