"use client";

import { Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  ThemeAnimationType,
  useModeAnimation,
} from "react-theme-switch-animation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SettingsDropdown() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  const { ref, toggleSwitchTheme } = useModeAnimation({
    duration: 750,
    animationType: ThemeAnimationType.CIRCLE,
    isDarkMode: theme === "dark",
    onDarkModeChange: (isDark) => {
      // Sync with next-themes when animation completes
      if (isDark && theme !== "dark") {
        setTheme("dark");
      } else if (!isDark && theme !== "light") {
        setTheme("light");
      }
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    if (
      (newTheme === "dark" && theme !== "dark") ||
      (newTheme === "light" && theme !== "light")
    ) {
      toggleSwitchTheme();
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" ref={ref}>
          <Settings />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun />
          Light
          {theme === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon />
          Dark
          {theme === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
