// @ts-ignore
"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Save, X, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { Note } from "@/types";

interface NoteEditorProps {
  note: Note | null | undefined;
  handleCloseEditor?: () => void;
  className?: string;
  selectedNoteId: string | null;
  handleSaveOrUpdateNote: any;
}
export function NoteEditor({
  note,

  handleCloseEditor,
  className,
  handleSaveOrUpdateNote,
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setLastSaved(note.updatedAt || null);
    } else {
      setTitle("");
      setContent("");
      setLastSaved(null);
    }
  }, [note]);

  const handleSave = () => {
    handleSaveOrUpdateNote({
      id: note?.id,
      title,
      content,
      syncStatus: note?.syncStatus || "unsynced",
    });
  };

  // Show a fallback UI if no note is selected
  if (!note) {
    return (
      <div
        className={`flex-1 p-6 flex flex-col items-center justify-center text-center bg-background ${className}`}
      >
        <Info className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          No Note Selected
        </h2>
        <p className="text-muted-foreground">
          Select a note from the list to view or edit, or create a new one.
        </p>
      </div>
    );
  }

  return (
    <Card
      className={`flex flex-col h-full shadow-lg rounded-lg overflow-hidden flex-1 ${className}`}
    >
      <CardHeader className="p-4 border-b relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            handleCloseEditor?.();
          }}
          aria-label="Close editor"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex items-center justify-between gap-2 pr-10">
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
        <ScrollArea className="h-full flex gap-4">
          <Textarea
            placeholder="Start typing your markdown note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-full w-1/2 resize-none border-0 rounded-none p-4 focus-visible:ring-0 text-base min-h-[calc(100vh-250px)]"
            aria-label="Note content"
          />
          <div className="w-1/2 p-4 border-l overflow-auto prose prose-sm dark:prose-invert text-muted-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
