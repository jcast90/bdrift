"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import config from "@/lib/config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Settings,
  Database,
  Zap,
  Users,
  BarChart3,
  FileText,
  Globe,
  Menu,
  LogOut,
  User,
  CreditCard,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Settings,
  Database,
  Zap,
  Users,
  BarChart3,
  FileText,
  Globe,
};

const navItems = config.dashboard.navItems;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const Icon = iconMap[item.icon] || LayoutDashboard;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-white/10 text-white border-l-[3px]"
                : "text-white/50 hover:bg-white/[0.06] hover:text-white/80 border-l-[3px] border-l-transparent"
            }`}
            style={isActive ? { borderLeftColor: "var(--brand-primary)" } : undefined}
          >
            <Icon
              className={`size-[18px] shrink-0 transition-colors duration-200 ${
                isActive
                  ? "text-brand-primary"
                  : "text-white/40 group-hover:text-white/60"
              }`}
            />
            <span>{item.label}</span>
            {isActive && (
              <span className="ml-auto size-1.5 rounded-full bg-brand-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu({ variant = "sidebar" }: { variant?: "sidebar" | "header" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.06] ${
          variant === "header" ? "cursor-pointer" : "w-full cursor-pointer"
        }`}
      >
        <Avatar size="sm">
          <AvatarFallback className="text-[10px] font-semibold text-white" style={{ background: "linear-gradient(to bottom right, var(--brand-primary), var(--brand-accent))" }}>
            JD
          </AvatarFallback>
        </Avatar>
        {variant === "sidebar" && (
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium text-white/90">John Doe</span>
            <span className="text-xs text-white/40">john@example.com</span>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={variant === "sidebar" ? "top" : "bottom"}
        align="end"
        sideOffset={8}
        className="w-56 bg-brand-surface-light border-white/10"
      >
        <DropdownMenuLabel className="text-white/60">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="text-white/80 focus:bg-white/10 focus:text-white cursor-pointer">
          <User className="mr-2 size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="text-white/80 focus:bg-white/10 focus:text-white cursor-pointer">
          <CreditCard className="mr-2 size-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem className="text-white/80 focus:bg-white/10 focus:text-white cursor-pointer">
          <Settings className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-white/[0.06] bg-brand-surface-light lg:flex">
      {/* Brand gradient top line */}
      <div className="h-[2px] w-full shrink-0" style={{ background: `linear-gradient(to right, var(--brand-primary), var(--brand-accent))` }} />
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: "linear-gradient(to bottom right, var(--brand-primary), var(--brand-accent))" }}>
          <Zap className="size-4 text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight text-white">
          {config.name}
        </span>
      </div>

      <Separator className="bg-white/[0.06]" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>

      <Separator className="bg-white/[0.06]" />

      {/* User section */}
      <div className="p-3">
        <UserMenu variant="sidebar" />
      </div>
    </aside>
  );
}

function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-white/[0.06] px-4 backdrop-blur-xl lg:hidden" style={{ backgroundColor: "color-mix(in srgb, var(--brand-surface) 80%, transparent)" }}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" />
          }
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[280px] border-r border-white/[0.06] bg-brand-surface-light p-0"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {/* Brand gradient top line */}
          <div className="h-[2px] w-full shrink-0" style={{ background: `linear-gradient(to right, var(--brand-primary), var(--brand-accent))` }} />
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6">
            <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: "linear-gradient(to bottom right, var(--brand-primary), var(--brand-accent))" }}>
              <Zap className="size-4 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              {config.name}
            </span>
          </div>

          <Separator className="bg-white/[0.06]" />

          <div className="flex-1 py-4">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>

          <Separator className="bg-white/[0.06]" />

          <div className="p-3">
            <UserMenu variant="sidebar" />
          </div>
        </SheetContent>
      </Sheet>

      <span className="text-sm font-semibold text-white">{config.name}</span>

      <div className="ml-auto">
        <UserMenu variant="header" />
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-surface">
      <Sidebar />
      <MobileHeader />
      <main className="lg:pl-[260px]">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
