"use client";

import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden text-sm text-muted lg:block">
          Fleet operations overview
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AnimatedThemeToggler
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-raised text-foreground transition-colors hover:border-border-strong hover:bg-surface"
          aria-label="Toggle theme"
          variant="circle"
          fromCenter
        />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-raised">
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-medium leading-none text-foreground">
                    {user.name}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {ROLE_LABELS[user.role]}
                  </div>
                </div>
                <Avatar>
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={logout}>
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
