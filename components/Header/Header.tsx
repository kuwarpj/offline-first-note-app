"use client";

import {  type ChangeEvent, type FC } from "react";
import { Wifi, WifiOff, Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { LogoIcon } from '@/components/icons/LogoIcon';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNewNote: () => void;
  isOnline: boolean
}

export const AppHeader: FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  onNewNote,
  isOnline
}) => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-foreground">
          Offline First Note App
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative w-full max-w-xs hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onSearchChange(e.target.value)
            }
            className="pl-8 pr-2 py-1 h-9 rounded-lg"
            aria-label="Search notes"
          />
        </div>
        <Button
          onClick={onNewNote}
         
          size="sm"
          className="gap-1 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">New Note</span>
        </Button>
        <div title={isOnline ? "Online" : "Offline"}>
          {isOnline ? (
            <div className="flex flex-col items-center justify-center">
              <Wifi className="h-6 w-6 text-green-500 " />
              <span className="font-semibold text-green-500 text-[14px]">
                Online
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center ">
              <WifiOff className="h-6 w-6 text-destructive" />
              <span className="font-semibold text-destructive text-[14px]">
                Offline
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
