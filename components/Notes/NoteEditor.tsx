"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState, useCallback } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Save, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Note } from "@/types";

interface NoteEditorProps {
  note: Note | null | undefined; // null for new note, undefined if no note selected
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onCloseEditor?: () => void; // For mobile view to go back
  isMobileView: boolean;
  className?: string;
}

export function NoteEditor({
  note,
  onSaveNote,
  onDeleteNote,
  onCloseEditor,
  isMobileView,
  className,
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  

  const handleSave = () => {

    console.log("THis")
    onSaveNote({
      title,
      content,
      syncStatus: note?.syncStatus || "unsynced",
    });
  };

  const handleDelete = () => {
    if (currentNoteId) {
      onDeleteNote(currentNoteId);
    }
  };

  //   if (note === undefined && !isMobileView) {
  //     return (
  //       <div className={`flex-1 p-6 flex flex-col items-center justify-center text-center bg-background ${className}`}>
  //         <Info className="h-16 w-16 text-primary mb-4" />
  //         <h2 className="text-2xl font-semibold text-foreground mb-2">No Note Selected</h2>
  //         <p className="text-muted-foreground">Select a note from the list to view or edit, or create a new one.</p>
  //       </div>
  //     );
  //   }

  //   if (note === undefined && isMobileView) return null; // Don't render editor if no note selected on mobile unless it's a new note flow

  return (
    <Card
      className={`flex flex-col h-full shadow-lg rounded-lg overflow-hidden ${
        isMobileView ? "w-full" : "flex-1"
      } ${className}`}
    >
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between gap-2">
          {isMobileView && onCloseEditor && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseEditor}
              aria-label="Back to list"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Input
            placeholder="Note Title"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0 flex-grow !p-0"
            aria-label="Note title"
          />
          <div className="flex items-center gap-2">
            {note && ( // Only show delete for existing notes, not a brand new one not yet saved
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
                aria-label="Delete note"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
            <Button onClick={handleSave} size="sm" className="gap-1">
              <Save className="h-4 w-4" />
              <span>Save</span>
            </Button>
          </div>
        </div>
        {lastSaved && (
          <p className="text-xs text-muted-foreground mt-1">
            Last saved: {format(new Date(lastSaved), "MMM d, yyyy 'at' h:mm a")}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-full">
          <Textarea
            placeholder="Start typing your markdown note..."
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setContent(e.target.value)
            }
            className="h-full w-full resize-none border-0 rounded-none p-4 focus-visible:ring-0 text-base min-h-[calc(100vh-250px)] sm:min-h-[calc(100vh-200px)]"
            aria-label="Note content"
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
