"use client";

import type { Note } from "@/types";
import { NoteListItem } from "./NoteListItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  className?: string;
}

export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
  searchTerm,
  onSearchChange,
  className,
}: NoteListProps) {
  
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
      <div className="p-4 border-b sm:hidden">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e: any) =>
              onSearchChange(e.target.value)
            }
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
            No notes yet. Create one!
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
