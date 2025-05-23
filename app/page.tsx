
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
    isOnline,
    activeMobileView,
    currentNote,
    setSearchTerm,
    handleNewNote,
    handleSelectNote,
    handleSaveNote,
    handleDeleteNote,
    handleCloseEditorMobile,
    isMobile, // Now available from context
    setSelectedNoteId
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
        {isMobile ? (
          activeMobileView === 'list' ? (
            <NoteList
              notes={notes}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm} // Pass setSearchTerm to NoteList for its mobile search bar
              className="w-full h-full"
            />
          ) : ( 
            <NoteEditor
              note={currentNote} 
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onCloseEditor={handleCloseEditorMobile}
              isMobileView={true}
              className="w-full h-full"
            />
          )
        ) : (
        
          <>
            <NoteList
              notes={notes}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm} 
              className="w-1/3 lg:w-1/4 border-r h-full"
            />
            <NoteEditor
              note={currentNote} 
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              isMobileView={false}
              className="flex-1 h-full"
            />
          </>
        )}
      </main>
    </div>
  );
}
