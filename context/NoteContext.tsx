"use client";

import type { Note } from "@/types";
import { ApiRequest } from "@/utils/ApiRequest";
import {
  clearNotesByStatus,
  getNotesByStatus,
  saveNote,
} from "@/utils/IndexDb";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "sonner";

interface NotesContextType {
  notes: Note[];
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  searchTerm: string;
  isOnline: boolean;
  currentNote: Note | null | undefined;
  setSearchTerm: (term: string) => void;
  handleNewNote: () => void;
  handleSelectNote: (id: string) => void;
  handleDeleteNote: (id: string) => void;
  handleCloseEditor: () => void;
  handleSaveOrUpdateNote: (note: Note) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== "undefined" && navigator ? navigator.onLine : true
  );
  const [currentNote, setCurrentNote] = useState<Note | null | undefined>(null);

  //Init function to get all the note of indexDb if present
  const init = async () => {
    const offlineNotes = await getNotesByStatus("offline");
    const formattedOffline = offlineNotes.map((n) => ({
      ...n,
      synced: "unsynced" as const,
    }));

    setNotes(formattedOffline);

    // Get the onlien notes from the server
    if (isOnline) {
      try {
        const res = await ApiRequest("/api/v1/note/getnotes", "GET");
        if (res?.statusCode === 200) {
          const serverNotes = res.data.map((note: any) => ({
            id: note._id,
            title: note.title,
            content: note.content,
            updatedAt: note.updatedAt,
            synced: "synced" as const,
          }));

          // Merge ofline notes and Server notes in state to render in Ui
          setNotes((prev) => {
            const offlineIds = new Set(
              prev.filter((n) => n.synced !== "synced").map((n) => n.id)
            );
            const filteredServerNotes = serverNotes.filter(
              (sn: any) => !offlineIds.has(sn.id)
            );
            return [...filteredServerNotes, ...prev];
          });
        }
      } catch (error) {
        console.error("Failed to fetch notes from server:", error);
      }
    }
  };
  useEffect(() => {
    init();
  }, []);

  //Function to open a a new note modal and add it to UI immediately in Sidebar
  const handleNewNote = () => {
    //Case to prevent multiple unsaved note  creations
    const handleUnsavedNotes = notes.some(
      (note) =>
        note?.id &&
        note?.id.startsWith("offline-") &&
        note.title.trim() === "" &&
        note.content.trim() === ""
    );
    if (handleUnsavedNotes) {
      toast("Note already open", {
        description:
          "Finish or discard the current note before creating a new one.",
      });
      return;
    }

    const newNote: Note = {
      id: `offline-${Date.now()}`,
      title: "",
      content: "",
      updatedAt: new Date().toISOString(),
      synced: "unsynced",
    };

    setNotes((prev) => [newNote, ...prev]);
    setCurrentNote(newNote);
  };

  //Function to save and update note in Server
  const handleSaveOrUpdateNote = useCallback(async (note: Note) => {
    const offline = !navigator.onLine;
    const id = note.id || `offline-${Date.now()}`;

    const noteToSave: Note = {
      ...note,
      id,
      updatedAt: new Date().toISOString(),
      synced: offline ? "unsynced" : "syncing",
    };

    // Update local state
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = noteToSave;
        return copy;
      }
      return [noteToSave, ...prev];
    });

    if (offline) {
      await saveNote(noteToSave, "offline");
      toast("Saved Offline", { description: "Note will sync later." });
      return;
    }

    console.log("This is Note", note);
    //If online sync note to server on save
    try {
      const body = {
        title: note?.title,
        content: note?.content,
        synced: true,
      };

      const isExisting = note.id && !note.id.startsWith("offline-");
      const res = isExisting
        ? await ApiRequest(`/api/v1/note/${note.id}`, "PUT", body)
        : await ApiRequest("/api/v1/note/createnote", "POST", body);

      if (res?.statusCode === 200) {
        if (!isExisting) {
          handleCloseEditor();
        }
        init();
        toast(isExisting ? "Note Updated" : "Note Created", {
          description: "Saved successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to sync note:", error);
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, synced: "error" } : n))
      );
    }
  }, []);

  // Function to sync notes with server when user is back online
  const syncOfflineNotes = useCallback(async () => {
    const offlineNotes = await getNotesByStatus("offline");
    const deletedNotes = await getNotesByStatus("deleted");

    // Sync offline notes (create or update)
    const syncTasks = offlineNotes.map(async (note: Note) => {
      const { id, title, content } = note;
      const isExisting = id && !id.startsWith("offline-");
      const body = { title, content, synced: true };

      try {
        const res = isExisting
          ? await ApiRequest(`/api/v1/note/${id}`, "PUT", body)
          : await ApiRequest("/api/v1/note/createnote", "POST", body);

        if (res?.statusCode === 200) {
          setNotes((prev) =>
            prev.map((n) =>
              n.id === note.id
                ? {
                    ...n,
                    id: res?.data?._id || res?.data?.id,
                    synced: "synced",
                    updatedAt: res?.data?.updatedAt,
                  }
                : n
            )
          );
        }
      } catch (err) {
        console.error("Sync failed:", id, err);
      }
    });

    // Delete notes
    const deleteTasks = deletedNotes.map(async (note) => {
      try {
        await ApiRequest(`/api/v1/note/${note.id}`, "DELETE");
      } catch (err) {
        console.error("Delete failed:", note.id, err);
      }
    });

    await Promise.all([...syncTasks, ...deleteTasks]);

    // Clear Local changes and show toast
    if (offlineNotes.length) await clearNotesByStatus("offline");
    if (deletedNotes.length) await clearNotesByStatus("deleted");

    if (offlineNotes.length) {
      toast("Notes Synced", {
        description: "Offline notes synced to the server.",
      });
    }

    if (deletedNotes.length) {
      toast("Notes Deleted", {
        description: "Deleted notes synced with the server.",
      });
    }
  }, []);

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        syncOfflineNotes();
      }
    };
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, [syncOfflineNotes]);

  //function to delete note and save to deleted note to indexdb if action is perfom in offline mode
  const handleDeleteNote = useCallback(
    async (id: string) => {
      if (!navigator.onLine) {
        // Mark as deleted offline
        const noteToDelete = notes.find((n) => n.id === id);
        if (noteToDelete) {
          await saveNote(noteToDelete, "deleted");
        }
      } else {
        if (!id.startsWith("offline-")) {
          await ApiRequest(`/api/v1/note/${id}`, "DELETE");
        }
      }

      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
        setCurrentNote(null);
      }
      toast("Deleted", { description: "Note deleted." });
    },
    [notes, selectedNoteId]
  );

  const handleSelectNote = (id: string) => {
    const selected = notes.find((n) => n.id === id);
    setSelectedNoteId(id);
    setCurrentNote(selected || null);
  };

  const handleCloseEditor = () => {
    setSelectedNoteId(null);
    setCurrentNote(null);
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        selectedNoteId,
        setSelectedNoteId,
        searchTerm,
        isOnline,
        currentNote,
        setSearchTerm,
        handleNewNote,
        handleSelectNote,
        handleDeleteNote,
        handleCloseEditor,
        handleSaveOrUpdateNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("Error");
  return context;
};
