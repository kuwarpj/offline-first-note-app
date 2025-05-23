"use client";

import type { Note } from "@/types";
import { ApiRequest } from "@/utils/ApiRequest";
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
  setSelectedNoteId: string | null;
  searchTerm: string;
  isOnline: boolean;
  isMobile: boolean;
  activeMobileView: "list" | "editor";
  currentNote: Note | null | undefined;
  setSearchTerm: (term: string) => void;
  handleNewNote: () => void;
  handleSelectNote: (id: string) => void;
  handleDeleteNote: (id: string) => void;
  handleCloseEditor: () => void;
  handleSaveOrUpdateNote: any;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOnline, setIsOnlineState] = useState<boolean>(true);
  const [activeMobileView, setActiveMobileView] = useState<"list" | "editor">(
    "list"
  );
  const [currentNote, setCurrentNote] = useState<Note | null | undefined>(null);

  const handleNewNote = () => {
    // setSelectedNoteId(null);
    setCurrentNote({
      title: "",
      content: "",
      updatedAt: new Date().toISOString(),
      syncStatus: "unsynced",
    });
  };

  const getAllNotes = useCallback(async () => {
    try {
      const res = await ApiRequest("/api/v1/note/getnotes", "GET");

      if (res?.statusCode === 200) {
        const mappedNotes = res?.data.map((note: any) => ({
          id: note._id,
          title: note.title,
          content: note.content,
          updatedAt: note.updatedAt,
          syncStatus: note.synced ? "synced" : "unsynced",
        }));
        setNotes(mappedNotes);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const isMobile = false; // fallback for now

  useEffect(() => {
    getAllNotes();
  }, []);

  const handleSaveOrUpdateNote = useCallback(async (noteToSave: Note) => {
    try {
      const body = {
        title: noteToSave.title,
        content: noteToSave.content,
        synced: true,
      };

      let res;
      if (noteToSave.id) {
        // Update existing note
        res = await ApiRequest(`/api/v1/note/${noteToSave.id}`, "PUT", body);
      } else {
        // Create new note
        res = await ApiRequest("/api/v1/note/createnote", "POST", body);
      }

      if (res?.statusCode === 200) {
        toast(noteToSave.id ? "Note Updated" : "Note Created", {
          description: `Note has been ${
            noteToSave.id ? "updated" : "created"
          } successfully.`,
          duration: 3000,
          className: "bg-red-500 text-white",
        });

        getAllNotes();
        setSelectedNoteId(null);
        setCurrentNote(null);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  //function to delete the note
  const handleDeleteNote = useCallback(async (id: string) => {
    try {
      const res = await ApiRequest(`/api/v1/note/${id}`, "DELETE");

      if (res?.statusCode === 200) {
        toast("Note Deleted", {
          description: `"Note has been deleted.`,
          duration: 3000,
          className: "bg-red-500 text-white",
        });
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleSelectNote = (id: string) => {
    const selected = notes.find((note) => note.id === id);
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
        handleCloseEditor,
        searchTerm,
        isOnline,
        isMobile,
        activeMobileView,
        setSearchTerm,
        handleDeleteNote,
        handleSelectNote,
        currentNote,
        handleNewNote,
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
