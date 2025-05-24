"use client";

import type { Note, NoteWithStatus } from "@/types";
import { NoteListItem } from "./NoteListItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { getNotesByStatus } from "@/utils/IndexDb";
import { Badge } from "../ui/badge";

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  className?: string;
  isOnline: Boolean;
}

export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
  searchTerm,
  onSearchChange,
  className,
  isOnline,
}: NoteListProps) {

  const [offlineNotes, setOfflineNotes] = useState<NoteWithStatus[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<NoteWithStatus[]>([]);
  const [updatedNotes, setUpdatedNotes] = useState<Note[]>([]);


  //function to show notes status when you are offline
  const handleNoteStatus = async () => {
    const offline = await getNotesByStatus("offline");
    const deleted = await getNotesByStatus("deleted");

    const createdNotes = offline.filter((note) =>
      note.id && note.id.startsWith("offline-")
    );
    const updatedNotes = offline.filter(
      (note) => note.id && !note.id.startsWith("offline-")
    );

    // console.log("This is offlineis", updated);
    setOfflineNotes(createdNotes);
    setDeletedNotes(deleted);
    setUpdatedNotes(updatedNotes);
  };

  useEffect(() => {
    handleNoteStatus();
  }, [notes]);

  const filteredNotes = notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt ?? 0).getTime();
      const dateB = new Date(b.updatedAt ?? 0).getTime();
      return dateB - dateA;
    });

  return (
    <div className={`flex flex-col h-full bg-card ${className}`}>
      {!isOnline && (
        <>
          <span className="font-medium px-2 py-2 text-xs text-start text-orange-400">
            Your notes will sync automatically when you're online.
          </span>
          <div className="p-2 border-b bg-muted flex gap-2 text-sm justify-center items-center ">
            <Badge variant="outline">
              New Notes: {offlineNotes?.length}
            </Badge>
            <Badge variant="outline">
              Updated Notes: {updatedNotes?.length}
            </Badge>
            <Badge variant="destructive">
              Deleted Notes: {deletedNotes?.length}
            </Badge>
          </div>
        </>
      )}
      <div className="p-4 border-b sm:hidden">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e: any) => onSearchChange(e.target.value)}
            className="pl-8 pr-2 py-1 h-9 rounded-lg"
            aria-label="Search notes"
          />
        </div>
      </div>
      <ScrollArea className="flex-grow min-h-0 p-1 sm:p-4">
        {filteredNotes.length === 0 && searchTerm && (
          <p className="text-center text-muted-foreground mt-4">
            No notes found for "{searchTerm}".
          </p>
        )}
        {filteredNotes.length === 0 && !searchTerm && (
          <p className="text-center text-muted-foreground mt-4">
            No notes yet. Create one.
          </p>
        )}
        <ul aria-label="Notes list">
          {filteredNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onSelectNote={onSelectNote}
              onDeleteNote={onDeleteNote}
            />
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
