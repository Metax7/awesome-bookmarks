"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import SettingsDropdown from "./settings-dropdown";

interface HeaderProps {
  onAddBookmark: () => void;
}

export function Header({ onAddBookmark }: HeaderProps) {
  return (
    <header className="border-b">
      <div className="flex h-14 items-center px-4">
        <SidebarTrigger className="mr-2" />
        <Separator
          orientation="vertical"
          className="mr-4 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-lg font-semibold">Awesome Bookmarks</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={onAddBookmark} size="sm">
            <Plus />
            Add
          </Button>

          <SettingsDropdown />
        </div>
      </div>
    </header>
  );
}
