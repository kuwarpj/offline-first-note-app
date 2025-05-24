import { Note } from "@/types";
import { DBSchema, openDB } from "idb";

type NoteStatus = 'offline' | 'deleted';

interface NoteWithStatus extends Note {
  status: NoteStatus;
}

interface NotesDB extends DBSchema {
  'notes': {
    key: string;
    value: NoteWithStatus;
  };
}

const DB_NAME = 'notes-db';
const DB_VERSION = 2;    // <-- bump version to trigger upgrade
const STORE_NOTES = 'notes';

export const initDB = () =>
  openDB<NotesDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
      }
    },
  });

// Save or update a note
export const saveNote = async (note: Note, status: NoteStatus = 'offline') => {
  const db = await initDB();
  await db.put(STORE_NOTES, { ...note, status });
};

// Get all notes with a given status
export const getNotesByStatus = async (status: NoteStatus): Promise<NoteWithStatus[]> => {
  const db = await initDB();
  const allNotes = await db.getAll(STORE_NOTES);
  return allNotes.filter(note => note.status === status);
};

// Clear all notes with a given status
export const clearNotesByStatus = async (status: NoteStatus) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NOTES, 'readwrite');
  const store = tx.objectStore(STORE_NOTES);
  const allNotes = await store.getAll();
  for (const note of allNotes) {
    if (note.status === status && note.id !== undefined) {
      await store.delete(note.id);
    }
  }
  await tx.done;
};
