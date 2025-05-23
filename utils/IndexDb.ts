import { openDB, DBSchema } from 'idb';
import { Note } from '@/types';

interface NotesDB extends DBSchema {
  'offline-notes': {
    key: number;
    value: Note & { offline: true };
  };
}

const DB_NAME = 'notes-db';
const STORE_NAME = 'offline-notes';

export const initDB = () =>
  openDB<NotesDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });

export const saveNoteOffline = async (note: Note) => {
  const db = await initDB();
  await db.put(STORE_NAME, { ...note, offline: true });
};

export const getAllOfflineNotes = async (): Promise<(Note & { offline: true })[]> => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

export const clearOfflineNotes = async () => {
  const db = await initDB();
  await db.clear(STORE_NAME);
};
