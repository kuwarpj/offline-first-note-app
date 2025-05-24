"use client";

import { AppHeader } from "@/components/Header/Header";
import { NoteEditor } from "@/components/Notes/NoteEditor";
import { NoteList } from "@/components/Notes/NoteList";
import { useNotes } from "@/context/NoteContext";

export default function HomePage() {
  const {
    notes,
    selectedNoteId,
    searchTerm,
    currentNote,
    setSearchTerm,
    handleNewNote,
    handleSelectNote,
    handleDeleteNote,

    handleCloseEditor,
    handleSaveOrUpdateNote,
    isOnline
  } = useNotes();

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewNote={handleNewNote}
        isOnline={isOnline}
      />
      <main className="flex flex-1 overflow-hidden">
        <>
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isOnline={isOnline}
            className="w-1/3 lg:w-1/4 border-r h-full"
          />
          <NoteEditor
            note={currentNote}
            handleSaveOrUpdateNote={handleSaveOrUpdateNote}
            selectedNoteId={selectedNoteId}
            handleCloseEditor={handleCloseEditor}
            className="flex-1 h-full"
          />
        </>
      </main>
    </div>
  );
}
