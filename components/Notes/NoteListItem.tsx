"use client";

import * as React from "react";
import type { Note } from "@/types";
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

interface NoteListItemProps {
  note: Note;
  isSelected: boolean;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

const getStatusProps = (status: Note["syncStatus"]) => {
  switch (status) {
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
        colorClass: "border-red-500 text-red-600",
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
}: NoteListItemProps) {
  const statusProps = getStatusProps(note.syncStatus);

  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(note.updatedAt ?? 0), {
        addSuffix: true,
      });
    } catch (error) {
      return "Invalid date";
    }
  }, [note.updatedAt]);

  const contentSnippet =
    note.content.substring(0, 100) + (note.content.length > 100 ? "..." : "");

  return (
    <Card
      className={`mb-3 cursor-pointer transition-all duration-200 ease-in-out hover:shadow-md ${
        isSelected ? "ring-2 ring-primary shadow-lg" : "shadow-sm"
      }`}
      onClick={() => note.id && onSelectNote(note.id)}
      onKeyDown={(e) => e.key === "Enter" && note.id && onSelectNote(note.id)}
      tabIndex={0}
      aria-selected={isSelected}
      role="listitem"
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium leading-tight">
            {note.title || "Untitled Note"}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={(e: any) => {
              e.stopPropagation(); // Prevent card click when deleting
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
        <p className="text-sm text-muted-foreground break-words line-clamp-2">
          {contentSnippet}
        </p>
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
