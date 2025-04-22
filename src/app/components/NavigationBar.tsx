"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LogOut, Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/leave-request", label: "Leave Request" },
  { href: "/approvals", label: "Endorsements/Approvals" },
  { href: "/leave-balance-management", label: "Leave Balance Management" },
  { href: "/audit-trail", label: "Audit Trail" },
];

// Sample submenu components
const LeaveRequestContent = () => {
  return (
    <NavigationMenuContent className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px]">
      <div className="grid gap-2">
        <NavigationMenuLink asChild>
          <Link
            href="/leave-request/personal-information"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Personal Information</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              View and update your personal information.
            </p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild></NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/leave-request/file-leave"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">File Leave</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              Initiate and submit a new leave application.
            </p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/leave-request/view-leave-balances"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">View Leave Balances</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              View your current leave balances for various leave types.
            </p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/leave-request/track-status"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Track status of leave request</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              Monitor the current status and history of your submitted leave applications.
            </p>
          </Link>
        </NavigationMenuLink>
      </div>
    </NavigationMenuContent>
  );
};

const ApprovalsContent = () => {
  return (
    <NavigationMenuContent className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px]">
      <div className="grid gap-4">
        <NavigationMenuLink asChild>
          <Link
            href="/approvals/pending"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Pending Approvals</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              Review and process pending leave requests from your team.
            </p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/approvals/processed"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Processed Requests</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              View history of leave requests you&apos;ve processed.
            </p>
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link
            href="/approvals/delegated"
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <div className="text-sm font-medium leading-none">Delegated Approvals</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              Manage approval permissions delegated to other approvers.
            </p>
          </Link>
        </NavigationMenuLink>
      </div>
    </NavigationMenuContent>
  );
};

export default function NavigationBar() {
  const pathname = usePathname();

  // Mock user data - replace with actual user context/auth
  const user = {
    name: "Andrei Rabon",
    role: "Admin",
    // role: "Employee",
    // role: "Manager",
    // role: "Hr Admin",
    // role: "Top Management",
    // role: "Admin",
    avatar: null,
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center">
        {/* Logo/Brand */}
        <Link
          href="/"
          className="mr-8 flex items-center space-x-2 font-semibold">
          <Image
            src="/dostlogo.ico"
            alt="Company Logo"
            width={60}
            height={60}
            className="object-contain"
            priority
          />
          <span className="text-lg">Leave Filing and Approval Process</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    pathname.startsWith("/leave-request")
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}>
                  Leave Request
                </NavigationMenuTrigger>
                <LeaveRequestContent />
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    pathname.startsWith("/approvals") ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}>
                  Endorsements/Approvals
                </NavigationMenuTrigger>
                <ApprovalsContent />
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/leave-balance-management"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === "/leave-balance-management"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}>
                    Leave Balance Management
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/audit-trail"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === "/audit-trail" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    )}>
                    Audit Trail
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* User Profile Dropdown */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden flex-1 justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80">
              <div className="flex flex-col space-y-4 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === link.href ? "text-primary" : "text-muted-foreground",
                    )}>
                    {link.label}
                  </Link>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="flex flex-col space-y-1 mb-4">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
