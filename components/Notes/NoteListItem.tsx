"use client";

import * as React from "react";
import type { Note } from "@/types";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  XCircle,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import { useNotes } from "@/context/NoteContext";

const getStatusProps = (status: Note["synced"] | boolean) => {
  const normalizedStatus = status === true ? "synced" : status;

  switch (normalizedStatus) {
    case "synced":
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        text: "Synced",
        variant: "outline" as const,
        colorClass: "border-green-500 text-green-600",
      };
    case "unsynced":
      return {
        icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
        text: "Unsynced",
        variant: "outline" as const,
        colorClass: "border-yellow-500 text-yellow-600",
      };
    case "syncing":
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
        text: "Syncing...",
        variant: "outline" as const,
        colorClass: "border-blue-500 text-blue-600",
      };
    case "error":
      return {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        text: "Error",
        variant: "destructive" as const,
        colorClass: "border-red-500 text-white",
      };
    default:
      return {
        icon: null,
        text: "",
        variant: "default" as const,
        colorClass: "",
      };
  }
};

export function NoteListItem({
  note,
  isSelected,
  onSelectNote,
  onDeleteNote,
}: {
  note: Note;
  isSelected: boolean;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
}) {
  const { syncingNotes } = useNotes();
  const isSyncing = syncingNotes.includes(note.id);
  const statusProps = getStatusProps(isSyncing ? "syncing" : note.synced);

  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(note.updatedAt ?? 0), {
        addSuffix: true,
      });
    } catch (error) {
      return "Invalid date";
    }
  }, [note.updatedAt]);

  return (
    <Card
      className={`mb-3 cursor-pointer hover:shadow-md ${
        isSelected ? " border-2 border-[green] shadow-lg" : "shadow-sm"
      }`}
      onClick={() => note.id && onSelectNote(note.id)}
      onKeyDown={(e) => e.key === "Enter" && note.id && onSelectNote(note.id)}
      tabIndex={0}
      aria-selected={isSelected}
      role="listitem"
    >
      <CardHeader className="pb-2 pt-1 px-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium leading-tight">
            {note.title || "Untitled Note"}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              note.id && onDeleteNote(note.id);
            }}
            aria-label={`Delete note ${note.title || "Untitled Note"}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Last updated: {timeAgo}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => (
              <p
                className="prose prose-sm dark:prose-invert text-muted-foreground line-clamp-2"
                {...props}
              />
            ),
          }}
        >
          {note.content}
        </ReactMarkdown>

        <div className="mt-2 flex justify-end">
          <Badge
            variant={statusProps.variant}
            className={`gap-1 ${statusProps.colorClass}`}
          >
            {statusProps.icon}
            {statusProps.text}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
