"use client";

import type { Note } from "@/types";
import { ApiRequest } from "@/utils/ApiRequest";
import {
  clearOfflineNotes,
  getAllOfflineNotes,
  saveNoteOffline,
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
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [currentNote, setCurrentNote] = useState<Note | null | undefined>(null);

  const getAllNotes = useCallback(async () => {
    try {
      const res = await ApiRequest("/api/v1/note/getnotes", "GET");

      if (res?.statusCode === 200) {
        const mappedNotes = res?.data.map((note: any) => ({
          id: note._id,
          title: note.title,
          content: note.content,
          updatedAt: note.updatedAt,
          synced: "synced" as const,
        }));
        
        // Merge with any existing unsynced notes
        setNotes(prevNotes => {
          const unsyncedNotes = prevNotes.filter(n => n.synced !== "synced");
          return [...mappedNotes, ...unsyncedNotes];
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, []);



  const isMobile = false; // fallback for now

  useEffect(() => {
    const loadInitialData = async () => {
      
      const offlineNotes = await getAllOfflineNotes();
      setNotes(prevNotes => [
        ...prevNotes,
        ...offlineNotes.map(note => ({
          ...note,
          synced: "unsynced" as const,
        })),
      ]);
      await getAllNotes();
    };
    loadInitialData();
  }, [getAllNotes]);

  const handleNewNote = () => {
    const newNote: Note = {
      title: "",
      content: "",
      updatedAt: new Date().toISOString(),
      synced: isOnline ? "unsynced" : "unsynced",
      id: `offline-${Date.now()}`,
    };
    setNotes(prev => [newNote, ...prev]);
    setCurrentNote(newNote);
    // setSelectedNoteId(newNote.id);
  };

  const handleSaveOrUpdateNote = useCallback(
    async (noteToSave: Note) => {
      const onlineStatus = navigator.onLine;
      const tempId = noteToSave.id?.startsWith("offline-") 
        ? noteToSave.id 
        : `offline-${Date.now()}`;

      // Update UI immediately
      setNotes(prevNotes => {
        const updatedNotes = [...prevNotes];
        const noteIndex = updatedNotes.findIndex(
          n => n.id === noteToSave.id || n.id === tempId
        );
        
        if (noteIndex !== -1) {
          updatedNotes[noteIndex] = {
            ...noteToSave,
            id: tempId,
            synced: onlineStatus ? "syncing" : "unsynced",
            updatedAt: new Date().toISOString(),
          };
        } else {
          updatedNotes.unshift({
            ...noteToSave,
            id: tempId,
            synced: onlineStatus ? "syncing" : "unsynced",
            updatedAt: new Date().toISOString(),
          });
        }
        return updatedNotes;
      });

      if (!onlineStatus) {
        await saveNoteOffline({
          ...noteToSave,
          id: tempId,
          synced: "unsynced",
          updatedAt: new Date().toISOString(),
        });
        toast("Offline", {
          description: "Note saved offline and will sync later.",
        });
        return;
      }

      try {
        const body = {
          title: noteToSave.title,
          content: noteToSave.content,
          synced: true
        };

        const isExistingNote = noteToSave.id && !noteToSave.id.startsWith("offline-");
        const res = isExistingNote
          ? await ApiRequest(`/api/v1/note/${noteToSave.id}`, "PUT", body)
          : await ApiRequest("/api/v1/note/createnote", "POST", body);

        if (res?.statusCode === 200) {
          setNotes(prevNotes => {
            const updatedNotes = prevNotes.map(n => 
              n.id === tempId || n.id === noteToSave.id
                ? {
                    ...n,
                    id: res.data._id || res.data.id,
                    synced: "synced",
                    updatedAt: res.data.updatedAt,
                  }
                : n
            );
            return updatedNotes;
          });

          toast(isExistingNote ? "Note Updated" : "Note Created", {
            description: `Note ${isExistingNote ? "updated" : "created"} successfully.`,
          });
        }
      } catch (error) {
        console.error(error);
        setNotes(prevNotes =>
          prevNotes.map(n =>
            n.id === tempId || n.id === noteToSave.id
              ? { ...n, synced: "error" }
              : n
          )
        );
      }
    },
    []
  );

  const syncOfflineNotes = useCallback(async () => {
    const offlineNotes = await getAllOfflineNotes();
    
    // Mark all offline notes as syncing
    setNotes(prevNotes => {
      const updatedNotes = [...prevNotes];
      offlineNotes.forEach(offlineNote => {
        const existingIndex = updatedNotes.findIndex(
          n => n.id === offlineNote.id || n.id === `offline-${offlineNote.id?.replace("offline-", "")}`
        );
        
        if (existingIndex !== -1) {
          updatedNotes[existingIndex] = {
            ...updatedNotes[existingIndex],
            synced: "syncing",
          };
        }
      });
      return updatedNotes;
    });

    for (const note of offlineNotes) {
      try {
        const { title, content } = note;
        const body = { title, content, synced: true  };

        const isExistingNote = note.id && !note.id.startsWith("offline-");
        const res = isExistingNote
          ? await ApiRequest(`/api/v1/note/${note.id}`, "PUT", body)
          : await ApiRequest("/api/v1/note/createnote", "POST", body);

        if (res?.statusCode === 200) {
          setNotes(prevNotes =>
            prevNotes.map(n =>
              n.id === note.id || n.id === `offline-${note.id?.replace("offline-", "")}`
                ? {
                    ...n,
                    id: res.data._id || res.data.id,
                    synced: "synced",
                    updatedAt: res.data.updatedAt,
                  }
                : n
            )
          );
        }
      } catch (err) {
        console.error("Failed syncing note", err);
        setNotes(prevNotes =>
          prevNotes.map(n =>
            n.id === note.id || n.id === `offline-${note.id?.replace("offline-", "")}`
              ? { ...n, synced: "error" }
              : n
          )
        );
      }
    }

    if (offlineNotes.length > 0) {
      await clearOfflineNotes();
      toast("Synced", { description: "Offline notes synced successfully." });
    }
  }, []);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        setNotes(prevNotes =>
          prevNotes.map(note =>
            note.synced === "unsynced" ? { ...note, synced: "syncing" } : note
          )
        );
        syncOfflineNotes();
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [syncOfflineNotes]);

  const handleDeleteNote = useCallback(
    async (id: string) => {
      try {
        // Don't try to delete offline-only notes from server
        if (!id.startsWith("offline-")) {
          const res = await ApiRequest(`/api/v1/note/${id}`, "DELETE");
          if (res?.statusCode !== 200) throw new Error("Delete failed");
        }

        setNotes(prev => prev.filter(note => note.id !== id));
        if (selectedNoteId === id) {
          setSelectedNoteId(null);
          setCurrentNote(null);
        }

        toast("Note Deleted", {
          description: `Note has been deleted.`,
          duration: 3000,
          className: "bg-red-500 text-white",
        });
      } catch (error) {
        console.log(error);
      }
    },
    [selectedNoteId]
  );

  const handleSelectNote = (id: string) => {
    const selected = notes.find(note => note.id === id);
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

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};